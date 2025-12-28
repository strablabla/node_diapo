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
    */

    console.log('#################  Deleting slide /d{}'.format(namediap))

    // Delete d{n}.html
    fs.unlink('views/diapos/d{}.html'.format(namediap), function (err) {
        if (err) {
            console.error('Error deleting d{}.html:'.format(namediap), err.message);
        } else {
            console.log('Successfully deleted d{}.html'.format(namediap));
        }
    });

    // Delete diapo{n}.html
    fs.unlink('views/diapos/diapo{}.html'.format(namediap), function (err) {
        if (err) {
            console.error('Error deleting diapo{}.html:'.format(namediap), err.message);
        } else {
            console.log('Successfully deleted diapo{}.html'.format(namediap));
        }
    });

}

function shift_renumber_slides(i, numdiap, modify){

      /*
      Shift and renumber slides with proper error handling
      */

      // Rename d{i}.html to d{i-1}.html
      fs.rename('views/diapos/d{}.html'.format(i), 'views/diapos/d{}.html'.format(i-1), (err) => {
          if (err) {
              console.error('Error renaming d{}.html to d{}:'.format(i, i-1), err.message);
          } else {
              console.log('Renamed d{}.html to d{}.html'.format(i, i-1));
          }
      });

      // Delete old diapo{i}.html (will be regenerated)
      fs.unlink('views/diapos/diapo{}.html'.format(i), function (err) {
          if (err) {
              console.error('Error deleting diapo{}.html:'.format(i), err.message);
          }
      });

      // Regenerate the Jinja template for the renumbered slide
      modify.new_jinja(fs, i-1);

      if (i == numdiap - 1) {
          console.log('✅ Successfully renumbered all slides!');
      }

}

function insert_slide_after(insert_index, numdiap, modify, callback){

      /*
      Insert a new slide after insert_index by shifting all subsequent slides forward
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
              // Rename d{i}.html to d{i+1}.html
              fs.rename('views/diapos/d{}.html'.format(index), 'views/diapos/d{}.html'.format(index+1), (err) => {
                  if (err) {
                      console.error('Error renaming d{}.html to d{}:'.format(index, index+1), err.message);
                  } else {
                      console.log('Shifted d{}.html to d{}.html'.format(index, index+1));
                  }

                  // Delete old diapo{i}.html (will be regenerated)
                  fs.unlink('views/diapos/diapo{}.html'.format(index), function (err) {
                      if (err && err.code !== 'ENOENT') {
                          console.error('Error deleting diapo{}.html:'.format(index), err.message);
                      }
                  });

                  // Regenerate the Jinja template for the shifted slide
                  modify.new_jinja(fs, index+1);

                  checkComplete();
              });
          })(i);
      }
}

module.exports = {
    delete_slide: delete_slide,
    shift_renumber_slides: shift_renumber_slides,
    insert_slide_after: insert_slide_after
};
