var fs = require('fs');
var yaml = require('js-yaml');

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
      return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

function addget(app, i, concat_diapos, numdiap){

    var addrd = '/d{}'.format(i)
    var adddiap = 'diapos/diapo.html'
    console.log(addrd + '__' + adddiap)

    app.get(addrd, function(req, res){
        fs.readFile("config.yaml", 'utf8', function (err, config_contents) {
                if (err) { return console.log(err); }
                var config_params = yaml.load(config_contents);
                // Add diapo_index to the parameters
                config_params.diapo_index = i;
                res.render(adddiap, config_params);
        });
    });
    concat_diapos(i, numdiap)              // concatenate all the diapo in one file
}

function main_init(app, concat_diapos, callback){

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

            var numdiap = dFiles.length
            console.log('done counting')
            console.log('Found', dFiles.length, 'd*.html files')
            console.log('numdiap is ' + numdiap)

            for (var i=0; i < numdiap; i++){
                  addget(app, i, concat_diapos, numdiap)      // Routage
            } // end for

            // Call callback with numdiap value
            if (callback) callback(numdiap)
      }) // end readdir

}

function other_routes(app, numdiap){

      /*
      Routing text, all and all_mini..
      */

      fs.readFile("config.json", 'utf8', function (err, config_contents) {
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

function route_all(app, concat_diapos, callback){

  /*
  Routing all
  */

  main_init(app, concat_diapos, function(numdiap) {
      other_routes(app, numdiap)
      if (callback) callback(numdiap)
  })

}

module.exports = {
    addget: addget,
    main_init: main_init,
    other_routes: other_routes,
    route_all: route_all
};
