// ============================================
// HANDLE POSITION (Images and Equations)
// ============================================

//------------------------- Initial positioning from !pos markers

function change_pos(elem){

      /*
      Change the position of the element
      */

      var reg1 = /\!pos\d+\/\d+/

      elem.each(function(){
           var txt = $(this).text()
           var htm = $(this).html()
           if (txt.match(reg1)){
                  regmatch = txt.match(reg1)
                  var coord = regmatch[0].split('!pos')[1].split('/')
                  var x = parseFloat(coord[0])
                  var y = parseFloat(coord[1])

                  // Check if this paragraph contains an image
                  var hasImage = $(this).find('img').length > 0

                  // Debug for equations (check class, not text, since !eq was already removed)
                  if (!hasImage && $(this).hasClass('eq')) {
                      console.log('Restoring equation position:')
                      console.log('  Coords from !pos:', {x: x, y: y})
                      console.log('  Element:', $(this)[0])
                  }

                  if (hasImage) {
                      // For images: disable pointer-events on paragraph, enable on image
                      $(this).css({'position':'absolute','left':x + 'px', 'top':y + 'px', 'z-index':'1', 'pointer-events':'none', 'margin':'0', 'padding':'0'})
                      $(this).html(htm.replace(regmatch,''))
                      $(this).find('img').css('pointer-events', 'auto')
                  } else {
                      // For equations or other content: enable pointer-events on the whole paragraph
                      $(this).css({'position':'absolute','left':x + 'px', 'top':y + 'px', 'z-index':'1', 'pointer-events':'auto', 'margin':'0', 'padding':'0'})
                      $(this).html(htm.replace(regmatch,''))
                  }

                  // Mark with a class for special drag handling
                  $(this).addClass('positioned-image')
           }
      });
}

change_pos($('p'))

//------------------------- Make objects draggable

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
          var $elem = $(this)

          // Get position directly from CSS instead of using offset()
          // This is more reliable since these elements are position:absolute
          var cssLeft = parseInt($elem.css('left')) || 0
          var cssTop = parseInt($elem.css('top')) || 0

          var pos = {
              left: cssLeft,
              top: cssTop
          }

          if ($elem.hasClass('eq')) {
              console.log('Saving equation position:')
              console.log('  Element:', $elem[0])
              console.log('  CSS left/top:', {left: cssLeft, top: cssTop})
              console.log('  Calculated pos:', pos)
          }

          var id = $elem.attr('id')
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
