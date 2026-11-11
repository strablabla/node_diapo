/*
The drawings kept with the slides (the "slide" layer of lib/slide_drawing.js).

Each slide has at most one file, views/drawings/d{n}.json, named after the
slide's index like views/diapos/d{n}.html. When the slides are renumbered
(new slide, duplicate, delete: lib/slide_operations.js), the drawings follow
through moveDrawing, copyDrawing and deleteDrawing.

    POST /save-drawing/:index   JSON {strokes: [...]}, written to d{index}.json;
                                no stroke removes the file

The file is read when the slide is served (lib/routing.js) and written into
the page, so the drawing is there from the first paint: in the thumbnails and
the PDF too, which are pictures of the pages.

A stroke: {tool: 'pen' | 'highlighter', color: '#rrggbb', size: px,
           points: [x0, y0, x1, y1, ...] in page pixels,
           w: width of the window it was drawn in (see lib/slide_drawing.js)}.
*/

var fs = require('fs');
var path = require('path');

var DIR = 'views/drawings';
var TOOLS = ['pen', 'highlighter'];
var MAX_STROKES = 5000;
var MAX_POINTS = 20000;          // coordinates in one stroke, x and y counted apart

function file(index) {
    return path.join(DIR, 'd' + index + '.json');
}

function checkStroke(s, n) {
    var where = 'stroke ' + n + ': ';
    if (!s || typeof s !== 'object') throw new Error(where + 'not an object');
    if (TOOLS.indexOf(s.tool) < 0) throw new Error(where + 'unknown tool');
    if (typeof s.color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(s.color)) {
        throw new Error(where + 'a #rrggbb colour is expected');
    }
    if (typeof s.size !== 'number' || !(s.size > 0 && s.size <= 100)) {
        throw new Error(where + 'a size between 0 and 100 is expected');
    }
    if (!Array.isArray(s.points) || s.points.length < 2 || s.points.length % 2
        || s.points.length > MAX_POINTS) {
        throw new Error(where + 'points must be pairs of coordinates');
    }
    var points = s.points.map(function(v) {
        if (typeof v !== 'number' || !isFinite(v)) throw new Error(where + 'a coordinate is not a number');
        return Math.round(v * 10) / 10;
    });
    var stroke = { tool: s.tool, color: s.color.toLowerCase(), size: s.size, points: points };
    if (s.w !== undefined) {
        if (typeof s.w !== 'number' || !(s.w >= 100 && s.w <= 20000)) {
            throw new Error(where + 'a window width between 100 and 20000 is expected');
        }
        stroke.w = Math.round(s.w);
    }
    return stroke;
}

function check(body) {
    if (!body || !Array.isArray(body.strokes)) throw new Error('{strokes: [...]} is expected');
    if (body.strokes.length > MAX_STROKES) throw new Error('too many strokes');
    return { strokes: body.strokes.map(checkStroke) };
}

// The drawing of a slide, as text ready to be written in a <script>, or 'null'.
function pageScript(index) {
    try {
        var json = JSON.stringify(JSON.parse(fs.readFileSync(file(index), 'utf8')));
        return json.replace(/</g, '\\u003c');      // no "</script>" can end the block early
    } catch (err) {
        if (err.code !== 'ENOENT') console.error('Drawing of slide ' + index + ' unreadable:', err.message);
        return 'null';
    }
}

function write(index, drawing) {
    if (!drawing.strokes.length) {
        deleteDrawing(index);
        return;
    }
    fs.mkdirSync(DIR, { recursive: true });
    var tmp = file(index) + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(drawing));
    fs.renameSync(tmp, file(index));      // never a half-written file
}

// Renumbering, synchronous: the callers go through the slides in an order
// that relies on each move being done before the next.
function moveDrawing(from, to) {
    if (fs.existsSync(file(from))) fs.renameSync(file(from), file(to));
    else if (fs.existsSync(file(to))) fs.unlinkSync(file(to));
}

function copyDrawing(from, to) {
    if (fs.existsSync(file(from))) fs.copyFileSync(file(from), file(to));
    else if (fs.existsSync(file(to))) fs.unlinkSync(file(to));
}

function deleteDrawing(index) {
    if (fs.existsSync(file(index))) fs.unlinkSync(file(index));
}

// onSaved(index): called once the file is written (thumbnail update).
function setup(app, express, onSaved) {
    app.post('/save-drawing/:index', express.json({ limit: '20mb' }), function(req, res) {
        var index = Number(req.params.index);
        if (!Number.isInteger(index) || index < 0
            || !fs.existsSync('views/diapos/d' + index + '.html')) {
            return res.status(404).json({ error: 'no slide ' + req.params.index });
        }
        var drawing;
        // A last save sent while the page closes (navigator.sendBeacon) comes
        // as text/plain, already read as a string by html_app.js.
        try { drawing = check(typeof req.body === 'string' ? JSON.parse(req.body) : req.body) }
        catch (err) { return res.status(400).json({ error: err.message }) }
        try { write(index, drawing) }
        catch (err) {
            console.error('Error saving the drawing of slide ' + index + ':', err);
            return res.status(500).json({ error: 'the drawing could not be saved' });
        }
        console.log('✏️  Drawing of slide ' + index + ' saved (' + drawing.strokes.length + ' strokes)');
        if (onSaved) onSaved(index);
        res.json({ success: true });
    });
}

module.exports = {
    setup: setup,
    pageScript: pageScript,
    moveDrawing: moveDrawing,
    copyDrawing: copyDrawing,
    deleteDrawing: deleteDrawing,
    check: check            // also for the presentation files (lib/deck_archive.js)
};
