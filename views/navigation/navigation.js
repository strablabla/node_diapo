// ============================================
// NAVIGATION SYSTEM (Arrows, Page Up/Down, Slider)
// ============================================

color_bar = "{{color_bar}}" //'violet'

// A slide shown in the full-screen frame (right-click menu, app_menu.js)
// behaves as the main page: slider, chevrons, drawing... The other frames
// (thumbnails, global views) do not.
var IN_PRESENTER = false
try { IN_PRESENTER = !!(window.frameElement && window.frameElement.id === 'presenter-frame') } catch (e) {}
var IS_MAIN_PAGE = window.top === window || IN_PRESENTER

function set_page_num_and_slider(diapo_index){

      /*
      Set the page number and position in the slider
      */

      if (diapo_index === null) return       // not a slide: /all, /all_mini

      if (diapo_index != 0){

            var isInIframe = !IS_MAIN_PAGE;

            // In iframe, check if there's a preview parameter in URL
            var displayIndex = diapo_index;
            if (isInIframe) {
                var urlParams = new URLSearchParams(window.location.search);
                var previewNum = urlParams.get('preview');
                if (previewNum) {
                    displayIndex = parseInt(previewNum);
                }
            }
            console.log('isInIframe:', isInIframe, 'diapo_index:', diapo_index, 'displayIndex:', displayIndex);

            // Always show page number (both in main window and iframe)
            var numpage = displayIndex + '/' + (parseInt(diapo_max) - 1)

            // Only create #num if it doesn't exist
            if ($('#num').length === 0) {
                $('#content').append($('<p></p>').attr('id', 'num'))
            }

            // Update content and style
            $('#num').text(numpage).css({
                'position': 'absolute', 'bottom': '20px',
                'right': '30px', 'font-size': '20px',
                'z-index': '100'
            })

            // Only create slider if not inside an iframe
            if (!isInIframe) {
                // Calculate slider length to go up to 100px from right edge
                var sliderLength = window.innerWidth - 300  // 150px from left + 150px from right
                var initialSliderX = 150 + diapo_index*sliderLength/(diapo_max - 1)
                param_slider_x = [{'xbar': 150,
                                   'x': initialSliderX,
                                   'ybar': 50, 'y': 50,
                                   'col': color_bar, 'dir': 'x',
                                   'slength': sliderLength, 'action': chgx}]
                slide(param_slider_x, svg)  // 'violet'

                // Initialize slider_value with the initial position
                $('#slider_value').html(initialSliderX)
            }

        } // end if

}

//---------------

$('h1').css({'right':'5%'})
// Set from the server-side template. The /all and /all_mini views include
// this file without a slide index: null there, and no page number or slider.
var diapo_index = {{ diapo_index if diapo_index is defined else 'null' }}
console.log('Initial diapo_index from template:', diapo_index)

// The slide's own index comes from its URL, through the template, and is the
// only one to trust. The server answers each connection with its shared
// "current" index, i.e. whichever tab reported last: taking it showed wrong
// page numbers (or NaN, before maxdiap), and made the next arrow key jump from
// that wrong index. So the page tells the server where it is (the /text
// editor needs it), and ignores what comes back.
// Emit initial diapo_index to server
console.log('Emitting initial diapo_index to server:', diapo_index)
if (diapo_index !== null) socket.emit('numdiap', diapo_index)
var diapo_max = null
socket.on('maxdiap', function(text){
  console.log('Received maxdiap from server:', text)
  diapo_max = text
  // Set initial page number and slider once we have diapo_max
  set_page_num_and_slider(diapo_index)
  socket.emit('params','')
 })        // number max of diapo

// Register arrow key handlers with keymaster
console.log('===== REGISTERING ARROW/SPACE HANDLERS =====');
console.log('key function type:', typeof key);
console.log('socket:', socket);

// One slide forward (+1) or back (-1): the arrow keys, and the chevrons of
// the bottom-right corner.
function go_slide(delta){
    var target = diapo_index + delta
    if (target >= 0 && target < diapo_max) { diapo_index = target }
    location.replace("d{}".format(diapo_index));
    socket.emit('numdiap', diapo_index)
}

key('right, pagedown', function(event){
    go_slide(1)
    return false;  // prevent default
});
console.log('RIGHT handler registered');

key('left, pageup', function(event){
    go_slide(-1)
    return false;  // prevent default
});

//--------------- chevrons in the bottom-right corner

/*
The mouse in the bottom-right corner brings out two chevrons, next to the page
number: back and forward. They go away a moment after the mouse has left the
corner. In a shadow root, so that the slides' stylesheets cannot reach them;
their clicks stop there, unseen by the slide (drawing, step-by-step...).
Not on the /all views, nor in the thumbnails' iframes.
*/
function setup_corner_nav(){
    if (diapo_index === null || !IS_MAIN_PAGE) return

    var CORNER_W = 220, CORNER_H = 140     // px: the corner that shows them

    var host = document.createElement('div')
    host.id = 'corner-nav'
    host.style.cssText = 'position: fixed; right: 95px; bottom: 14px; margin: 0; padding: 0; '
                       + 'border: 0; z-index: 10001;'
    var shadow = host.attachShadow({ mode: 'open' })
    shadow.innerHTML = `
        <style>
            .nav {
                all: initial;
                display: flex;
                gap: 6px;
                opacity: 0;
                transform: translateY(8px);
                pointer-events: none;
                transition: opacity 0.18s ease-out, transform 0.18s ease-out;
            }
            .nav.shown {
                opacity: 1;
                transform: none;
                pointer-events: auto;
            }
            button {
                all: unset;
                box-sizing: border-box;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.95);
                box-shadow: 0 1px 5px rgba(0, 0, 0, 0.35);
                color: #333;
                cursor: pointer;
            }
            button:hover { background: #e8e8e8; }
            button:disabled { opacity: 0.35; cursor: default; background: rgba(255, 255, 255, 0.95); }
            svg { width: 22px; height: 22px; }
        </style>
        <div class="nav">
            <button data-delta="-1" title="Previous slide (←)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"
                     stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
            </button>
            <button data-delta="1" title="Next slide (→)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"
                     stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
            </button>
        </div>`
    document.body.appendChild(host)

    var nav = shadow.querySelector('.nav')
    var prev = shadow.querySelector('[data-delta="-1"]')
    var next = shadow.querySelector('[data-delta="1"]')

    shadow.querySelectorAll('button').forEach(function(button){
        button.addEventListener('click', function(){ go_slide(parseInt(button.dataset.delta)) })
    })
    ;['mousedown', 'mouseup', 'click', 'dblclick', 'pointerdown', 'pointerup', 'contextmenu'].forEach(function(type){
        host.addEventListener(type, function(e){ e.stopPropagation() })
    })

    var hideTimer = null
    function show(){
        clearTimeout(hideTimer)
        prev.disabled = diapo_index <= 0
        next.disabled = diapo_max !== null && diapo_index >= diapo_max - 1
        nav.classList.add('shown')
    }
    function scheduleHide(){
        clearTimeout(hideTimer)
        hideTimer = setTimeout(function(){ nav.classList.remove('shown') }, 800)
    }

    // Capture phase: seen even when a handler below stops the event.
    window.addEventListener('mousemove', function(e){
        var w = document.documentElement.clientWidth, h = document.documentElement.clientHeight
        if (e.clientX >= w - CORNER_W && e.clientY >= h - CORNER_H) show()
        else if (nav.classList.contains('shown')) scheduleHide()
    }, true)
    document.documentElement.addEventListener('mouseleave', scheduleHide)
}

$(document).ready(setup_corner_nav)

// interception laser signal

window.addEventListener('keydown', function (event) {
    // 116 est le code pour F5
    // event.metaKey / event.ctrlKey + 'r' pour le raccourci de recharge
    if (event.keyCode === 116 || (event.ctrlKey && event.key === 'r')) {
        console.log("Tentative de recharge bloquée !");
        event.preventDefault();
        return false;
    }
});
