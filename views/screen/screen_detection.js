// ============================================
// SCREEN DIMENSIONS DETECTION
// ============================================

// Send screen dimensions on page load - use screen object directly
$(document).ready(function() {
    // Wait longer to ensure socket is connected
    setTimeout(function() {
        // Use screen.width and screen.height directly (no zoom adjustment needed)
        var width = screen.width
        var height = screen.height

        console.log('=== Screen Detection ===')
        console.log('screen.width: ' + screen.width)
        console.log('screen.height: ' + screen.height)
        console.log('window.devicePixelRatio: ' + window.devicePixelRatio)
        console.log('Socket connected: ' + socket.connected)
        console.log('Sending dimensions: {}x{}'.format(width, height))
        console.log('=======================')

        // Make sure socket is connected before sending
        if (socket.connected) {
            socket.emit('update_viewport', { width: width, height: height })
        } else {
            // Wait for connection then send
            socket.on('connect', function() {
                console.log('Socket connected, now sending dimensions')
                socket.emit('update_viewport', { width: width, height: height })
            })
        }
    }, 1000)  // Increased delay to 1000ms
})
