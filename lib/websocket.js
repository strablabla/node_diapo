var fs = require('fs');

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
      return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

function setupWebSocket(io, server, dependencies) {

    // Extract dependencies
    var port = dependencies.port;
    var count = dependencies.count;
    var util = dependencies.util;
    var re = dependencies.re;
    var modify = dependencies.modify;
    var findpos_modif_txt = dependencies.findpos_modif_txt;
    var imagePosition = dependencies.imagePosition;
    var imageSize = require('./image_size');
    var generate_pdf_from_thumbnails = dependencies.generate_pdf_from_thumbnails;
    var update_viewport_dimensions = dependencies.update_viewport_dimensions;
    var thumbnails = dependencies.thumbnails;
    var slideOperations = dependencies.slideOperations;
    var routing = dependencies.routing;
    var app = dependencies.app;
    var concat_diapos = dependencies.concat_diapos;

    // Shared state
    var state = {
        diapo_index: 0,
        numdiap: dependencies.numdiap || null,
        patt: '',
        scroll_html_pos: 0,
        fullscreen: false,
        io: io  // Store io reference to emit to all clients
    };

    io.sockets.on('connection', function (socket) {

        console.log('A client is connected!');

        socket.emit('maxdiap', state.numdiap) // diapo_max
        socket.emit('numdiap', state.diapo_index) // emit current diapo_index to client

        socket.on('numdiap', function(text){
            state.diapo_index = text
            console.log('in html_apps, diapo_index is ' + state.diapo_index)
        })

        fs.readFile('views/diapos/d{}.html'.format(state.diapo_index), 'utf8', function (err,text) {
            if (err) { return console.log(err); }
            re.emit_from_read(socket, count, state.patt, text, state.scroll_html_pos)
        });                        // end fs.readFile
        util.save_regularly()          // save regularly the text..
        socket.on('join', function(data) { socket.emit('scroll', state.patt) }); // end socket.on join

        //-----------------  Read the file all_diap.md

        fs.readFile('views/saved/all_diap.md', 'utf8', function (err,txt) {
            if (err) { return console.log(err); }
            //console.log(txt)
            io.emit('tags_voice',txt)
        }) // end readFile

        //-------------------------------- From textarea to html

        socket.on('return', function(new_text) {       // change html with textarea
            modify.modify_html_with_newtext(socket, fs, util, new_text, state.diapo_index)
            // Update thumbnail after saving
            thumbnails.updateSingleThumbnail(state.diapo_index, port, state.numdiap).catch(err => {
                console.error('Error updating thumbnail:', err)
            })
        }); // end socket.on return

        //---------------------------------------- Make a new diapo..

        socket.on('make_new_diap', function(){           // Ctrl + D
            modify.modify_html_with_newtext(socket, fs, util, ' ', state.numdiap)
            routing.main_init(app, concat_diapos, function(num) {
                state.numdiap = num
            })
        })

        //---------------------------------------- Show the memos

        socket.on('show_memos', function(){             // Ctrl + M
            console.log('#####################  received show memos !!!! ')
            io.emit('trigger_memos', ''); // triggers memos in diapo.html..
        })

        //---------------------------------------- Full screen

        socket.on('full_screen', function(){             //
            console.log('#####################  full screen !!!! ')
            state.fullscreen = !state.fullscreen
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

        socket.on('scroll', function(pattern) { state.patt = pattern })
        socket.on('scroll_html', function(pos) { state.scroll_html_pos = pos })

        //---------------------------------  Delete

        socket.on('delete', function(namediap) {

            slideOperations.delete_slide(namediap)

            //------------------- renumber

            for (i = parseInt(namediap) + 1; i < state.numdiap ; i++ ){

                slideOperations.shift_renumber_slides(i, state.numdiap, modify)

            }

            //------------------ reroute all after delete

            routing.route_all(app, concat_diapos, function(num) {
                state.numdiap = num
            })

        }); // end delete

        //---------------------------------   Image position..

        socket.on('pos_img', function(infos){
            imagePosition.save_image_position(infos, state.diapo_index, findpos_modif_txt)
        })

        //---------------------------------   Image size..

        socket.on('size_img', function(infos){
            imageSize.save_image_size(infos, state.diapo_index)
        })

        //---------------------------------   Update thumbnail after Ctrl+S

        socket.on('update_thumbnail', function(){
            thumbnails.updateSingleThumbnail(state.diapo_index, port, state.numdiap).catch(err => {
                console.error('Error updating thumbnail:', err)
            })
        })

        //---------------------------------   Update viewport dimensions from client

        socket.on('update_viewport', function(dimensions){
            update_viewport_dimensions(dimensions)
        })

        //---------------------------------   Generate PDF from thumbnails

        socket.on('generate_pdf', function(){
            generate_pdf_from_thumbnails(socket, state.numdiap)
        })


    }); // end sockets.on connection

    // Function to update numdiap
    state.updateNumdiap = function(newNumdiap) {
        state.numdiap = newNumdiap;
        console.log('Updated numdiap in websocket state:', state.numdiap);
        // Emit to all connected clients
        state.io.emit('maxdiap', state.numdiap);
        console.log('Emitted maxdiap to all clients:', state.numdiap);
    };

    return state;
}

module.exports = setupWebSocket;
