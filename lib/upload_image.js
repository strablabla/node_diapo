var fs = require('fs');
var path = require('path');
var multer = require('multer');
var crypto = require('crypto');

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

function handleFaviconUpload(file, res) {
    // Copy the uploaded file to public/favicons directory keeping original name
    var faviconName = file.filename
    var ext = path.extname(faviconName)
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

        // Update header.html to include favicon
        var headerPath = 'views/header.html'
        fs.readFile(headerPath, 'utf8', function(err, content) {
            if (err) {
                console.error('Error reading header.html:', err)
                return res.status(500).json({ error: 'Failed to update header' })
            }

            // Remove any existing favicon link
            content = content.replace(/<link\s+rel=["'](?:shortcut )?icon["'][^>]*>/gi, '')

            // Add new favicon link after title
            var faviconLink = '<link rel="icon" type="image/' + ext.slice(1) + '" href="/favicons/' + faviconName + '">\n'
            content = content.replace(/(<title>.*?<\/title>)/i, '$1\n' + faviconLink)

            fs.writeFile(headerPath, content, function(err) {
                if (err) {
                    console.error('Error writing header.html:', err)
                    return res.status(500).json({ error: 'Failed to update header' })
                }

                console.log('Header updated with favicon')
                res.json({
                    success: true,
                    favicon: faviconName,
                    message: 'Favicon updated successfully'
                })
            })
        })
    })
}

function handle_upload_image(req, res, diapo_index, modify) {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
    }

    var filename = req.file.filename
    var originalName = path.basename(req.file.originalname, path.extname(req.file.originalname))
    var diapo_idx = req.body.diapo_index || diapo_index
    var posX = parseInt(req.body.posX) || 100
    var posY = parseInt(req.body.posY) || 100

    console.log('Image uploaded:', filename, 'Original name:', originalName, 'for diapo', diapo_idx, 'at position', posX, posY)

    // Check if this is a favicon (filename starts with "fav_")
    if (originalName.toLowerCase().startsWith('fav_')) {
        console.log('Favicon detected, processing as favicon...')
        return handleFaviconUpload(req.file, res)
    }

    // Read current diapo content
    var diapoFile = 'views/diapos/d{}.html'.format(diapo_idx)

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
