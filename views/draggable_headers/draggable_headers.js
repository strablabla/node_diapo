// ============================================
// DRAGGABLE HEADERS (h3 vertical drag only)
// ============================================

//------------------------- Make h3 draggable vertically

$('h3').each(function(index){
    var $h3 = $(this);

    // Force unique IDs to h3 for position saving (override any existing ID)
    var h3_id = 'h3-' + index;
    $h3.attr('id', h3_id);

    // Find all elements that follow this h3 until the next h2/h3
    function getFollowingElements($h3) {
        var followers = [];
        var $current = $h3.next();

        while ($current.length > 0) {
            // Stop if we hit another h2 or h3
            if ($current.is('h2, h3')) {
                break;
            }

            // Skip hidden positioned-image markers (the !pos markers for h3)
            if ($current.is('p') && $current.css('display') === 'none' && $current.hasClass('positioned-image')) {
                $current = $current.next();
                continue;
            }

            // Add ul, ol containers to followers
            if ($current.is('ul, ol')) {
                // Set position relative on the ul/ol so we can move it with top
                $current.css('position', 'relative');
                followers.push($current);
                // Don't add individual li elements - they will move with the ul
            }
            // Add paragraphs that are NOT positioned images, equations, headers or footers
            else if ($current.is('p') && !$current.hasClass('positioned-image') && !$current.hasClass('eq') && !$current.hasClass('foot') && !$current.hasClass('head')) {
                followers.push($current);
            }

            $current = $current.next();
        }

        return followers;
    }

    // Function to position followers relative to h3
    function positionFollowers($h3) {
        var followers = getFollowingElements($h3);

        // Get h3 position
        var h3Top = parseInt($h3.css('top')) || 0;
        var h3Height = $h3.outerHeight();
        var h3Bottom = h3Top + h3Height;

        // Position each follower -40px below h3
        followers.forEach(function($elem) {
            $elem.css('top', (h3Bottom - 40) + 'px');
        });
    }

    // Initialize follower positions on page load (after h3 positions are restored)
    setTimeout(function() {
        positionFollowers($h3);

        // Recalculate progressive visualization to update indicator position
        if (typeof progressive_visualization === 'function' && typeof stp !== 'undefined') {
            progressive_visualization(stp);
        }
    }, 150);

    // Make draggable only on vertical axis
    $h3.draggable({
        axis: 'y',  // Only vertical movement
        cursor: 'ns-resize',  // North-South resize cursor

        start: function(event, ui) {
            // Store initial position and find followers
            var followers = getFollowingElements($(this));
            $(this).data('followers', followers);
        },

        drag: function(event, ui) {
            // Position all followers 30px below the h3
            var followers = $(this).data('followers');
            var $h3 = $(this);

            // Get h3 bottom position
            var h3Top = ui.position.top;
            var h3Height = $h3.outerHeight();
            var h3Bottom = h3Top + h3Height;

            // Position each follower -40px below h3
            var lastVisibleFollower = null;
            followers.forEach(function($elem) {
                $elem.css('top', (h3Bottom - 40) + 'px');
                if ($elem.is(':visible')) {
                    lastVisibleFollower = $elem;
                }
            });

            // Update "more content" indicator position if visible
            if ($('#more-content-indicator').is(':visible') && lastVisibleFollower) {
                var lastElemOffset = lastVisibleFollower.offset();
                var lastElemHeight = lastVisibleFollower.outerHeight();
                var topPosition = lastElemOffset.top + lastElemHeight + 10;
                $('#more-content-indicator').css('top', topPosition + 'px');
            }
        }
    });
});
