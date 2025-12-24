var fs = require('fs');
var path = require('path');
const PDFDocument = require('pdfkit');

function generate_pdf_from_thumbnails(socket, numdiap) {
    console.log('Starting PDF generation from thumbnails...')

    try {
        // Read viewport dimensions from config
        var config = JSON.parse(fs.readFileSync('views/config/config.json', 'utf8'))
        var viewportWidth = config.viewport_width || 1920
        var viewportHeight = config.viewport_height || 1080

        // Create PDF document in landscape A4 (842 x 595 points)
        const doc = new PDFDocument({
            size: 'A4',
            layout: 'landscape',
            margin: 0
        })

        // Output file in static folder to make it accessible via HTTP
        const timestamp = Date.now()
        const filename = 'slides_' + timestamp + '.pdf'
        const outputPath = path.join(__dirname, '..', 'static', filename)
        const writeStream = fs.createWriteStream(outputPath)
        doc.pipe(writeStream)

        // Add each thumbnail to the PDF
        let addedPages = 0
        for (let i = 0; i < numdiap; i++) {
            const thumbPath = path.join(__dirname, '..', 'views', 'thumbnails', 'thumb_' + i + '.png')

            if (fs.existsSync(thumbPath)) {
                if (addedPages > 0) {
                    doc.addPage()
                }

                // Fit image to page (A4 landscape: 842 x 595 points)
                // Scale to fit width based on actual viewport dimensions
                const scale = 842 / viewportWidth
                const width = viewportWidth * scale  // 842
                const height = viewportHeight * scale
                const x = 0
                const y = (595 - height) / 2  // Center vertically

                doc.image(thumbPath, x, y, { width: width, height: height })
                addedPages++
                console.log('Added thumbnail ' + i + ' to PDF')
            } else {
                console.warn('Thumbnail ' + i + ' not found: ' + thumbPath)
            }
        }

        doc.end()
        console.log('PDF document ended, waiting for write to finish...')

        // Wait for PDF to finish writing
        writeStream.on('finish', function() {
            console.log('PDF generated successfully at: ' + outputPath)
            // Send the URL for download
            const downloadUrl = '/static/' + filename
            socket.emit('pdf_generated', { success: true, downloadUrl: downloadUrl })
        })

        writeStream.on('error', function(err) {
            console.error('Error writing PDF:', err)
            socket.emit('pdf_generated', { success: false, error: err.message })
        })

    } catch (err) {
        console.error('Error generating PDF:', err)
        socket.emit('pdf_generated', { success: false, error: err.message })
    }
}

module.exports = generate_pdf_from_thumbnails;
