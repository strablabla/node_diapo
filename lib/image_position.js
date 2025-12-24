var fs = require('fs');

var imagePosQueue = [];
var imagePosTimer = null;

function save_image_position(infos, diapo_index, findpos_modif_txt){

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
          processImagePosQueue(diapo_index, findpos_modif_txt);
      }, 100);
}

function processImagePosQueue(diapo_index, findpos_modif_txt) {
      if (imagePosQueue.length === 0) {
          return;
      }

      console.log('Processing', imagePosQueue.length, 'image positions');

      String.prototype.format = function () {
          var i = 0, args = arguments;
          return this.replace(/{}/g, function () {
              return typeof args[i] != 'undefined' ? args[i++] : '';
          });
      };

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

module.exports = {
    save_image_position: save_image_position,
    processImagePosQueue: processImagePosQueue
};
