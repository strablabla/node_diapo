// ============================================
// MOVE OBJECTS (Images and Equations)
// ============================================

//---------------------------------

// Make both images (p figure) and equations (p.eq) draggable
$('p figure, p.eq').each(function(){
    var $element = $(this);
    var wasDragged = false;

    $element.draggable({
        start: function() {
            wasDragged = false;
        },
        drag: function() {
            wasDragged = true;
        },
        stop: function() {
            // Keep wasDragged true for a moment after stopping
            setTimeout(function() {
                wasDragged = false;
            }, 200);
        }
    });

    // Prevent click after dragging
    $element.on('click', function(e) {
        if (wasDragged) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }
    });

    $element.find('img').on('click', function(e) {
        if (wasDragged) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }
    });
})

//------------------------- fixing image's and equation's position

key('ctrl+s', function(e){

      /*
      Fixing image and equation position..
      */

      // Prevent browser's default save dialog
      e.preventDefault()

      var count = 0
      $('p figure, p.eq').each(function(){
          var pos = $(this).offset()
          var id = $(this).attr('id')
          if (id) {
              // For images, remove the -## suffix (slice 0,-3)
              // For equations, use the id as-is
              var cleanId = id.match(/\d{2}$/) ? id.slice(0,-3) : id
              socket.emit('pos_img', cleanId + '§§' + JSON.stringify(pos))
              count++
          }
      })

      // Show confirmation message
      if (count === 0) return  // Don't show message if nothing to save

      // Create and display temporary message div
      var $msgDiv = $('<div>')
          .text('Position saved')
          .css({
              'position': 'fixed',
              'top': '50%',
              'left': '50%',
              'transform': 'translate(-50%, -50%)',
              'background-color': '#4CAF50',
              'color': 'white',
              'padding': '20px 40px',
              'border-radius': '5px',
              'font-size': '18px',
              'z-index': '10000',
              'box-shadow': '0 4px 6px rgba(0,0,0,0.3)'
          })

      $('body').append($msgDiv)

      // Remove message after 1 second
      setTimeout(function() {
          $msgDiv.fadeOut(300, function() {
              $(this).remove()
          })
      }, 1000)

      // Update thumbnail for current slide
      socket.emit('update_thumbnail')

      return false  // Prevent any default browser behavior
})
