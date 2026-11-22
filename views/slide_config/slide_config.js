// ============================================
// SLIDE GENERAL CONFIGURATION (CSS & Layout)
// Loads from slide_config.yaml and applies directly
// ============================================

// Text written without "*" (a paragraph) looks like a list item: same size,
// colour and right margin, and it starts where the items' text starts (the
// list's left margin plus the item's). Taken from the li and ul rules each
// time, so the lists' settings of the configuration panel move both.
// Left alone: paragraphs placed with !pos, equations, header and footer,
// those holding an image or a video, those inside a list, and the title page.
function paragraphsLikeLists(css) {
    if (typeof diapo_index === 'undefined' || !diapo_index) return;
    var li = css.li || {}, ul = css.ul || {};
    function length(v) { return v === undefined || v === null || v === '' ? '0px' : typeof v === 'number' ? v + 'px' : String(v) }
    var style = { 'margin-left': 'calc(' + length(ul['margin-left']) + ' + ' + length(li['margin-left']) + ')' };
    if (li['font-size'] !== undefined) style['font-size'] = li['font-size'];
    if (li.color !== undefined) style.color = li.color;
    var right = String(li.margin || '').split(/\s+/)[1];       // "30px 100px": top/bottom, left/right
    if (li['margin-right'] !== undefined) right = li['margin-right'];
    if (right) style['margin-right'] = length(right);
    $('.section > p').not('.positioned-image, .eq, .head, .foot').filter(function() {
        return !$(this).find('img, iframe, video').length && this.style.position !== 'absolute';
    }).css(style);
}

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

            paragraphsLikeLists(config.css || {});

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
