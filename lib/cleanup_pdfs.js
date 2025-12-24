var fs = require('fs');
var path = require('path');

function cleanupOldPDFs() {
    const staticDir = path.join(__dirname, '..', 'static')
    fs.readdir(staticDir, function(err, files) {
        if (err) {
            console.error('Error reading static directory:', err)
            return
        }

        files.forEach(function(file) {
            if (file.startsWith('slides_') && file.endsWith('.pdf')) {
                const filePath = path.join(staticDir, file)
                fs.unlink(filePath, function(err) {
                    if (err) {
                        console.error('Error deleting ' + file + ':', err)
                    } else {
                        console.log('Deleted old PDF: ' + file)
                    }
                })
            }
        })
    })
}

module.exports = cleanupOldPDFs;
