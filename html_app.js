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
var findpos_modif_txt = require('./lib/findpos_modif_txt');
var imagePosition = require('./lib/image_position');
var generate_pdf_from_thumbnails = require('./lib/generate_pdf');
var update_viewport_dimensions = require('./lib/update_viewport');
var cleanupOldPDFs = require('./lib/cleanup_pdfs');
var domtoimage = require('dom-to-image');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var multer = require('multer');
var crypto = require('crypto');
const puppeteer = require('puppeteer');

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

//--------------  Server

var app = express()
var server = require('http').createServer(app);

var patt = '' // pattern for scroll position
var scroll_html_pos = 0 //
var comment = false;
diapo_index = 0;
all_diap = ''
var fullscreen = false

var port = 3067
server.listen(port);
var addr = 'http://127.0.0.1:{}/d0'.format(port)



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

async function create_thumbnails(){

    // make thumbnails - optimized version
    console.log('Creating {} thumbnails...'.format(numdiap));

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Process thumbnails sequentially to avoid race conditions with #num display
    for (var i = 0; i < numdiap; i++) {
        await createSingleThumbnail(browser, i);
    }

    await browser.close();
    console.log('All thumbnails created!');
}

async function createSingleThumbnail(browser, index_diap) {
    const page = await browser.newPage();

    // Read viewport dimensions from config
    var config = JSON.parse(fs.readFileSync('views/config/config.json', 'utf8'));
    var viewportWidth = config.viewport_width || 1920;
    var viewportHeight = config.viewport_height || 1080;

    await page.setViewport({ width: viewportWidth, height: viewportHeight });
    var addr_diap = 'http://127.0.0.1:{}/d{}'.format(port, index_diap);

    try {
        await page.goto(addr_diap, { waitUntil: 'networkidle0', timeout: 30000 });

        // Hide UI elements - keep content styling as is (already configured in diapo.html)
        await page.evaluate(() => {
            // Hide all UI elements that shouldn't appear in screenshots
            // Note: #num is kept visible for PDF generation
            const elementsToHide = [
                document.getElementById('help_keys'),
                document.getElementById('help_voice_cmds'),
                document.getElementById('slider'),
                document.getElementById('slider_value'),
                document.getElementById('current_diapo'),
                document.getElementById('help_syntax'),
                document.getElementById('config'),
                document.querySelector('header'),
                document.querySelector('footer')
            ];

            elementsToHide.forEach(el => {
                if (el) el.style.display = 'none';
            });
        });

        // Take screenshot of the entire page (content is already properly styled)
        await page.screenshot({
            path: 'views/thumbnails/thumb_{}.png'.format(index_diap),
            fullPage: false
        });
        console.log('Thumbnail {} created'.format(index_diap));
    } catch (err) {
        console.error('Error creating thumbnail {}: {}'.format(index_diap, err.message));
    }

    await page.close();
}

async function updateSingleThumbnail(index_diap) {
    /*
    Update the thumbnail for a single slide
    */
    console.log('Updating thumbnail for slide {}...'.format(index_diap));

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    await createSingleThumbnail(browser, index_diap);
    await browser.close();

    console.log('Thumbnail {} updated!'.format(index_diap));
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
    var adddiap = 'diapos/diapo.html'
    console.log(addrd + '__' + adddiap)

    app.get(addrd, function(req, res){
        fs.readFile("views/config/config.json", 'utf8', function (err, config_contents) {
                if (err) { return console.log(err); }
                var config_params = JSON.parse(config_contents);
                // Add diapo_index to the parameters
                config_params.diapo_index = i;
                res.render(adddiap, config_params);
        });
    });
    concat_diapos(i)              // concatenate all the diapo in one file
}

// ----------------  Make the Routage

numdiap = null      // number of slides

function main_init(){

      /*
      Routage and concatenation
      */

      

      // Count only d*.html files (markdown files), not diapo*.html (jinja templates)
      fs.readdir('views/diapos', function(err, files) {
            if (err) {
                  console.error('Error reading diapos directory:', err)
                  return
            }

            // Filter to only count d[0-9]*.html files (not diapo*.html)
            var dFiles = files.filter(function(file) {
                  return file.match(/^d\d+\.html$/)
            })

            numdiap = dFiles.length
            console.log('done counting')
            console.log('Found', dFiles.length, 'd*.html files')
            console.log('numdiap is ' + numdiap)

            for (var i=0; i < numdiap; i++){
                  addget(app,i)      // Routage
            } // end for
      }) // end readdir

}

function other_routes(){

      /*
      Routing text, all and all_mini..
      */

      fs.readFile("views/config/config.json", 'utf8', function (err, config_contents) {
            if (err) { return console.log(err); }
            //-----------
            json_params = JSON.parse(config_contents);
            var dict_numdiap = { "number_diapos" : numdiap }
            var config_params = Object.assign({}, json_params, dict_numdiap);
            //-----------
            app.get('/text', function(req, res){ res.render('text.html', config_params) });
            app.get('/all', function(req, res){ res.render('diapo_all.html', config_params) });
            app.get('/all_mini', function(req, res){ res.render('diapo_all_small.html', config_params) });
        });

}

//-------------------- Make all the routings..

function route_all(){

  /*
  Routing all
  */

  main_init()
  other_routes()

}

//------------------- Routage

route_all()

//--------------  static addresses

app.use(express.static('public'));
app.use(express.static('scripts'));
app.use(express.static('lib'));
app.use('/thumbnails', express.static('views/thumbnails'));
app.use('/static', express.static('static'));

//--------------  Image upload configuration

// Configure multer for image uploads
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/imgs/')
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        var ext = path.extname(file.originalname)
        var basename = path.basename(file.originalname, ext)
        var uniqueName = basename + '-' + Date.now() + ext
        cb(null, uniqueName)
    }
})

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false)
        }
        cb(null, true)
    }
})

// Image upload endpoint
app.post('/upload-image', upload.single('image'), function(req, res) {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
    }

    var filename = req.file.filename
    var diapo_idx = req.body.diapo_index || diapo_index

    console.log('Image uploaded:', filename, 'for diapo', diapo_idx)

    // Read current diapo content
    var diapoFile = 'views/diapos/d{}.html'.format(diapo_idx)

    fs.readFile(diapoFile, 'utf8', function (err, txt) {
        if (err) {
            console.error('Error reading diapo file:', err)
            return res.status(500).json({ error: 'Failed to read diapo file' })
        }

        // Generate unique image ID for positioning
        var imageId = filename.replace(/\.[^/.]+$/, '') // Remove extension

        // Add image to end of file with position marker
        var newImageMarkdown = '\n!pos100/100\n![\'img\' 300x300 %' + imageId + '%](imgs/' + filename + ')\n'
        var newContent = txt + newImageMarkdown

        // Write updated content
        fs.writeFile(diapoFile, newContent, function(err) {
            if (err) {
                console.error('Error writing diapo file:', err)
                return res.status(500).json({ error: 'Failed to update diapo file' })
            }

            console.log('Image added to diapo:', diapoFile)

            // Regenerate the jinja template
            modify.new_jinja(fs, diapo_idx)

            res.json({
                success: true,
                filename: filename,
                imageId: imageId
            })
        })
    })
})

//-----------------  modify the value of position in the slide..

//------------------------ Delete slide

function delete_slide(namediap){

    /*
    Delete
    */

    console.log('#################  /d{}'.format(namediap))
    fs.unlink('views/diapos/d{}.html'.format(namediap), function (err) { if (err) throw err; })
    fs.unlink('views/diapos/diapo{}.html'.format(namediap), function (err) { if (err) throw err; console.log('File deleted!'); })

}

//----------------------- Shift and renumber slides after delete ..

function shift_renumber_slides(i){

      /*
      Shift and renumber
      */

      fs.rename('views/diapos/d{}.html'.format(i),'views/diapos/d{}.html'.format(i-1), (err) => { if (err) throw err; });
      fs.unlink('views/diapos/diapo{}.html'.format(i), function (err) { if (err) throw err; })
      modify.new_jinja(fs,i-1)
      //new_jinja(fs, diapo_index)
      if (i == numdiap){console.log('Renumbered the slides !')}

}

//--------------  websocket

// Loading socket.io

var io = require('socket.io')(server);

io.sockets.on('connection', function (socket) {

      console.log('A client is connected!');

      socket.emit('numdiap', diapo_index)
      socket.emit('maxdiap', numdiap) // diapo_max

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

      //-----------------  Read the file all_diap.md

      fs.readFile('views/saved/all_diap.md', 'utf8', function (err,txt) {
            if (err) { return console.log(err); }
            //console.log(txt)
            io.emit('tags_voice',txt)

            }) // end readFile

      //-------------------------------- From textarea to html

      socket.on('return', function(new_text) {       // change html with textarea
            modify.modify_html_with_newtext(socket, fs, util, new_text, diapo_index)
            // Update thumbnail after saving
            updateSingleThumbnail(diapo_index).catch(err => {
                console.error('Error updating thumbnail:', err)
            })
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
            io.emit('full_screen', ''); //
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

          delete_slide(namediap)

          //------------------- renumber

          for (i = parseInt(namediap) + 1; i < numdiap ; i++ ){

              shift_renumber_slides(i)

          }

          //------------------ reroute all after delete

          route_all()

        }); // end delete

      //---------------------------------   Image position..

      socket.on('pos_img', function(infos){
          imagePosition.save_image_position(infos, diapo_index, findpos_modif_txt)
      })

      //---------------------------------   Update thumbnail after Ctrl+S

      socket.on('update_thumbnail', function(){
          updateSingleThumbnail(diapo_index).catch(err => {
              console.error('Error updating thumbnail:', err)
          })
      })

      //---------------------------------   Update viewport dimensions from client

      socket.on('update_viewport', function(dimensions){
          update_viewport_dimensions(dimensions)
      })

      //---------------------------------   Generate PDF from thumbnails

      socket.on('generate_pdf', function(){
          generate_pdf_from_thumbnails(socket, numdiap)
      })


}); // end sockets.on connection


console.log('Server running at {}'.format(addr));
open(addr,"node-strap");

// Clean up old PDFs on startup
cleanupOldPDFs()

// Create thumbnails after server is fully started (wait 2 seconds)
setTimeout(function() {
    create_thumbnails().then(function() {
        console.log('Thumbnails created successfully');
    }).catch(function(err) {
        console.error('Error creating thumbnails:', err);
    });
}, 2000);
