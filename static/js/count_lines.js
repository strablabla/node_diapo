/*

Count lines before pattern

*/


exports.find_line_of_pattern = function(text, pattern){

      /*
      Find the line index of the given pattern..
      */

      var line_number = 1
      var tot_lines = 0
      var astring = text.split('\n')
      var count = true

      // Si le pattern ne contient pas de marqueurs de coloration mais que le texte en contient,
      // essayer de trouver le pattern en cherchant aussi dans les versions avec couleur
      var cleanPattern = pattern.trim()

      astring.forEach(function (line, number) {

          // Échapper les caractères spéciaux regex dans le pattern
          var escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          var lineMatch = line.match(escapedPattern) != null

          // Si pas de match direct, essayer de matcher en ignorant les marqueurs de coloration
          if (!lineMatch && cleanPattern.length > 0) {
              // Chercher si le pattern apparaît dans une version colorée comme "pattern"cX
              var colorRegex = new RegExp('"[^"]*' + cleanPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^"]*"c[rbygom]')
              lineMatch = line.match(colorRegex) != null
          }

          if(!lineMatch && count){
                //console.log('##' + line_number + '## '  + line)
                line_number += 1
          }
          else{ count = false }
          tot_lines += 1

      });
      //

      return line_number

}
