// ============================================
// MEMO SYSTEM
// ============================================

// Global variables
var show_memos = false;
var currentActiveMemo = null;  // Track the currently active memo span
var currentMemoCross = null;   // Track the cross marker element

// ============================================
// MEMO FUNCTIONS
// ============================================

function find_target_memo(match_txt, num_memo){

      /*
      Target memos
      */

      var memo_short = match_txt.slice(1,-1) + num_memo // .slice(1,-1)
      var newreg = '\\$' + memo_short
      console.log('find_target_memo: Looking for', newreg)
      var found = false
      $('p').each(function(){
          var regdoll = new RegExp( newreg );
          if ( $(this).text().match(regdoll) ){
               console.log('find_target_memo: Found memo tag', newreg, 'Next element:', $(this).next().length > 0 ? $(this).next().prop('tagName') : 'NONE')
               $(this).next().attr('id', 'targ_memo' + num_memo)
               $(this).next().hide()     // hide the list after
               $(this).hide()         // hide the tag $memo
               $(this).addClass('targ_memo')
               found = true
          }
      })
      if (!found) {
          console.log('find_target_memo: WARNING - Did not find', newreg)
      }
}

function tag_for_memo(elem,txt,reg){

      /*
      Tag the sentence and the target..
      */

      var match_txt = txt.match(reg)[0]
      var num_memo = match_txt.split('!memo')[1]

      // Split text into parts: before memo tag and after
      var parts = txt.split(/!memo\d+/)
      var beforeMemo = parts[0]
      var afterMemo = parts[1] || ''

      // Wrap only the text before !memo in a span with the memo class
      var newHtml = '<span class="memo" memo="' + num_memo + '">' + beforeMemo + '</span>' + afterMemo
      elem.html(newHtml)

      find_target_memo(match_txt, num_memo)     // tag the target

}

function p_match_memos(elem){

      /*
      Handle the memos
      */

      var reg = /\!memo\d+/
      var num_memo = {}
      elem.each(function(){
           var txt = $(this).html()
           if (txt.match(reg)){
                tag_for_memo($(this),txt,reg)
           }
       })
}

function color_memos(show_memos){
    if (show_memos){
          $('.memo').css({'background-color':'#ffe6e6'})
    }else{$('.memo').css({'background-color':'#ffffff'})}
}

function memo(cls){

      /*
      memo html
      */

      var num_memo = cls.attr('memo')       // memo's index

      // Create header with title and close button
      var header = $('<div>').css({
          'display': 'flex',
          'justify-content': 'center',
          'align-items': 'center',
          'margin-bottom': '50px',
          'position': 'relative'
      })

      var title = $('<div>').html('<span style="color: red;">‡</span> <span style="color: #666;">note ' + num_memo + '</span>').css({
          'margin': '0',
          'font-size': '18px',
          'font-weight': 'normal',
          'text-align': 'center'
      })

      var closeBtn = $('<span>').html('&times;').css({
          'cursor': 'pointer',
          'font-size': '24px',
          'font-weight': 'bold',
          'color': '#666',
          'line-height': '20px',
          'position': 'absolute',
          'right': '0',
          'top': '0'
      }).click(function(e){
          e.stopPropagation()  // Prevent triggering the div click
          // Remove cross from active memo when closing
          if (currentMemoCross) {
              currentMemoCross.remove()
              currentMemoCross = null
          }
          if (currentActiveMemo) {
              currentActiveMemo = null
          }
          tag_infos.hide()
      }).hover(
          function(){ $(this).css('color', '#000') },
          function(){ $(this).css('color', '#666') }
      )

      header.append(title).append(closeBtn)

      // Get memo content
      var targ_memo = '#targ_memo' + num_memo
      var $target = $(targ_memo)

      console.log('Looking for memo target:', targ_memo, 'Found:', $target.length)

      if ($target.length === 0) {
          // Target not found - show error message
          var errorMsg = $('<div>').text('Memo content not found (target: ' + targ_memo + ')').css({
              'color': 'red',
              'padding': '10px'
          })
          tag_infos.html('').append(header).append(errorMsg)
      } else {
          var clone = $target.clone()
          clone.show()
          // Force display of all child elements that might be hidden
          clone.find('*').show()
          // Shift all content to the left by 100px
          var diccss = {'font-size':'11px', 'margin-left':'-100px', 'margin-top':'0px', 'display':'block'}
          clone.css(diccss)

          // Update tag_infos content
          tag_infos.html('').append(header).append(clone)
      }

      tag_infos.show()
}

// ============================================
// MEMO EVENT HANDLERS
// ============================================

// Ctrl+M keyboard shortcut to activate/deactivate memos
key('ctrl+m', function(){
      show_memos = !show_memos
      color_memos(show_memos)
});

// Click on memo phrase
$(document).on('click', '.memo', function(){

    /*
    click on colored memo bars..
    */

    if (show_memos){
        // Remove cross from previous active memo
        if (currentMemoCross) {
            currentMemoCross.remove()
            currentMemoCross = null
        }

        // Add cross of Lorraine after the clicked memo
        var cross = $('<span>').html('‡').css({
            'color': 'red',
            'font-size': '12px',
            'margin-left': '3px',
            'vertical-align': 'super',
            'position': 'relative',
            'top': '-3px'
        })
        $(this).after(cross)
        currentMemoCross = cross
        currentActiveMemo = $(this)

        // Calculate vertical position to align with the clicked phrase
        var memoOffset = $(this).offset()
        var memoHeight = $(this).outerHeight()
        var panelHeight = 400  // Height of #infos panel
        var verticalCenter = memoOffset.top + (memoHeight / 2) - (panelHeight / 2)

        // Position the panel at the vertical center of the phrase, 50px to the right
        tag_infos.css({
            'top': verticalCenter + 'px',
            'left': (memoOffset.left + $(this).outerWidth() + 50) + 'px',
            'right': 'auto'  // Override the right positioning
        })

        memo($(this))
    }
})

// Socket event: trigger memos vocally
socket.on('trigger_memos', function(){

      /*
      triggering memos vocally..
      */

      show_memos = !show_memos
      color_memos(show_memos)  // color zone fr accessing memos
})

// ============================================
// MEMO UI SETUP
// ============================================

var tag_infos = $('<div>').attr('id','infos')
tag_infos.css({'position':'absolute',
              'top': '50px', 'right':'10px',
              'padding': '20px',
              'width': '600px','height': '400px',
              'font-size' : '16px',
              'background-color':'white',
              'box-shadow': '8px 8px 12px #aaa',
              'opacity':'1',
              'z-index': '100'
            })

tag_infos.draggable()
$('#content').append(tag_infos.hide())
tag_infos.click(function(e){
    // Only hide if clicking on the background, not on content
    if (e.target === this) {
        // Remove cross from active memo when closing
        if (currentMemoCross) {
            currentMemoCross.remove()
            currentMemoCross = null
        }
        if (currentActiveMemo) {
            currentActiveMemo = null
        }
        $(this).hide()
    }
})

// ============================================
// MEMO INITIALIZATION
// ============================================

p_match_memos($("p"))
p_match_memos($("li"))
