// ============================================
// EQUATION HANDLING
// ============================================

//----------- equation

function make_eq(){

      /*
      Equation
      syntax : !eq e^{i\pi}=-1
      */

      // Don't set position in diceq - let change_pos() handle it for positioned equations
      var diceq= {'font-size':'150%', 'text-align':' center '}
      p_match__inject_css(/\!eq/, diceq)

      // Assign unique IDs to equations for drag positioning
      var eq_counter = 0
      $('p.eq').each(function(){
          if (!$(this).attr('id')) {
              $(this).attr('id', 'eq-' + eq_counter)
              eq_counter++
          }

          // If equation doesn't have absolute positioning (no !pos marker), set relative
          if ($(this).css('position') !== 'absolute') {
              $(this).css('position', 'relative')
          }
      })

}

make_eq()    //-----------------------------  Equation
