/*
The server's output, for the debug panel of the page (lib/debug_panel.js,
Ctrl+Shift+D).

The launchers start the server with no window: what it writes is kept here and
sent to the panels. capture() is called first thing in html_app.js and wraps
process.stdout and stderr themselves rather than console.*, so that the panel
shows what a terminal would: the first lines of the startup, and what comes
from elsewhere than console.log. Only a crash of Node itself escapes it; that
one is in logs/node_diapo.log.

The panels use a namespace of their own: they do not count as readers for the
idle shutdown. It accepts this computer only, as the server listens on every
interface and its output holds file paths.
*/

var HISTORY_MAX = 2000;
var history = [];
var channel = null;

function record(stream, text) {
    var entry = { stream: stream, text: text };
    history.push(entry);
    if (history.length > HISTORY_MAX) history.shift();
    if (channel) channel.emit('line', entry);
}

function wrap(stream, name) {
    var pending = '';
    var write = stream.write;
    stream.write = function(chunk) {
        try {
            var lines = (pending + chunk.toString()).split('\n');
            pending = lines.pop();                  // an unfinished line waits for its end
            lines.forEach(function(line) { record(name, line) });
        } catch (e) { /* the panel must never break the server's output */ }
        return write.apply(stream, arguments);
    };
}

function capture() {
    wrap(process.stdout, 'out');
    wrap(process.stderr, 'err');
}

function isLocal(address) {
    return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
}

function attach(io) {
    channel = io.of('/debug');
    channel.use(function(socket, next) {
        next(isLocal(socket.handshake.address) ? undefined : new Error('this computer only'));
    });
    channel.on('connection', function(socket) {
        socket.emit('history', history);
    });
}

module.exports = {
    capture: capture,
    attach: attach
};
