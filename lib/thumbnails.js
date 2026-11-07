var fs = require('fs');
const puppeteer = require('puppeteer');
var yaml = require('js-yaml');

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
      return typeof args[i] != 'undefined' ? args[i++] : '';
    });
};

async function create_thumbnails(numdiap, port){

    // make thumbnails - batch processing version
    console.log('Creating {} thumbnails...'.format(numdiap));

    const browser = await puppeteer.launch({
        headless: true,
        // 30 s, not the default 180 s: a capture stuck on a slide whose CDN never
        // answers would otherwise hold every other thumbnail for three minutes.
        protocolTimeout: 30000,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Process thumbnails in batches for better performance
    const BATCH_SIZE = 5;

    for (var i = 0; i < numdiap; i += BATCH_SIZE) {
        const batchPromises = [];
        const batchEnd = Math.min(i + BATCH_SIZE, numdiap);

        console.log('Processing batch {}-{}...'.format(i, batchEnd - 1));

        for (var j = i; j < batchEnd; j++) {
            batchPromises.push(createSingleThumbnail(browser, j, port, numdiap));
        }

        await Promise.all(batchPromises);
        console.log('Batch {}-{} completed'.format(i, batchEnd - 1));
    }

    await browser.close();
    console.log('All thumbnails created!');
}

// Serializes the screenshots; see createSingleThumbnail.
var screenshotQueue = Promise.resolve();
function withScreenshotLock(task) {
    var run = screenshotQueue.then(task);
    screenshotQueue = run.catch(function() {});   // a failed capture must not block the next
    return run;
}

async function createSingleThumbnail(browser, index_diap, port, numdiap) {
    const page = await browser.newPage();

    // Read viewport dimensions from config
    var config = yaml.load(fs.readFileSync('config.yaml', 'utf8'));
    var viewportWidth = config.viewport_width || 1920;
    var viewportHeight = config.viewport_height || 1080;

    await page.setViewport({ width: viewportWidth, height: viewportHeight });
    var addr_diap = 'http://127.0.0.1:{}/d{}'.format(port, index_diap);

    try {
        // The slides pull libraries from CDNs, some slow (unpkg: up to ~15 s), some
        // dead (cdn.rawgit.com), so the network may never go idle. A timeout then
        // just means "capture the page as it is", not "give up the thumbnail".
        try {
            await page.goto(addr_diap, { waitUntil: 'networkidle0', timeout: 15000 });
        } catch (err) {
            if (err.name !== 'TimeoutError') throw err;
            console.warn('Thumbnail {}: network still busy after 15 s, capturing anyway'.format(index_diap));
        }

        // Hide UI elements and add slide number
        await page.evaluate((slideIndex, totalSlides) => {
            // Hide all UI elements that shouldn't appear in screenshots
            const elementsToHide = [
                document.getElementById('help_keys'),
                document.getElementById('help_voice_cmds'),
                document.getElementById('slider'),
                document.getElementById('slider_value'),
                document.getElementById('current_diapo'),
                document.getElementById('help_syntax'),
                document.getElementById('config'),
                document.querySelector('header'),
                document.querySelector('footer')
            ];

            elementsToHide.forEach(el => {
                if (el) el.style.display = 'none';
            });

            // Update existing #num with slide number (for thumbnails)
            let numElement = document.getElementById('num');
            if (numElement) {
                numElement.textContent = slideIndex + '/' + (totalSlides - 1);
                // Ensure it's visible for the screenshot
                numElement.style.display = 'block';
            }
        }, index_diap, numdiap);

        // views/thumbnails/ is git-ignored, so a fresh clone does not have it,
        // and the screenshot does not create it: every thumbnail then failed.
        fs.mkdirSync('views/thumbnails', { recursive: true });

        // Take screenshot of the entire page (content is already properly styled).
        // One capture at a time, tab brought to the front first: headless Chrome
        // renders only the front tab, so concurrent captures in background tabs
        // could hang until the 180 s protocol timeout. Loading stays parallel.
        await withScreenshotLock(async function() {
            await page.bringToFront();
            await page.screenshot({
                path: 'views/thumbnails/thumb_{}.png'.format(index_diap),
                fullPage: false
            });
        });
        console.log('Thumbnail {} created'.format(index_diap));
    } catch (err) {
        console.error('Error creating thumbnail {}: {}'.format(index_diap, err.message));
    }

    await page.close();
}

async function updateSingleThumbnail(index_diap, port, numdiap) {
    /*
    Update the thumbnail for a single slide
    */
    console.log('Updating thumbnail for slide {}...'.format(index_diap));

    const browser = await puppeteer.launch({
        headless: true,
        // 30 s, not the default 180 s: a capture stuck on a slide whose CDN never
        // answers would otherwise hold every other thumbnail for three minutes.
        protocolTimeout: 30000,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    await createSingleThumbnail(browser, index_diap, port, numdiap);
    await browser.close();

    console.log('Thumbnail {} updated!'.format(index_diap));
}

module.exports = {
    create_thumbnails: create_thumbnails,
    createSingleThumbnail: createSingleThumbnail,
    updateSingleThumbnail: updateSingleThumbnail
};
