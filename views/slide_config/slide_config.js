// ============================================
// SLIDE GENERAL CONFIGURATION (CSS & Layout)
// Loads from slide_config.yaml and applies directly
// ============================================

$(document).ready(function() {
    // Fetch and parse YAML config
    $.get('/slide_config.yaml', function(yamlText) {
        try {
            // Parse YAML (using js-yaml if available, or fallback to simple parsing)
            var config = jsyaml.load(yamlText);

            console.log('📋 Loading slide configuration from YAML...');

            // Apply CSS rules
            if (config.css) {
                for (var selector in config.css) {
                    if (config.css.hasOwnProperty(selector)) {
                        $(selector).css(config.css[selector]);
                    }
                }
            }

            // Apply hide() to elements
            if (config.hide && Array.isArray(config.hide)) {
                config.hide.forEach(function(selector) {
                    $(selector).hide();
                });
            }

            console.log('✅ Slide configuration applied');

        } catch (err) {
            console.error('❌ Error loading slide config:', err);
        }
    }).fail(function() {
        console.error('❌ Failed to load slide_config.yaml');
    });
});
