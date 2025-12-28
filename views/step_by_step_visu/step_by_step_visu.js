// ============================================
// PROGRESSIVE VISUALIZATION (STEP BY STEP)
// ============================================

function match__inject_stop(elem, patt){

      /*
      Inject class stop
      */

      elem.each(function(){
           var htm = $(this).html()
           if (htm.match(patt)){
               pattern = htm.match(patt)
               var class_added = pattern.slice(1,-1)
               $(this).attr('class', 'stop')                  // adding Class
           }
       })
}

match__inject_stop($('li'), /\!stp/) // inject Class stop

function progressive_visu_hide_show(elem,showline,count,reg){

    /*
    hide show...
    */

    if ( !showline  ){ elem.hide() } // hide if after tag !stp..
    else if (showline & ( count > 0 )){
        elem.show()
        elem.find('li').show()
        elem.html(elem.html().replace(reg,''))
     }

}

function progressive_visualization(stp){

    /*
    Show the li or p one after another according to tags !stp ..
    */

    var count = 0;
    var reg = /\!stp/
    var showline = true;
    var hasHiddenContent = false;
    var lastVisibleElement = null;

    $('li, p').not('#num, #footlim, .foot, .head, #infos, #infos *').each(function(){
         var txt = $(this).text()
         //alert(htm)
         if ($(this).hasClass('stop')){
             count += 1
             if (count > stp){
                 showline = false
                 hasHiddenContent = true
             }
         }
        progressive_visu_hide_show($(this),showline,count,reg )
        if ($(this).hasClass('targ_memo')){ $(this).hide() }   // hide memo tags..
        if ($(this).hasClass('foot')){ $(this).show() }        // show footer

        // Track the last visible element
        if (showline && $(this).is(':visible')) {
            lastVisibleElement = $(this)
        }
    })

    // Show or hide the "more content" indicator
    if (hasHiddenContent && lastVisibleElement) {
        if ($('#more-content-indicator').length === 0) {
            // Create indicator if it doesn't exist
            var indicator = $('<div>').attr('id', 'more-content-indicator')

            // Create three separate dots for smooth circles
            for (var i = 0; i < 3; i++) {
                var dot = $('<span>').text('•')
                indicator.append(dot)
            }

            indicator.css({
                'position': 'absolute',
                'left': '50%',
                'transform': 'translateX(-50%)',
                'font-size': '25px',
                'color': '#888',
                'z-index': '90',
                'letter-spacing': '5px',
                'text-align': 'center'
            })
            $('body').append(indicator)
        }

        // Position indicator just below the last visible element
        var lastElemOffset = lastVisibleElement.offset()
        var lastElemHeight = lastVisibleElement.outerHeight()
        var topPosition = lastElemOffset.top + lastElemHeight + 10

        $('#more-content-indicator').css('top', topPosition + 'px').show()
    } else {
        $('#more-content-indicator').hide()
    }
}

//------------------------------- Progressive visualization..

progressive_visualization(stp)

// Count total number of steps
var maxSteps = $('.stop').length;

// Direction for B key: 1 = forward, -1 = backward
var bDirection = 1;
var bPendingClick = false; // Flag to skip one click at boundaries

key('down', function(){  // down arrow - always goes forward
    stp += 1;
    progressive_visualization(stp)
})

key('b', function(){  // B key - goes back and forth
    // If we're waiting for a "neutral" click at a boundary
    if (bPendingClick) {
        bPendingClick = false;
        return; // Do nothing on this click
    }

    stp += bDirection;

    // Check if we hit the bottom
    if (stp >= maxSteps) {
        stp = maxSteps;
        bDirection = -1; // Reverse direction
        bPendingClick = true; // Next click will be neutral
    }
    // Check if we hit the top
    else if (stp <= 0) {
        stp = 0;
        bDirection = 1; // Reverse direction
        bPendingClick = true; // Next click will be neutral
    }

    progressive_visualization(stp)
})

key('up', function(){  // up arrow - always goes backward
    if (stp > 0) {
        stp -= 1;
        progressive_visualization(stp)
    }
})
