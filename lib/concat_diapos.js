var fs = require('fs');

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
      return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

var all_diap = '';

function concat_diapos(i, numdiap){

      /*
      Concatenate the content of all the slides..
      */

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

module.exports = concat_diapos;
