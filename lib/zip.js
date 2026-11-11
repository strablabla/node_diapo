/*
Writing and reading .zip files, with nothing but Node's zlib: no dependency
to install. Enough for the presentation files of lib/deck_archive.js, and for
the same files after they went through another zip tool (data descriptors,
directories, no compression).

    createZip([{name, data}])  -> Buffer
    readZip(buffer[, wanted])  -> [{name, data}]   (directories left out;
                                  wanted(name): only those, the others not inflated)

Not handled: ZIP64 (archives over 4 GB or 65535 files), encryption, any
compression but deflate.
*/

var zlib = require('zlib');

var CRC_TABLE = (function() {
    var table = new Int32Array(256);
    for (var n = 0; n < 256; n++) {
        var c = n;
        for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c;
    }
    return table;
})();

function crc32(buf) {
    var c = -1;
    for (var i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
}

// Already compressed: stored as they are, deflating them again gains nothing.
var STORED = /\.(jpe?g|png|gif|webp|mp4|webm|ogg|ogv|zip|pdf|woff2?)$/i;

function dosDateTime(d) {
    return {
        time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
        date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
    };
}

function createZip(entries) {
    var parts = [], central = [], offset = 0;
    var when = dosDateTime(new Date());

    entries.forEach(function(entry) {
        var name = Buffer.from(entry.name, 'utf8');
        var data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data, 'utf8');
        var method = STORED.test(entry.name) ? 0 : 8;
        var body = method ? zlib.deflateRawSync(data, { level: 9 }) : data;
        if (method && body.length >= data.length) { method = 0; body = data }
        var crc = crc32(data);
        if (offset + body.length > 0xffffffff) throw new Error('presentation too large for a zip file (4 GB)');

        var local = Buffer.alloc(30);
        local.writeUInt32LE(0x04034b50, 0);
        local.writeUInt16LE(20, 4);              // version needed
        local.writeUInt16LE(0x0800, 6);          // flags: names in UTF-8
        local.writeUInt16LE(method, 8);
        local.writeUInt16LE(when.time, 10);
        local.writeUInt16LE(when.date, 12);
        local.writeUInt32LE(crc, 14);
        local.writeUInt32LE(body.length, 18);
        local.writeUInt32LE(data.length, 22);
        local.writeUInt16LE(name.length, 26);
        local.writeUInt16LE(0, 28);
        parts.push(local, name, body);

        var dir = Buffer.alloc(46);
        dir.writeUInt32LE(0x02014b50, 0);
        dir.writeUInt16LE(20, 4);                // made by
        dir.writeUInt16LE(20, 6);                // version needed
        dir.writeUInt16LE(0x0800, 8);
        dir.writeUInt16LE(method, 10);
        dir.writeUInt16LE(when.time, 12);
        dir.writeUInt16LE(when.date, 14);
        dir.writeUInt32LE(crc, 16);
        dir.writeUInt32LE(body.length, 20);
        dir.writeUInt32LE(data.length, 24);
        dir.writeUInt16LE(name.length, 28);
        dir.writeUInt32LE(offset, 42);           // the rest (extra, comment, attributes): 0
        central.push(dir, name);

        offset += local.length + name.length + body.length;
    });

    var centralSize = central.reduce(function(n, b) { return n + b.length }, 0);
    var end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(entries.length, 8);
    end.writeUInt16LE(entries.length, 10);
    end.writeUInt32LE(centralSize, 12);
    end.writeUInt32LE(offset, 16);
    return Buffer.concat(parts.concat(central, [end]));
}

function readZip(buf, wanted) {
    // The end record, searched from the end (a comment may follow it).
    var end = -1;
    for (var i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 0xffff); i--) {
        if (buf.readUInt32LE(i) === 0x06054b50) { end = i; break }
    }
    if (end < 0) throw new Error('not a zip file');
    var count = buf.readUInt16LE(end + 10);
    var pos = buf.readUInt32LE(end + 16);
    if (count === 0xffff || pos === 0xffffffff) throw new Error('ZIP64 files are not supported');

    var entries = [];
    for (var n = 0; n < count; n++) {
        if (pos + 46 > buf.length || buf.readUInt32LE(pos) !== 0x02014b50) throw new Error('damaged zip file');
        var flags = buf.readUInt16LE(pos + 8);
        var method = buf.readUInt16LE(pos + 10);
        var crc = buf.readUInt32LE(pos + 16);
        var size = buf.readUInt32LE(pos + 20);
        var nameLen = buf.readUInt16LE(pos + 28);
        var extraLen = buf.readUInt16LE(pos + 30);
        var commentLen = buf.readUInt16LE(pos + 32);
        var localAt = buf.readUInt32LE(pos + 42);
        var name = buf.toString(flags & 0x0800 ? 'utf8' : 'latin1', pos + 46, pos + 46 + nameLen);
        pos += 46 + nameLen + extraLen + commentLen;
        if (flags & 1) throw new Error(name + ': encrypted files are not supported');
        if (name.endsWith('/') || (wanted && !wanted(name))) continue;

        // The sizes are taken from the central directory: the local header
        // may leave them to a data descriptor written after the data.
        if (localAt + 30 > buf.length || buf.readUInt32LE(localAt) !== 0x04034b50) throw new Error('damaged zip file');
        var start = localAt + 30 + buf.readUInt16LE(localAt + 26) + buf.readUInt16LE(localAt + 28);
        if (start + size > buf.length) throw new Error('damaged zip file');
        var body = buf.subarray(start, start + size);
        var data;
        if (method === 0) data = Buffer.from(body);
        else if (method === 8) data = zlib.inflateRawSync(body);
        else throw new Error(name + ': compression method ' + method + ' is not supported');
        if (crc32(data) !== crc) throw new Error(name + ': damaged (checksum)');
        entries.push({ name: name, data: data });
    }
    return entries;
}

module.exports = { createZip: createZip, readZip: readZip, crc32: crc32 };
