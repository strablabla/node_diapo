// ============================================
// SYNTAX HELP PANEL
// ============================================

// Function to setup syntax helper for CodeMirror
function setupSyntaxHelper(editor) {
    console.log('setupSyntaxHelper called with editor:', editor);
    var syntaxPanelVisible = false;
    var quickMenuVisible = false;

    // Create quick menu (appears on double-click in gutter)
    var $quickMenu = $('<div>')
        .attr('id', 'quick-menu')
        .css({
            'position': 'fixed',
            'background': 'white',
            'border': 'none',
            'border-radius': '5px',
            'padding': '10px',
            'padding-bottom': '20px',
            'width': '120px',
            'height': '150px',
            'display': 'flex',
            'flex-direction': 'column',
            'align-items': 'center',
            'justify-content': 'flex-end',
            'box-sizing': 'border-box',
            'z-index': '1000',
            'box-shadow': '0 4px 6px rgba(0,0,0,0.3)'
        })
        .html('<button id="syntax-btn" class="btn btn-warning btn-sm">Syntax</button>');

    $('body').append($quickMenu);

    // Create syntax panel (appears when clicking "Syntax" button)
    var $syntaxPanel = $('<div>')
        .attr('id', 'syntax-panel')
        .css({
            'position': 'fixed',
            'top': '50px',
            'right': '50px',
            'width': '400px',
            'max-height': '80vh',
            'overflow-y': 'auto',
            'background': 'white',
            'border': '2px solid #333',
            'border-radius': '8px',
            'padding': '20px',
            'z-index': '1001',
            'box-shadow': '0 4px 12px rgba(0,0,0,0.4)',
            'display': 'none',
            'font-family': 'monospace'
        });

    // Syntax content
    var syntaxContent = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0;">Markdown Syntax</h3>
            <button id="close-syntax" style="background: white; color: black; border: 2px solid black; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 18px; font-weight: bold;">×</button>
        </div>

        <div style="margin-bottom: 20px;">
            <h4 style="margin: 10px 0 5px 0; color: #2196F3;">Title Page (Slide 0)</h4>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                <code># Title !pdf_title</code><br/>
                <small style="color: #666;">PDF filename (e.g., "My Talk" → my_talk.pdf)</small>
            </div>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                <code>!deck_title My Presentation</code><br/>
                <small style="color: #666;">Presentation title displayed on title page</small>
            </div>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                <code>!author John Doe</code><br/>
                <small style="color: #666;">Author name</small>
            </div>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                <code>!date January 2025</code><br/>
                <small style="color: #666;">Presentation date</small>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <h4 style="margin: 10px 0 5px 0; color: #2196F3;">Headers</h4>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                <code># Title !tit</code><br/>
                <small style="color: #666;">Centered, italic title (40px)</small>
            </div>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                <code>## Subtitle !fb</code><br/>
                <small style="color: #666;">Blue frame around h2</small>
            </div>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                <code>### Section !pos150/100</code><br/>
                <small style="color: #666;">h3 at position x:150px, y:100px</small>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <h4 style="margin: 10px 0 5px 0; color: #2196F3;">Frames</h4>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                <code>!fb</code> - Blue frame<br/>
                <code>!fr</code> - Red frame<br/>
                <code>!fg</code> - Green frame<br/>
                <code>!fo</code> - Orange frame
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <h4 style="margin: 10px 0 5px 0; color: #2196F3;">Positions</h4>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                <code>!pos100/200</code><br/>
                <small style="color: #666;">Position element at x:100px, y:200px</small>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <h4 style="margin: 10px 0 5px 0; color: #2196F3;">Equations</h4>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                <code>!pos150/300<br/>!eq E = mc^2</code><br/>
                <small style="color: #666;">LaTeX equation at position</small>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <h4 style="margin: 10px 0 5px 0; color: #2196F3;">Header & Footer</h4>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                <code>!head My Header</code><br/>
                <small style="color: #666;">Page header (top right)</small>
            </div>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                <code>!foot My Footer</code><br/>
                <small style="color: #666;">Page footer (bottom)</small>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <h4 style="margin: 10px 0 5px 0; color: #2196F3;">Progressive Display</h4>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                <code>* Item !stp</code><br/>
                <small style="color: #666;">Show item step-by-step (use ↓/↑/B keys)</small>
            </div>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                <code>!['img'] !stp=0</code><br/>
                <small style="color: #666;">Show element at specific step (0, 1, 2...)</small>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <h4 style="margin: 10px 0 5px 0; color: #2196F3;">Images</h4>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                <code>!pos100/200<br/>!['title' 400x300 %id%](path.jpg)</code><br/>
                <small style="color: #666;">Image at position with size</small>
            </div>
            <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                <small style="color: #666;">Right-click on image: Delete or Resize</small>
            </div>
        </div>
    `;

    $syntaxPanel.html(syntaxContent);

    // Add CSS for close button hover effect
    var $syntaxStyle = $('<style>')
        .text(`
            #close-syntax:hover {
                background: #e0e0e0 !important;
            }
        `);

    $('head').append($syntaxStyle);
    $('body').append($syntaxPanel);

    var nbClickSyntax = 0;
    var posx = null;
    var posy = null;

    // Track mouse position
    document.addEventListener("click", function(event) {
        if ((event.clientX != 0) && (event.clientY != 0)) {
            posx = event.clientX;
            // Position so bottom of panel is just above click (height=150px + padding)
            posy = event.clientY - 190;
        }
    });

    // Detect clicks on CodeMirror gutter (line numbers area)
    editor.on('gutterClick', function(cm, line, gutter) {
        console.log('Gutter clicked! Gutter:', gutter, 'Clicks:', nbClickSyntax + 1);
        if (gutter === 'CodeMirror-linenumbers') {
            nbClickSyntax += 1;
            console.log('Line numbers gutter clicked, nbClickSyntax:', nbClickSyntax);

            if (nbClickSyntax == 2) {
                // Show quick menu at mouse position (use setTimeout to prevent immediate close)
                setTimeout(function() {
                    $quickMenu.css({
                        'position': 'fixed',
                        'left': posx + 'px',
                        'top': posy + 'px',
                        'display': 'flex'
                    });
                    quickMenuVisible = true;
                }, 100);
            }

            if (nbClickSyntax == 3) {
                $quickMenu.hide();
                quickMenuVisible = false;
                nbClickSyntax = 0;
            }
        }
    });

    // Click on "Syntax" button
    $(document).on('click', '#syntax-btn', function(e) {
        e.stopPropagation();  // Prevent event from bubbling to document click handler
        $syntaxPanel.fadeIn(200);
        syntaxPanelVisible = true;
        $quickMenu.hide();
        quickMenuVisible = false;
        nbClickSyntax = 0;  // Reset click counter
    });

    // Close syntax panel
    $(document).on('click', '#close-syntax', function() {
        $syntaxPanel.fadeOut(200);
        syntaxPanelVisible = false;
    });

    // Close quick menu when clicking outside
    $(document).on('click', function(e) {
        if (quickMenuVisible && !$(e.target).closest('#quick-menu').length && !$(e.target).is('#syntax-btn')) {
            $quickMenu.hide();
            quickMenuVisible = false;
            nbClickSyntax = 0;
        }
    });

    // Close syntax panel when clicking outside (with delay to prevent immediate closing)
    var enableOutsideClick = false;
    $(document).on('click', function(e) {
        if (syntaxPanelVisible && enableOutsideClick &&
            !$(e.target).closest('#syntax-panel').length &&
            !$(e.target).is('#syntax-btn')) {
            $syntaxPanel.fadeOut(200);
            syntaxPanelVisible = false;
            enableOutsideClick = false;
        }
    });

    // Enable outside click detection after panel is opened
    $(document).on('click', '#syntax-btn', function() {
        setTimeout(function() {
            enableOutsideClick = true;
        }, 300);
    });
}
