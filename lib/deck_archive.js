/*
The presentation as one file, to keep it, or to open it in node_diapo on
another machine: a .zip from the right-click menu (views/app_menu/app_menu.js).

    GET  /export-deck    downloads <title>.diapo.zip
    POST /import-deck    the body is such a file: it replaces the presentation
    POST /new-deck       a new presentation, one title slide (Ctrl+Alt+N)

Inside the file:

    manifest.json        format, version, title, number of slides, date
    slides/d0.html ...   the slides' markdown (views/diapos/)
    drawings/d0.json ... the drawings kept with the slides (views/drawings/)
    config_deck.yaml     title, background, PDF title (views/config_deck.yaml)
    slide_config.yaml    the style (views/slide_config/slide_config.yaml)
    media/imgs/...       the images, videos and background the slides use,
    media/videos/...     and only those (public/imgs, public/videos,
    media/bckgrds/...    public/bckgrds)

Opening a file checks all of it first, and changes nothing if any part is
wrong. A new presentation keeps the background and the style, and starts
with a title slide. Either way, the presentation in place is first saved in
backups/ (a file like the
exported ones, which can be opened again the same way), its slides and
drawings removed, and the new ones written. The media files are added to
public/, replacing those of the same name; the others stay.
*/

var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var zip = require('./zip');
var drawings = require('./drawings');
var pdfTitle = require('./pdf_title');

var FORMAT = 'node_diapo presentation';
var VERSION = 1;

var SLIDES_DIR = 'views/diapos';
var DRAWINGS_DIR = 'views/drawings';
var DECK_CONFIG = 'views/config_deck.yaml';
var STYLE_CONFIG = 'views/slide_config/slide_config.yaml';
var MEDIA_DIRS = ['imgs', 'videos', 'bckgrds'];     // under public/
var BACKUP_DIR = 'backups';

// "imgs/name.jpg" or "videos/name.mp4" in a slide: a markdown link, an
// <img src>, whatever comes before.
var MEDIA_REF = /\b(imgs|videos)\/([^\s)"'<>\]]+)/g;

function slideIndexes() {
    return fs.readdirSync(SLIDES_DIR)
        .map(function(f) { var m = /^d(\d+)\.html$/.exec(f); return m ? Number(m[1]) : null })
        .filter(function(n) { return n !== null })
        .sort(function(a, b) { return a - b });
}

// A plain file name: no folder, nothing hidden.
function safeName(name) {
    return name && !/[\/\\]/.test(name) && name[0] !== '.' && name !== '..' && name.length < 256;
}

function readYaml(file) {
    return fs.existsSync(file) ? (yaml.load(fs.readFileSync(file, 'utf8')) || {}) : {};
}

function deckTitle(deckConfig) {
    return deckConfig.pdf_title || deckConfig.deck_title || 'presentation';
}

// ------------------------------------------------------------------- export

// The presentation in place, as zip entries; missing: media named by the
// slides but not found.
function collect() {
    var entries = [], missing = [], media = {};
    var indexes = slideIndexes();
    var deckConfig = readYaml(DECK_CONFIG);

    indexes.forEach(function(i) {
        var text = fs.readFileSync(path.join(SLIDES_DIR, 'd' + i + '.html'), 'utf8');
        entries.push({ name: 'slides/d' + i + '.html', data: text });
        var m;
        MEDIA_REF.lastIndex = 0;
        while ((m = MEDIA_REF.exec(text))) {
            var name = m[2];
            try { name = decodeURIComponent(name) } catch (e) {}
            media[m[1] + '/' + name] = true;
        }
        var drawing = path.join(DRAWINGS_DIR, 'd' + i + '.json');
        if (fs.existsSync(drawing)) entries.push({ name: 'drawings/d' + i + '.json', data: fs.readFileSync(drawing) });
    });
    if (deckConfig.background) media['bckgrds/' + deckConfig.background] = true;

    Object.keys(media).sort().forEach(function(ref) {
        var parts = ref.split('/'), file = path.join('public', parts[0], parts[1]);
        if (safeName(parts[1]) && fs.existsSync(file) && fs.statSync(file).isFile()) {
            entries.push({ name: 'media/' + ref, data: fs.readFileSync(file) });
        } else {
            missing.push(ref);
        }
    });

    if (fs.existsSync(DECK_CONFIG)) entries.push({ name: 'config_deck.yaml', data: fs.readFileSync(DECK_CONFIG) });
    if (fs.existsSync(STYLE_CONFIG)) entries.push({ name: 'slide_config.yaml', data: fs.readFileSync(STYLE_CONFIG) });

    var manifest = {
        format: FORMAT,
        version: VERSION,
        title: deckTitle(deckConfig),
        slides: indexes.length,
        exported: new Date().toISOString()
    };
    if (missing.length) manifest.missing_media = missing;
    entries.unshift({ name: 'manifest.json', data: JSON.stringify(manifest, null, 2) });
    return { entries: entries, manifest: manifest };
}

function fileName(title) {
    // é -> e first: the sanitizing drops the letters it does not know.
    var plain = String(title).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return (pdfTitle.sanitizeTitleForFilename(plain) || 'presentation') + '.diapo.zip';
}

function exportDeck() {
    var deck = collect();
    if (deck.manifest.missing_media) {
        console.warn('Export: media named by the slides but not found:', deck.manifest.missing_media.join(', '));
    }
    return { name: fileName(deck.manifest.title), data: zip.createZip(deck.entries), manifest: deck.manifest };
}

// ------------------------------------------------------------------- import

// Everything checked, nothing written: the parts of the new presentation.
function parse(buffer) {
    var all = zip.readZip(buffer);

    // A file zipped again from its unzipped folder has everything one level
    // down: "about_superconductors/manifest.json".
    var manifestEntry = all.find(function(e) { return /(^|\/)manifest\.json$/.test(e.name) && e.name.split('/').length <= 2 });
    if (!manifestEntry) throw new Error('this is not a node_diapo presentation (no manifest.json)');
    var prefix = manifestEntry.name.slice(0, -'manifest.json'.length);

    var manifest;
    try { manifest = JSON.parse(manifestEntry.data.toString('utf8')) }
    catch (e) { throw new Error('manifest.json is not valid JSON') }
    if (manifest.format !== FORMAT) throw new Error('this is not a node_diapo presentation');
    if (!(manifest.version <= VERSION)) {
        throw new Error('this presentation comes from a newer node_diapo (format ' + manifest.version + '): update node_diapo first');
    }

    var deck = { manifest: manifest, slides: {}, drawings: {}, media: [], deckConfig: null, styleConfig: null };
    all.forEach(function(e) {
        if (e.name.slice(0, prefix.length) !== prefix) return;
        var name = e.name.slice(prefix.length), m;
        if (name === 'manifest.json') return;
        if ((m = /^slides\/d(\d+)\.html$/.exec(name))) {
            deck.slides[Number(m[1])] = e.data.toString('utf8');
        } else if ((m = /^drawings\/d(\d+)\.json$/.exec(name))) {
            try { deck.drawings[Number(m[1])] = drawings.check(JSON.parse(e.data.toString('utf8'))) }
            catch (err) { throw new Error(name + ': ' + err.message) }
        } else if ((m = /^media\/([^\/]+)\/([^\/]+)$/.exec(name))) {
            if (MEDIA_DIRS.indexOf(m[1]) < 0 || !safeName(m[2])) throw new Error(name + ': unexpected file name');
            deck.media.push({ dir: m[1], name: m[2], data: e.data });
        } else if (name === 'config_deck.yaml' || name === 'slide_config.yaml') {
            var text = e.data.toString('utf8');
            try { yaml.load(text) } catch (err) { throw new Error(name + ': ' + err.message) }
            if (name === 'config_deck.yaml') deck.deckConfig = text; else deck.styleConfig = text;
        }
        // Anything else (__MACOSX/, .DS_Store...) is left out.
    });

    var count = Object.keys(deck.slides).length;
    if (!count) throw new Error('the file has no slide');
    for (var i = 0; i < count; i++) {
        if (!(i in deck.slides)) throw new Error('slide d' + i + '.html is missing: the slides must be numbered from 0 without gap');
    }
    Object.keys(deck.drawings).forEach(function(i) {
        if (!(i in deck.slides)) throw new Error('drawings/d' + i + '.json belongs to no slide');
    });
    deck.count = count;
    return deck;
}

// Local time, as the clock of the machine shows it: 20261111_113648.
// A new presentation: one title slide; the background and the style stay.
function blankDeck() {
    var title = 'Nouvelle présentation';
    var date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    var deckConfig = readYaml(DECK_CONFIG);
    deckConfig.deck_title = title;
    deckConfig.pdf_title = title;
    return {
        manifest: { title: title },
        slides: { 0: '# ' + title + ' !pdf_title\n\n!deck_title ' + title + '\n\n!author Auteur\n\n!date ' + date + '\n' },
        drawings: {},
        media: [],
        deckConfig: yaml.dump(deckConfig),
        styleConfig: null,
        count: 1
    };
}

function stamp() {
    var d = new Date();
    function two(n) { return (n < 10 ? '0' : '') + n }
    return d.getFullYear() + two(d.getMonth() + 1) + two(d.getDate()) + '_'
         + two(d.getHours()) + two(d.getMinutes()) + two(d.getSeconds());
}

// The presentation in place, saved before it is replaced. Returns the path.
function backup() {
    var deck = collect();
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    var file = path.join(BACKUP_DIR, stamp() + '_' + fileName(deck.manifest.title));
    fs.writeFileSync(file, zip.createZip(deck.entries));
    return file;
}

function install(deck) {
    slideIndexes().forEach(function(i) { fs.unlinkSync(path.join(SLIDES_DIR, 'd' + i + '.html')) });
    if (fs.existsSync(DRAWINGS_DIR)) {
        fs.readdirSync(DRAWINGS_DIR).forEach(function(f) {
            if (/^d\d+\.json$/.test(f)) fs.unlinkSync(path.join(DRAWINGS_DIR, f));
        });
    }
    // The old thumbnails would show for a moment in the mosaic.
    if (fs.existsSync('views/thumbnails')) {
        fs.readdirSync('views/thumbnails').forEach(function(f) {
            if (/^thumb_/.test(f)) fs.unlinkSync(path.join('views/thumbnails', f));
        });
    }

    deck.media.forEach(function(m) {
        var dir = path.join('public', m.dir);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, m.name), m.data);
    });
    Object.keys(deck.drawings).forEach(function(i) {
        if (!deck.drawings[i].strokes.length) return;
        fs.mkdirSync(DRAWINGS_DIR, { recursive: true });
        fs.writeFileSync(path.join(DRAWINGS_DIR, 'd' + i + '.json'), JSON.stringify(deck.drawings[i]));
    });
    if (deck.deckConfig !== null) fs.writeFileSync(DECK_CONFIG, deck.deckConfig);
    if (deck.styleConfig !== null) fs.writeFileSync(STYLE_CONFIG, deck.styleConfig);
    // The slides last: the pages read them, and they must find the rest there.
    for (var i = 0; i < deck.count; i++) {
        fs.writeFileSync(path.join(SLIDES_DIR, 'd' + i + '.html'), deck.slides[i]);
    }
}

// --------------------------------------------------------------------- routes

// onLoaded(count): once a presentation has been opened (routes, thumbnails,
// pages to send back to the first slide).
function setup(app, express, onLoaded) {
    var busy = false;

    app.get('/export-deck', function(req, res) {
        try {
            var out = exportDeck();
            console.log('📦 Presentation exported: ' + out.name + ' (' + out.manifest.slides + ' slides, '
                        + Math.round(out.data.length / 1024) + ' kB)');
            res.attachment(out.name);
            res.type('application/zip');
            res.send(out.data);
        } catch (err) {
            console.error('Error exporting the presentation:', err);
            res.status(500).json({ error: err.message });
        }
    });

    // The presentation in place saved, then replaced by deck.
    function replace(deck, res) {
        var saved;
        try { saved = backup() }
        catch (err) {
            console.error('Backup before opening failed:', err);
            return res.status(500).json({ error: 'the current presentation could not be saved first, nothing was changed: ' + err.message });
        }
        console.log('💾 Current presentation saved in ' + saved);

        try { install(deck) }
        catch (err) {
            console.error('Error opening the presentation:', err);
            return res.status(500).json({ error: 'opening failed halfway (' + err.message + '); the previous presentation is in ' + saved });
        }
        console.log('📂 Presentation opened: ' + (deck.manifest.title || '?') + ' (' + deck.count + ' slides)');
        if (onLoaded) onLoaded(deck.count);
        res.json({ success: true, slides: deck.count, title: deck.manifest.title, backup: saved });
    }

    app.post('/import-deck', express.raw({ type: '*/*', limit: '2gb' }), function(req, res) {
        if (busy) return res.status(409).json({ error: 'a presentation is already being opened' });
        if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ error: 'no file received' });
        busy = true;
        try {
            var deck;
            try { deck = parse(req.body) }
            catch (err) { return res.status(400).json({ error: err.message }) }
            replace(deck, res);
        } finally {
            busy = false;
        }
    });

    app.post('/new-deck', function(req, res) {
        if (busy) return res.status(409).json({ error: 'a presentation is already being opened' });
        busy = true;
        try { replace(blankDeck(), res) }
        finally { busy = false }
    });
}

module.exports = { setup: setup, exportDeck: exportDeck, parse: parse };
