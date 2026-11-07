/*
The general settings of config.yaml, for the configuration panel
(views/slide_config/slide_config_editor.js, Ctrl+Shift+C).

    GET  /app-config        the editable settings, plus the read-only ones
    POST /save-app-config   JSON of the editable settings, merged into config.yaml

Only the settings listed in EDITABLE can be written, each checked; the rest of
config.yaml (favicon, viewport size, set elsewhere) is kept as it is.
*/

var fs = require('fs');
var yaml = require('js-yaml');

var CONFIG_FILE = 'config.yaml';
var DEFAULT_IDLE_SHUTDOWN_SEC = 120;

function integer(min, max) {
    return function(v) {
        var n = Number(v);
        if (!Number.isInteger(n) || n < min || n > max) {
            throw new Error('an integer between ' + min + ' and ' + max + ' is expected')
        }
        return n
    }
}

// A CSS colour: a name ("blue") or a hex code ("#2196f3").
function colour(v) {
    if (typeof v !== 'string' || !/^(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)$/.test(v)) {
        throw new Error('a colour name or a #hex code is expected')
    }
    return v
}

var EDITABLE = {
    color_bar: colour,
    nb_horiz_mosaic: integer(1, 20),
    idle_shutdown_sec: integer(0, 86400)
};

function read() {
    return yaml.load(fs.readFileSync(CONFIG_FILE, 'utf8')) || {}
}

function idleShutdownSec() {
    var v = read().idle_shutdown_sec
    return v === undefined ? DEFAULT_IDLE_SHUTDOWN_SEC : v
}

function setup(app, express, onSaved) {
    app.get('/app-config', function(req, res) {
        var config = read()
        res.json({
            color_bar: config.color_bar || 'blue',
            nb_horiz_mosaic: config.nb_horiz_mosaic || 5,
            idle_shutdown_sec: config.idle_shutdown_sec === undefined
                ? DEFAULT_IDLE_SHUTDOWN_SEC : config.idle_shutdown_sec,
            viewport_width: config.viewport_width,
            viewport_height: config.viewport_height
        })
    })

    app.post('/save-app-config', express.json(), function(req, res) {
        var config = read()
        try {
            Object.keys(req.body || {}).forEach(function(name) {
                if (!EDITABLE[name]) throw new Error('unknown setting ' + name)
                try { config[name] = EDITABLE[name](req.body[name]) }
                catch (err) { throw new Error(name + ': ' + err.message) }
            })
        } catch (err) {
            return res.status(400).json({ error: err.message })
        }
        fs.writeFile(CONFIG_FILE, yaml.dump(config), 'utf8', function(err) {
            if (err) {
                console.error('Error saving config.yaml:', err)
                return res.status(500).json({ error: 'Failed to save config.yaml' })
            }
            console.log('✅ General configuration saved')
            if (onSaved) onSaved()
            res.json({ success: true })
        })
    })
}

module.exports = {
    setup: setup,
    idleShutdownSec: idleShutdownSec
};
