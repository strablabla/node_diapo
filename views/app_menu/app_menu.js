// ============================================
// RIGHT-CLICK MENU - the application's actions
// ============================================
//
// A right click on the slide opens a small menu:
//   - Export the PDF: every thumbnail is taken again first, so the PDF shows
//     the slides as they are now (Alt+Ctrl+P uses the thumbnails as they are);
//   - Export the presentation: one .zip file with the slides, their images,
//     videos, drawings, title and style (lib/deck_archive.js);
//   - Open a presentation: a panel lists the presentations of backups/ (a
//     click opens one), "Another file…" takes one from elsewhere; it
//     replaces this one, which is saved first in backups/; every open page
//     goes to its first slide;
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
            showOpenPanel();
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

    // The answer of the server to an opening, the same for each way.
    function opening(request, label) {
        var el = notice('Opening ' + label + '…');
        request
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

    function confirmOpen(label) {
        return confirm('Open "' + label + '" in place of the current presentation?\n\n'
                       + 'The current one is saved first in the backups folder of node_diapo, '
                       + 'as a file that can be opened again the same way.');
    }

    function openDeck(file) {
        if (!confirmOpen(file.name)) return;
        opening(fetch('/import-deck', { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' },
                                        body: file }), file.name);
    }

    function openBackup(item) {
        var deck = item.deck || item.title;
        var label = deck ? deck + ' (' + backupDate(item) + ')' : item.name;
        if (!confirmOpen(label)) return;
        opening(fetch('/open-backup', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ name: item.name }) }), label);
    }

    // --------------------------------------- the panel of "Open a presentation"
    // A web page cannot choose the folder the browser's file dialog opens in:
    // so the presentations of backups/ are listed here, read on the server.

    var PANEL_CSS = `
        .shade { all: initial; position: fixed; inset: 0; background: rgba(0,0,0,0.35);
                 display: flex; align-items: center; justify-content: center; }
        .panel { background: white; border-radius: 8px; box-shadow: 0 8px 30px rgba(0,0,0,0.35);
                 width: min(640px, calc(100vw - 32px)); max-height: 80vh; display: flex; flex-direction: column;
                 font: 14px/1.4 Arial, sans-serif; color: #222; }
        h3 { margin: 0; padding: 16px 20px 6px; font-size: 18px; }
        .hint { padding: 0 20px 10px; color: #666; font-size: 12px; }
        .list { overflow-y: auto; border-top: 1px solid #eee; border-bottom: 1px solid #eee; }
        .row { display: grid; grid-template-columns: 1fr auto auto; gap: 14px; align-items: baseline;
               padding: 9px 20px; cursor: pointer; }
        .row:hover { background: #e8f0fe; }
        .title { font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sub { display: block; font-weight: normal; color: #666; font-size: 12px; overflow: hidden; text-overflow: ellipsis; }
        .date, .meta { color: #666; font-size: 12px; white-space: nowrap; }
        .empty { padding: 20px; color: #666; }
        .buttons { display: flex; justify-content: space-between; padding: 12px 20px; gap: 10px; }
        button { font: 14px Arial, sans-serif; padding: 6px 14px; border-radius: 5px; border: 1px solid #bbb;
                 background: #f6f6f6; cursor: pointer; }
        button:hover { background: #e8e8e8; }
    `;

    function backupDate(item) {
        return new Date(item.modified).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric',
                                                                 hour: '2-digit', minute: '2-digit' });
    }

    function esc(t) {
        return String(t).replace(/[&<>"]/g, function(c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] });
    }

    var panelHost = null;

    function closeOpenPanel() {
        if (panelHost) { panelHost.remove(); panelHost = null }
        document.removeEventListener('keydown', escapePanel, true);
    }

    // The keys go to the page, not to the panel: Esc is caught there.
    function escapePanel(e) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeOpenPanel() }
    }

    function showOpenPanel() {
        closeOpenPanel();
        panelHost = document.createElement('div');
        panelHost.id = 'open-deck-panel';
        panelHost.style.cssText = 'position: fixed; inset: 0; z-index: 2147483646; margin: 0; padding: 0;';
        var root = panelHost.attachShadow({ mode: 'open' });
        root.innerHTML = '<style>' + PANEL_CSS + '</style>' +
            '<div class="shade"><div class="panel">' +
            '<h3>Open a presentation</h3>' +
            '<div class="hint">Saved in the backups folder of node_diapo. The current presentation is saved there too before another one opens.</div>' +
            '<div class="list"><div class="empty">Reading…</div></div>' +
            '<div class="buttons"><button class="other">Another file…</button><button class="cancel">Cancel</button></div>' +
            '</div></div>';
        document.body.appendChild(panelHost);

        // The page's own handlers stay out (menus, dragging, keys).
        ['click', 'mousedown', 'mouseup', 'dblclick', 'contextmenu', 'wheel'].forEach(function(type) {
            panelHost.addEventListener(type, function(e) { e.stopPropagation() });
        });
        document.addEventListener('keydown', escapePanel, true);
        root.querySelector('.shade').addEventListener('click', function(e) {
            if (e.target.classList.contains('shade')) closeOpenPanel();
        });
        root.querySelector('.cancel').addEventListener('click', closeOpenPanel);
        root.querySelector('.other').addEventListener('click', function() { closeOpenPanel(); chooseDeck() });

        var list = root.querySelector('.list');
        fetch('/backups').then(function(res) { return res.json() }).then(function(items) {
            if (!Array.isArray(items)) throw new Error(items.error || 'unexpected answer');
            if (!items.length) {
                list.innerHTML = '<div class="empty">No presentation saved yet: "Another file…" opens one from elsewhere.</div>';
                return;
            }
            list.innerHTML = '';
            items.forEach(function(item) {
                var row = document.createElement('div');
                row.className = 'row';
                row.title = item.name;
                var deck = item.deck || item.title || item.name;
                var sub = item.title && item.title !== deck ? '<span class="sub">' + esc(item.title) + '</span>' : '';
                row.innerHTML = '<span class="title">' + esc(deck) + sub + '</span>' +
                    '<span class="meta">' + (item.slides ? item.slides + (item.slides > 1 ? ' slides · ' : ' slide · ') : '') +
                    (item.size / 1048576).toFixed(1) + ' MB</span>' +
                    '<span class="date">' + esc(backupDate(item)) + '</span>';
                row.addEventListener('click', function() { closeOpenPanel(); openBackup(item) });
                list.appendChild(row);
            });
        }).catch(function(err) {
            list.innerHTML = '<div class="empty">The backups folder could not be read: ' + esc(err.message) + '</div>';
        });
    }

    // ------------------------------------------- "New presentation" (Ctrl+Alt+N)
    // Two things asked: the name, for the files (export, backups, PDF, the
    // list of "Open a presentation"), and the title, on the first slide. The
    // title follows the name as it is typed, until it is typed itself.

    var NEW_CSS = `
        form { padding: 4px 20px 6px; display: flex; flex-direction: column; gap: 12px; }
        label { display: flex; flex-direction: column; gap: 4px; font-weight: bold; }
        label small { font-weight: normal; color: #666; font-size: 12px; }
        input { font: 15px Arial, sans-serif; padding: 7px 9px; border: 1px solid #bbb; border-radius: 5px; }
        input:focus { outline: 2px solid #1e88e5; border-color: #1e88e5; }
        button.create { background: #1e88e5; border-color: #1e88e5; color: white; }
        button.create:hover { background: #1976d2; }
    `;

    function newDeck() {
        closeOpenPanel();
        panelHost = document.createElement('div');
        panelHost.id = 'new-deck-panel';
        panelHost.style.cssText = 'position: fixed; inset: 0; z-index: 2147483646; margin: 0; padding: 0;';
        var root = panelHost.attachShadow({ mode: 'open' });
        root.innerHTML = '<style>' + PANEL_CSS + NEW_CSS + '</style>' +
            '<div class="shade"><div class="panel">' +
            '<h3>New presentation</h3>' +
            '<div class="hint">It replaces the current presentation, saved first in the backups folder of node_diapo ' +
            '("Open a presentation" opens it again). The background and the style stay.</div>' +
            '<form>' +
            '<label>Name <small>for the files: export, backups, PDF</small><input class="field-name" maxlength="150"></label>' +
            '<label>Title <small>shown on the first slide</small><input class="field-title" maxlength="150"></label>' +
            '</form>' +
            '<div class="buttons"><button class="cancel" type="button">Cancel</button>' +
            '<button class="create" type="button">Create</button></div>' +
            '</div></div>';
        document.body.appendChild(panelHost);

        // Nothing typed here reaches the page (its shortcuts: B, D, arrows...).
        ['click', 'mousedown', 'mouseup', 'dblclick', 'contextmenu', 'wheel', 'keydown', 'keyup', 'keypress'].forEach(function(type) {
            panelHost.addEventListener(type, function(e) { e.stopPropagation() });
        });
        document.addEventListener('keydown', escapePanel, true);

        var nameInput = root.querySelector('.field-name'), titleInput = root.querySelector('.field-title');
        var titleTyped = false;
        nameInput.value = 'Nouvelle présentation';
        titleInput.value = nameInput.value;
        nameInput.addEventListener('input', function() { if (!titleTyped) titleInput.value = nameInput.value });
        titleInput.addEventListener('input', function() { titleTyped = true });

        function create() {
            var name = nameInput.value.trim(), title = titleInput.value.trim();
            closeOpenPanel();
            makeNewDeck(name, title);
        }
        root.querySelector('form').addEventListener('submit', function(e) { e.preventDefault(); create() });
        [nameInput, titleInput].forEach(function(input) {
            input.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); create() } });
        });
        root.querySelector('.create').addEventListener('click', create);
        root.querySelector('.cancel').addEventListener('click', closeOpenPanel);
        root.querySelector('.shade').addEventListener('click', function(e) {
            if (e.target.classList.contains('shade')) closeOpenPanel();
        });
        nameInput.focus();
        nameInput.select();
    }

    function makeNewDeck(name, title) {
        var el = notice('New presentation: ' + (name || title || 'Nouvelle présentation') + '…');
        fetch('/new-deck', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({ name: name, title: title }) })
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
