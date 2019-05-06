
var new_strap = function(diapo_index){

      return function(){/*
{% extends 'diapo_template.html' %}

{% block diapo_content %}

{% include 'diapos/d{}.html' %}

{% endblock %}
*/}.toString().slice(14,-3).format(diapo_index)

}

exports.modify_html_with_newtext = function(socket, fs, util, new_text, diapo_index){

    console.log('save before changing the text')
    util.save_current_version(new_text,false)  // save before change
    socket.emit('page_return_to_html','') // send message back for sending the scroll pos.
    var nstrap = new_strap(diapo_index)
    console.log(nstrap)
    fs.writeFile("views/diapos/d{}.html".format(diapo_index), new_text, function(err) {
          if(err) { return console.log(err); }
          console.log('new text modified and saved in views/d{}.html'.format(diapo_index))
    }); // end write file
    fs.writeFile("views/diapos/diapo{}.html".format(diapo_index), nstrap, function(err) {
          if(err) { return console.log(err); }
          console.log('new text modified and saved in views/diapo{}.html'.format(diapo_index))
    }); // end write file

}
