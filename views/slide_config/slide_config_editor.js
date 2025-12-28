// ============================================
// SLIDE CONFIG EDITOR - Opens with Ctrl+C
// ============================================

(function() {
    var editorPanel = null;
    var editorTextarea = null;

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
            'padding': '20px',
            'width': '80%',
            'max-width': '900px',
            'height': '80%',
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
            'margin-bottom': '15px'
        });

        var title = $('<h3>').text('Slide Configuration Editor').css({
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

        // Create textarea
        editorTextarea = $('<textarea>')
            .attr('id', 'yaml-editor')
            .css({
                'height': '500px',
                'width': '100%',
                'border-radius': '4px',
                'resize': 'vertical',
                'font-family': "'Courier New', Courier, monospace",
                'font-size': '14px',
                'line-height': '1.5',
                'padding': '10px',
                'border': '1px solid #ccc',
                'background-color': '#ffffff',
                'color': '#000000',
                'display': 'block'
            });

        // Create buttons container
        var buttonsContainer = $('<div>').css({
            'display': 'flex',
            'justify-content': 'flex-end',
            'gap': '10px',
            'margin-top': '15px'
        });

        var cancelBtn = $('<button>').text('Cancel').css({
            'padding': '8px 20px',
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
            'padding': '8px 20px',
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
        editorContainer.append(editorTextarea);
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
            editorTextarea.val(yamlText);
            editorPanel.css('display', 'flex');

            // Focus textarea after a short delay
            setTimeout(function() {
                var textarea = document.getElementById('yaml-editor');
                if (textarea) {
                    textarea.focus();
                }
            }, 100);
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
        var yamlContent = editorTextarea.val();

        // Validate YAML
        try {
            jsyaml.load(yamlContent);
        } catch (err) {
            alert('YAML syntax error:\n' + err.message);
            return;
        }

        // Send to server
        $.ajax({
            url: '/save-slide-config',
            type: 'POST',
            contentType: 'text/plain',
            data: yamlContent,
            success: function(response) {
                console.log('✅ Slide configuration saved');
                closeEditor();
                // Reload the page to apply changes
                location.reload();
            },
            error: function(xhr, status, error) {
                alert('Failed to save configuration:\n' + error);
            }
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
