

exports.emit_from_read = function(socket, count, patt, text, scroll_html_pos){

      /*
      Emit after the data read
      */

      console.log('DEBUG emit_from_read: patt = "' + patt + '"')
      socket.emit('message', text); // send the text read in html file to textarea
      var line_number = count.find_line_of_pattern(text, patt)
      console.log('DEBUG emit_from_read: line_number = ' + line_number)
      var json_line_patt = JSON.stringify( {'line':line_number, 'pattern':patt} );
      socket.emit('scroll', json_line_patt);  // send line number and pattern..
      socket.emit('scroll_html', scroll_html_pos)  // scroll position in the html..
      socket.emit('pattern', patt);       // send the pattern

}
