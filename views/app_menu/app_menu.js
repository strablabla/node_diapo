// ============================================
// RIGHT-CLICK MENU - the application's actions
// ============================================
//
// A right click on the slide opens a small menu:
//   - Export the PDF: every thumbnail is taken again first, so the PDF shows
//     the slides as they are now (Alt+Ctrl+P uses the thumbnails as they are);
//   - Configuration (Ctrl+Shift+C);
//   - Stop node_diapo: the server exits, the open pages say so.
//
// Left to others: images and equations keep their own menu
// (context_menu/context_menu.js), text fields and the editor the browser's
// one (copy, paste, spelling); Shift+right click always gives the browser's.
//
// The menu lives in a shadow root, out of reach of the slides' styles.

;(function() {   // the leading ; : this file is pasted after others in one script

    var OWN_MENU = 'p figure, p.eq, .positioned-image';
    var BROWSER_MENU = 'input, textarea, select, [contenteditable], .CodeMirror';

    var CSS = `
        .menu {
            all: initial;
            display: block;
            background: white;
            border: 1px solid #bbb;
            border-radius: 6px;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
            padding: 5px 0;
            min-width: 230px;
            font: 14px/1.4 Arial, sans-serif;
            color: #222;
        }
        .item {
            display: flex; justify-content: space-between; gap: 24px;
            padding: 7px 14px;
            cursor: pointer;
            user-select: none;
        }
        .item:hover { background: #e8f0fe; }
        .keys { color: #888; font-size: 12px; }
        .sep { height: 1px; background: #e4e4e4; margin: 5px 0; }
        .danger { color: #c62828; }
        .danger:hover { background: #fdecea; }
    `;

    var HTML =
        '<div class="menu">' +
        '  <div class="item" data-action="pdf"><span>Export the slides as PDF</span></div>' +
        '  <div class="item" data-action="config"><span>Configuration</span><span class="keys">Ctrl+Shift+C</span></div>' +
        '  <div class="sep"></div>' +
        '  <div class="item danger" data-action="stop"><span>Stop node_diapo</span></div>' +
        '</div>';

    var host = null, shadow = null;

    function create() {
        host = document.createElement('div');
        host.id = 'app-menu';
        host.style.cssText = 'position: fixed; z-index: 2147483647; display: none; margin: 0; padding: 0;';
        shadow = host.attachShadow({ mode: 'open' });
        shadow.innerHTML = '<style>' + CSS + '</style>' + HTML;
        document.body.appendChild(host);

        shadow.querySelectorAll('.item').forEach(function(item) {
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                hide();
                run(item.getAttribute('data-action'));
            });
        });
        // A right click on the menu itself: nothing, rather than a menu on the menu.
        host.addEventListener('contextmenu', function(e) { e.preventDefault(); e.stopPropagation() });
    }

    function run(action) {
        if (action === 'pdf') {
            generatePdf(true);
        } else if (action === 'config') {
            if (window.openConfigPanel) window.openConfigPanel();
        } else if (action === 'stop') {
            if (confirm('Stop node_diapo?\n\nThe slides are saved; it can be started again from its launcher.')) {
                socket.emit('shutdown');
            }
        }
    }

    function show(x, y) {
        if (!host) create();
        host.style.display = 'block';
        // Kept inside the window, flipped left or up near the edges.
        var w = host.offsetWidth, h = host.offsetHeight;
        host.style.left = Math.max(0, Math.min(x, window.innerWidth - w - 4)) + 'px';
        host.style.top = Math.max(0, Math.min(y, window.innerHeight - h - 4)) + 'px';
    }

    function hide() { if (host) host.style.display = 'none' }

    $(document).on('contextmenu', function(e) {
        if (e.shiftKey) return;
        var target = $(e.target);
        if (target.closest(OWN_MENU).length || target.closest(BROWSER_MENU).length) { hide(); return; }
        e.preventDefault();
        $('#image-context-menu').hide();
        show(e.clientX, e.clientY);
    });

    document.addEventListener('mousedown', function(e) {
        if (host && e.target !== host) hide();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') hide();
    });
    window.addEventListener('blur', hide);
    window.addEventListener('resize', hide);
    window.addEventListener('scroll', hide, true);

})();
