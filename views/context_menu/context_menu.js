// ============================================
// CONTEXT MENU FOR IMAGES AND EQUATIONS
// ============================================

// Create context menu
var $contextMenu = $('<div>')
    .attr('id', 'image-context-menu')
    .css({
        'position': 'fixed',
        'background': 'white',
        'border': '1px solid #ccc',
        'box-shadow': '2px 2px 8px rgba(0,0,0,0.2)',
        'z-index': '10000',
        'display': 'none',
        'min-width': '180px',
        'padding': '5px 0'
    })

$('body').append($contextMenu)

var currentTarget = null

// Show context menu on right-click for images and equations
$(document).on('contextmenu', 'p figure, p.eq, .positioned-image', function(e) {
    e.preventDefault()
    currentTarget = $(this)

    // Clear previous menu content
    $contextMenu.empty()

    // Get current image dimensions
    var img = currentTarget.find('img')
    var currentWidth = img.length > 0 ? Math.round(img.width()) : 0
    var currentHeight = img.length > 0 ? Math.round(img.height()) : 0

    // Create Delete menu item
    var $deleteItem = $('<div>')
        .text('Delete')
        .attr('data-action', 'delete')
        .css({
            'padding': '8px 12px',
            'cursor': 'pointer',
            'border-bottom': '1px solid #eee'
        })
        .hover(
            function() { $(this).css('background', '#f0f0f0') },
            function() { $(this).css('background', 'white') }
        )

    $contextMenu.append($deleteItem)

    // Create Size section only if there's an image
    if (img.length > 0) {
        // Store aspect ratio
        var aspectRatio = currentWidth / currentHeight

        // Size label
        var $sizeLabel = $('<div>')
            .text('Current size: ' + currentWidth + 'x' + currentHeight)
            .css({
                'padding': '8px 12px',
                'font-size': '11px',
                'color': '#666',
                'border-bottom': '1px solid #eee'
            })

        // Width input
        var $widthInput = $('<div>')
            .css({
                'padding': '8px 12px',
                'border-bottom': '1px solid #eee'
            })
            .html('<label style="font-size: 12px;">Width: <input type="number" id="ctx-width" value="' + currentWidth + '" style="width: 60px; margin-left: 5px;" /></label>')

        // Height input
        var $heightInput = $('<div>')
            .css({
                'padding': '8px 12px',
                'border-bottom': '1px solid #eee'
            })
            .html('<label style="font-size: 12px;">Height: <input type="number" id="ctx-height" value="' + currentHeight + '" style="width: 60px; margin-left: 5px;" /></label>')

        // Apply button
        var $applyBtn = $('<div>')
            .text('Apply')
            .attr('data-action', 'apply-size')
            .css({
                'padding': '8px 12px',
                'cursor': 'pointer',
                'text-align': 'center',
                'background': '#e0e0e0',
                'font-weight': 'bold'
            })
            .hover(
                function() { $(this).css('background', '#d0d0d0') },
                function() { $(this).css('background', '#e0e0e0') }
            )

        $contextMenu.append($sizeLabel, $widthInput, $heightInput, $applyBtn)

        // Add event handlers for maintaining aspect ratio
        setTimeout(function() {
            $('#ctx-width').on('input', function() {
                var newWidth = parseInt($(this).val())
                if (newWidth > 0) {
                    var newHeight = Math.round(newWidth / aspectRatio)
                    $('#ctx-height').val(newHeight)
                }
            })

            $('#ctx-height').on('input', function() {
                var newHeight = parseInt($(this).val())
                if (newHeight > 0) {
                    var newWidth = Math.round(newHeight * aspectRatio)
                    $('#ctx-width').val(newWidth)
                }
            })
        }, 0)
    }

    $contextMenu.css({
        'left': e.pageX + 'px',
        'top': e.pageY + 'px',
        'display': 'block'
    })

    return false
})

// Hide menu when clicking elsewhere
$(document).on('click', function(e) {
    if (!$(e.target).closest('#image-context-menu').length) {
        $contextMenu.hide()
    }
})

// Handle menu item clicks
$contextMenu.on('click', 'div[data-action]', function(e) {
    e.stopPropagation()
    var action = $(this).attr('data-action')

    if (!currentTarget) return

    if (action === 'delete') {
        // Delete the element
        if (confirm('Delete this element?')) {
            currentTarget.remove()
            // Trigger save to update the file
            socket.emit('update_thumbnail')
        }
        $contextMenu.hide()
    } else if (action === 'apply-size') {
        // Apply new size
        var newWidth = parseInt($('#ctx-width').val())
        var newHeight = parseInt($('#ctx-height').val())

        var img = currentTarget.find('img')
        if (img.length > 0 && newWidth > 0 && newHeight > 0) {
            // Apply CSS changes
            img.css({
                'width': newWidth + 'px',
                'height': newHeight + 'px'
            })

            // Get the image ID from the parent figure element
            var imageId = currentTarget.attr('id')
            if (imageId) {
                // For images, remove the random number suffix (last 3 chars if ends with 2 digits)
                var cleanId = imageId.match(/\d{2}$/) ? imageId.slice(0,-3) : imageId

                // Send size update to server
                // Format: "imageId§§width§§height"
                socket.emit('size_img', cleanId + '§§' + newWidth + '§§' + newHeight)
                console.log('Saving image size:', cleanId, newWidth + 'x' + newHeight)
            }

            // Update thumbnail
            socket.emit('update_thumbnail')
        }
        $contextMenu.hide()
    }
})
