// ============================================
// FIRST PAGE FUNCTIONS (Title, Author, Date)
// ============================================

function make_deck_title(){

      /*
      Place the title
      */

      $('h1').hide()
      $('li').hide()
      var dictit= {'position':'relative','font-size':'300%',
                   'text-align':'center', 'top':'100px',
                   'background-color':'orange', 'color':'white',
                   'margin-left':'100px', 'margin-right':'100px'}
      p_match__inject_css(/\!deck_title/, dictit)

}

function make_author(){

      /*
      Place the author
      */

      var dicauth= {'position':'relative','font-size':'250%',
                  'text-align':'center', 'top':'250px',
                   'margin': 'auto'}
      p_match__inject_css(/\!author/, dicauth)

}

function make_date(){

      /*
      place the date
      */

      var dicdate= {'position':'relative','font-size':'200%',
                  'text-align':'center', 'top':'300px', 'margin-left':'0'}
      p_match__inject_css(/\!date/, dicdate)

}


$("p").each(function(){
var txt = $(this).text()
if (txt.match(/\!deck_title/)){

make_deck_title() //----------------------------- Title
make_author() //----------------------------- Author
make_date() //----------------------------- Date

}
})

// Centred whatever the slides' style says. slide_config.js applies it once the
// page is loaded, as inline styles on every p: its "p: margin-left: 8%" moved
// the title right, and the author and date further (no margin on their right
// to balance it). Rules marked !important win over such inline styles.
if (!document.getElementById('first-page-centring')) {
    $('<style id="first-page-centring">').text(
        '.deck_title { margin-left: 100px !important; margin-right: 100px !important; }' +
        '.author, .date { margin-left: 0 !important; margin-right: 0 !important; }'
    ).appendTo('head')
}

// The author and the date, as one block, halfway between the bottom of the
// title and the top of the footer (or the bottom of the window), on any
// screen: their fixed offsets left them high up, the more so on a tall one.
// Moved with a transform, which leaves their place in the page alone; measured
// afresh each time, the previous move undone first.
function centre_author_date() {
    var $block = $('.author, .date').filter(':visible')
    var $title = $('.deck_title:visible')
    if (!$block.length || !$title.length) return
    $block.css('transform', '')
    var top = Infinity, bottom = -Infinity
    $block.each(function() {
        var r = this.getBoundingClientRect()
        top = Math.min(top, r.top); bottom = Math.max(bottom, r.bottom)
    })
    var areaTop = $title[0].getBoundingClientRect().bottom
    var areaBottom = window.innerHeight
    $('.foot:visible').each(function() {
        var t = this.getBoundingClientRect().top
        if (t > areaTop && t < areaBottom) areaBottom = t
    })
    var shift = (areaTop + areaBottom) / 2 - (top + bottom) / 2
    $block.css('transform', 'translateY(' + Math.round(shift) + 'px)')
}

if ($('.deck_title').length) {
    // Again once everything is loaded (fonts, the slides' style, applied
    // late by slide_config.js), and when the window changes size.
    $(window).on('load', centre_author_date)
    $(window).on('resize', centre_author_date)
    setTimeout(centre_author_date, 0)
    setTimeout(centre_author_date, 500)
}

$('.deck_title').attr('align', 'center')
$('.deck_title').css({'line-height':'150%'})
$('.author').wrap( "<div style='text-align:center;'></div>" )
$('.date').attr('align', 'center')

make_head() //----------------------------- Header
make_foot() //----------------------------- Footer
