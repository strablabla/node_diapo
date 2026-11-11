// ============================================
// DRAWING ON THE SLIDES, AND THE TOOLBAR AT THE RIGHT EDGE
// ============================================
//
// Bring the mouse to the right edge of the window: a toolbar slides out.
//   ?   the keyboard shortcuts (the Ctrl+H panel, lib/shortcuts_help.js);
//   pen drawing mode, with two layers on each slide:
//       - Live: drawn during the talk, kept while the tab stays open (going
//         back to a slide shows it again), never written to disk;
//       - Slide: part of the presentation, saved at each stroke in
//         views/drawings/d{n}.json (lib/drawings.js), so it is in the
//         thumbnails and the PDF too.
//
// Keys: D toggles drawing, Esc leaves it. While drawing: P pen,
// H highlighter, E eraser, L switches Live/Slide, Ctrl+Z undo, Ctrl+Y or
// Ctrl+Shift+Z redo. The arrows still change slide.
//
// The strokes are SVG paths in page pixels, as the !pos positions are. The
// slides are not drawn to scale with the window: measured on every slide, the
// text and images keep their distance from the top, and sideways move by 8 %
// of the change in the window's width (the headings by 13 %). So each stroke
// keeps the width of the window it was drawn in (w), and is moved sideways by
// 8 % of the difference: it stays on what it marks, a few pixels off at worst,
// on the projector as in the thumbnails.
//
// The layers have no size of their own (1 px, overflow visible): they never change
// the page's scrolling. Drawing goes through a transparent sheet over the
// page, so that the slide's own handlers (double click to the text, dragging
// images) do not run under the pen.
//
// In a preview frame (mosaic) and in the headless browser that takes the
// thumbnails, only the Slide layer is shown: no toolbar, no Live layer.

;(function() {

    if (window.__slideDrawing) return;      // the page includes it once, but who knows
    window.__slideDrawing = true;

    var SVGNS = 'http://www.w3.org/2000/svg';
    var INDEX = (typeof diapo_index === 'number') ? diapo_index : null;   // fixed at load: the arrows change diapo_index before leaving
    var INTERACTIVE = window.top === window && !navigator.webdriver;

    var COLORS = ['#000000', '#e53935', '#1e88e5', '#43a047', '#fdd835', '#ffffff'];
    var SIZES = { pen: [2, 4, 8], highlighter: [12, 22, 36], eraser: [8, 16, 32] };
    var HIGHLIGHTER_OPACITY = 0.35;
    var UNDO_DEPTH = 100;
    var SIDEWAYS = 0.08;            // see above: how the slides follow the window's width

    function pageWidth() { return document.documentElement.clientWidth }

    // The sideways move of a stroke drawn in a window of another width.
    function shift(s) { return s.w ? SIDEWAYS * (pageWidth() - s.w) : 0 }

    // ---------------------------------------------------------------- storage
    // sessionStorage: per tab, gone when it closes. Every access may throw
    // (blocked storage), and nothing must break then.

    function load(key, fallback) {
        try {
            var v = sessionStorage.getItem('node_diapo.' + key);
            return v === null ? fallback : JSON.parse(v);
        } catch (e) { return fallback }
    }
    function store(key, value) {
        try { sessionStorage.setItem('node_diapo.' + key, JSON.stringify(value)) } catch (e) {}
    }

    // ------------------------------------------------------------------ state

    var settings = Object.assign({
        drawing: false,             // drawing mode, kept from slide to slide
        layer: 'live',
        tool: 'pen',
        color: { pen: '#e53935', highlighter: '#fdd835' },
        size: 1,                    // index in SIZES[tool]
        hidden: false               // the eye: drawings hidden
    }, load('drawing_settings', {}));

    function saveSettings() { store('drawing_settings', settings) }

    var layers = {
        slide: { strokes: [], undo: [], redo: [], svg: null },
        live:  { strokes: [], undo: [], redo: [], svg: null }
    };

    if (INDEX !== null) {
        if (window.SLIDE_DRAWING && Array.isArray(SLIDE_DRAWING.strokes)) {
            layers.slide.strokes = SLIDE_DRAWING.strokes;
        }
        if (INTERACTIVE) layers.live.strokes = load('live_drawing.' + INDEX, []);
    }

    // -------------------------------------------------------------- rendering

    function pathData(p) {
        // Through the midpoints, each point a control point: smooth curves
        // from the raw pointer positions.
        if (p.length <= 4) {
            return 'M' + p[0] + ' ' + p[1] + 'L' + (p[2] === undefined ? p[0] : p[2]) + ' '
                       + (p[3] === undefined ? p[1] : p[3]);
        }
        var d = 'M' + p[0] + ' ' + p[1];
        for (var i = 2; i < p.length - 2; i += 2) {
            var mx = (p[i] + p[i + 2]) / 2, my = (p[i + 1] + p[i + 3]) / 2;
            d += 'Q' + p[i] + ' ' + p[i + 1] + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1);
        }
        return d + 'L' + p[p.length - 2] + ' ' + p[p.length - 1];
    }

    function strokeElement(s) {
        var el = document.createElementNS(SVGNS, 'path');
        el.setAttribute('d', pathData(s.points));
        el.setAttribute('fill', 'none');
        el.setAttribute('stroke', s.color);
        el.setAttribute('stroke-width', s.size);
        el.setAttribute('stroke-linecap', 'round');
        el.setAttribute('stroke-linejoin', 'round');
        if (s.tool === 'highlighter') el.setAttribute('stroke-opacity', HIGHLIGHTER_OPACITY);
        var dx = shift(s);
        if (dx) el.setAttribute('transform', 'translate(' + dx.toFixed(1) + ' 0)');
        return el;
    }

    function makeLayer(name, z) {
        var svg = document.createElementNS(SVGNS, 'svg');
        svg.setAttribute('class', 'slide-drawing-layer');
        svg.setAttribute('data-layer', name);
        svg.setAttribute('width', '1');
        svg.setAttribute('height', '1');
        // Inline: the slides' stylesheets lose to it.
        svg.style.cssText = 'position: absolute; left: 0; top: 0; width: 1px; height: 1px; margin: 0; '
            + 'padding: 0; border: 0; overflow: visible; pointer-events: none; z-index: ' + z + ';';
        document.body.appendChild(svg);
        layers[name].svg = svg;
        render(name);
    }

    function render(name) {
        var layer = layers[name];
        if (!layer.svg) return;
        while (layer.svg.firstChild) layer.svg.removeChild(layer.svg.firstChild);
        layer.strokes.forEach(function(s) { layer.svg.appendChild(strokeElement(s)) });
        layer.svg.style.display = settings.hidden ? 'none' : '';
    }

    function renderAll() { render('slide'); render('live') }

    var resizeTimer = null;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(renderAll, 100);
    });

    // ----------------------------------------------------------------- saving

    var saving = false, saveAgain = false, unsaved = false;

    function saveUrl() { return '/save-drawing/' + INDEX }
    function slidePayload() { return JSON.stringify({ strokes: layers.slide.strokes }) }

    function saveSlide() {
        unsaved = true;
        if (saving) { saveAgain = true; return }
        saving = true;
        setStatus('saving', 'Saving…');
        fetch(saveUrl(), { method: 'POST', headers: { 'Content-Type': 'application/json' },
                           body: slidePayload() })
            .then(function(res) {
                return res.json().catch(function() { return {} }).then(function(body) {
                    if (!res.ok) throw new Error(body.error || ('HTTP ' + res.status));
                });
            })
            .then(function() {
                saving = false;
                if (saveAgain) { saveAgain = false; return saveSlide() }
                unsaved = false;
                setStatus('saved', 'Saved');
            })
            .catch(function(err) {
                saving = false; saveAgain = false;
                console.error('Drawing not saved:', err);
                setStatus('error', 'Not saved!');
            });
    }

    // Leaving the slide (arrow keys) while a save is on its way: one last
    // copy, which the browser sends even as the page goes. Above 64 kB it
    // refuses; the save already sent then has to make it alone.
    window.addEventListener('pagehide', function() {
        if (!unsaved || INDEX === null) return;
        try { navigator.sendBeacon(saveUrl(), slidePayload()) } catch (e) {}
    });

    function saveLive() { store('live_drawing.' + INDEX, layers.live.strokes) }

    // A change to a layer: kept for undo first, then saved.
    function change(name, newStrokes) {
        var layer = layers[name];
        layer.undo.push(layer.strokes);
        if (layer.undo.length > UNDO_DEPTH) layer.undo.shift();
        layer.redo = [];
        layer.strokes = newStrokes;
        committed(name);
    }

    function committed(name) {
        render(name);
        if (name === 'slide') saveSlide(); else saveLive();
        refreshButtons();
    }

    function undo() {
        var layer = layers[settings.layer];
        if (!layer.undo.length) return;
        layer.redo.push(layer.strokes);
        layer.strokes = layer.undo.pop();
        committed(settings.layer);
    }

    function redo() {
        var layer = layers[settings.layer];
        if (!layer.redo.length) return;
        layer.undo.push(layer.strokes);
        layer.strokes = layer.redo.pop();
        committed(settings.layer);
    }

    function clearLayer() {
        var name = settings.layer;
        if (!layers[name].strokes.length) return;
        if (name === 'slide' && !confirm('Erase the drawing kept with this slide?\n\n'
                                         + 'Ctrl+Z brings it back while the slide stays open.')) return;
        change(name, []);
    }

    // The live drawing becomes part of the slide.
    function keepLive() {
        if (!layers.live.strokes.length) return;
        change('slide', layers.slide.strokes.concat(layers.live.strokes));
        change('live', []);
        setStatus('saving', 'Moved to the slide');
    }

    // In the headless browser and the preview frames: the drawing kept with
    // the slide, and nothing else.
    if (INDEX !== null && !INTERACTIVE) {
        $(function() { makeLayer('slide', 9000) });
        return;
    }
    if (!INTERACTIVE) return;

    // ------------------------------------------------------------- the pencil

    var sheet = null;           // the transparent sheet over the page
    var current = null;         // the stroke being drawn: {stroke, el, pointerId}
    var erasing = null;         // eraser gesture: {pointerId, before}

    function makeSheet() {
        sheet = document.createElement('div');
        sheet.id = 'slide-drawing-sheet';
        sheet.style.cssText = 'position: fixed; left: 0; top: 0; right: 0; bottom: 0; margin: 0; '
            + 'z-index: 9002; display: none; touch-action: none; user-select: none; background: transparent;';
        document.body.appendChild(sheet);

        sheet.addEventListener('pointerdown', down);
        sheet.addEventListener('pointermove', move);
        sheet.addEventListener('pointerup', up);
        sheet.addEventListener('pointercancel', up);
        // Nothing under the pen: no text selection, double click to the
        // editor, image drag... The right click still opens the menu.
        ['mousedown', 'mouseup', 'click', 'dblclick'].forEach(function(type) {
            sheet.addEventListener(type, function(e) { e.stopPropagation(); e.preventDefault() });
        });
    }

    function localPoint(e) {
        var r = layers[settings.layer].svg.getBoundingClientRect();
        return [Math.round((e.clientX - r.left) * 10) / 10, Math.round((e.clientY - r.top) * 10) / 10];
    }

    function down(e) {
        if (e.button !== 0 || current || erasing) return;
        e.preventDefault();
        e.stopPropagation();
        sheet.setPointerCapture(e.pointerId);
        if (settings.hidden) { settings.hidden = false; saveSettings(); renderAll(); refreshButtons() }
        if (settings.tool === 'eraser') {
            erasing = { pointerId: e.pointerId, before: layers[settings.layer].strokes, removed: false };
            eraseAt(localPoint(e));
            return;
        }
        var p = localPoint(e);
        var stroke = {
            tool: settings.tool,
            color: settings.color[settings.tool],
            size: SIZES[settings.tool][settings.size],
            points: [p[0], p[1]],
            w: pageWidth()
        };
        var el = strokeElement(stroke);
        layers[settings.layer].svg.appendChild(el);
        current = { stroke: stroke, el: el, pointerId: e.pointerId };
    }

    // The positions the browser merged into this event, for smoother lines.
    function pointerEvents(e) {
        var list = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
        return list.length ? list : [e];
    }

    function move(e) {
        if (erasing && e.pointerId === erasing.pointerId) {
            pointerEvents(e).forEach(function(ev) {
                eraseAt(localPoint(ev));
            });
            return;
        }
        if (!current || e.pointerId !== current.pointerId) return;
        var pts = current.stroke.points;
        pointerEvents(e).forEach(function(ev) {
            var p = localPoint(ev);
            var dx = p[0] - pts[pts.length - 2], dy = p[1] - pts[pts.length - 1];
            if (dx * dx + dy * dy >= 2.25) pts.push(p[0], p[1]);    // 1.5 px apart at least
        });
        current.el.setAttribute('d', pathData(pts));
    }

    function up(e) {
        if (erasing && e.pointerId === erasing.pointerId) {
            var name = settings.layer, layer = layers[name];
            if (erasing.removed) {
                // One undo step for the whole gesture.
                layer.undo.push(erasing.before);
                if (layer.undo.length > UNDO_DEPTH) layer.undo.shift();
                layer.redo = [];
                committed(name);
            }
            erasing = null;
            return;
        }
        if (!current || e.pointerId !== current.pointerId) return;
        var stroke = current.stroke;
        current.el.remove();
        current = null;
        change(settings.layer, layers[settings.layer].strokes.concat([stroke]));
    }

    // Removes the strokes of the active layer under the eraser.
    function eraseAt(p) {
        var layer = layers[settings.layer];
        var radius = SIZES.eraser[settings.size] / 2;
        var kept = layer.strokes.filter(function(s) {
            return !touches(s, [p[0] - shift(s), p[1]], radius + s.size / 2);
        });
        if (kept.length !== layer.strokes.length) {
            layer.strokes = kept;
            erasing.removed = true;
            render(settings.layer);
        }
    }

    function touches(s, p, r) {
        var q = s.points, r2 = r * r;
        if (q.length === 2) return dist2(p, q[0], q[1], q[0], q[1]) <= r2;
        for (var i = 0; i + 3 < q.length; i += 2) {
            if (dist2(p, q[i], q[i + 1], q[i + 2], q[i + 3]) <= r2) return true;
        }
        return false;
    }

    // Squared distance from p to the segment (ax, ay)-(bx, by).
    function dist2(p, ax, ay, bx, by) {
        var dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy;
        var t = len ? Math.max(0, Math.min(1, ((p[0] - ax) * dx + (p[1] - ay) * dy) / len)) : 0;
        var x = ax + t * dx - p[0], y = ay + t * dy - p[1];
        return x * x + y * y;
    }

    function setDrawing(on) {
        settings.drawing = on && INDEX !== null;
        saveSettings();
        if (sheet) {
            sheet.style.display = settings.drawing ? 'block' : 'none';
            sheet.style.cursor = settings.tool === 'eraser' ? 'cell' : 'crosshair';
        }
        if (settings.drawing) showBar(); else scheduleHide();
        refreshButtons();
    }

    // ----------------------------------------------------------------- toolbar

    var ICONS = {
        pen: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
        highlighter: '<path d="M6 15l7-10 6 4-7 10z"/><path d="M6 15l-2 5h5l3-1"/>',
        eraser: '<path d="M4 15l8-9 7 6-7 8H8z"/><path d="M13 20h8"/><path d="M9 10l6 6"/>',
        undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>',
        redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 000 12h3"/>',
        clear: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>',
        keep: '<path d="M12 3v11"/><path d="M7 9l5 5 5-5"/><rect x="3" y="15" width="18" height="6" rx="1"/>',
        eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
        eyeOff: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><path d="M4 4l16 16"/>',
        slide: '<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M12 16v4"/><path d="M8 20h8"/>',
        live: '<circle cx="12" cy="12" r="5" fill="currentColor"/><circle cx="12" cy="12" r="9"/>'
    };

    function icon(name) {
        return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" '
             + 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</svg>';
    }

    var CSS = `
        .bar {
            all: initial;
            position: fixed;
            right: 0;
            top: 50%;
            transform: translate(110%, -50%);
            transition: transform 0.18s ease-out;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            padding: 6px 5px;
            background: rgba(255, 255, 255, 0.97);
            border: 1px solid #c8c8c8;
            border-right: 0;
            border-radius: 8px 0 0 8px;
            box-shadow: -2px 2px 10px rgba(0, 0, 0, 0.18);
            font: 12px/1.3 Arial, sans-serif;
            color: #333;
        }
        .bar.shown { transform: translate(0, -50%); }
        button {
            all: unset;
            position: relative;
            box-sizing: border-box;
            width: 34px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 6px;
            cursor: pointer;
            color: #333;
        }
        button:hover { background: #e8f0fe; }
        button.on { background: #1e88e5; color: white; }
        button:disabled { opacity: 0.3; cursor: default; background: none; }
        button.help { font: bold 19px Arial, sans-serif; }
        button.live.on { background: #e53935; }
        .swatches, .sizes {
            display: grid;
            grid-template-columns: 17px 17px;
            gap: 4px;
            padding: 3px 0;
        }
        .swatch {
            width: 17px; height: 17px;
            border-radius: 50%;
            border: 1px solid #999;
        }
        .swatch.on { outline: 2px solid #1e88e5; outline-offset: 1px; }
        .sizes { grid-template-columns: 34px; gap: 1px; }
        .size { width: 34px; height: 22px; }
        .size span { display: block; border-radius: 50%; background: #333; }
        .size.on { background: #e8f0fe; }
        .size.on span { background: #1e88e5; }
        .sep { width: 26px; height: 1px; background: #ddd; margin: 3px 0; }
        .tools { display: none; flex-direction: column; align-items: center; gap: 2px; }
        .bar.drawing .tools { display: flex; }
        .status { font-size: 10px; color: #777; min-height: 12px; text-align: center; max-width: 40px; }
        .status.error { color: #c62828; font-weight: bold; }
        /* The tooltips, to the left: immediate, unlike the title attribute's. */
        [data-tip]:hover::after {
            content: attr(data-tip);
            position: absolute;
            right: calc(100% + 10px);
            top: 50%;
            transform: translateY(-50%);
            background: #333;
            color: white;
            font: 12px/1.3 Arial, sans-serif;
            padding: 4px 8px;
            border-radius: 4px;
            white-space: nowrap;
            pointer-events: none;
        }
    `;

    function swatchesHtml() {
        return COLORS.map(function(c) {
            return '<button class="swatch" data-color="' + c + '" style="background:' + c + '" data-tip="Colour"></button>';
        }).join('');
    }

    function sizesHtml() {
        return [0, 1, 2].map(function(i) {
            var d = [4, 8, 13][i];
            return '<button class="size" data-size="' + i + '" data-tip="' + ['Thin', 'Medium', 'Thick'][i]
                 + '"><span style="width:' + d + 'px;height:' + d + 'px"></span></button>';
        }).join('');
    }

    var HTML =
        '<div class="bar">' +
        '  <button class="help" data-act="help" data-tip="Help">?</button>' +
        (INDEX === null ? '' :
        '  <div class="sep"></div>' +
        '  <button data-act="draw" data-tip="Draw on the slide (D)">' + icon('pen') + '</button>' +
        '  <div class="tools">' +
        '    <div class="sep"></div>' +
        '    <button class="live" data-layer="live" data-tip="Live: for the talk, not saved (L)">' + icon('live') + '</button>' +
        '    <button data-layer="slide" data-tip="Slide: kept in the presentation (L)">' + icon('slide') + '</button>' +
        '    <div class="sep"></div>' +
        '    <button data-tool="pen" data-tip="Pen (P)">' + icon('pen') + '</button>' +
        '    <button data-tool="highlighter" data-tip="Highlighter (H)">' + icon('highlighter') + '</button>' +
        '    <button data-tool="eraser" data-tip="Eraser: removes whole strokes (E)">' + icon('eraser') + '</button>' +
        '    <div class="sep"></div>' +
        '    <div class="swatches">' + swatchesHtml() + '</div>' +
        '    <div class="sizes">' + sizesHtml() + '</div>' +
        '    <div class="sep"></div>' +
        '    <button data-act="undo" data-tip="Undo (Ctrl+Z)">' + icon('undo') + '</button>' +
        '    <button data-act="redo" data-tip="Redo (Ctrl+Y)">' + icon('redo') + '</button>' +
        '    <button data-act="keep" data-tip="Move the live drawing into the slide">' + icon('keep') + '</button>' +
        '    <button data-act="clear" data-tip="Erase this layer">' + icon('clear') + '</button>' +
        '  </div>' +
        '  <div class="sep"></div>' +
        '  <button data-act="eye" data-tip="Hide the drawings">' + icon('eye') + '</button>' +
        '  <div class="status"></div>') +
        '</div>';

    var host = null, shadow = null, bar = null;

    function makeBar() {
        host = document.createElement('div');
        host.id = 'slide-toolbar';
        host.style.cssText = 'position: fixed; z-index: 2147483000; margin: 0; padding: 0; width: 0; height: 0; right: 0; top: 0;';
        shadow = host.attachShadow({ mode: 'open' });
        shadow.innerHTML = '<style>' + CSS + '</style>' + HTML;
        document.body.appendChild(host);
        bar = shadow.querySelector('.bar');

        bar.addEventListener('click', function(e) {
            var b = e.target.closest('button');
            if (!b || b.disabled) return;
            if (b.dataset.act) action(b.dataset.act);
            else if (b.dataset.layer) { settings.layer = b.dataset.layer; saveSettings(); refreshButtons() }
            else if (b.dataset.tool) setTool(b.dataset.tool);
            else if (b.dataset.color) {
                if (settings.tool === 'eraser') setTool('pen');
                settings.color[settings.tool] = b.dataset.color; saveSettings(); refreshButtons();
            }
            else if (b.dataset.size) { settings.size = Number(b.dataset.size); saveSettings(); refreshButtons() }
        });
        // The page's own handlers stay out of the toolbar: the document click
        // that closes the help would close it as soon as opened, the right
        // click menu, the dragging...
        ['click', 'mousedown', 'mouseup', 'dblclick', 'pointerdown', 'contextmenu', 'wheel'].forEach(function(type) {
            host.addEventListener(type, function(e) {
                e.stopPropagation();
                if (type === 'contextmenu') e.preventDefault();
            });
        });
        bar.addEventListener('mouseenter', function() { overBar = true; showBar() });
        bar.addEventListener('mouseleave', function() { overBar = false; scheduleHide() });
    }

    function action(act) {
        if (act === 'help') {
            if (window.toggleShortcutsHelp) window.toggleShortcutsHelp();
        } else if (act === 'draw') setDrawing(!settings.drawing);
        else if (act === 'undo') undo();
        else if (act === 'redo') redo();
        else if (act === 'clear') clearLayer();
        else if (act === 'keep') keepLive();
        else if (act === 'eye') {
            settings.hidden = !settings.hidden; saveSettings(); renderAll(); refreshButtons();
        }
    }

    function setTool(tool) {
        settings.tool = tool; saveSettings();
        if (sheet) sheet.style.cursor = tool === 'eraser' ? 'cell' : 'crosshair';
        refreshButtons();
    }

    function refreshButtons() {
        if (!bar || INDEX === null) return;
        function each(sel, fn) { shadow.querySelectorAll(sel).forEach(fn) }
        bar.classList.toggle('drawing', settings.drawing);
        each('[data-act=draw]', function(b) { b.classList.toggle('on', settings.drawing) });
        each('[data-layer]', function(b) { b.classList.toggle('on', b.dataset.layer === settings.layer) });
        each('[data-tool]', function(b) { b.classList.toggle('on', b.dataset.tool === settings.tool) });
        var colour = settings.color[settings.tool];
        each('[data-color]', function(b) {
            b.classList.toggle('on', settings.tool !== 'eraser' && b.dataset.color === colour);
        });
        each('[data-size]', function(b) { b.classList.toggle('on', Number(b.dataset.size) === settings.size) });
        var layer = layers[settings.layer];
        shadow.querySelector('[data-act=undo]').disabled = !layer.undo.length;
        shadow.querySelector('[data-act=redo]').disabled = !layer.redo.length;
        shadow.querySelector('[data-act=clear]').disabled = !layer.strokes.length;
        shadow.querySelector('[data-act=keep]').disabled = !layers.live.strokes.length;
        var eye = shadow.querySelector('[data-act=eye]');
        eye.innerHTML = icon(settings.hidden ? 'eyeOff' : 'eye');
        eye.dataset.tip = settings.hidden ? 'Show the drawings' : 'Hide the drawings';
        eye.classList.toggle('on', settings.hidden);
    }

    var statusTimer = null;
    function setStatus(kind, text) {
        if (!shadow) return;
        var el = shadow.querySelector('.status');
        if (!el) return;
        clearTimeout(statusTimer);
        el.textContent = text;
        el.className = 'status ' + kind;
        if (kind === 'error') { showBar(); return }       // stays until the next save
        if (kind === 'saved') statusTimer = setTimeout(function() { el.textContent = '' }, 2000);
    }

    // ------------------------------------------- showing it at the right edge

    var EDGE = 24;                  // px from the right edge that bring it out
    var overBar = false, hideTimer = null;

    function showBar() {
        clearTimeout(hideTimer);
        if (bar) bar.classList.add('shown');
    }

    function scheduleHide() {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(function() {
            if (!overBar && !settings.drawing && bar) bar.classList.remove('shown');
        }, 700);
    }

    // Capture phase: seen even when a handler below stops the event.
    window.addEventListener('mousemove', function(e) {
        var right = document.documentElement.clientWidth;
        if (e.clientX >= right - EDGE && e.clientX <= right) showBar();
        else if (!overBar) scheduleHide();
    }, true);
    document.documentElement.addEventListener('mouseleave', function() { if (!overBar) scheduleHide() });

    // --------------------------------------------------------------- keyboard

    function editable(el) {
        return el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)
                      || (el.closest && el.closest('.CodeMirror')));
    }

    window.addEventListener('keydown', function(e) {
        if (INDEX === null || e.repeat || editable(e.target)) return;
        var k = e.key.toLowerCase();
        var plain = !e.ctrlKey && !e.altKey && !e.metaKey;
        var handled = true;
        if (plain && !e.shiftKey && k === 'd') setDrawing(!settings.drawing);
        else if (k === 'escape' && settings.drawing) { setDrawing(false); handled = false }
        else if (!settings.drawing) handled = false;
        else if ((e.ctrlKey || e.metaKey) && !e.altKey && k === 'z') { if (e.shiftKey) redo(); else undo() }
        else if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && k === 'y') redo();
        else if (plain && !e.shiftKey && k === 'p') setTool('pen');
        else if (plain && !e.shiftKey && k === 'h') setTool('highlighter');
        else if (plain && !e.shiftKey && k === 'e') setTool('eraser');
        else if (plain && !e.shiftKey && k === 'l') {
            settings.layer = settings.layer === 'live' ? 'slide' : 'live'; saveSettings(); refreshButtons();
        }
        else handled = false;
        if (handled) { e.preventDefault(); e.stopPropagation() }
    }, true);

    // ------------------------------------------------------------------ start

    $(function() {
        if (INDEX !== null) {
            makeLayer('slide', 9000);
            makeLayer('live', 9001);
            makeSheet();
        }
        makeBar();
        refreshButtons();
        if (settings.drawing) setDrawing(true);
    });

    // For the help panel and others.
    window.slideDrawing = {
        toggle: function() { setDrawing(!settings.drawing) },
        stop: function() { setDrawing(false) }
    };

})();
