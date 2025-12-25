var fs = require('fs');

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
      return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

// Helper function to escape special regex characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function save_image_size(infos, diapo_index){
    /*
    Save image size when Apply is clicked in context menu
    infos format: "imageId§§width§§height"
    */

    console.log('save_image_size:', infos)
    var parts = infos.split('§§')
    var id = parts[0]
    var width = parseInt(parts[1])
    var height = parseInt(parts[2])

    console.log('Updating size for image:', id, 'to', width + 'x' + height)

    fs.readFile('views/diapos/d{}.html'.format(diapo_index), 'utf8', function (err, txt) {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        if (!txt || txt.trim() === '') {
            console.error('File content is empty, aborting save');
            return;
        }

        // Find and update the image size in markdown syntax
        // Pattern: ![' ... WxH %id%](imgs/...)
        var lines = txt.split('\n')
        var found = false

        for (var i = 0; i < lines.length; i++) {
            // Look for the image ID pattern with % delimiters
            // The ID comes without %, so we need to search for %id%
            var idPattern = new RegExp('%' + escapeRegExp(id) + '%')
            if (lines[i].match(idPattern)) {
                console.log('Found image at line', i, ':', lines[i])

                // Replace the size (WIDTHxHEIGHT) in the markdown
                // Pattern: !['text' WIDTHxHEIGHT %id%](imgs/file.jpg)
                // Use a more specific pattern that matches the exact ID
                var sizePattern = new RegExp('(\\d+)x(\\d+)(\\s+%' + escapeRegExp(id) + '%)')
                var newLine = lines[i].replace(sizePattern, width + 'x' + height + '$3')

                if (newLine !== lines[i]) {
                    lines[i] = newLine
                    found = true
                    console.log('Updated to:', lines[i])
                } else {
                    console.log('No size pattern found to replace')
                }
                break
            }
        }

        if (!found) {
            console.error('Image ID not found:', id)
            return
        }

        var new_txt = lines.join('\n')

        // Safety check
        if (!new_txt || new_txt.trim() === '' || new_txt.length < 10) {
            console.error('Generated text is invalid, aborting save');
            return;
        }

        var dest = 'views/diapos/d{}.html'.format(diapo_index)
        fs.writeFile(dest, new_txt, function(err) {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log('Saved {} with new image size: {}x{}'.format(dest, width, height));
        })
    })
}

module.exports = {
    save_image_size: save_image_size
};
