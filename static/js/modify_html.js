
var new_strap = function(diapo_index){

    /*
    New diapo..
    */

      return function(){/*
{% extends 'diapo_template.html' %}

{% block diapo_content %}

{% include 'diapos/d{}.html' %}

{% endblock %}
*/}.toString().slice(14,-3).format(diapo_index)

}

function create_diapo_md(fs, diapo_index, new_text){

      /*
      Markdown
      */

      fs.writeFile("views/diapos/d{}.html".format(diapo_index), new_text, function(err) {
            if(err) { return console.log(err); }
            console.log('new text modified and saved in views/d{}.html'.format(diapo_index))
      }); // end write file

}

function create_diapo_jinja(fs, diapo_index, nstrap){

      /*
      Jinja
      */

      fs.writeFile("views/diapos/diapo{}.html".format(diapo_index), nstrap, function(err) {
            if(err) { return console.log(err); }
            console.log('new text modified and saved in views/diapo{}.html'.format(diapo_index))
      }); // end write file

}

function create_md_jinja(fs, diapo_index, new_text){

      /*
      Markdown and jinja
      */

      var nstrap = new_strap(diapo_index) // new diapo jinja html code..
      console.log(nstrap)
      create_diapo_md(fs, diapo_index, new_text)   // markdown code..
      create_diapo_jinja(fs, diapo_index, nstrap)

}

exports.modify_html_with_newtext = function(socket, fs, util, new_text, diapo_index){

    /*
    Modify the files after modification of the markdown in Code mirror..
    */

    console.log('save before changing the text')
    util.save_current_version(new_text,false)    // save before change
    socket.emit('page_return_to_html','')        // send message back for sending the scroll pos.
    create_md_jinja(fs, diapo_index, new_text)   // create markdown and jinja parts.. 

}
