var fs = require('fs');

function initialize(dependencies) {
    /*
    Initialize system on startup:
    - Clean up old PDFs
    - Extract and save PDF title from first slide
    - Create thumbnails
    */

    var cleanupOldPDFs = dependencies.cleanupOldPDFs;
    var pdfTitle = dependencies.pdfTitle;
    var thumbnails = dependencies.thumbnails;
    var numdiap = dependencies.numdiap;
    var port = dependencies.port;

    // Clean up old PDFs on startup
    cleanupOldPDFs()

    // Extract and save PDF title from first slide on startup
    if (fs.existsSync('views/diapos/d0.html')) {
        var d0Content = fs.readFileSync('views/diapos/d0.html', 'utf8');
        var title = pdfTitle.extractPdfTitle(d0Content);
        if (title) {
            pdfTitle.savePdfTitle(title);
            console.log('PDF title extracted and saved:', title);
        } else {
            console.log('No PDF title found in d0.html');
        }
    }

    // Create thumbnails after server is fully started (wait 2 seconds)
    setTimeout(function() {
        thumbnails.create_thumbnails(numdiap, port).then(function() {
            console.log('Thumbnails created successfully');
        }).catch(function(err) {
            console.error('Error creating thumbnails:', err);
        });
    }, 2000);
}

module.exports = initialize;
