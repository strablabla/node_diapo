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

    ` + syntaxReferenceHtml();   // the list: lib/syntax_reference.js

    $syntaxPanel.html(syntaxContent);

    // Add CSS for close button hover effect
    var $syntaxStyle = $('<style>')
        .text(`
            #close-syntax:hover {
                background: #e0e0e0 !important;
            }
            #syntax-panel h4 {
                margin: 15px 0 5px 0;
                color: #2196F3;
            }
            #syntax-panel .syntax-item {
                background: #f5f5f5;
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 8px;
            }
            #syntax-panel .syntax-note {
                color: #666;
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
