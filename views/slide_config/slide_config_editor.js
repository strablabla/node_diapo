// ============================================
// CONFIGURATION PANEL - Opens with Ctrl+Shift+C
// ============================================
//
// Two files behind one panel:
//   - the slides' style, views/slide_config/slide_config.yaml (css section),
//     read and written through /slide_config.yaml and /save-slide-config;
//   - the general settings of config.yaml, through /app-config and
//     /save-app-config (lib/app_config.js);
//   - the presentation's name, for its files (views/config_deck.yaml,
//     through /deck-name and /save-deck-name, lib/deck_archive.js).
// Style changes are previewed on the slide as the controls move; Cancel puts
// the saved style back, Save writes both files and reloads the page.
//
// Ctrl+Shift+C, not Ctrl+C: Ctrl+C has to stay the copy of selected text.
//
// The panel lives in a shadow root, out of reach of the slides' stylesheets.
// Keys typed in it are kept from the page: the slide shortcuts (arrows, B...)
// listen on the document and, the shadow root hiding the real target, would
// take them for keys pressed on the slide.

(function() {

    // The style settings: each control drives one CSS property on one or
    // more selectors of slide_config.yaml.
    var STYLE_FIELDS = [
        { id: 'title_margin', label: 'Titles: left margin', selectors: ['h1', 'h2', 'h3'],
          prop: 'margin-left', kind: 'range', min: 0, max: 50, step: 0.5, unit: '%' },
        { id: 'p_margin', label: 'Paragraphs: left margin', selectors: ['p'],
          prop: 'margin-left', kind: 'range', min: 0, max: 50, step: 0.5, unit: '%' },
        { id: 'ul_margin', label: 'Lists: left margin', selectors: ['ul'],
          prop: 'margin-left', kind: 'range', min: 0, max: 50, step: 0.5, unit: '%' },
        { id: 'li_size', label: 'Lists: text size', selectors: ['li'],
          prop: 'font-size', kind: 'range', min: 50, max: 300, step: 5, unit: '%' },
        { id: 'lili_size', label: 'Sub-lists: text size (relative to the list)', selectors: ['li li'],
          prop: 'font-size', kind: 'range', min: 40, max: 150, step: 5, unit: '%' },
        { id: 'li_color', label: 'Lists: text colour', selectors: ['li', 'li li'],
          prop: 'color', kind: 'color' }
    ];

    var CSS = `
        .overlay {
            all: initial;
            position: fixed; inset: 0;
            display: flex; justify-content: center; align-items: center;
            background: rgba(0, 0, 0, 0.6);
            font: 14px/1.4 Arial, sans-serif; color: #222;
        }
        .panel {
            background: white; border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            width: 540px; max-height: 88vh; overflow-y: auto;
            padding: 24px 28px; box-sizing: border-box;
        }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        h3 { margin: 0; font-size: 20px; font-weight: bold; }
        h4 { margin: 22px 0 4px; font-size: 15px; color: #2196F3; font-weight: bold; }
        .file { font-size: 12px; color: #888; margin-bottom: 12px; font-family: monospace; }
        .row { margin: 0 0 14px; }
        .label { display: flex; justify-content: space-between; align-items: center;
                 font-weight: bold; margin-bottom: 5px; }
        .value { font-family: monospace; color: #666; font-weight: normal; }
        .hint { font-size: 12px; color: #777; margin-top: 3px; }
        input[type=range] { width: 100%; cursor: pointer; margin: 0; }
        input[type=number] { width: 90px; padding: 4px 6px; font: inherit;
                             border: 1px solid #bbb; border-radius: 4px; }
        input[type=text] { width: 100%; box-sizing: border-box; padding: 5px 8px; font: inherit;
                           border: 1px solid #bbb; border-radius: 4px; margin-top: 4px; }
        input[type=color] { width: 60px; height: 28px; padding: 0 2px; cursor: pointer;
                            border: 1px solid #bbb; border-radius: 4px; background: white; }
        .error { color: #c62828; min-height: 18px; margin: 8px 0 0; }
        .buttons { display: flex; justify-content: flex-end; gap: 10px;     /* kept in sight on a small screen */
                    position: sticky; bottom: -24px; background: white;
                    margin: 10px 0 -24px; padding: 10px 0 24px; }
        button { font: inherit; cursor: pointer; border: none; border-radius: 4px; padding: 9px 22px; color: white; }
        .cancel { background: #6c757d; }
        .cancel:hover { background: #5a6268; }
        .save { background: #28a745; }
        .save:hover { background: #218838; }
        .close { background: white; color: black; border: 2px solid black; border-radius: 50%;
                 width: 30px; height: 30px; padding: 0; font-size: 18px; font-weight: bold; line-height: 1; }
        .close:hover { background: #e0e0e0; }
    `;

    function styleRow(f) {
        if (f.kind === 'color') {
            return '<div class="row"><div class="label"><span>' + f.label + '</span>' +
                   '<input type="color" data-style="' + f.id + '"></div></div>';
        }
        return '<div class="row"><div class="label"><span>' + f.label + '</span>' +
               '<span class="value" data-value="' + f.id + '"></span></div>' +
               '<input type="range" data-style="' + f.id + '" min="' + f.min + '" max="' + f.max +
               '" step="' + f.step + '"></div>';
    }

    var HTML =
        '<div class="overlay"><div class="panel">' +
        '  <div class="header"><h3>Configuration</h3><button class="close" title="Close (Esc)">×</button></div>' +
        '  <h4>Slide style</h4><div class="file">views/slide_config/slide_config.yaml</div>' +
           STYLE_FIELDS.map(styleRow).join('') +
        '  <h4>Presentation</h4><div class="file">views/config_deck.yaml</div>' +
        '  <div class="row"><div class="label"><span>Name</span></div>' +
        '    <input type="text" data-deck="name" maxlength="150">' +
        '    <div class="hint">For its files: the exported one, the backups, the PDF. ' +
        'The title, on the first slide, is part of that slide\'s text (Alt+T).</div></div>' +
        '  <h4>General</h4><div class="file">config.yaml</div>' +
        '  <div class="row"><div class="label"><span>Slider bar colour</span>' +
        '    <input type="color" data-app="color_bar"></div></div>' +
        '  <div class="row"><div class="label"><span>Thumbnails per row (Alt+M)</span>' +
        '    <input type="number" data-app="nb_horiz_mosaic" min="1" max="20" step="1"></div></div>' +
        '  <div class="row"><div class="label"><span>Stop the server after (s)</span>' +
        '    <input type="number" data-app="idle_shutdown_sec" min="0" step="10"></div>' +
        '    <div class="hint">Seconds after the last tab is closed. 0: never, stop it by hand.</div></div>' +
        '  <div class="row"><div class="label"><span>Thumbnail and PDF size</span>' +
        '    <span class="value" data-viewport></span></div>' +
        '    <div class="hint">Taken from the browser window at each start.</div></div>' +
        '  <div class="error"></div>' +
        '  <div class="buttons"><button class="cancel">Cancel</button><button class="save">Save &amp; Apply</button></div>' +
        '</div></div>';

    var host = null, shadow = null;
    var savedStyle = null;          // slide_config.yaml as loaded, for Cancel and Save

    function $in(sel) { return shadow.querySelector(sel) }
    function field(id) { return STYLE_FIELDS.filter(function(f) { return f.id === id })[0] }

    // A colour name or rgb() turned into the #rrggbb an <input type=color> needs.
    function toHex(c) {
        var ctx = document.createElement('canvas').getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillStyle = String(c || '#000000');
        var v = ctx.fillStyle;
        if (v.charAt(0) === '#') return v;
        var m = v.match(/\d+/g) || [0, 0, 0];
        return '#' + m.slice(0, 3).map(function(n) { return ('0' + Number(n).toString(16)).slice(-2) }).join('');
    }

    // A slide_config.yaml value read as a number in the field's unit. Older
    // files hold margins in px: converted to % of a 1920 px wide screen.
    function toNumber(f, v) {
        if (v === undefined || v === null || v === '') return null;
        if (typeof v === 'number') return f.prop === 'margin-left' ? v / 1920 * 100 : v;
        var n = parseFloat(v);
        if (isNaN(n)) return null;
        if (/px$/.test(v) && f.prop === 'margin-left') return n / 1920 * 100;
        if (/px$/.test(v) && f.prop === 'font-size') return n / 16 * 100;
        if (/em$/.test(v)) return n * 100;
        return n;
    }

    function readStyle(css, f) {
        var rule = css[f.selectors[0]] || {};
        if (f.kind === 'color') return toHex(rule[f.prop] || '#000000');
        var n = toNumber(f, rule[f.prop]);
        if (n === null) n = f.prop === 'font-size' ? 100 : 0;
        return Math.min(f.max, Math.max(f.min, n));
    }

    function styleValue(f, input) {
        return f.kind === 'color' ? input.value : parseFloat(input.value) + f.unit;
    }

    // Live preview, the same way slide_config.js applies the file.
    function preview(f, value) {
        f.selectors.forEach(function(sel) { $(sel).css(f.prop, value) });
    }

    function restoreStyle() {
        if (!savedStyle) return;
        var css = savedStyle.css || {};
        STYLE_FIELDS.forEach(function(f) {
            f.selectors.forEach(function(sel) {
                var rule = css[sel] || {};
                $(sel).css(f.prop, rule[f.prop] === undefined ? '' : rule[f.prop]);
            });
        });
    }

    function create() {
        host = document.createElement('div');
        host.id = 'slide-config-editor';
        host.style.cssText = 'position: fixed; inset: 0; z-index: 100000; display: none; margin: 0; padding: 0;';
        shadow = host.attachShadow({ mode: 'open' });
        shadow.innerHTML = '<style>' + CSS + '</style>' + HTML;
        document.body.appendChild(host);

        shadow.querySelectorAll('[data-style]').forEach(function(input) {
            input.addEventListener('input', function() {
                var f = field(input.getAttribute('data-style'));
                var v = styleValue(f, input);
                var shown = $in('[data-value="' + f.id + '"]');
                if (shown) shown.textContent = v;
                preview(f, v);
            });
        });

        $in('.close').addEventListener('click', cancel);
        $in('.cancel').addEventListener('click', cancel);
        $in('.save').addEventListener('click', save);
        $in('.overlay').addEventListener('click', function(e) {
            if (e.target === $in('.overlay')) cancel();
        });

        // Keep the keys typed in the panel from the slide shortcuts; Escape closes.
        ['keydown', 'keypress', 'keyup'].forEach(function(type) {
            host.addEventListener(type, function(e) {
                e.stopPropagation();
                if (type === 'keydown' && e.key === 'Escape') cancel();
                // The field typed in: seen from here, e.target is only the host.
                var typedIn = (e.composedPath && e.composedPath()[0]) || e.target;
                if (type === 'keydown' && e.key === 'Enter' && typedIn.tagName === 'INPUT') save();
            });
        });
    }

    function open() {
        if (!host) create();
        $in('.error').textContent = '';
        $.when($.get('/slide_config.yaml'), $.getJSON('/app-config'), $.getJSON('/deck-name')).done(function(styleRes, appRes, deckRes) {
            savedStyle = jsyaml.load(styleRes[0]) || {};
            var css = savedStyle.css || {};
            STYLE_FIELDS.forEach(function(f) {
                var input = $in('[data-style="' + f.id + '"]');
                input.value = readStyle(css, f);
                var shown = $in('[data-value="' + f.id + '"]');
                if (shown) shown.textContent = styleValue(f, input);
            });

            $in('[data-deck="name"]').value = deckRes[0].name || '';

            var app = appRes[0];
            $in('[data-app="color_bar"]').value = toHex(app.color_bar);
            $in('[data-app="nb_horiz_mosaic"]').value = app.nb_horiz_mosaic;
            $in('[data-app="idle_shutdown_sec"]').value = app.idle_shutdown_sec;
            $in('[data-viewport]').textContent = app.viewport_width && app.viewport_height
                ? app.viewport_width + ' × ' + app.viewport_height : 'not measured yet';

            host.style.display = 'block';
            $in('[data-style]').focus();
        }).fail(function(xhr, status, error) {
            alert('Failed to load the configuration: ' + (error || status));
        });
    }

    function isOpen() { return host && host.style.display !== 'none' }

    function close() { if (host) host.style.display = 'none' }

    function cancel() {
        restoreStyle();
        close();
    }

    function save() {
        var error = $in('.error');
        error.textContent = '';

        // The style: the loaded file, other rules (hide, #content...) untouched.
        var style = savedStyle || {};
        style.css = style.css || {};
        STYLE_FIELDS.forEach(function(f) {
            var v = styleValue(f, $in('[data-style="' + f.id + '"]'));
            f.selectors.forEach(function(sel) {
                style.css[sel] = style.css[sel] || {};
                style.css[sel][f.prop] = v;
            });
        });

        var app = {
            color_bar: $in('[data-app="color_bar"]').value,
            nb_horiz_mosaic: Number($in('[data-app="nb_horiz_mosaic"]').value),
            idle_shutdown_sec: Number($in('[data-app="idle_shutdown_sec"]').value)
        };

        var name = $in('[data-deck="name"]').value.trim();
        if (!name) { error.textContent = 'Not saved: the presentation needs a name'; return; }

        $.ajax({ url: '/save-deck-name', type: 'POST', contentType: 'application/json',
                 data: JSON.stringify({ name: name }) })
        .then(function() {
            return $.ajax({ url: '/save-app-config', type: 'POST', contentType: 'application/json',
                            data: JSON.stringify(app) });
        })
        .then(function() {
            return $.ajax({ url: '/save-slide-config', type: 'POST', contentType: 'text/plain',
                            data: jsyaml.dump(style) });
        })
        .done(function() {
            console.log('✅ Configuration saved');
            close();
            location.reload();
        })
        .fail(function(xhr) {
            var msg = (xhr.responseJSON && xhr.responseJSON.error) || xhr.statusText || 'no answer';
            error.textContent = 'Not saved: ' + msg;
        });
    }

    // Ctrl+Shift+C toggles the panel. Caught in the capture phase, ahead of
    // the page's other handlers.
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && !e.altKey && (e.key === 'C' || e.key === 'c')) {
            e.preventDefault();
            e.stopPropagation();
            if (isOpen()) cancel(); else open();
        }
    }, true);

    window.openConfigPanel = open;          // for the right-click menu (app_menu.js)

    console.log('✅ Configuration panel initialized (Ctrl+Shift+C to open)');

})();
