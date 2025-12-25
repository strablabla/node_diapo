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

function handle_upload_image(req, res, diapo_index, modify) {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
    }

    var filename = req.file.filename
    var diapo_idx = req.body.diapo_index || diapo_index
    var posX = parseInt(req.body.posX) || 100
    var posY = parseInt(req.body.posY) || 100

    console.log('Image uploaded:', filename, 'for diapo', diapo_idx, 'at position', posX, posY)

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
