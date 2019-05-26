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
all_diap = ''

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


function concat_diapos(i){

      /*
      Concatenate the content of all the slides..
      */

      fs.readFile('views/diapos/d{}.html'.format(i), 'utf8', function (err,txt) {
              if (err) { return console.log(err); }

              all_diap +=  '\n --------------- diap{} ----------------- \n\n '.format(i) + txt + '\n'

              if ( i == numdiap-1 ){
                  console.log(all_diap)
                  dest = 'views/saved/all_diap.md'
                  fs.writeFile( dest, all_diap, function(err) {
                        if(err) { return console.log(err); }
                        console.log("all_diap saved in {}".format(dest));
                  });    // end writeFile
              }
          });   // end fs.readFile

}

function addget(app,i){  // add Routes

      var addrd = '/d{}'.format(i)
      var adddiap = 'diapos/diapo{}.html'.format(i)
      console.log(addrd + '__' + adddiap)
      app.get(addrd, function(req, res){ res.render(adddiap)});
      concat_diapos(i)              // concatenate all the diapo in one file

}

// ----------------  Make the Routage

function main_init(){

      /*
      Routage and concatenation
      */

      numdiap = null

      var stats = countFiles('views/diapos', function (err, results) {
            console.log('done counting')
            console.log(results) // { files: 10, dirs: 2, bytes: 234 }
            numdiap = parseInt(results.files/2)
            console.log('numdiap is ' + numdiap)
            for (var i=0; i < numdiap; i++){
                  addget(app,i)      // Routage
                } // end for
      }) // end countFiles
}

//------------------- Routage

main_init()
app.get('/text', function(req, res){ res.render('text.html') });
app.get('/all', function(req, res){ res.render('diapo_all.html', { number_diapos : numdiap }) });
//app.get('/d555', function(req, res){ res.render('diapos/diapo555.html') });

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

      //---------------------------------------- Make a new diapo..

      socket.on('make_new_diap', function(){  // Ctrl + D
            modify.modify_html_with_newtext(socket, fs, util, ' ', numdiap)
            main_init()
      })

      //---------------------------------

      socket.on('scroll', function(pattern) { patt = pattern })
      socket.on('scroll_html', function(pos) {
            scroll_html_pos = pos
       })

      //---------------------------------

      socket.on('pos_img', function(infos) {
          console.log(infos)
          var id = infos.split('§§')[0]
          var pos = JSON.parse(infos.split('§§')[1])
          console.log(id)
          console.log(pos)
          var new_txt = ''
          fs.readFile('views/diapos/d{}.html'.format(diapo_index), 'utf8', function (err,txt) {
                  if (err) { return console.log(err); }
                  console.log(txt)
                  list_lines = txt.split('\n')
                  console.log(list_lines[i])
                  for (var i=0; i<list_lines.length; i++){
                        if (list_lines[i].match(id)){
                            console.log('the pattern was found at line  ' + i)
                            if (list_lines[i-1].match(/\!pos/)){
                                console.log("found a pos " + list_lines[i-1])
                                list_lines[i-1] = '!pos' + pos.left + '/' + pos.top
                            } // end if
                        } // end if
                      } // end for
                new_txt = list_lines.join('\n')
                console.log('######## after joining ########### \n'+ new_txt)
                dest = 'views/diapos/d{}.html'.format(diapo_index)
                fs.writeFile(dest , new_txt, function(err) {
                      if(err) { return console.log(err); }
                      console.log("saved {}".format(dest));
                      });    // end writeFile
                }) // end readFile
          // console.log('#########################################')
          // console.log(new_txt)
       })


}); // sockets.on connection

var port = 3000
server.listen(port);
var addr = 'http://127.0.0.1:{}/d0'.format(port)
//diapo_index = 5;
console.log('Server running at {}'.format(addr));
open(addr,"node-strap");
