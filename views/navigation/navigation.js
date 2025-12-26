// ============================================
// NAVIGATION SYSTEM (Arrows, Page Up/Down, Slider)
// ============================================

function set_page_num_and_slider(diapo_index){

      /*
      Set the page number and position in the slider
      */

      if (diapo_index != 0){

            var isInIframe = (window.self !== window.top);

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
var diapo_index = {{ diapo_index }}  // Initialize with value from server-side template
console.log('Initial diapo_index from template:', diapo_index)

socket.on('numdiap', function(numdiap){
      console.log('Received numdiap from server:', numdiap)
      diapo_index = parseInt(numdiap)
      set_page_num_and_slider(diapo_index)
     })  // index of current diap
// Emit initial diapo_index to server
console.log('Emitting initial diapo_index to server:', diapo_index)
socket.emit('numdiap', diapo_index)
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

key('right, pagedown', function(event){
    if ((diapo_index + 1) < diapo_max) { diapo_index += 1 }
    location.replace("d{}".format(diapo_index));
    socket.emit('numdiap', diapo_index)
    return false;  // prevent default
});
console.log('RIGHT handler registered');

key('left, pageup', function(event){
    if ((diapo_index - 1) > -1) { diapo_index += -1 }
    location.replace("d{}".format(diapo_index));
    socket.emit('numdiap', diapo_index)
    return false;  // prevent default
});

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
