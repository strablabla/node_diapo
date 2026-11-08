#!/usr/bin/env node
/*
Installs node_diapo and puts a launcher on the Desktop, on Linux, macOS or
Windows. Written in Node, which the application needs anyway, so that one
script serves every OS; install.sh and install.bat only call it.

    node install.js              npm install, then the Desktop launcher
    node install.js --no-npm     the launcher only

Safe to run again: it overwrites its own launcher. The launcher runs Node by
the absolute path of the one running this script: a macOS app started from the
Finder does not get the shell's PATH, nor does a Linux .desktop started from a
menu with nvm. Run the installer again after moving or upgrading Node.
*/

var fs = require('fs');
var os = require('os');
var path = require('path');
var child = require('child_process');

var APP_NAME = 'node_diapo';
var APP_DIR = __dirname;
var ICON_PNG = path.join(APP_DIR, 'icons', 'node_diapo.png');
var NODE = process.execPath;
var MIN_NODE = [20, 19];                    // jsdom 27 needs ^20.19, ^22.12 or >=24

var args = process.argv.slice(2);
var PLATFORM = process.platform;

function log(msg) { console.log('[install] ' + msg) }
function fail(msg) { console.error('[install] ' + msg); process.exit(1) }

// --- 1. Node version ---------------------------------------------------------

var v = process.versions.node.split('.').map(Number);
if (v[0] < MIN_NODE[0] || (v[0] === MIN_NODE[0] && v[1] < MIN_NODE[1])) {
    fail('Node ' + process.versions.node + ' is too old: node_diapo needs Node ' +
         MIN_NODE.join('.') + ' or later (https://nodejs.org).')
}
log('Node ' + process.versions.node + ' (' + NODE + ')')

// --- 2. Dependencies ---------------------------------------------------------

if (args.indexOf('--no-npm') === -1) {
    log('npm install (this also downloads the browser used for the thumbnails)...')
    // npm is a .cmd on Windows: it needs a shell there.
    var r = child.spawnSync('npm', ['install'], { cwd: APP_DIR, stdio: 'inherit', shell: PLATFORM === 'win32' })
    if (r.status !== 0) fail('npm install failed (see above).')
}

// --- 3. Launcher -------------------------------------------------------------

function desktopDir() {
    if (PLATFORM === 'linux') {
        // The real, possibly localised, Desktop: ~/Bureau, ~/Escritorio...
        try {
            var d = child.execFileSync('xdg-user-dir', ['DESKTOP'], { encoding: 'utf8' }).trim()
            if (d && fs.existsSync(d)) return d
        } catch (e) { /* no xdg-user-dir */ }
    }
    if (PLATFORM === 'win32') {
        // Follows a Desktop moved to OneDrive or localised.
        try {
            var w = child.execFileSync('powershell', ['-NoProfile', '-Command',
                    '[Environment]::GetFolderPath("Desktop")'], { encoding: 'utf8' }).trim()
            if (w && fs.existsSync(w)) return w
        } catch (e) { /* fall back below */ }
    }
    var candidates = ['Desktop', 'Bureau'].map(function(n) { return path.join(os.homedir(), n) })
    for (var i = 0; i < candidates.length; i++) {
        if (fs.existsSync(candidates[i])) return candidates[i]
    }
    return os.homedir()
}

function linuxLauncher(desktop) {
    // Terminal=false: no window; start_diapo.sh sends the server's messages to
    // logs/node_diapo.log, and the page shows them (Ctrl+Shift+D).
    var quote = function(s) { return '"' + s.replace(/(["`$\\])/g, '\\$1') + '"' }
    var entry = [
        '[Desktop Entry]',
        'Type=Application',
        'Name=' + APP_NAME,
        'Comment=Slideshows in markdown',
        'Exec=env NODE=' + quote(NODE) + ' ' + quote(path.join(APP_DIR, 'start_diapo.sh')),
        'Path=' + APP_DIR,
        'Icon=' + ICON_PNG,
        'Terminal=false',
        'Categories=Office;Presentation;',
        ''
    ].join('\n')
    var targets = [path.join(desktop, APP_NAME + '.desktop'),
                   path.join(os.homedir(), '.local', 'share', 'applications', APP_NAME + '.desktop')]
    targets.forEach(function(file) {
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, entry, { mode: 0o755 })
        log('launcher: ' + file)
    })
    // GNOME shows an untrusted .desktop on the Desktop as a plain file.
    try { child.execFileSync('gio', ['set', targets[0], 'metadata::trusted', 'true'], { stdio: 'ignore' }) }
    catch (e) { /* not GNOME, or no gio */ }
}

function macLauncher(desktop) {
    // An .app bundle is just a folder with a fixed layout. It starts the
    // server in the background, with its messages in logs/node_diapo.log
    // (start_diapo.sh); the server stops by itself once the browser is closed.
    var app = path.join(desktop, APP_NAME + '.app')
    fs.rmSync(app, { recursive: true, force: true })
    var macos = path.join(app, 'Contents', 'MacOS')
    var resources = path.join(app, 'Contents', 'Resources')
    fs.mkdirSync(macos, { recursive: true })
    fs.mkdirSync(resources, { recursive: true })
    fs.writeFileSync(path.join(app, 'Contents', 'Info.plist'), [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
        '<plist version="1.0"><dict>',
        '  <key>CFBundleName</key><string>' + APP_NAME + '</string>',
        '  <key>CFBundleIdentifier</key><string>local.node-diapo</string>',
        '  <key>CFBundleVersion</key><string>1.0</string>',
        '  <key>CFBundlePackageType</key><string>APPL</string>',
        '  <key>CFBundleExecutable</key><string>launcher</string>',
        '  <key>CFBundleIconFile</key><string>node_diapo</string>',
        '</dict></plist>', ''
    ].join('\n'))
    var q = function(s) { return "'" + s.replace(/'/g, "'\\''") + "'" }
    fs.writeFileSync(path.join(macos, 'launcher'), [
        '#!/bin/sh',
        'NODE=' + q(NODE) + ' exec ' + q(path.join(APP_DIR, 'start_diapo.sh')), ''
    ].join('\n'), { mode: 0o755 })
    // Icon: the PNG turned into .icns with the stock macOS tools, if present.
    try {
        var iconset = fs.mkdtempSync(path.join(os.tmpdir(), 'diapo-')) + '/node_diapo.iconset'
        fs.mkdirSync(iconset)
        ;[[16, 'icon_16x16'], [32, 'icon_16x16@2x'], [32, 'icon_32x32'], [64, 'icon_32x32@2x'],
          [128, 'icon_128x128'], [256, 'icon_128x128@2x'], [256, 'icon_256x256'],
          [512, 'icon_256x256@2x'], [512, 'icon_512x512']].forEach(function(s) {
            child.execFileSync('sips', ['-z', String(s[0]), String(s[0]), ICON_PNG,
                                        '--out', path.join(iconset, s[1] + '.png')], { stdio: 'ignore' })
        })
        child.execFileSync('iconutil', ['-c', 'icns', iconset, '-o',
                                        path.join(resources, 'node_diapo.icns')], { stdio: 'ignore' })
    } catch (e) { log('no sips/iconutil: default icon') }
    log('launcher: ' + app)
}

function windowsLauncher(desktop) {
    // Windows wants an .ico. Vista and later read PNG-compressed icons, so the
    // PNG behind a 22-byte ICO header is enough.
    var png = fs.readFileSync(ICON_PNG)
    var w = png.readUInt32BE(16), h = png.readUInt32BE(20)
    var header = Buffer.alloc(22)
    header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4)
    header.writeUInt8(w >= 256 ? 0 : w, 6); header.writeUInt8(h >= 256 ? 0 : h, 7)
    header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12)
    header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18)
    var ico = path.join(APP_DIR, 'icons', 'node_diapo.ico')
    fs.writeFileSync(ico, Buffer.concat([header, png]))

    // start_diapo.vbs starts the server with no window; the shortcut gives it
    // the absolute path of node.
    var link = path.join(desktop, APP_NAME + '.lnk')
    var ps = function(s) { return "'" + s.replace(/'/g, "''") + "'" }
    var script = [
        '$s = (New-Object -ComObject WScript.Shell).CreateShortcut(' + ps(link) + ')',
        '$s.TargetPath = (Join-Path $env:WINDIR "System32\\wscript.exe")',
        '$s.Arguments = ' + ps('"' + path.join(APP_DIR, 'start_diapo.vbs') + '" "' + NODE + '"'),
        '$s.WorkingDirectory = ' + ps(APP_DIR),
        '$s.IconLocation = ' + ps(ico + ',0'),
        '$s.Description = ' + ps('Slideshows in markdown'),
        '$s.Save()'
    ].join('; ')
    var r = child.spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script], { stdio: 'inherit' })
    if (r.status !== 0) fail('could not create the shortcut; start_diapo.bat can be run directly.')
    log('launcher: ' + link)
}

var desktop = desktopDir()
if (PLATFORM === 'linux') linuxLauncher(desktop)
else if (PLATFORM === 'darwin') macLauncher(desktop)
else if (PLATFORM === 'win32') windowsLauncher(desktop)
else log('unknown platform ' + PLATFORM + ': no launcher, start with start_diapo.sh')

log('done. Double-click "' + APP_NAME + '" on the Desktop to start.')
