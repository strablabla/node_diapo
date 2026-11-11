// ============================================
// KEYBOARD SHORTCUTS HELP PANEL
// ============================================
//
// The panel lives in a shadow root: the slides' stylesheets (ul, li, h3, h4,
// fonts, backgrounds...) cannot reach inside it, and its own rules cannot leak
// into the slides. Only the host box is styled from the outside, inline, so
// that page rules aimed at body's children lose to it.

var SHORTCUTS_PANEL_CSS = `
    .panel {
        all: initial;              /* drop whatever the page lets inherit */
        display: block;
        font-family: Arial, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        color: #222;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }
    h3 {
        margin: 0;
        font-size: 20px;
        font-weight: bold;
    }
    h4 {
        color: #2196F3;
        font-size: 16px;
        font-weight: bold;
        margin: 20px 0 10px 0;
    }
    h4:first-of-type {
        margin-top: 0;
    }
    ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    li {
        margin: 0 0 8px 0;
        padding: 0;
    }
    kbd {
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
    .close {
        background: white;
        color: black;
        border: 2px solid black;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        padding: 0;
        cursor: pointer;
        font-family: Arial, sans-serif;
        font-size: 18px;
        font-weight: bold;
        line-height: 1;
    }
    .close:hover {
        background: #e0e0e0;
    }
`;

var SHORTCUTS_PANEL_HTML = `
    <div class="panel">
        <div class="header">
            <h3>Keyboard Shortcuts</h3>
            <button class="close" title="Close">×</button>
        </div>

        <h4>Navigation</h4>
        <ul>
            <li><kbd>→</kbd> or <kbd>Page Down</kbd> - Next slide</li>
            <li><kbd>←</kbd> or <kbd>Page Up</kbd> - Previous slide</li>
            <li><kbd>↓</kbd> or <kbd>B</kbd> - Progressive visualization (next line)</li>
            <li><kbd>↑</kbd> - Progressive visualization (previous line)</li>
        </ul>

        <h4>Editor</h4>
        <ul>
            <li><kbd>Alt + T</kbd> - Toggle text editor</li>
            <li><kbd>Ctrl + S</kbd> - Save positions</li>
        </ul>

        <h4>Global views</h4>
        <ul>
            <li><kbd>Alt + A</kbd> - Global view (full list)</li>
            <li><kbd>Alt + M</kbd> - Thumbnails view (mosaic)</li>
        </ul>

        <h4>Slide management</h4>
        <ul>
            <li><kbd>Ctrl + P</kbd> - Create new slide</li>
            <li><kbd>Ctrl + D</kbd> - Duplicate current slide</li>
            <li><kbd>Alt + Ctrl + X</kbd> - Delete current slide</li>
            <li><kbd>Ctrl + Alt + N</kbd> - New presentation (the current one is saved in backups/)</li>
        </ul>

        <h4>Drawing on the slides</h4>
        <ul>
            <li>Mouse at the <b>right edge</b> - Toolbar: help, drawing tools</li>
            <li><kbd>D</kbd> - Drawing mode on/off (<kbd>Esc</kbd> leaves it)</li>
            <li><kbd>L</kbd> - Layer: <b>Live</b> (for the talk, not saved) or <b>Slide</b> (kept in the presentation)</li>
            <li><kbd>P</kbd> Pen, <kbd>H</kbd> Highlighter, <kbd>E</kbd> Eraser</li>
            <li><kbd>Ctrl + Z</kbd> - Undo, <kbd>Ctrl + Y</kbd> or <kbd>Ctrl + Shift + Z</kbd> - Redo</li>
        </ul>

        <h4>Advanced features</h4>
        <ul>
            <li><kbd>Alt + Ctrl + P</kbd> - Generate PDF (current thumbnails)</li>
            <li><kbd>Right click</kbd> - Menu: PDF of the slides as they are, export or open a presentation (.zip), configuration, stop</li>
            <li><kbd>Ctrl + Shift + C</kbd> - Configuration panel (style, general settings)</li>
            <li><kbd>Ctrl + Shift + D</kbd> - Debug panel (server terminal, page console)</li>
            <li><kbd>Ctrl + M</kbd> - Toggle memos</li>
            <li><kbd>Alt + V</kbd> - Voice commands help</li>
            <li><kbd>Ctrl + V</kbd> - Toggle voice recognition</li>
            <li><kbd>Ctrl + H</kbd> - Show this help</li>
        </ul>
    </div>
`;

function setupShortcutsHelper() {
    var shortcutsPanelVisible = false;

    // The host box: the only part the page can see, hence styled inline.
    var $shortcutsPanel = $('<div>')
        .attr('id', 'shortcuts-panel')
        .css({
            'position': 'fixed',
            'top': '50px',
            'right': '50px',
            'margin': '0',
            'background': 'white',
            'border': '2px solid #333',
            'padding': '20px',
            'width': '500px',
            'box-sizing': 'content-box',
            'max-height': '80vh',
            'overflow-y': 'auto',
            'z-index': '10000',
            'display': 'none',
            'opacity': '1',
            'box-shadow': '0 4px 6px rgba(0,0,0,0.1)',
            'text-align': 'left'
        });

    var shadow = $shortcutsPanel[0].attachShadow({ mode: 'open' });
    shadow.innerHTML = '<style>' + SHORTCUTS_PANEL_CSS + '</style>' + SHORTCUTS_PANEL_HTML;

    $('body').append($shortcutsPanel);

    function hidePanel() {
        $shortcutsPanel.fadeOut(200);
        shortcutsPanelVisible = false;
    }

    function togglePanel() {
        if (shortcutsPanelVisible) {
            hidePanel();
        } else {
            $shortcutsPanel.fadeIn(200);
            shortcutsPanelVisible = true;
        }
    }

    // The "?" of the toolbar at the right edge (lib/slide_drawing.js).
    window.toggleShortcutsHelp = togglePanel;

    // Close button handler
    shadow.querySelector('.close').addEventListener('click', function(e) {
        e.stopPropagation();
        hidePanel();
    });

    // Close on outside click. A click inside the shadow root reaches the
    // document retargeted to the host, so closest() still recognises it.
    $(document).on('click', function(e) {
        if (shortcutsPanelVisible && !$(e.target).closest('#shortcuts-panel').length) {
            hidePanel();
        }
    });

    // Close on Escape key
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && shortcutsPanelVisible) {
            hidePanel();
        }
    });

    // Register Ctrl+H to toggle the panel
    key('ctrl+h', function(e) {
        e.preventDefault();
        togglePanel();
        return false;
    });

    console.log('Shortcuts helper initialized - press Ctrl+H to show help');
}

// Initialize when document is ready
$(document).ready(function() {
    setupShortcutsHelper();
});
