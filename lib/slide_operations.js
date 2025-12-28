var fs = require('fs');

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
      return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

function delete_slide(namediap){

    /*
    Delete slide files with proper error handling
    Only delete d{n}.html (markdown content) - no individual jinja files
    */

    console.log('#################  Deleting slide /d{}'.format(namediap))

    // Delete d{n}.html (markdown content)
    fs.unlink('views/diapos/d{}.html'.format(namediap), function (err) {
        if (err) {
            console.error('Error deleting d{}.html:'.format(namediap), err.message);
        } else {
            console.log('Successfully deleted d{}.html'.format(namediap));
        }
    });

}

function shift_renumber_slides(i, numdiap){

      /*
      Shift and renumber slides with proper error handling
      Only rename d{i}.html (markdown content) - no individual jinja files to manage
      */

      // Rename d{i}.html to d{i-1}.html
      fs.rename('views/diapos/d{}.html'.format(i), 'views/diapos/d{}.html'.format(i-1), (err) => {
          if (err) {
              console.error('Error renaming d{}.html to d{}:'.format(i, i-1), err.message);
          } else {
              console.log('Renamed d{}.html to d{}.html'.format(i, i-1));
          }
      });

      if (i == numdiap - 1) {
          console.log('✅ Successfully renumbered all slides!');
      }

}

function insert_slide_after(insert_index, numdiap, callback){

      /*
      Insert a new slide after insert_index by shifting all subsequent slides forward
      Only shift d{i}.html (markdown content) - no individual jinja files to manage
      */

      console.log('📝 Inserting new slide after index {}'.format(insert_index));

      // If we're at the end, no need to shift
      if (insert_index >= numdiap - 1) {
          console.log('Creating slide at end, no shifting needed');
          if (callback) callback();
          return;
      }

      // Count operations to track completion
      var totalOps = numdiap - 1 - insert_index;
      var completedOps = 0;

      function checkComplete() {
          completedOps++;
          if (completedOps === totalOps) {
              console.log('✅ Successfully shifted all slides forward!');
              if (callback) callback();
          }
      }

      // Shift slides forward (from end to insert position)
      // Must go backwards to avoid overwriting
      for (var i = numdiap - 1; i > insert_index; i--) {
          (function(index) {
              // Rename d{i}.html to d{i+1}.html (markdown content only)
              fs.rename('views/diapos/d{}.html'.format(index), 'views/diapos/d{}.html'.format(index+1), (err) => {
                  if (err) {
                      console.error('Error renaming d{}.html to d{}:'.format(index, index+1), err.message);
                  } else {
                      console.log('Shifted d{}.html to d{}.html'.format(index, index+1));
                  }

                  checkComplete();
              });
          })(i);
      }
}

function duplicate_slide(source_index, numdiap, callback){

      /*
      Duplicate a slide by copying its content and inserting after it
      */

      console.log('📋 Duplicating slide {}'.format(source_index));

      // Read the source slide content
      fs.readFile('views/diapos/d{}.html'.format(source_index), 'utf8', function (err, content) {
          if (err) {
              console.error('Error reading source slide d{}.html:'.format(source_index), err.message);
              if (callback) callback(err);
              return;
          }

          console.log('Source slide content read, length:', content.length);

          // Now shift all subsequent slides forward (if any)
          insert_slide_after(source_index, numdiap, function(shiftErr) {
              if (shiftErr) {
                  console.error('Error shifting slides:', shiftErr);
                  if (callback) callback(shiftErr);
                  return;
              }

              // Create the duplicate at source_index + 1
              var duplicate_index = source_index + 1;
              fs.writeFile('views/diapos/d{}.html'.format(duplicate_index), content, function(writeErr) {
                  if (writeErr) {
                      console.error('Error writing duplicate slide d{}.html:'.format(duplicate_index), writeErr.message);
                      if (callback) callback(writeErr);
                      return;
                  }

                  console.log('✅ Successfully duplicated slide {} to {}'.format(source_index, duplicate_index));
                  if (callback) callback(null, duplicate_index);
              });
          });
      });
}

module.exports = {
    delete_slide: delete_slide,
    shift_renumber_slides: shift_renumber_slides,
    insert_slide_after: insert_slide_after,
    duplicate_slide: duplicate_slide
};
