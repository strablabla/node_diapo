// ============================================
// CREATE AND DELETE SLIDES
// ============================================

//------------------ new diapo

key('ctrl+p', function () {                      // Add a new diapo
    socket.emit('make_new_diap', '')
    alert('adding a new diapo !!!!!');
    return false
});

//------------------ delete the slide

key('alt+ctrl+x', function(){
    pos_before = diapo_index-1   //
    //alert('delete')
    window.location.href = 'd' + pos_before;
    socket.emit('delete', diapo_index)
    });
