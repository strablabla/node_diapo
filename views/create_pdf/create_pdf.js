// ============================================
// PDF GENERATION FROM THUMBNAILS
// ============================================

// fresh: take every thumbnail again first (right-click menu), so the PDF shows
// the slides as they are now; without, the thumbnails already made are used.
function generatePdf(fresh) {
    console.log('Generating PDF from thumbnails' + (fresh ? ', taken again first' : '') + '...')
    socket.emit('generate_pdf', { fresh: !!fresh })
    // Show a notification
    var notification = $('<div>').text('Génération du PDF en cours...').css({
        'position': 'fixed',
        'top': '50%',
        'left': '50%',
        'transform': 'translate(-50%, -50%)',
        'background': 'rgba(0, 0, 0, 0.8)',
        'color': 'white',
        'padding': '20px 40px',
        'border-radius': '5px',
        'font-size': '18px',
        'z-index': '10000'
    })
    $('body').append(notification)

    socket.on('pdf_progress', showProgress)
    function showProgress(text) { notification.text(text) }

    // Listen for completion
    socket.once('pdf_generated', function(data) {
        socket.off('pdf_progress', showProgress)
        if (data.success) {
            notification.text('PDF généré avec succès ! Téléchargement en cours...')

            // Trigger download
            // Extract filename from URL to preserve the deck title
            var link = document.createElement('a')
            link.href = data.downloadUrl
            var filename = data.downloadUrl.split('/').pop()  // Get filename from URL
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            setTimeout(function() {
                notification.fadeOut(500, function() { $(this).remove() })
            }, 2000)
        } else {
            notification.text('Erreur lors de la génération du PDF: ' + (data.error || 'Erreur inconnue'))
            setTimeout(function() {
                notification.fadeOut(500, function() { $(this).remove() })
            }, 3000)
        }
    })
}

key('alt+ctrl+p', function(){ generatePdf(false) });
