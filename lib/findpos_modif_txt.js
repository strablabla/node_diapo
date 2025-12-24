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

module.exports = findpos_modif_txt;
