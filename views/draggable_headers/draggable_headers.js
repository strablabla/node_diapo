// ============================================
// DRAGGABLE HEADERS (h3 vertical drag only)
// ============================================

//------------------------- Make h3 draggable vertically

$('h3').each(function(index){
    var $h3 = $(this);

    // Force unique IDs to h3 for position saving (override any existing ID)
    var h3_id = 'h3-' + index;
    $h3.attr('id', h3_id);

    // Make draggable only on vertical axis
    $h3.draggable({
        axis: 'y',  // Only vertical movement
        cursor: 'ns-resize'  // North-South resize cursor
    });
});
