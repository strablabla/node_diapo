var express = require('express')
var http = require('http');
var open = require('open');
var _ = require('underscore');
var countFiles = require('count-files');
var nunjucks  = require('nunjucks');
var fs = require('fs');
var yaml = require('js-yaml');
var count = require('./static/js/count_lines');
var util = require('./static/js/util');
var re = require('./static/js/read_emit');
var modify = require('./static/js/modify_html');
var findpos_modif_txt = require('./lib/findpos_modif_txt');
var imagePosition = require('./lib/image_position');
var generate_pdf_from_thumbnails = require('./lib/generate_pdf');
var update_viewport_dimensions = require('./lib/update_viewport');
var cleanupOldPDFs = require('./lib/cleanup_pdfs');
var concat_diapos = require('./lib/concat_diapos');
var thumbnails = require('./lib/thumbnails');
var uploadImage = require('./lib/upload_image');
var uploadVideo = require('./lib/upload_video');
var idleShutdown = require('./lib/idle_shutdown');
var slideOperations = require('./lib/slide_operations');
var routing = require('./lib/routing');
var setupWebSocket = require('./lib/websocket');
var pdfTitle = require('./lib/pdf_title');
var initSystem = require('./lib/init_system');
var domtoimage = require('dom-to-image');

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

//--------------  Server

var app = express()
var server = require('http').createServer(app);

var comment = false;

var port = 3067                 // listened on at the end, once everything is set up
var addr = 'http://127.0.0.1:{}/d0'.format(port)



// Load config and setup nunjucks with global variables
var config = yaml.load(fs.readFileSync('config.yaml', 'utf8'));
var config_desk = yaml.load(fs.readFileSync('views/config_deck.yaml', 'utf8'));

var nunjucksEnv = nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch:true
});

// Add global variables to nunjucks
nunjucksEnv.addGlobal('config', config);
nunjucksEnv.addGlobal('config_desk', config_desk);

// ----------------  Make the Routage

var numdiap = null      // number of slides

//------------------- Routage

//--------------  static addresses

app.use(express.static('public'));
app.use(express.static('scripts'));
app.use(express.static('lib'));
app.use('/thumbnails', express.static('views/thumbnails'));
app.use('/static', express.static('static'));

// Serve slide_config.yaml
app.get('/slide_config.yaml', function(req, res) {
    res.sendFile(__dirname + '/views/slide_config/slide_config.yaml');
});

// Save slide_config.yaml
app.use(express.text({ type: 'text/plain' }));
app.post('/save-slide-config', function(req, res) {
    var yamlContent = req.body;

    // Validate YAML before saving
    try {
        yaml.load(yamlContent);
    } catch (err) {
        return res.status(400).json({ error: 'Invalid YAML: ' + err.message });
    }

    // Save to file
    fs.writeFile('views/slide_config/slide_config.yaml', yamlContent, 'utf8', function(err) {
        if (err) {
            console.error('Error saving slide_config.yaml:', err);
            return res.status(500).json({ error: 'Failed to save file' });
        }
        console.log('✅ Slide configuration saved');
        res.json({ success: true });
    });
});

//--------------  websocket

var io = require('socket.io')(server);

// Stop once the last reader's tab has been closed for a while (config.yaml:
// idle_shutdown_sec, default 120 s, 0 = never).
idleShutdown.setupIdleShutdown(io,
    config.idle_shutdown_sec === undefined ? 120 : config.idle_shutdown_sec)

// Setup websocket handlers and get shared state
var websocketState = setupWebSocket(io, server, {
    port: port,
    app: app,
    numdiap: numdiap,
    count: count,
    util: util,
    re: re,
    modify: modify,
    findpos_modif_txt: findpos_modif_txt,
    imagePosition: imagePosition,
    generate_pdf_from_thumbnails: generate_pdf_from_thumbnails,
    update_viewport_dimensions: update_viewport_dimensions,
    thumbnails: thumbnails,
    slideOperations: slideOperations,
    routing: routing,
    concat_diapos: concat_diapos
})

// Initialize routing and update websocket state when numdiap is ready
routing.route_all(app, concat_diapos, function(num) {
    numdiap = num
    console.log('Numdiap initialized:', numdiap)
    // Update websocket state with the correct numdiap value
    websocketState.updateNumdiap(numdiap)
})

//--------------  Image upload configuration

// Function to reload config
function reloadConfig() {
    config = yaml.load(fs.readFileSync('config.yaml', 'utf8'));
    config_desk = yaml.load(fs.readFileSync('views/config_deck.yaml', 'utf8'));
    nunjucksEnv.addGlobal('config', config);
    nunjucksEnv.addGlobal('config_desk', config_desk);
}

// Image upload endpoint (uses websocketState.diapo_index)
app.post('/upload-image', uploadImage.upload.single('image'), function(req, res) {
    uploadImage.handle_upload_image(req, res, websocketState.diapo_index, modify, reloadConfig)
})

// Video upload endpoint: the slide index comes with the drop. A refused file
// (not MP4/WebM/Ogg) gets its reason back instead of an error page.
app.post('/upload-video', function(req, res) {
    uploadVideo.upload.single('video')(req, res, function(err) {
        if (err) { return res.status(400).json({ error: err.message }) }
        uploadVideo.handle_upload_video(req, res, modify)
    })
})

//--------------  Start

// The port already taken is most often node_diapo itself, left running: say
// so and open the browser on it, rather than crash on EADDRINUSE. Anything
// else on that port is reported as such.
server.on('error', function(err) {
    if (err.code !== 'EADDRINUSE') { throw err }
    http.get(addr, function(res) {
        var body = ''
        res.on('data', function(chunk) { body += chunk })
        res.on('end', function() {
            if (body.indexOf('node diapo') !== -1) {
                console.log('node_diapo is already running on port {}: opening it.'.format(port))
                open(addr).then(function() { process.exit(0) }, function() { process.exit(0) })
            } else {
                console.error('Port {} is used by another program: node_diapo cannot start.'.format(port))
                process.exit(1)
            }
        })
    }).on('error', function() {
        console.error('Port {} is taken and does not answer: node_diapo cannot start.'.format(port))
        process.exit(1)
    })
})

server.listen(port, function() {
    console.log('Server running at {}'.format(addr));
    open(addr);

    // Initialize system (cleanup, extract PDF title, create thumbnails)
    initSystem({
        cleanupOldPDFs: cleanupOldPDFs,
        pdfTitle: pdfTitle,
        thumbnails: thumbnails,
        // A getter, not the value: numdiap is still null here, route_all sets it later.
        getNumdiap: function() { return numdiap },
        port: port
    });
});
