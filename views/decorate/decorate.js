// ============================================
// DECORATION FUNCTIONS (Header, Footer, Title & Colored Frames)
// ============================================

function make_title(){

      /*
      Style h1 title
      syntax : # My Title !tit
      Applies centered style and 30px font to h1 elements with !tit marker
      */

      var reg = /\!tit/
      var dict_tit = {
          'text-align': 'center',
          'font-size': '40px',
          'font-style': 'italic',
          'margin-top': '100px',
          'margin-bottom': '70px',
          'text-shadow': 'none'
      }

      $('h1').each(function(){
          var txt = $(this).text()
          if (txt.match(reg)){
              // Add slide_title class
              $(this).addClass('slide_title')

              // Apply CSS styling and remove the !tit marker from text
              elem_match__inject_css($(this), reg, dict_tit)
          }
      })
}

function make_head(){

      /*
      header
      syntax : !head blablabla..
      */

      var dichead = {'position':'absolute','top':'40px',
                     'font-size':'120%', 'right':'50px',
                     'white-space':'nowrap'}
      p_match__inject_css(/\!head/, dichead)
      $('#content').append($('</p>').attr('id','footlim'))
      $('#footlim').html('<hr>')
      $('#footlim').css({'position':'absolute','top':'780px'})

}

function make_foot(){

      /*
      footer
      syntax : !foot blablabla..
      */

      var dicfoot = {'position':'absolute','bottom':'20px','font-size':'110%'}
      p_match__inject_css(/\!foot/, dicfoot)

      $('#content').append($('</p>').attr('id','footlim'))
      $('#footlim').html('<hr>')
      $('#footlim').css({'position':'absolute','bottom':'70px'})

}

function frame_col(){

      /*
      Colored frame or band on a title (h1, h2, h3):
        !fb  !fr  !fg  !fo  !fy   frame around it   (blue, red, green, orange, yellow)
        !hb  !hr  !hg  !ho  !hy   band behind it, as a highlighter
      Only these letters: "!head", "!foot"... are left alone.

      The frame or band goes on a span around the text, not on the title: the
      title stays a block, on its own line (two decorated ## one below the
      other, not side by side), and keeps its alignment (a # stays centered).
      */

      var frame_col = {'b':'blue', 'r':'red', 'g':'#5cc95c', 'o':'orange', 'y':'#e6c200'}
      var band_col = {'b':'#cce0ff', 'r':'#ffd1d1', 'g':'#cdf2cd', 'o':'#ffdfb0', 'y':'#fff2a0'}
      var marks = [
            { reg: /\!f([brgoy])\b/, css: function(c){ return {'border': '3px solid ' + frame_col[c]} } },
            { reg: /\!h([brgoy])\b/, css: function(c){ return {'background-color': band_col[c], 'border-radius': '4px'} } }
      ]
      $('h1, h2, h3').each(function(){
            var text = $(this).text(), css = null
            marks.forEach(function(mark){              // both may be used: !fb !hy
                  var m = text.match(mark.reg)
                  if (!m) return
                  css = $.extend(css || {'display': 'inline-block', 'padding': '7px'}, mark.css(m[1]))
                  text = text.replace(mark.reg, '')
            })
            if (css) $(this).empty().append($('<span/>').addClass('title-deco').text(text.trim()).css(css))
      })
}

make_title() // style h1 title with !tit marker
frame_col() // frame or band of color on the titles

// ============================================
// BACKGROUND IMAGE SETUP
// ============================================



// Pass background config to JavaScript
{% if config_desk.background %}
window.config_desk_background = '{{ config_desk.background }}';
{% endif %}

function setupBackground(backgroundImage) {
    if (!backgroundImage) {
        return;
    }

    console.log('Setting up background overlay...');

    // Create full-screen background overlay
    var bgOverlay = $('<div>').attr('id', 'bg-overlay').css({
        'position': 'fixed',
        'top': '0',
        'left': '0',
        'right': '0',
        'bottom': '0',
        'width': '100vw',
        'height': '100vh',
        'background-image': 'url(/bckgrds/' + backgroundImage + ')',
        'background-size': 'cover',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
        'background-attachment': 'fixed',
        'opacity': '0.1',
        'z-index': '-999999',
        'pointer-events': 'none'
    });

    // Prepend to HTML (before body)
    $('html').prepend(bgOverlay);

    // Force transparent backgrounds on all elements
    $('body, html, body > *, xmp, #content').each(function() {
        // Spare an element that sets its own background inline: that is a choice,
        // not a stylesheet default. Panels such as the Ctrl+H help are white this
        // way, and turning them transparent let the slide show through them.
        if (this.style.backgroundColor) return;
        var bg = $(this).css('background-color');
        if (bg === 'rgb(255, 255, 255)' || bg === '#ffffff' || bg === 'white') {
            $(this).css('background-color', 'transparent');
        }
    });

    console.log('Background overlay created, checking elements...');
    console.log('Body background:', $('body').css('background-color'));
    console.log('HTML background:', $('html').css('background-color'));
}

// Initialize background on document ready if background is configured
$(document).ready(function() {
    // Check if background is set via global config_desk variable
    if (typeof window.config_desk_background !== 'undefined' && window.config_desk_background) {
        setupBackground(window.config_desk_background);
        setTimeout(function() { setupBackground(window.config_desk_background); }, 500);
    }
});

// ============================================
// AUTO-HIDE CURSOR AFTER INACTIVITY
// ============================================

(function() {
    var cursorTimeout;

    // Add CSS to hide cursor with very strong selectors
    var $cursorStyle = $('<style>')
        .attr('id', 'cursor-hide-style')
        .text(`
            body.hide-cursor,
            body.hide-cursor *,
            html.hide-cursor,
            html.hide-cursor * {
                cursor: none !important;
            }
        `);
    $('head').append($cursorStyle);

    // Hide cursor after 2 seconds of inactivity
    function resetCursorTimeout() {
        // Show cursor
        $('body').removeClass('hide-cursor');
        $('html').removeClass('hide-cursor');

        // Clear existing timeout
        if (cursorTimeout) {
            clearTimeout(cursorTimeout);
        }

        // Set timeout to hide cursor after 2 seconds
        cursorTimeout = setTimeout(function() {
            $('body').addClass('hide-cursor');
            $('html').addClass('hide-cursor');
            console.log('Cursor hidden');
        }, 2000); // 2 seconds
    }

    // Listen to mouse movement
    $(document).on('mousemove', function() {
        resetCursorTimeout();
    });

    // Initialize on page load
    $(document).ready(function() {
        resetCursorTimeout();
        console.log('Auto-hide cursor initialized');
    });
})();