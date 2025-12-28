var fs = require('fs');
var yaml = require('js-yaml');

function extractPdfTitle(text) {
    /*
    Extract PDF title from markdown text containing !pdf_title tag
    Returns the title text without the tag
    Looks for lines with # Title !pdf_title format
    */

    var lines = text.split('\n');

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();

        // Skip empty lines
        if (!line) continue;

        // Check if line has !pdf_title tag (typically in a heading like "# Title !pdf_title")
        if (line.match(/!\s*pdf_title/i)) {
            // Extract the text before !pdf_title
            var match = line.match(/^#\s+(.+?)\s+!pdf_title/i);
            if (match && match[1]) {
                var title = match[1].trim();
                console.log('📌 Extracted PDF title:', title);
                return title;
            }
        }
    }

    return null;
}

function savePdfTitle(title) {
    /*
    Save PDF title to views/config_deck.yaml
    This is used for PDF filename generation
    */

    if (!title) {
        console.log('⚠️  No PDF title to save');
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

    // Update PDF title
    config.pdf_title = title;

    // Write back to file
    try {
        var yamlStr = yaml.dump(config);
        fs.writeFileSync(configPath, yamlStr, 'utf8');
        console.log('✅ Saved PDF title to views/config_deck.yaml');
    } catch (err) {
        console.error('❌ Error writing config_deck.yaml:', err);
    }
}

function getPdfTitle() {
    /*
    Read PDF title from views/config_deck.yaml
    Returns the title or null if not found
    */

    var configPath = 'views/config_deck.yaml';

    if (!fs.existsSync(configPath)) {
        return null;
    }

    try {
        var configContents = fs.readFileSync(configPath, 'utf8');
        var config = yaml.load(configContents);
        return config.pdf_title || null;
    } catch (err) {
        console.error('Error reading PDF title from config_deck.yaml:', err);
        return null;
    }
}

function sanitizeTitleForFilename(title) {
    /*
    Convert title to safe filename
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

module.exports = {
    extractPdfTitle: extractPdfTitle,
    savePdfTitle: savePdfTitle,
    getPdfTitle: getPdfTitle,
    sanitizeTitleForFilename: sanitizeTitleForFilename
};
