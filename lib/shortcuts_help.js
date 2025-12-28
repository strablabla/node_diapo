// ============================================
// KEYBOARD SHORTCUTS HELP PANEL
// ============================================

function setupShortcutsHelper() {
    var shortcutsPanelVisible = false;

    // Create shortcuts help panel
    var $shortcutsPanel = $('<div>')
        .attr('id', 'shortcuts-panel')
        .css({
            'position': 'fixed',
            'top': '50px',
            'right': '50px',
            'background': 'white',
            'border': '2px solid #333',
            'padding': '20px',
            'width': '500px',
            'max-height': '80vh',
            'overflow-y': 'auto',
            'z-index': '10000',
            'display': 'none',
            'box-shadow': '0 4px 6px rgba(0,0,0,0.1)',
            'font-family': 'Arial, sans-serif'
        })
        .html(`
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0;">Keyboard Shortcuts</h3>
                <button id="close-shortcuts" style="background: white; color: black; border: 2px solid black; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 18px; font-weight: bold;">×</button>
            </div>

            <div style="margin-top: 15px;">
                <h4 style="color: #2196F3; margin-bottom: 10px;">Navigation</h4>
                <ul style="list-style: none; padding-left: 0;">
                    <li style="margin-bottom: 8px;"><kbd>→</kbd> or <kbd>Page Down</kbd> - Next slide</li>
                    <li style="margin-bottom: 8px;"><kbd>←</kbd> or <kbd>Page Up</kbd> - Previous slide</li>
                    <li style="margin-bottom: 8px;"><kbd>↓</kbd> or <kbd>B</kbd> - Progressive visualization (next line)</li>
                    <li style="margin-bottom: 8px;"><kbd>↑</kbd> - Progressive visualization (previous line)</li>
                </ul>

                <h4 style="color: #2196F3; margin-bottom: 10px; margin-top: 20px;">Editor</h4>
                <ul style="list-style: none; padding-left: 0;">
                    <li style="margin-bottom: 8px;"><kbd>Alt + T</kbd> - Toggle text editor</li>
                    <li style="margin-bottom: 8px;"><kbd>Ctrl + S</kbd> - Save positions</li>
                </ul>

                <h4 style="color: #2196F3; margin-bottom: 10px; margin-top: 20px;">Global views</h4>
                <ul style="list-style: none; padding-left: 0;">
                    <li style="margin-bottom: 8px;"><kbd>Alt + A</kbd> - Global view (full list)</li>
                    <li style="margin-bottom: 8px;"><kbd>Alt + M</kbd> - Thumbnails view (mosaic)</li>
                </ul>

                <h4 style="color: #2196F3; margin-bottom: 10px; margin-top: 20px;">Slide management</h4>
                <ul style="list-style: none; padding-left: 0;">
                    <li style="margin-bottom: 8px;"><kbd>Ctrl + P</kbd> - Create new slide</li>
                    <li style="margin-bottom: 8px;"><kbd>Alt + Ctrl + X</kbd> - Delete current slide</li>
                </ul>

                <h4 style="color: #2196F3; margin-bottom: 10px; margin-top: 20px;">Advanced features</h4>
                <ul style="list-style: none; padding-left: 0;">
                    <li style="margin-bottom: 8px;"><kbd>Alt + Ctrl + P</kbd> - Generate PDF</li>
                    <li style="margin-bottom: 8px;"><kbd>Ctrl + M</kbd> - Toggle memos</li>
                    <li style="margin-bottom: 8px;"><kbd>Alt + V</kbd> - Voice commands help</li>
                    <li style="margin-bottom: 8px;"><kbd>Ctrl + V</kbd> - Toggle voice recognition</li>
                    <li style="margin-bottom: 8px;"><kbd>Ctrl + H</kbd> - Show this help</li>
                </ul>
            </div>
        `);

    // Add CSS for kbd tags
    var $style = $('<style>')
        .text(`
            #shortcuts-panel kbd {
                background-color: #f7f7f7;
                border: 1px solid #ccc;
                border-radius: 3px;
                box-shadow: 0 1px 0 rgba(0,0,0,0.2);
                color: #333;
                display: inline-block;
                font-family: monospace;
                font-size: 11px;
                line-height: 1.4;
                margin: 0 2px;
                padding: 2px 6px;
                white-space: nowrap;
            }
            #shortcuts-panel h4 {
                margin-bottom: 10px;
                margin-top: 20px;
            }
            #shortcuts-panel ul {
                margin-top: 0;
            }
            #close-shortcuts:hover {
                background: #e0e0e0 !important;
            }
        `);

    $('head').append($style);
    $('body').append($shortcutsPanel);

    // Close button handler
    $('#close-shortcuts').on('click', function(e) {
        e.stopPropagation();
        $shortcutsPanel.fadeOut(200);
        shortcutsPanelVisible = false;
    });

    // Close on outside click
    $(document).on('click', function(e) {
        if (shortcutsPanelVisible && !$(e.target).closest('#shortcuts-panel').length) {
            $shortcutsPanel.fadeOut(200);
            shortcutsPanelVisible = false;
        }
    });

    // Close on Escape key
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && shortcutsPanelVisible) {
            $shortcutsPanel.fadeOut(200);
            shortcutsPanelVisible = false;
        }
    });

    // Register Ctrl+H to toggle the panel
    key('ctrl+h', function(e) {
        e.preventDefault();
        if (shortcutsPanelVisible) {
            $shortcutsPanel.fadeOut(200);
            shortcutsPanelVisible = false;
        } else {
            $shortcutsPanel.fadeIn(200);
            shortcutsPanelVisible = true;
        }
        return false;
    });

    console.log('Shortcuts helper initialized - press Ctrl+H to show help');
}

// Initialize when document is ready
$(document).ready(function() {
    setupShortcutsHelper();
});
