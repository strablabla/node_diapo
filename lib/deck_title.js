var fs = require('fs');
var yaml = require('js-yaml');

function extractDeckTitle(text) {
    /*
    Extract deck title from markdown text containing !deck_title tag
    Returns the title text without the tag
    Looks for lines starting with !deck_title (not in a heading)
    */

    // Match lines that start with !deck_title (optionally after whitespace)
    // but NOT lines that have # before !deck_title
    var lines = text.split('\n');

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();

        // Skip empty lines
        if (!line) continue;

        // Check if line starts with !deck_title (not in a heading)
        if (line.match(/^!deck_title\s+(.+)/i)) {
            var match = line.match(/^!deck_title\s+(.+)/i);
            if (match && match[1]) {
                var title = match[1].trim();
                console.log('📌 Extracted deck title:', title);
                return title;
            }
        }
    }

    return null;
}

function saveDeckTitle(title) {
    /*
    Save deck title to views/config_deck.yaml
    */

    if (!title) {
        console.log('⚠️  No title to save');
        return;
    }

    var configPath = 'views/config_deck.yaml';
    var config = {};

    // Read existing config if it exists
    if (fs.existsSync(configPath)) {
        try {
            var existingConfig = fs.readFileSync(configPath, 'utf8');
            config = yaml.load(existingConfig) || {};
        } catch (err) {
            console.error('Error reading config_deck.yaml:', err);
            config = {};
        }
    }

    // Update title
    config.deck_title = title;

    // Write back to file
    try {
        var yamlStr = yaml.dump(config);
        fs.writeFileSync(configPath, yamlStr, 'utf8');
        console.log('✅ Saved deck title to views/config_deck.yaml');
    } catch (err) {
        console.error('❌ Error writing config_deck.yaml:', err);
    }
}

function getDeckTitle() {
    /*
    Read deck title from views/config_deck.yaml
    Returns the title or null if not found
    */

    var configPath = 'views/config_deck.yaml';

    if (!fs.existsSync(configPath)) {
        return null;
    }

    try {
        var configContents = fs.readFileSync(configPath, 'utf8');
        var config = yaml.load(configContents);
        return config.deck_title || null;
    } catch (err) {
        console.error('Error reading deck title from config_deck.yaml:', err);
        return null;
    }
}

function sanitizeTitleForFilename(title) {
    /*
    Convert deck title to safe filename
    - Replace spaces with underscores
    - Remove special characters
    - Lowercase
    - Limit length
    */

    if (!title) return 'slides';

    var sanitized = title
        .toLowerCase()
        .replace(/\s+/g, '_')           // spaces to underscores
        .replace(/[^a-z0-9_-]/g, '')    // remove special chars
        .substring(0, 50);              // max 50 chars

    return sanitized || 'slides';
}

function updateDeckTitleFromFirstSlide() {
    /*
    Read first slide (d0.html) and extract/save deck title
    This should be called when the first slide is saved
    */

    var firstSlidePath = 'views/diapos/d0.html';

    if (!fs.existsSync(firstSlidePath)) {
        console.log('⚠️  First slide not found');
        return;
    }

    fs.readFile(firstSlidePath, 'utf8', function(err, text) {
        if (err) {
            console.error('Error reading first slide:', err);
            return;
        }

        var title = extractDeckTitle(text);
        if (title) {
            saveDeckTitle(title);
        }
    });
}

module.exports = {
    extractDeckTitle: extractDeckTitle,
    saveDeckTitle: saveDeckTitle,
    getDeckTitle: getDeckTitle,
    sanitizeTitleForFilename: sanitizeTitleForFilename,
    updateDeckTitleFromFirstSlide: updateDeckTitleFromFirstSlide
};
