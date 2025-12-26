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

//------------------------- Initial positioning for h3 headers from !pos markers
// MUST run BEFORE change_pos($('p')) to process !pos markers before they're consumed

function change_pos_h3(elem){
      /*
      Change the vertical position of h3 elements
      The !pos marker is on the next line after the h3 in the HTML
      */

      var reg1 = /\!pos\d+\/\d+/

      elem.each(function(){
           var $h3 = $(this)
           var $prev = $h3.prev()
           var $next = $h3.next()

           // Hide any !pos marker that appears BEFORE the h3 (shouldn't be there)
           // BUT only if it's a "pure" !pos marker (not an equation or image with !pos)
           if ($prev.length > 0) {
               var prevText = $prev.text().trim()
               if (prevText.match(reg1)) {
                   // Check if this is a pure !pos marker (ONLY "!pos123/456" with nothing else)
                   var isPurePosMarker = prevText.match(/^!pos\d+\/\d+$/)
                   if (isPurePosMarker) {
                       console.log('Found stray !pos before h3, hiding it:', prevText)
                       $prev.hide()
                   } else {
                       console.log('Found !pos before h3 but it contains other content (equation/image), NOT hiding it:', prevText.substring(0, 50))
                   }
               }
           }

           // Check if the next element is a text node or paragraph containing !pos
           if ($next.length > 0) {
               var nextText = $next.text().trim()
               if (nextText.match(reg1)) {
                   // Check if this !pos is ONLY the position marker (not followed by content like !eq)
                   // A h3 position marker should be JUST "!pos123/456" with nothing else
                   var isPurePos = nextText.match(/^!pos\d+\/\d+$/)

                   if (isPurePos) {
                       var regmatch = nextText.match(reg1)
                       var coord = regmatch[0].split('!pos')[1].split('/')
                       var x = parseFloat(coord[0])
                       var y = parseFloat(coord[1])

                       console.log('Restoring h3 position:')
                       console.log('  Next element text:', nextText)
                       console.log('  Coords from !pos: x=' + x + ', y=' + y)
                       console.log('  Element:', $h3[0])

                       // For h3: set position relative with only top offset
                       $h3.css({'position':'relative', 'top':y + 'px', 'margin-left':'100px'})

                       // Hide the !pos marker
                       $next.hide()
                   } else {
                       console.log('Next element contains !pos but is not a pure h3 position marker:', nextText.substring(0, 50))
                   }
               }
           }
      });
}

change_pos_h3($('h3'))
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

      // Save positions for images, equations, and h3 headers
      $('p figure, p.eq, h3').each(function(){
          var $elem = $(this)

          var cssLeft, cssTop

          if ($elem.is('figure')) {
              // For images: <figure> is draggable and has position:relative inside <p position:absolute>
              // We need to combine both positions
              var $p = $elem.parent('p')
              var pLeft = parseInt($p.css('left')) || 0
              var pTop = parseInt($p.css('top')) || 0
              var figLeft = parseInt($elem.css('left')) || 0
              var figTop = parseInt($elem.css('top')) || 0

              cssLeft = pLeft + figLeft
              cssTop = pTop + figTop
          } else if ($elem.is('h3')) {
              // For h3: only save vertical position (top), left should remain at margin-left
              cssLeft = 100  // Keep the margin-left value

              // Get the top value - jQuery UI draggable sets it directly
              var topVal = $elem.css('top')
              cssTop = parseInt(topVal) || 0

              console.log('h3 CSS top value:', topVal)
              console.log('h3 parsed cssTop:', cssTop)
          } else {
              // For equations: position is directly on <p>
              cssLeft = parseInt($elem.css('left')) || 0
              cssTop = parseInt($elem.css('top')) || 0
          }

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

          if ($elem.is('h3')) {
              console.log('Saving h3 position:')
              console.log('  Element:', $elem[0])
              console.log('  CSS top:', cssTop)
              console.log('  Calculated pos:', pos)
          }

          // For images, ID is on the <figure>, for equations it's on <p>, for h3 it's on h3
          var id = $elem.attr('id')

          if ($elem.is('figure')) {
              var $p = $elem.parent('p')
              console.log('Saving image position:')
              console.log('  Figure element:', $elem[0])
              console.log('  Parent p element:', $p[0])
              console.log('  Figure ID:', id)
              console.log('  P left/top:', {left: parseInt($p.css('left')), top: parseInt($p.css('top'))})
              console.log('  Figure left/top:', {left: parseInt($elem.css('left')), top: parseInt($elem.css('top'))})
              console.log('  Combined left/top:', {left: cssLeft, top: cssTop})
              console.log('  Calculated pos:', pos)
          }

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
