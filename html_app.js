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
var multer = require('multer');
var crypto = require('crypto');
const puppeteer = require('puppeteer');
const PDFDocument = require('pdfkit');

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
var viewportDimensionsDetected = false  // Flag to detect viewport dimensions only once per server session

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

function findpos_modif_txt(txt, pos, id){

      /*
      Find image or equation position marker and update it
      For images: id is like "Turner-Fire..." from %id% in markdown
      For equations: id is like "eq-0" indicating the Nth equation
      */

      if (!txt) {
          console.error('findpos_modif_txt: txt is empty or undefined')
          return txt
      }

      list_lines = txt.split('\n')
      console.log('Looking for pattern ID:', id)
      console.log('Position to save:', pos)

      var found = false;

      // Check if this is an equation (id starts with "eq-")
      console.log('Checking if ID matches equation pattern /^eq-\\d+$/:', id.match(/^eq-\d+$/))
      if (id.match(/^eq-\d+$/)) {
          console.log('This is an equation ID!')
          var eq_index = parseInt(id.split('-')[1])
          var eq_count = 0
          console.log('Looking for equation index:', eq_index)

          for (var i=0; i < list_lines.length; i++){
              if (list_lines[i].match(/\!eq/)){
                  console.log('Found !eq at line ' + i + ', eq_count=' + eq_count)
                  if (eq_count === eq_index) {
                      console.log('Equation ' + eq_index + ' found at line ' + i + ': ' + list_lines[i])
                      found = true;
                      if (i > 0 && list_lines[i-1].match(/\!pos/)){
                          console.log("Found !pos marker at line " + (i-1) + ": " + list_lines[i-1])
                          list_lines[i-1] = '!pos' + Math.round(pos.left) + '/' + Math.round(pos.top)
                          console.log("Updated to: " + list_lines[i-1])
                      } else {
                          console.log("No !pos marker found at line " + (i-1))
                      }
                      break;
                  }
                  eq_count++;
              }
          }
      } else {
          console.log('This is NOT an equation ID, treating as image')
          // For images, search for the ID pattern (original behavior)
          for (var i=0; i < list_lines.length; i++){
              if (list_lines[i].match(id)){
                  console.log('Pattern "' + id + '" found at line ' + i + ': ' + list_lines[i])
                  found = true;
                  if (i > 0 && list_lines[i-1].match(/\!pos/)){
                      console.log("Found !pos marker at line " + (i-1) + ": " + list_lines[i-1])
                      list_lines[i-1] = '!pos' + Math.round(pos.left) + '/' + Math.round(pos.top)
                      console.log("Updated to: " + list_lines[i-1])
                  } else {
                      console.log("No !pos marker found at line " + (i-1) + ", it contains: " + (i > 0 ? list_lines[i-1] : 'N/A'))
                  }
              } // end if
          } // end for
      }

      if (!found) {
          console.error('Pattern "' + id + '" was NOT found in the file!')
      }

      new_txt = list_lines.join('\n')

      if (!new_txt) {
          console.error('findpos_modif_txt: new_txt is empty, returning original txt')
          return txt
      }

      return new_txt
}

//------------------ Save image position with batching

var imagePosQueue = [];
var imagePosTimer = null;

function save_image_position(infos){

      /*
      Image position is saved when ctrl+i is executed..
      Accumulates positions for 100ms to handle multiple images
      */

      console.log(infos)
      var id = infos.split('§§')[0]
      var pos = JSON.parse(infos.split('§§')[1])

      // Add to queue
      imagePosQueue.push({id: id, pos: pos});

      // Clear existing timer
      if (imagePosTimer) {
          clearTimeout(imagePosTimer);
      }

      // Set timer to process queue after 100ms
      imagePosTimer = setTimeout(function() {
          processImagePosQueue();
      }, 100);
}

function processImagePosQueue() {
      if (imagePosQueue.length === 0) {
          return;
      }

      console.log('Processing', imagePosQueue.length, 'image positions');

      fs.readFile('views/diapos/d{}.html'.format(diapo_index), 'utf8', function (err,txt) {
              if (err) {
                  console.error('Error reading file:', err);
                  imagePosQueue = [];
                  return;
              }

              if (!txt || txt.trim() === '') {
                  console.error('File content is empty, aborting save to prevent data loss');
                  imagePosQueue = [];
                  return;
              }

              // Apply all position updates
              var new_txt = txt;
              for (var i = 0; i < imagePosQueue.length; i++) {
                  new_txt = findpos_modif_txt(new_txt, imagePosQueue[i].pos, imagePosQueue[i].id);
              }

              // Safety check: don't write if new_txt is empty or too short
              if (!new_txt || new_txt.trim() === '' || new_txt.length < 10) {
                  console.error('Generated text is empty or too short, aborting save to prevent data loss');
                  console.error('Original text length:', txt.length, 'New text length:', new_txt ? new_txt.length : 0);
                  imagePosQueue = [];
                  return;
              }

              dest = 'views/diapos/d{}.html'.format(diapo_index)
              fs.writeFile(dest , new_txt, function(err) {
                  if(err) {
                      console.error('Error writing file:', err);
                      return;
                  }
                  console.log("saved {} with {} image position updates".format(dest, imagePosQueue.length));
                  imagePosQueue = []; // Clear queue after successful save
                  });    // end writeFile
            }) // end readFile
}

//------------------------ Delete slide

function delete_slide(namediap){

    /*
    Delete
    */

    console.log('#################  /d{}'.format(namediap))
    fs.unlink('views/diapos/d{}.html'.format(namediap), function (err) { if (err) throw err; })
    fs.unlink('views/diapos/diapo{}.html'.format(namediap), function (err) { if (err) throw err; console.log('File deleted!'); })

}

//----------------------- Shift and rename slides after delete ..

function shift_rename_slides(i){

      /*
      Shift and rename
      */

      fs.rename('views/diapos/d{}.html'.format(i),'views/diapos/d{}.html'.format(i-1), (err) => { if (err) throw err; });
      fs.unlink('views/diapos/diapo{}.html'.format(i), function (err) { if (err) throw err; })
      modify.new_jinja(fs,i-1)
      //new_jinja(fs, diapo_index)
      if (i == numdiap){console.log('Renamed the slides !')}

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

          //------------------- rename

          for (i = parseInt(namediap) + 1; i < numdiap ; i++ ){

              shift_rename_slides(i)

          }

          //------------------ reroute all after delete

          route_all()

        }); // end delete

      //---------------------------------   Image position..

      socket.on('pos_img', function(infos){
          save_image_position(infos)
      })

      //---------------------------------   Update thumbnail after Ctrl+S

      socket.on('update_thumbnail', function(){
          updateSingleThumbnail(diapo_index).catch(err => {
              console.error('Error updating thumbnail:', err)
          })
      })

      //---------------------------------   Update viewport dimensions from client

      socket.on('update_viewport', function(dimensions){
          // Only update dimensions once per server session
          if (viewportDimensionsDetected) {
              console.log('Viewport dimensions already detected, ignoring update')
              return
          }

          console.log('Updating viewport dimensions:', dimensions)

          fs.readFile('views/config/config.json', 'utf8', function(err, data) {
              if (err) {
                  console.error('Error reading config:', err)
                  return
              }

              var config = JSON.parse(data)
              config.viewport_width = dimensions.width
              config.viewport_height = dimensions.height

              fs.writeFile('views/config/config.json', JSON.stringify(config, null, 2), function(err) {
                  if (err) {
                      console.error('Error writing config:', err)
                      return
                  }
                  console.log('Viewport dimensions saved: {}x{}'.format(dimensions.width, dimensions.height))
                  viewportDimensionsDetected = true  // Mark as detected
              })
          })
      })

      //---------------------------------   Generate PDF from thumbnails

      socket.on('generate_pdf', function(){
          console.log('Starting PDF generation from thumbnails...')

          try {
              // Read viewport dimensions from config
              var config = JSON.parse(fs.readFileSync('views/config/config.json', 'utf8'))
              var viewportWidth = config.viewport_width || 1920
              var viewportHeight = config.viewport_height || 1080

              // Create PDF document in landscape A4 (842 x 595 points)
              const doc = new PDFDocument({
                  size: 'A4',
                  layout: 'landscape',
                  margin: 0
              })

              // Output file in static folder to make it accessible via HTTP
              const timestamp = Date.now()
              const filename = 'slides_' + timestamp + '.pdf'
              const outputPath = path.join(__dirname, 'static', filename)
              const writeStream = fs.createWriteStream(outputPath)
              doc.pipe(writeStream)

              // Add each thumbnail to the PDF
              let addedPages = 0
              for (let i = 0; i < numdiap; i++) {
                  const thumbPath = path.join(__dirname, 'views', 'thumbnails', 'thumb_' + i + '.png')

                  if (fs.existsSync(thumbPath)) {
                      if (addedPages > 0) {
                          doc.addPage()
                      }

                      // Fit image to page (A4 landscape: 842 x 595 points)
                      // Scale to fit width based on actual viewport dimensions
                      const scale = 842 / viewportWidth
                      const width = viewportWidth * scale  // 842
                      const height = viewportHeight * scale
                      const x = 0
                      const y = (595 - height) / 2  // Center vertically

                      doc.image(thumbPath, x, y, { width: width, height: height })
                      addedPages++
                      console.log('Added thumbnail ' + i + ' to PDF')
                  } else {
                      console.warn('Thumbnail ' + i + ' not found: ' + thumbPath)
                  }
              }

              doc.end()
              console.log('PDF document ended, waiting for write to finish...')

              // Wait for PDF to finish writing
              writeStream.on('finish', function() {
                  console.log('PDF generated successfully at: ' + outputPath)
                  // Send the URL for download
                  const downloadUrl = '/static/' + filename
                  socket.emit('pdf_generated', { success: true, downloadUrl: downloadUrl })
              })

              writeStream.on('error', function(err) {
                  console.error('Error writing PDF:', err)
                  socket.emit('pdf_generated', { success: false, error: err.message })
              })

          } catch (err) {
              console.error('Error generating PDF:', err)
              socket.emit('pdf_generated', { success: false, error: err.message })
          }
      })


}); // end sockets.on connection


console.log('Server running at {}'.format(addr));
open(addr,"node-strap");

// Clean up old PDF files in static folder
function cleanupOldPDFs() {
    const staticDir = path.join(__dirname, 'static')
    fs.readdir(staticDir, function(err, files) {
        if (err) {
            console.error('Error reading static directory:', err)
            return
        }

        files.forEach(function(file) {
            if (file.startsWith('slides_') && file.endsWith('.pdf')) {
                const filePath = path.join(staticDir, file)
                fs.unlink(filePath, function(err) {
                    if (err) {
                        console.error('Error deleting ' + file + ':', err)
                    } else {
                        console.log('Deleted old PDF: ' + file)
                    }
                })
            }
        })
    })
}

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
