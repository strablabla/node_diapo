// ============================================
// GLOBAL VIEW AND MINIATURES
// ============================================

//------------------ gobal views

key('alt+a', function(){         // go to the global view of the slides..

    // alert("d index is "+ diapo_index)
    const diapo_id = 'd' + diapo_index;
    location.replace("all#" + diapo_id)

    diapo_index = 0
    socket.emit('numdiap', diapo_index)  // set diapo_index to 0 for avoiding bad page number..
  });


//------------------ go to miniatures

key('alt+m', function(){         // show all the slides as miniatures
    window.location.href = 'all_mini';
    diapo_index = 0
    socket.emit('numdiap', diapo_index)
  });
