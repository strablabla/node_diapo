var fs = require('fs');

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
      return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

function delete_slide(namediap){

    /*
    Delete
    */

    console.log('#################  /d{}'.format(namediap))
    fs.unlink('views/diapos/d{}.html'.format(namediap), function (err) { if (err) throw err; })
    fs.unlink('views/diapos/diapo{}.html'.format(namediap), function (err) { if (err) throw err; console.log('File deleted!'); })

}

function shift_renumber_slides(i, numdiap, modify){

      /*
      Shift and renumber
      */

      fs.rename('views/diapos/d{}.html'.format(i),'views/diapos/d{}.html'.format(i-1), (err) => { if (err) throw err; });
      fs.unlink('views/diapos/diapo{}.html'.format(i), function (err) { if (err) throw err; })
      modify.new_jinja(fs,i-1)
      //new_jinja(fs, diapo_index)
      if (i == numdiap){console.log('Renumbered the slides !')}

}

module.exports = {
    delete_slide: delete_slide,
    shift_renumber_slides: shift_renumber_slides
};
