// ============================================
// VOICE COMMANDS
// ============================================

//------------------------ hiding voice tag

$('p').each(function(){
    var regtagv = new RegExp( '!tagv' );
    if ( $(this).text().match(regtagv) ){
         $(this).hide()
    }
})

//-----------------------------  go to markdown by voice

socket.on('markdown', function(){

     /*
     trigger markdown view
     */

     //alert('go to markdown !!! ')
     window.location.href = 'text'   // flip from html to textarea

    })

//--------------------------------  Help voice commands

var help_voice_cmds = $('<div>').attr('id','help_voice_cmds')
help_voice_cmds.css(infos_css_dict)

help_voice_cmds.draggable()
$('#content').append(help_voice_cmds.hide())
help_voice_cmds.click(function(){
    $(this).toggle()
})

//------------------------ available voice commands

var voice_cmds = function(){/*

# Voice commands

* Voice ::
    * aide : help
    * nouvelle diapo : create new slide
    * toutes les diapos : view all the slides
    * memos : show memos..
    * diapo + num : go to diapo num ..

*/}.toString().slice(14,-3)

$('#help_voice_cmds').html(simple_md(voice_cmds))

//----------- voice commands

key('alt+v', function(){         // Show the help
    $('#help_voice_cmds').toggle()
  });
