
var new_strap = function(diapo_index){

    /*
    New diapo..
    */

      return function(){/*
{% extends 'diapo_template.html' %}

{% block diapo_content %}

{% include 'diapos/d{}.html' %}

{% endblock %}
*/}.toString().slice(14,-3).format(diapo_index)

}

function create_diapo_md(fs, diapo_index, new_text){

      /*
      Markdown
      */

      fs.writeFile("views/diapos/d{}.html".format(diapo_index), new_text, function(err) {
            if(err) { return console.log(err); }
            console.log('new text modified and saved in views/d{}.html'.format(diapo_index))
      }); // end write file

}

function create_diapo_jinja(fs, diapo_index, nstrap){

      /*
      Jinja
      */

      fs.writeFile("views/diapos/diapo{}.html".format(diapo_index), nstrap, function(err) {
            if(err) { return console.log(err); }
            console.log('new text modified and saved in views/diapo{}.html'.format(diapo_index))
      }); // end write file

}

function create_md_jinja(fs, diapo_index, new_text){

      /*
      Markdown and jinja
      */

      var nstrap = new_strap(diapo_index) // new diapo jinja html code..
      console.log(nstrap)
      create_diapo_md(fs, diapo_index, new_text)   // markdown code..
      create_diapo_jinja(fs, diapo_index, nstrap)

}

function renameImagesBasedOnMarkdown(fs, old_text, new_text, diapo_index){

    /*
    Detect image name changes in markdown and rename the files accordingly
    Image syntax: !['name' WxH %id%](imgs/filename.jpg)
    Strategy: Match images by their filename (which doesn't change initially)
    */

    // Extract all image references from old and new text
    var imgRegex = /!\['([^']+)'\s+(\d+x\d+)\s+%([^%]+)%\]\(imgs\/([^)]+)\)/g

    var oldImages = {}  // Key by filename
    var newImages = {}  // Key by filename
    var match

    console.log('=== Analyzing image name changes ===')

    // Parse old text
    while ((match = imgRegex.exec(old_text)) !== null) {
        var filename = match[4]
        oldImages[filename] = {
            fullMatch: match[0],
            name: match[1],      // e.g. 'turner'
            size: match[2],      // e.g. '300x300'
            id: match[3],        // e.g. 'Turner-Fire-...'
            filename: filename   // e.g. 'Turner-Fire-....jpg'
        }
        console.log('OLD image found: name="' + match[1] + '" filename="' + filename + '"')
    }

    // Reset regex
    imgRegex.lastIndex = 0

    // Parse new text
    while ((match = imgRegex.exec(new_text)) !== null) {
        var filename = match[4]
        newImages[filename] = {
            fullMatch: match[0],
            name: match[1],
            size: match[2],
            id: match[3],
            filename: filename
        }
        console.log('NEW image found: name="' + match[1] + '" filename="' + filename + '"')
    }

    // Compare images by filename to detect name changes
    for (var filename in oldImages) {
        if (newImages[filename]) {
            var oldImg = oldImages[filename]
            var newImg = newImages[filename]

            console.log('Comparing: "' + oldImg.name + '" vs "' + newImg.name + '" for file: ' + filename)

            // If the name changed (but filename is still the same)
            if (oldImg.name !== newImg.name) {
                console.log('==> Image name CHANGED: "' + oldImg.name + '" -> "' + newImg.name + '"')

                // Generate new filename and ID based on new name
                // Replace spaces with hyphens and make URL-safe
                var sanitizedName = newImg.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-_]/g, '')
                var ext = oldImg.filename.substring(oldImg.filename.lastIndexOf('.'))
                var newFilename = sanitizedName + ext
                var newId = sanitizedName

                var oldPath = 'public/imgs/' + oldImg.filename
                var newPath = 'public/imgs/' + newFilename

                console.log('Sanitized name: "' + newImg.name + '" -> "' + sanitizedName + '"')
                console.log('New filename: ' + newFilename)
                console.log('New ID: ' + newId)
                console.log('Renaming file: ' + oldPath + ' -> ' + newPath)

                // Rename the file
                fs.rename(oldPath, newPath, function(err) {
                    if (err) {
                        console.error('Error renaming image file:', err)
                    } else {
                        console.log('SUCCESS: Renamed image file: ' + oldPath + ' -> ' + newPath)
                    }
                })

                // Build the new markdown line with updated ID and filename
                var oldMarkdownLine = newImg.fullMatch  // Use newImg because that's what's in new_text
                var newMarkdownLine = "!['" + newImg.name + "' " + newImg.size + " %" + newId + "%](imgs/" + newFilename + ")"

                console.log('Replacing markdown:')
                console.log('  OLD: ' + oldMarkdownLine)
                console.log('  NEW: ' + newMarkdownLine)

                // Replace the markdown line in new_text
                new_text = new_text.replace(oldMarkdownLine, newMarkdownLine)
            }
        }
    }

    console.log('=== End of image analysis ===')
    return new_text
}

exports.modify_html_with_newtext = function(socket, fs, util, new_text, diapo_index){

    /*
    Modify the files after modification of the markdown in Code mirror..
    */

    console.log('save before changing the text')

    // Read the old text first to compare
    fs.readFile('views/diapos/d{}.html'.format(diapo_index), 'utf8', function (err, old_text) {
        if (!err && old_text) {
            // Rename images if names changed
            new_text = renameImagesBasedOnMarkdown(fs, old_text, new_text, diapo_index)
        }

        util.save_current_version(new_text,false)    // save before change
        socket.emit('page_return_to_html','')        // send message back for sending the scroll pos.
        create_md_jinja(fs, diapo_index, new_text)   // create markdown and jinja parts..
    })

}

exports.new_jinja = function(fs, diapo_index){

      /*
      jinja
      */

      var nstrap = new_strap(diapo_index) // new diapo jinja html code..
      console.log(nstrap)
      create_diapo_jinja(fs, diapo_index, nstrap)

}
