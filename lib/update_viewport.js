var fs = require('fs');
var yaml = require('js-yaml');

var viewportDimensionsDetected = false;  // Flag to detect viewport dimensions only once per server session

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

function update_viewport_dimensions(dimensions) {
      // Only update dimensions once per server session
      if (viewportDimensionsDetected) {
          console.log('Viewport dimensions already detected, ignoring update')
          return
      }

      console.log('Updating viewport dimensions:', dimensions)

      fs.readFile('config.yaml', 'utf8', function(err, data) {
          if (err) {
              console.error('Error reading config:', err)
              return
          }

          var config = yaml.load(data)
          config.viewport_width = dimensions.width
          config.viewport_height = dimensions.height

          fs.writeFile('config.yaml', yaml.dump(config), function(err) {
              if (err) {
                  console.error('Error writing config:', err)
                  return
              }
              console.log('Viewport dimensions saved: {}x{}'.format(dimensions.width, dimensions.height))
              viewportDimensionsDetected = true  // Mark as detected
          })
      })
}

module.exports = update_viewport_dimensions;
