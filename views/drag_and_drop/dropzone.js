// ============================================
// DRAG & DROP IMAGE UPLOAD
// ============================================

// Create drop zone overlay
var dropZone = $('<div>').attr('id', 'drop-zone')
dropZone.css({
    'position': 'fixed',
    'top': '0',
    'left': '0',
    'width': '100%',
    'height': '100%',
    'background-color': 'rgba(100, 100, 255, 0.3)',
    'border': '5px dashed #4444ff',
    'display': 'none',
    'z-index': '10000',
    'justify-content': 'center',
    'align-items': 'center',
    'font-size': '48px',
    'color': '#4444ff',
    'pointer-events': 'none'
})
dropZone.html('Drop image here')
$('body').append(dropZone)

// Prevent default drag behaviors on document
$(document).on('dragover', function(e) {
    e.preventDefault()
    e.stopPropagation()
    $('#drop-zone').css('display', 'flex')
})

$(document).on('dragleave', function(e) {
    e.preventDefault()
    e.stopPropagation()
    // Only hide if leaving the window
    if (e.originalEvent.clientX === 0 && e.originalEvent.clientY === 0) {
        $('#drop-zone').hide()
    }
})

$(document).on('drop', function(e) {
    e.preventDefault()
    e.stopPropagation()
    $('#drop-zone').hide()

    var files = e.originalEvent.dataTransfer.files
    if (files.length > 0) {
        var file = files[0]

        // Check if it's an image
        if (file.type.match('image.*')) {
            // Get drop coordinates (relative to page)
            var dropX = e.pageX
            var dropY = e.pageY
            console.log('Drop position:', dropX, dropY)

            // Create FormData to send file
            var formData = new FormData()
            formData.append('image', file)
            formData.append('diapo_index', diapo_index)
            formData.append('posX', dropX)
            formData.append('posY', dropY)

            // Upload image via AJAX
            $.ajax({
                url: '/upload-image',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    console.log('Image uploaded successfully:', response)
                    // Reload the page to show the new image
                    location.reload()
                },
                error: function(xhr, status, error) {
                    console.error('Upload failed:', error)
                    alert('Failed to upload image: ' + error)
                }
            })
        } else {
            alert('Please drop an image file')
        }
    }
})
