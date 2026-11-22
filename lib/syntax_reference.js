// ============================================
// SLIDE SYNTAX REFERENCE
// ============================================
//
// The markers a slide's text understands, in one list for the two panels that
// show it: the "Syntax" tab of the help panel ("?" of the right-edge toolbar,
// Ctrl+H; lib/shortcuts_help.js) and the editor's Syntax panel (double-click
// on the line numbers; lib/syntax_help.js).
//
// Each item: code (shown as typed, "\n" for a new line) and a short note.

var SYNTAX_REFERENCE = [
    { title: 'Title page (slide 0)', items: [
        { code: '!deck_title My Presentation', note: 'Presentation title, shown on the title page' },
        { code: '!author John Doe', note: 'Author name' },
        { code: '!date January 2025', note: 'Presentation date' },
        { code: '# Title !pdf_title', note: 'PDF filename ("My Talk" gives my_talk.pdf)' }
    ]},
    { title: 'Headers', items: [
        { code: '# Title !tit', note: 'Centered, italic title (40px)' },
        { code: '## Subtitle !fb', note: 'Blue frame around the h2' },
        { code: '### Section !pos150/100', note: 'h3 at x: 150px, y: 100px' }
    ]},
    { title: 'Frames and bands (titles)', items: [
        { code: '## Subtitle !fg', note: 'Frame around the title: !fb blue, !fr red, !fg green, !fo orange, !fy yellow' },
        { code: '## Subtitle !hy', note: 'Band of color behind the title, as a highlighter: !hb, !hr, !hg, !ho, !hy' }
    ]},
    { title: 'Positions', items: [
        { code: '!pos100/200', note: 'Element at x: 100px, y: 200px' }
    ]},
    { title: 'Text style', items: [
        { code: '"some words"cb', note: 'Color: cr red, cb blue, cy yellow, cg green, co orange, cm magenta' },
        { code: '"some words"b', note: 'Bold' },
        { code: '"some words"u', note: 'Underlined' }
    ]},
    { title: 'Equations', items: [
        { code: '!pos150/300\n!eq E = mc^2', note: 'LaTeX equation, at a position' }
    ]},
    { title: 'Images', items: [
        { code: "!pos100/200\n!['title' 400x300 %id%](imgs/file.jpg)", note: 'Image at a position, with its size' },
        { code: null, note: 'Drag an image onto the slide to add it. Right-click on it: delete or resize' }
    ]},
    { title: 'Videos', items: [
        { code: '[title ;;](https://www.youtube.com/watch?v=...)', note: 'YouTube video' },
        { code: '[title %%](videos/file.mp4)', note: 'Local video, from public/ (subtitles from file.vtt next to it). MP4, WebM or Ogg' },
        { code: null, note: 'Drag a video file onto the slide to add it. Click [-] to unfold it' }
    ]},
    { title: 'Header & footer', items: [
        { code: '!head My Header', note: 'Page header (top right)' },
        { code: '!foot My Footer', note: 'Page footer (bottom)' }
    ]},
    { title: 'Progressive display', items: [
        { code: '* Item !stp', note: 'Shown step by step (keys ↓ / ↑ / B)' },
        { code: "!['img'] !stp=0", note: 'Element shown at a given step (0, 1, 2...)' }
    ]},
    { title: 'Memos', items: [
        { code: 'a phrase !memo0', note: 'Marks the phrase: a click on it shows memo 0' },
        { code: '$memo0\n* the memo text', note: 'The memo: what follows $memo0 (a list, a paragraph), hidden in the slide. Ctrl+M shows the marked phrases' }
    ]}
];

// The list as HTML. Its classes (section, syntax-item, syntax-note) are styled
// by the panel that shows it.
function syntaxReferenceHtml() {
    function escape(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    return SYNTAX_REFERENCE.map(function(section) {
        return '<h4>' + escape(section.title) + '</h4>' +
            section.items.map(function(item) {
                var code = item.code === null ? ''
                    : '<code>' + escape(item.code).replace(/\n/g, '<br/>') + '</code><br/>';
                return '<div class="syntax-item">' + code +
                       '<small class="syntax-note">' + escape(item.note) + '</small></div>';
            }).join('');
    }).join('');
}
