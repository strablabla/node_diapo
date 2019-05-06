var express = require('express')
var path = require("path");
var open = require('open');
var fs = require('fs');
var _ = require('underscore');
var countFiles = require('count-files');
var nunjucks  = require('nunjucks');
var count = require('./static/js/count_lines');
var util = require('./static/js/util');
var re = require('./static/js/read_emit');
var modify = require('./static/js/modify_html');

//--------------  Server

var app = express()
var server = require('http').createServer(app);

var patt = '' // pattern for scroll position
var scroll_html_pos = 0 //
var comment = false;
diapo_index = 0;

String.prototype.format = function () {
  var i = 0, args = arguments;
  return this.replace(/{}/g, function () {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
};

nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch:true
    // echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
});

function addget(app,i){

      var addrd = '/d{}'.format(i)
      var adddiap = 'diapos/diapo{}.html'.format(i)
      console.log(addrd + '__' + adddiap)
      app.get(addrd, function(req, res){ res.render(adddiap)});

}


// ----------------  Make the Routage
numdiap = null

var stats = countFiles('views/diapos', function (err, results) {
  console.log('done counting')
  console.log(results) // { files: 10, dirs: 2, bytes: 234 }
  numdiap = parseInt(results.files/2)
  console.log(numdiap)
  var list_diap = _.range(numdiap).map((nb) => (nb))
  list_diap.forEach(function(i){ addget(app,i) }) // Routage

})

app.get('/text', function(req, res){ res.render('text.html') });
app.get('/synopt', function(req, res){ res.render('diapo_synopt.html') });

//--------------  static addresses

app.use(express.static('public'));
app.use(express.static('scripts'));
app.use(express.static('lib'));

//--------------  websocket

// Loading socket.io
var io = require('socket.io')(server);

io.sockets.on('connection', function (socket) {

      console.log('A client is connected!');
      socket.emit('numdiap', diapo_index)
      socket.emit('maxdiap', numdiap)
      socket.on('numdiap', function(text){
            diapo_index = text
            console.log('in html_apps, numdiap is ' + diapo_index)
          })
      fs.readFile('views/diapos/d{}.html'.format(diapo_index), 'utf8', function (err,text) {
              if (err) { return console.log(err); }
              re.emit_from_read(socket, count, patt, text, scroll_html_pos)
          }); // end fs.readFile
      util.save_regularly() // save the regularly the text..
      socket.on('join', function(data) { socket.emit('scroll', patt) }); // end socket.on join

      //-------------------------------- From textarea to html

      socket.on('return', function(new_text) { // change html with textarea
            modify.modify_html_with_newtext(socket, fs, util, new_text, diapo_index)
        }); // end socket.on return

      socket.on('scroll', function(pattern) { patt = pattern })
      socket.on('scroll_html', function(pos) {
            scroll_html_pos = pos
       })

}); // sockets.on connection

var port = 3000
server.listen(port);
var addr = 'http://127.0.0.1:{}/d0'.format(port)
console.log('Server running at {}'.format(addr));
open(addr,"node-strap");
