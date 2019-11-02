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
var domtoimage = require('dom-to-image');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

//--------------  Server

var app = express()
var server = require('http').createServer(app);

var patt = '' // pattern for scroll position
var scroll_html_pos = 0 //
var comment = false;
diapo_index = 0;
all_diap = ''
var fullscreen = false

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
});


function make_png(i){

  // load from an external file
  options = {
    runScripts: 'dangerously',
    resources: "usable"
    };
  console.log('current index is ' + i)
  JSDOM.fromFile('views/diapos/d1.html', options).then(function (dom) {

      console.log('######## inside jsdom #########')
      let window = dom.window,
      document = window.document;
      //console.log(dom.serialize())
      //console.log(document.getElementById('num').value)
      content = window.document.documentElement.outerHTML
      console.log(content)
      console.log('#########################')
    }).catch (function (e) {
        console.log(e);
    });

}

function concat_diapos(i){

      /*
      Concatenate the content of all the slides..
      */

      make_png(i)
      fs.readFile('views/diapos/d{}.html'.format(i), 'utf8', function (err,txt) {
            if (err) { return console.log(err); }

            all_diap +=  '\n --------------- diap{} ----------------- \n\n '.format(i) + txt + '\n'

            if ( i == numdiap-1 ){
                //console.log(all_diap)
                dest = 'views/saved/all_diap.md'
                fs.writeFile( dest, all_diap, function(err) {
                      if(err) { return console.log(err); }
                      //console.log("all_diap saved in {}".format(dest));
                });    // end writeFile
            }
        });   // end fs.readFile

}

function addget(app,i){           // add Routes

      var addrd = '/d{}'.format(i)
      var adddiap = 'diapos/diapo{}.html'.format(i)
      console.log(addrd + '__' + adddiap)
      fs.readFile("views/config/config.json", 'utf8', function (err, config_contents) {
          if (err) { return console.log(err); }
          config_params = JSON.parse(config_contents);
          app.get(addrd, function(req, res){ res.render(adddiap, config_params)});
      });
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
app.get('/all_mini', function(req, res){ res.render('diapo_all_small.html', { number_diapos : numdiap }) });

//--------------  static addresses

app.use(express.static('public'));
app.use(express.static('scripts'));
app.use(express.static('lib'));


//-----------------

function findpos_modif_txt(txt, pos, id){

      /*
      */

      list_lines = txt.split('\n')
      console.log(list_lines[i])
      for (var i=0; i < list_lines.length; i++){
            if (list_lines[i].match(id)){
                console.log('the pattern was found at line  ' + i)
                if (list_lines[i-1].match(/\!pos/)){
                    console.log("found a pos " + list_lines[i-1])
                    list_lines[i-1] = '!pos' + pos.left + '/' + pos.top
                } // end if
            } // end if
          } // end for
      new_txt = list_lines.join('\n')
      return new_txt
}



//--------------  websocket

// Loading socket.io

var io = require('socket.io')(server);

io.sockets.on('connection', function (socket) {

      console.log('A client is connected!');

      socket.emit('numdiap', diapo_index)
      socket.emit('maxdiap', numdiap) // diapo_max

      fs.readFile("views/config/config.json", 'utf8', function (err, config_contents) {
          if (err) { return console.log(err); }
          config_params = JSON.parse(config_contents);
      });

      socket.on('numdiap', function(text){
            diapo_index = text
            console.log('in html_apps, diapo_index is ' + diapo_index)

          })

      fs.readFile('views/diapos/d{}.html'.format(diapo_index), 'utf8', function (err,text) {
              if (err) { return console.log(err); }
              re.emit_from_read(socket, count, patt, text, scroll_html_pos)
          });                        // end fs.readFile
      util.save_regularly()          // save regularly the text..
      socket.on('join', function(data) { socket.emit('scroll', patt) }); // end socket.on join

      //-------------------------------- From textarea to html

      socket.on('return', function(new_text) {       // change html with textarea
            modify.modify_html_with_newtext(socket, fs, util, new_text, diapo_index)
        }); // end socket.on return

      //---------------------------------------- Make a new diapo..

      socket.on('make_new_diap', function(){           // Ctrl + D
            modify.modify_html_with_newtext(socket, fs, util, ' ', numdiap)
            main_init()
      })

      //---------------------------------------- Show the memos

      socket.on('show_memos', function(){             // Ctrl + M
            console.log('#####################  received show memos !!!! ')
            io.emit('trigger_memos', ''); // triggers memos in diapo.html..
      })

      //---------------------------------------- Full screen

      socket.on('full_screen', function(){             //
            console.log('#####################  full screen !!!! ')
            fullscreen = !fullscreen
            io.emit('fullscreen', ''); //
      })

      //---------------------------------------- go to md

      socket.on('markdown', function(){             //
            console.log('###### go to md !!!! ')
            io.emit('markdown', ''); //
      })

      //---------------------------------------- show syntax

      socket.on('syntax', function(){             //
            console.log('###### syntax!!!! ')
            io.emit('syntax', ''); //
      })

      //---------------------------------------- show config

      socket.on('config', function(){             //
            console.log('###### config!!!! ')
            io.emit('config', ''); //
      })

      //---------------------------------  Scroll

      socket.on('scroll', function(pattern) { patt = pattern })
      socket.on('scroll_html', function(pos) { scroll_html_pos = pos })

      //---------------------------------  Delete

      socket.on('delete', function(namediap) {

          console.log('#################  /d{}'.format(namediap))
          fs.unlink('views/diapos/d{}.html'.format(namediap), function (err) { if (err) throw err; })
          fs.unlink('views/diapos/diapo{}.html'.format(namediap), function (err) { if (err) throw err; console.log('File deleted!'); })
          main_init()
          app.get('/text', function(req, res){ res.render('text.html') });
          app.get('/all', function(req, res){ res.render('diapo_all.html', { number_diapos : numdiap }) });
          app.get('/all_mini', function(req, res){ res.render('diapo_all_small.html', { number_diapos : numdiap }) });

      }); // end delete

      //---------------------------------   Image position..

      socket.on('pos_img', function(infos) {
          console.log(infos)
          var id = infos.split('§§')[0]
          var pos = JSON.parse(infos.split('§§')[1])
          fs.readFile('views/diapos/d{}.html'.format(diapo_index), 'utf8', function (err,txt) {
                  if (err) { return console.log(err); }
                  new_txt = findpos_modif_txt(txt, pos, id)
                  dest = 'views/diapos/d{}.html'.format(diapo_index)
                  fs.writeFile(dest , new_txt, function(err) {
                      if(err) { return console.log(err); }
                      console.log("saved {}".format(dest));
                      });    // end writeFile
                }) // end readFile
       })

}); // end sockets.on connection

var port = 3067
server.listen(port);
var addr = 'http://127.0.0.1:{}/d0'.format(port)
//diapo_index = 5;
console.log('Server running at {}'.format(addr));
open(addr,"node-strap");
