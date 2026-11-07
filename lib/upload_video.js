var fs = require('fs');
var path = require('path');
var multer = require('multer');

/*
Video dropped on a slide: the file is stored in public/videos/ (git-ignored:
videos are heavy, copy them by hand to another machine), and a folded local
video line, "* [title %%](videos/file)", is appended to the slide.
Only the formats browsers play are accepted.
*/

var VIDEOS_DIR = 'public/videos/';
var PLAYABLE = ['video/mp4', 'video/webm', 'video/ogg'];

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        fs.mkdir(VIDEOS_DIR, { recursive: true }, function(err) { cb(err, VIDEOS_DIR) })
    },
    filename: function (req, file, cb) {
        // Keep the name readable but safe in a markdown link: no spaces,
        // brackets or parentheses.
        var ext = path.extname(file.originalname).toLowerCase()
        var basename = path.basename(file.originalname, path.extname(file.originalname))
                           .replace(/[^\w.-]+/g, '_')
        cb(null, basename + '-' + Date.now() + ext)
    }
})

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (PLAYABLE.indexOf(file.mimetype) === -1) {
            return cb(new Error('Only MP4, WebM or Ogg videos are allowed'), false)
        }
        cb(null, true)
    }
})

function handle_upload_video(req, res, modify) {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
    }

    var diapo_idx = parseInt(req.body.diapo_index)
    if (isNaN(diapo_idx)) {
        return res.status(400).json({ error: 'Invalid diapo index' })
    }

    var filename = req.file.filename
    // The title shown above the folded video: the original name, without
    // anything that would close the markdown link early.
    var title = path.basename(req.file.originalname, path.extname(req.file.originalname))
                    .replace(/[\[\]]/g, '')
    var diapoFile = 'views/diapos/d' + diapo_idx + '.html'

    fs.readFile(diapoFile, 'utf8', function (err, txt) {
        if (err) {
            console.error('Error reading diapo file:', err)
            return res.status(500).json({ error: 'Failed to read diapo file' })
        }

        // A blank line first, so that the item starts a list of its own.
        var line = '\n\n* [' + title + ' %%](videos/' + filename + ')\n'
        fs.writeFile(diapoFile, txt.replace(/\s*$/, '') + line, function(err) {
            if (err) {
                console.error('Error writing diapo file:', err)
                return res.status(500).json({ error: 'Failed to update diapo file' })
            }
            console.log('Video added to diapo:', diapoFile, filename)
            modify.new_jinja(fs, diapo_idx)        // regenerate the jinja template
            res.json({ success: true, filename: filename })
        })
    })
}

module.exports = {
    upload: upload,
    handle_upload_video: handle_upload_video
};
