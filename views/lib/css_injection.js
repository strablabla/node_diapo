// ============================================
// CSS INJECTION UTILITIES
// ============================================
// Shared functions for pattern matching and CSS injection

function remove_patt_change_css(elem,txt,patt,dict_css){

      /*
      Remove the pattern and modify the css
      patt : pattern
      dict_css : dictionary of the css parameters..
      */

      var new_txt = txt.replace(patt,'')
      elem.text(new_txt)
      elem.css(dict_css)

}

function elem_match__inject_css(elem, patt, dict_css){

      /*
      Generic match replace
      patt : pattern
      dict_css : dictionary of the css parameters..
      */

      if (patt==/\!fb/){alert('patt is fb')}
      elem.each(function(){
           var txt = $(this).text()
           if (txt.match(patt)){
               remove_patt_change_css($(this),txt,patt,dict_css)
               var class_added = patt.toString().slice(3,-1)
               //alert("class_added " + class_added)
               $(this).attr('class',class_added) // adding Class
               if (txt.match(/\!eq/)){                                // if equation..
                  $(this).text('$$' + $(this).text() + '$$')
               }
           }
       })
}

function p_match__inject_css(patt, dict_css){

      /*
      Generic match replace
      patt : pattern
      dict_css : dictionary of the css parameters..
      */

      elem_match__inject_css($("p"), patt, dict_css)

}
