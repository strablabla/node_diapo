var fs = require('fs');
var path = require('path');

// static/ only holds the PDF exports, already downloaded by the browser when
// made: all of them go at each start, whether named after the deck or slides_*.
function cleanupOldPDFs() {
    const staticDir = path.join(__dirname, '..', 'static')
    fs.readdir(staticDir, function(err, files) {
        if (err) {
            console.error('Error reading static directory:', err)
            return
        }

        files.forEach(function(file) {
            if (file.endsWith('.pdf')) {
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
