/*
Stop the server once the last reader's tab is gone.

Closing the browser used to leave the server running, holding port 3067, which
the next start then collided with. The server now counts the tabs connected
through socket.io and stops idle_shutdown_sec seconds after the last one left
(config.yaml, default 120 s; 0 keeps the server running until stopped by hand).

The delay matters: each arrow key reloads the page, which drops the socket for
a moment. Two guards besides: the countdown is checked again when it fires, so
a reconnection in between cancels it; and nothing is armed before a first
reader has connected, so a server whose browser failed to open stays up.

The hidden tabs that make the thumbnails (lib/thumbnails.js) send the
x-diapo-thumbnail header and are not readers: they neither count nor arm. A
header set per tab, not a cookie: the cookie jar is shared by all the tabs of
the thumbnail browser, and setting it from one tab briefly deleted it for the
others, which then connected as readers.
*/

var THUMBNAIL_HEADER = 'x-diapo-thumbnail';

function isThumbnailTab(socket) {
    return socket.handshake.headers[THUMBNAIL_HEADER] === '1';
}

function setupIdleShutdown(io, delaySec) {
    var delay = Number(delaySec);
    var readers = 0;
    var everHadReader = false;
    var timer = null;

    function cancel() {
        if (timer) { clearTimeout(timer); timer = null; }
    }

    function arm() {
        if (!everHadReader || !delay || delay <= 0) return;
        cancel();
        timer = setTimeout(function() {
            timer = null;
            if (readers > 0) return;                 // someone came back meanwhile
            console.log('No reader left for ' + delay + ' s: stopping the server.');
            process.exit(0);
        }, delay * 1000);
    }

    io.on('connection', function(socket) {
        if (isThumbnailTab(socket)) return;
        readers += 1;
        everHadReader = true;
        cancel();
        socket.on('disconnect', function() {
            readers -= 1;
            if (readers === 0) arm();
        });
    });
}

module.exports = {
    setupIdleShutdown: setupIdleShutdown,
    THUMBNAIL_HEADER: THUMBNAIL_HEADER
};
