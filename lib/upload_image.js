var fs = require('fs');
var path = require('path');
var multer = require('multer');
var crypto = require('crypto');
var yaml = require('js-yaml');

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
      return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

// Configure multer for image uploads
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/imgs/')
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        var ext = path.extname(file.originalname)
        var basename = path.basename(file.originalname, ext)
        var uniqueName = basename + '-' + Date.now() + ext
        cb(null, uniqueName)
    }
})

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false)
        }
        cb(null, true)
    }
})

function handleFaviconUpload(file, res, reloadConfig) {
    // Copy the uploaded file to public/favicons directory keeping original name
    var faviconName = file.filename
    var sourcePath = file.path

    // Create favicons directory if it doesn't exist
    var faviconsDir = path.join('public', 'favicons')
    if (!fs.existsSync(faviconsDir)) {
        fs.mkdirSync(faviconsDir, { recursive: true })
    }

    var destPath = path.join(faviconsDir, faviconName)

    fs.copyFile(sourcePath, destPath, function(err) {
        if (err) {
            console.error('Error copying favicon:', err)
            return res.status(500).json({ error: 'Failed to copy favicon' })
        }

        console.log('Favicon saved as:', faviconName)

        // Update config.yaml with favicon name
        var configPath = 'config.yaml'
        fs.readFile(configPath, 'utf8', function(err, data) {
            if (err) {
                console.error('Error reading config.yaml:', err)
                return res.status(500).json({ error: 'Failed to read config' })
            }

            var config = yaml.load(data)
            config.favicon = faviconName

            fs.writeFile(configPath, yaml.dump(config), function(err) {
                if (err) {
                    console.error('Error writing config.yaml:', err)
                    return res.status(500).json({ error: 'Failed to update config' })
                }

                console.log('Config updated with favicon:', faviconName)

                // Reload config in nunjucks
                if (reloadConfig) {
                    reloadConfig()
                }

                res.json({
                    success: true,
                    favicon: faviconName,
                    message: 'Favicon updated successfully'
                })
            })
        })
    })
}

function handleBackgroundUpload(file, res, reloadConfig) {
    // Copy the uploaded file to public/bckgrds directory keeping original name
    var backgroundName = file.filename
    var sourcePath = file.path

    // Create bckgrds directory if it doesn't exist
    var bckgrdsDir = path.join('public', 'bckgrds')
    if (!fs.existsSync(bckgrdsDir)) {
        fs.mkdirSync(bckgrdsDir, { recursive: true })
    }

    var destPath = path.join(bckgrdsDir, backgroundName)

    fs.copyFile(sourcePath, destPath, function(err) {
        if (err) {
            console.error('Error copying background:', err)
            return res.status(500).json({ error: 'Failed to copy background' })
        }

        console.log('Background saved as:', backgroundName)

        // Update config_deck.yaml with background name
        var configPath = 'views/config_deck.yaml'
        fs.readFile(configPath, 'utf8', function(err, data) {
            if (err) {
                console.error('Error reading config_deck.yaml:', err)
                return res.status(500).json({ error: 'Failed to read config' })
            }

            var config_desk = yaml.load(data)
            config_desk.background = backgroundName

            fs.writeFile(configPath, yaml.dump(config_desk), function(err) {
                if (err) {
                    console.error('Error writing config_deck.yaml:', err)
                    return res.status(500).json({ error: 'Failed to update config' })
                }

                console.log('Config updated with background:', backgroundName)

                // Reload config in nunjucks
                if (reloadConfig) {
                    reloadConfig()
                }

                res.json({
                    success: true,
                    background: backgroundName,
                    message: 'Background updated successfully'
                })
            })
        })
    })
}

function handle_upload_image(req, res, diapo_index, modify, reloadConfig) {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
    }

    var filename = req.file.filename
    var originalName = path.basename(req.file.originalname, path.extname(req.file.originalname))

    // CRITICAL: Ensure diapo_idx is defined for regular image uploads
    var diapo_idx = req.body.diapo_index !== undefined ? parseInt(req.body.diapo_index) : diapo_index
    var posX = parseInt(req.body.posX) || 100
    var posY = parseInt(req.body.posY) || 100

    console.log('=== Image Upload Debug ===')
    console.log('Filename:', filename)
    console.log('Original name:', originalName)
    console.log('req.body.diapo_index:', req.body.diapo_index)
    console.log('diapo_index param:', diapo_index)
    console.log('Final diapo_idx:', diapo_idx)
    console.log('Position:', posX, posY)

    // Check if this is a favicon (filename starts with "fav_")
    if (originalName.toLowerCase().startsWith('fav_')) {
        console.log('Favicon detected, processing as favicon...')
        return handleFaviconUpload(req.file, res, reloadConfig)
    }

    // Check if this is a background (filename starts with "bg_")
    if (originalName.toLowerCase().startsWith('bg_')) {
        console.log('Background detected, processing as background...')
        return handleBackgroundUpload(req.file, res, reloadConfig)
    }

    // SAFETY CHECK: Validate diapo_idx before proceeding
    if (diapo_idx === undefined || diapo_idx === null || isNaN(diapo_idx)) {
        console.error('❌ CRITICAL ERROR: Invalid diapo_idx:', diapo_idx)
        return res.status(400).json({ error: 'Invalid diapo index' })
    }

    // Read current diapo content
    var diapoFile = 'views/diapos/d{}.html'.format(diapo_idx)
    console.log('Target diapo file:', diapoFile)

    fs.readFile(diapoFile, 'utf8', function (err, txt) {
        if (err) {
            console.error('Error reading diapo file:', err)
            return res.status(500).json({ error: 'Failed to read diapo file' })
        }

        // Generate unique image ID for positioning
        var imageId = filename.replace(/\.[^/.]+$/, '') // Remove extension

        // Add image to end of file with position marker using drop coordinates
        var newImageMarkdown = '\n!pos' + posX + '/' + posY + '\n![\'img\' 300x300 %' + imageId + '%](imgs/' + filename + ')\n'
        var newContent = txt + newImageMarkdown

        // Write updated content
        fs.writeFile(diapoFile, newContent, function(err) {
            if (err) {
                console.error('Error writing diapo file:', err)
                return res.status(500).json({ error: 'Failed to update diapo file' })
            }

            console.log('Image added to diapo:', diapoFile)

            // Regenerate the jinja template
            modify.new_jinja(fs, diapo_idx)

            res.json({
                success: true,
                filename: filename,
                imageId: imageId
            })
        })
    })
}

module.exports = {
    upload: upload,
    handle_upload_image: handle_upload_image
};
