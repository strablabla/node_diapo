// ============================================
// SLIDE CONFIG EDITOR - Opens with Ctrl+C
// ============================================

(function() {
    var editorPanel = null;
    var marginSlider = null;
    var marginValueDisplay = null;
    var ulMarginSlider = null;
    var ulMarginValueDisplay = null;

    function createEditorPanel() {
        // Create overlay
        editorPanel = $('<div>').attr('id', 'slide-config-editor')
            .css({
                'position': 'fixed',
                'top': '0',
                'left': '0',
                'width': '100%',
                'height': '100%',
                'background-color': 'rgba(0, 0, 0, 0.8)',
                'z-index': '100000',
                'display': 'none',
                'justify-content': 'center',
                'align-items': 'center',
                'cursor': 'auto'
            });

        // Create editor container
        var editorContainer = $('<div>').css({
            'background': 'white',
            'border-radius': '8px',
            'padding': '30px',
            'width': '500px',
            'display': 'flex',
            'flex-direction': 'column',
            'box-shadow': '0 4px 20px rgba(0,0,0,0.3)',
            'cursor': 'auto'
        });

        // Create header
        var header = $('<div>').css({
            'display': 'flex',
            'justify-content': 'space-between',
            'align-items': 'center',
            'margin-bottom': '30px'
        });

        var title = $('<h3>').text('Header Margins').css({
            'margin': '0',
            'color': '#333'
        });

        var closeBtn = $('<button>').text('×').css({
            'background': 'white',
            'color': 'black',
            'border': '2px solid black',
            'border-radius': '50%',
            'width': '30px',
            'height': '30px',
            'cursor': 'pointer',
            'font-size': '18px',
            'font-weight': 'bold'
        }).on('click', closeEditor).on('mouseenter', function() {
            $(this).css('background', '#e0e0e0');
        }).on('mouseleave', function() {
            $(this).css('background', 'white');
        });

        header.append(title).append(closeBtn);

        // Create slider container
        var sliderContainer = $('<div>').css({
            'display': 'flex',
            'flex-direction': 'column',
            'gap': '25px',
            'margin-bottom': '30px'
        });

        // Create single slider for margin
        var sliderRow = $('<div>').css({
            'display': 'flex',
            'flex-direction': 'column',
            'gap': '8px'
        });

        var labelRow = $('<div>').css({
            'display': 'flex',
            'justify-content': 'space-between',
            'align-items': 'center'
        });

        var label = $('<label>').text('Margin:').css({
            'font-weight': 'bold',
            'font-size': '14px',
            'color': '#333'
        });

        marginValueDisplay = $('<span>').text('0%').css({
            'font-family': 'monospace',
            'font-size': '14px',
            'color': '#666',
            'min-width': '50px',
            'text-align': 'right'
        });

        labelRow.append(label).append(marginValueDisplay);

        marginSlider = $('<input>')
            .attr('type', 'range')
            .attr('min', '0')
            .attr('max', '50')
            .attr('step', '0.5')
            .attr('value', '0')
            .css({
                'width': '100%',
                'cursor': 'pointer'
            })
            .on('input', function() {
                var val = $(this).val();
                marginValueDisplay.text(val + '%');
            });

        sliderRow.append(labelRow).append(marginSlider);
        sliderContainer.append(sliderRow);

        // Create second slider for ul margin
        var ulSliderRow = $('<div>').css({
            'display': 'flex',
            'flex-direction': 'column',
            'gap': '8px'
        });

        var ulLabelRow = $('<div>').css({
            'display': 'flex',
            'justify-content': 'space-between',
            'align-items': 'center'
        });

        var ulLabel = $('<label>').text('UL Margin:').css({
            'font-weight': 'bold',
            'font-size': '14px',
            'color': '#333'
        });

        ulMarginValueDisplay = $('<span>').text('0%').css({
            'font-family': 'monospace',
            'font-size': '14px',
            'color': '#666',
            'min-width': '50px',
            'text-align': 'right'
        });

        ulLabelRow.append(ulLabel).append(ulMarginValueDisplay);

        ulMarginSlider = $('<input>')
            .attr('type', 'range')
            .attr('min', '0')
            .attr('max', '50')
            .attr('step', '0.5')
            .attr('value', '0')
            .css({
                'width': '100%',
                'cursor': 'pointer'
            })
            .on('input', function() {
                var val = $(this).val();
                ulMarginValueDisplay.text(val + '%');
            });

        ulSliderRow.append(ulLabelRow).append(ulMarginSlider);
        sliderContainer.append(ulSliderRow);

        // Create buttons container
        var buttonsContainer = $('<div>').css({
            'display': 'flex',
            'justify-content': 'flex-end',
            'gap': '10px'
        });

        var cancelBtn = $('<button>').text('Cancel').css({
            'padding': '10px 24px',
            'background': '#6c757d',
            'color': 'white',
            'border': 'none',
            'border-radius': '4px',
            'cursor': 'pointer',
            'font-size': '14px'
        }).on('click', closeEditor).on('mouseenter', function() {
            $(this).css('background', '#5a6268');
        }).on('mouseleave', function() {
            $(this).css('background', '#6c757d');
        });

        var saveBtn = $('<button>').text('Save & Apply').css({
            'padding': '10px 24px',
            'background': '#28a745',
            'color': 'white',
            'border': 'none',
            'border-radius': '4px',
            'cursor': 'pointer',
            'font-size': '14px'
        }).on('click', saveConfig).on('mouseenter', function() {
            $(this).css('background', '#218838');
        }).on('mouseleave', function() {
            $(this).css('background', '#28a745');
        });

        buttonsContainer.append(cancelBtn).append(saveBtn);

        // Assemble everything
        editorContainer.append(header);
        editorContainer.append(sliderContainer);
        editorContainer.append(buttonsContainer);

        editorPanel.append(editorContainer);
        $('body').append(editorPanel);
    }

    function openEditor() {
        if (!editorPanel) {
            createEditorPanel();
        }

        // Load current YAML content
        $.get('/slide_config.yaml', function(yamlText) {
            var config = jsyaml.load(yamlText);

            // Get margin-left from h1 (or use 0 if not set)
            var percentValue = 0;
            if (config.css && config.css.h1 && config.css.h1['margin-left']) {
                var marginLeft = config.css.h1['margin-left'];

                // Convert px to % (assuming viewport width ~1920px)
                if (typeof marginLeft === 'string' && marginLeft.includes('px')) {
                    var pxValue = parseFloat(marginLeft);
                    percentValue = (pxValue / 1920) * 100;
                } else if (typeof marginLeft === 'string' && marginLeft.includes('%')) {
                    percentValue = parseFloat(marginLeft);
                } else if (typeof marginLeft === 'number') {
                    percentValue = (marginLeft / 1920) * 100;
                }
            }

            marginSlider.val(percentValue.toFixed(1));
            marginValueDisplay.text(percentValue.toFixed(1) + '%');

            // Get margin-left from ul (or use 0 if not set)
            var ulPercentValue = 0;
            if (config.css && config.css.ul && config.css.ul['margin-left']) {
                var ulMarginLeft = config.css.ul['margin-left'];

                // Convert px to %
                if (typeof ulMarginLeft === 'string' && ulMarginLeft.includes('px')) {
                    var ulPxValue = parseFloat(ulMarginLeft);
                    ulPercentValue = (ulPxValue / 1920) * 100;
                } else if (typeof ulMarginLeft === 'string' && ulMarginLeft.includes('%')) {
                    ulPercentValue = parseFloat(ulMarginLeft);
                } else if (typeof ulMarginLeft === 'number') {
                    ulPercentValue = (ulMarginLeft / 1920) * 100;
                }
            }

            ulMarginSlider.val(ulPercentValue.toFixed(1));
            ulMarginValueDisplay.text(ulPercentValue.toFixed(1) + '%');

            editorPanel.css('display', 'flex');
        }).fail(function(xhr, status, error) {
            console.error('Failed to load YAML:', status, error);
            alert('Failed to load slide_config.yaml: ' + error);
        });
    }

    function closeEditor() {
        if (editorPanel) {
            editorPanel.hide();
        }
    }

    function saveConfig() {
        // Load current YAML to preserve other settings
        $.get('/slide_config.yaml', function(yamlText) {
            var config = jsyaml.load(yamlText);

            // Get the margin values
            var percentValue = parseFloat(marginSlider.val());
            var ulPercentValue = parseFloat(ulMarginSlider.val());

            // Update margin-left values for h1, h2, h3 with the same percentage value
            ['h1', 'h2', 'h3'].forEach(function(tag) {
                // Ensure css section and tag exist
                if (!config.css) {
                    config.css = {};
                }
                if (!config.css[tag]) {
                    config.css[tag] = {};
                }

                // Set margin-left as percentage string
                config.css[tag]['margin-left'] = percentValue + '%';
            });

            // Update margin-left for ul
            if (!config.css) {
                config.css = {};
            }
            if (!config.css.ul) {
                config.css.ul = {};
            }
            config.css.ul['margin-left'] = ulPercentValue + '%';

            // Convert back to YAML
            var newYamlContent = jsyaml.dump(config);

            // Send to server
            $.ajax({
                url: '/save-slide-config',
                type: 'POST',
                contentType: 'text/plain',
                data: newYamlContent,
                success: function() {
                    console.log('✅ Slide configuration saved');
                    closeEditor();
                    // Reload the page to apply changes
                    location.reload();
                },
                error: function(xhr, status, error) {
                    alert('Failed to save configuration:\n' + error);
                }
            });
        }).fail(function(xhr, status, error) {
            alert('Failed to load current configuration:\n' + error);
        });
    }

    // Bind Ctrl+C to open editor
    $(document).on('keydown', function(e) {
        if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            openEditor();
        }
    });

    console.log('✅ Slide config editor initialized (Ctrl+C to open)');

})();
