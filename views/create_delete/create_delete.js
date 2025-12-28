// ============================================
// CREATE AND DELETE SLIDES
// ============================================

//------------------ new diapo

key('ctrl+p', function () {                      // Add a new diapo
    console.log('Creating new slide after index:', diapo_index);

    // Send request to create new slide after current index
    socket.emit('make_new_diap', diapo_index);

    // Show notification
    var $notification = $('<div>')
        .text('Creating new slide...')
        .css({
            'position': 'fixed',
            'top': '20px',
            'left': '50%',
            'transform': 'translateX(-50%)',
            'background': '#28a745',
            'color': 'white',
            'padding': '15px 30px',
            'border-radius': '4px',
            'z-index': '10001',
            'font-family': 'Arial, sans-serif',
            'box-shadow': '0 2px 8px rgba(0,0,0,0.3)'
        });
    $('body').append($notification);

    // Auto-remove notification after 2 seconds
    setTimeout(function() {
        $notification.fadeOut(500, function() { $(this).remove(); });
    }, 2000);

    return false;
});

// Listen for server confirmation and navigate to new slide
socket.on('new_slide_created', function(new_index) {
    console.log('New slide created at index:', new_index);
    // Navigate to the newly created slide
    setTimeout(function() {
        window.location.href = 'd' + new_index;
    }, 100);
});

//------------------ duplicate the slide

key('ctrl+d', function () {                      // Duplicate current slide
    console.log('Duplicating slide at index:', diapo_index);

    // Send request to duplicate current slide
    socket.emit('duplicate_diap', diapo_index);

    // Show notification
    var $notification = $('<div>')
        .text('Duplicating slide...')
        .css({
            'position': 'fixed',
            'top': '20px',
            'left': '50%',
            'transform': 'translateX(-50%)',
            'background': '#17a2b8',
            'color': 'white',
            'padding': '15px 30px',
            'border-radius': '4px',
            'z-index': '10001',
            'font-family': 'Arial, sans-serif',
            'box-shadow': '0 2px 8px rgba(0,0,0,0.3)'
        });
    $('body').append($notification);

    // Auto-remove notification after 2 seconds
    setTimeout(function() {
        $notification.fadeOut(500, function() { $(this).remove(); });
    }, 2000);

    return false;
});

// Listen for server confirmation and navigate to duplicated slide
socket.on('slide_duplicated', function(duplicate_index) {
    console.log('Slide duplicated at index:', duplicate_index);
    // Navigate to the duplicated slide
    setTimeout(function() {
        window.location.href = 'd' + duplicate_index;
    }, 100);
});

// Handle duplication errors
socket.on('duplicate_error', function(message) {
    console.error('Duplication error:', message);
    var $errorMsg = $('<div>')
        .text('Error: ' + message)
        .css({
            'position': 'fixed',
            'top': '20px',
            'left': '50%',
            'transform': 'translateX(-50%)',
            'background': '#dc3545',
            'color': 'white',
            'padding': '15px 30px',
            'border-radius': '4px',
            'z-index': '10001',
            'font-family': 'Arial, sans-serif',
            'box-shadow': '0 2px 8px rgba(0,0,0,0.3)'
        });
    $('body').append($errorMsg);
    setTimeout(function() { $errorMsg.fadeOut(500, function() { $(this).remove(); }); }, 3000);
});

//------------------ delete the slide - custom confirmation dialog

function showDeleteConfirmation(slideIndex, callback) {
    // Create overlay
    var $overlay = $('<div>')
        .css({
            'position': 'fixed',
            'top': '0',
            'left': '0',
            'width': '100%',
            'height': '100%',
            'background': 'rgba(0, 0, 0, 0.5)',
            'z-index': '10000',
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'center'
        });

    // Create dialog box
    var $dialog = $('<div>')
        .css({
            'background': 'white',
            'border': '2px solid #333',
            'border-radius': '8px',
            'padding': '30px',
            'min-width': '400px',
            'box-shadow': '0 4px 12px rgba(0,0,0,0.3)',
            'font-family': 'Arial, sans-serif'
        });

    // Message
    var $message = $('<p>')
        .text('Are you sure you want to delete slide ' + slideIndex + '?')
        .css({
            'margin': '0 0 20px 0',
            'font-size': '16px',
            'color': '#333',
            'text-align': 'center'
        });

    // Buttons container
    var $buttons = $('<div>')
        .css({
            'display': 'flex',
            'gap': '10px',
            'justify-content': 'center'
        });

    // Cancel button
    var $cancelBtn = $('<button>')
        .text('Cancel')
        .css({
            'padding': '10px 25px',
            'font-size': '14px',
            'background': '#6c757d',
            'color': 'white',
            'border': 'none',
            'border-radius': '4px',
            'cursor': 'pointer',
            'font-weight': 'bold'
        })
        .on('mouseenter', function() { $(this).css('background', '#5a6268'); })
        .on('mouseleave', function() { $(this).css('background', '#6c757d'); })
        .on('click', function() {
            $overlay.remove();
            callback(false);
        });

    // OK button
    var $okBtn = $('<button>')
        .text('OK')
        .css({
            'padding': '10px 25px',
            'font-size': '14px',
            'background': '#dc3545',
            'color': 'white',
            'border': 'none',
            'border-radius': '4px',
            'cursor': 'pointer',
            'font-weight': 'bold'
        })
        .on('mouseenter', function() { $(this).css('background', '#c82333'); })
        .on('mouseleave', function() { $(this).css('background', '#dc3545'); })
        .on('click', function() {
            $overlay.remove();
            callback(true);
        });

    // Assemble dialog
    $buttons.append($cancelBtn).append($okBtn);
    $dialog.append($message).append($buttons);
    $overlay.append($dialog);
    $('body').append($overlay);
}

key('alt+ctrl+x', function(){
    // Prevent deletion of the first slide (slide 0)
    if (diapo_index === 0) {
        showDeleteConfirmation(0, function(confirmed) {
            if (!confirmed) return;
            // Even if confirmed, show error for slide 0
            var $errorMsg = $('<div>')
                .text('Cannot delete the first slide (slide 0)!')
                .css({
                    'position': 'fixed',
                    'top': '20px',
                    'left': '50%',
                    'transform': 'translateX(-50%)',
                    'background': '#dc3545',
                    'color': 'white',
                    'padding': '15px 30px',
                    'border-radius': '4px',
                    'z-index': '10001',
                    'font-family': 'Arial, sans-serif',
                    'box-shadow': '0 2px 8px rgba(0,0,0,0.3)'
                });
            $('body').append($errorMsg);
            setTimeout(function() { $errorMsg.fadeOut(500, function() { $(this).remove(); }); }, 2000);
        });
        return false;
    }

    // Ask for confirmation before deleting
    showDeleteConfirmation(diapo_index, function(confirmed) {
        if (!confirmed) return; // User cancelled

        var pos_before = diapo_index - 1;

        // Send delete event FIRST (before navigation to avoid race condition)
        socket.emit('delete', diapo_index);

        // Then navigate after a short delay to ensure server receives the event
        setTimeout(function() {
            window.location.href = 'd' + pos_before;
        }, 100);
    });

    return false;
});
