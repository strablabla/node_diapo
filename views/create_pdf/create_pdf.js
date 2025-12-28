// ============================================
// PDF GENERATION FROM THUMBNAILS
// ============================================

key('alt+ctrl+p', function(){         // Generate PDF from thumbnails
    console.log('Generating PDF from thumbnails...')
    socket.emit('generate_pdf')
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

    // Listen for completion
    socket.once('pdf_generated', function(data) {
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
})
