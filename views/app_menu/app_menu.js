// ============================================
// RIGHT-CLICK MENU - the application's actions
// ============================================
//
// A right click on the slide opens a small menu:
//   - Export the PDF: every thumbnail is taken again first, so the PDF shows
//     the slides as they are now (Alt+Ctrl+P uses the thumbnails as they are);
//   - Export the presentation: one .zip file with the slides, their images,
//     videos, drawings, title and style (lib/deck_archive.js);
//   - Open a presentation: such a file replaces this one, which is saved
//     first in backups/; every open page goes to its first slide;
//   - New presentation (Ctrl+Alt+N): one title slide in place of this
//     presentation, saved first in backups/ too;
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
        '  <div class="item" data-action="export"><span>Export the presentation</span><span class="keys">.zip</span></div>' +
        '  <div class="item" data-action="open"><span>Open a presentation…</span></div>' +
        '  <div class="item" data-action="new"><span>New presentation</span><span class="keys">Ctrl+Alt+N</span></div>' +
        '  <div class="sep"></div>' +
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
        } else if (action === 'export') {
            exportDeck();
        } else if (action === 'open') {
            chooseDeck();
        } else if (action === 'new') {
            newDeck();
        } else if (action === 'config') {
            if (window.openConfigPanel) window.openConfigPanel();
        } else if (action === 'stop') {
            if (confirm('Stop node_diapo?\n\nThe slides are saved; it can be started again from its launcher.')) {
                socket.emit('shutdown');
            }
        }
    }

    // ------------------------------------------------ presentation files

    function exportDeck() {
        // The server names the file (Content-Disposition): a link is enough,
        // the page stays.
        var link = document.createElement('a');
        link.href = '/export-deck';
        link.download = '';
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    function chooseDeck() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip,application/zip';
        input.style.display = 'none';
        input.addEventListener('change', function() {
            var file = input.files[0];
            input.remove();
            if (file) openDeck(file);
        });
        document.body.appendChild(input);
        input.click();
    }

    function notice(text) {
        var el = document.getElementById('deck-notice');
        if (!el) {
            el = document.createElement('div');
            el.id = 'deck-notice';
            el.style.cssText = 'position: fixed; left: 50%; top: 20px; transform: translateX(-50%); z-index: 2147483647; '
                + 'background: #333; color: white; padding: 10px 18px; border-radius: 6px; margin: 0; '
                + 'font: 15px Arial, sans-serif; box-shadow: 0 4px 14px rgba(0,0,0,0.3);';
            document.body.appendChild(el);
        }
        el.textContent = text;
        return el;
    }

    function openDeck(file) {
        if (!confirm('Open "' + file.name + '" in place of the current presentation?\n\n'
                     + 'The current one is saved first in the backups folder of node_diapo, '
                     + 'as a file that can be opened again the same way.')) return;
        var el = notice('Opening ' + file.name + '…');
        fetch('/import-deck', { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: file })
            .then(function(res) {
                return res.json().catch(function() { return { error: 'HTTP ' + res.status } }).then(function(body) {
                    if (!res.ok || !body.success) throw new Error(body.error || ('HTTP ' + res.status));
                    el.textContent = body.slides + ' slides opened. The previous presentation is in ' + body.backup;
                    // The server then sends every page to the first slide.
                });
            })
            .catch(function(err) {
                el.remove();
                alert('The presentation could not be opened:\n\n' + err.message);
            });
    }

    function newDeck() {
        if (!confirm('Start a new presentation in place of the current one?\n\n'
                     + 'The current one is saved first in the backups folder of node_diapo, '
                     + 'as a file that "Open a presentation" opens again. '
                     + 'The background and the style stay.')) return;
        var el = notice('New presentation…');
        fetch('/new-deck', { method: 'POST' })
            .then(function(res) {
                return res.json().catch(function() { return { error: 'HTTP ' + res.status } }).then(function(body) {
                    if (!res.ok || !body.success) throw new Error(body.error || ('HTTP ' + res.status));
                    el.textContent = 'New presentation. The previous one is in ' + body.backup;
                });
            })
            .catch(function(err) {
                el.remove();
                alert('The new presentation could not be made:\n\n' + err.message);
            });
    }

    // Ctrl+Alt+N. Capture phase, and by the key's place as well as its
    // letter: the same key on AZERTY and QWERTY.
    if (window.top === window) {
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.altKey && !e.shiftKey && !e.metaKey && !e.repeat
                && (e.code === 'KeyN' || (e.key || '').toLowerCase() === 'n')) {
                e.preventDefault();
                e.stopPropagation();
                hide();
                newDeck();
            }
        }, true);
    }

    // Another presentation was opened, from this page or another one.
    if (window.top === window) {
        socket.on('deck_replaced', function() { location.replace('/d0') });
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
