// ============================================
// DECORATION FUNCTIONS (Header, Footer, Title & Colored Frames)
// ============================================

function make_title(){

      /*
      Style h1 title
      syntax : # My Title !tit
      Applies centered style and 30px font to h1 elements with !tit marker
      */

      var reg = /\!tit/
      var dict_tit = {
          'text-align': 'center',
          'font-size': '40px',
          'font-style': 'italic',
          'margin-top': '100px',
          'margin-bottom': '70px',
          'text-shadow': 'none'
      }

      $('h1').each(function(){
          var txt = $(this).text()
          if (txt.match(reg)){
              // Add slide_title class
              $(this).addClass('slide_title')

              // Apply CSS styling and remove the !tit marker from text
              elem_match__inject_css($(this), reg, dict_tit)
          }
      })
}

function make_head(){

      /*
      header
      syntax : !head blablabla..
      */

      var dichead = {'position':'absolute','top':'40px',
                     'font-size':'120%', 'right':'50px',
                     'white-space':'nowrap'}
      p_match__inject_css(/\!head/, dichead)
      $('#content').append($('</p>').attr('id','footlim'))
      $('#footlim').html('<hr>')
      $('#footlim').css({'position':'absolute','top':'780px'})

}

function make_foot(){

      /*
      footer
      syntax : !foot blablabla..
      */

      var dicfoot = {'position':'absolute','bottom':'20px','font-size':'110%'}
      p_match__inject_css(/\!foot/, dicfoot)

      $('#content').append($('</p>').attr('id','footlim'))
      $('#footlim').html('<hr>')
      $('#footlim').css({'position':'absolute','bottom':'70px'})

}

function frame_col(){

      /*
      Frame with color around tag element
      eg: !fb  for blue frame ..
      */

      var dic_col = {'b':'blue','r':'red','g':'green','o':'orange'}
      var tags = ['h1','h2','h3']
      var reg = /\!f\w/
      for (var i in tags){
            $(tags[i]).each(function(){
                var regmatch = $(this).text().match(reg)
                if (regmatch){
                      var col = dic_col[regmatch[0].slice(-1)] // find color..
                      var cssfb = {'border':'3px solid ' + col, 'display':'inline-block', 'padding':' 7px 7px 7px 7px'}
                      elem_match__inject_css($(this), reg, cssfb)
                }
            })
      }
}

make_title() // style h1 title with !tit marker
frame_col() // frame with color around the tag..
