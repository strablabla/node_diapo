# node_diapo (straptoc)

Interactive web application for creating and presenting slideshows with markdown support, voice control, and real-time editing.

## Description

node_diapo is a web-based presentation editor that allows you to create, edit, and present slideshows with the following features:

- Markdown content editing with enriched syntax
- Real-time preview
- Voice control for presentations (French)
- Keyboard navigation
- Dynamic slide management (create, delete, reorganize)
- Automatic versioning of modifications
- Fullscreen presentation interface
- Socket.io for real-time synchronization

## Prerequisites

- Node.js (recommended version: 12.x or higher)
- npm

## Installation

```bash
# Clone the repository
git clone https://github.com/strablabla/node_straptoc.git
cd node_straptoc

# Install dependencies
npm install
```

## Starting the Application

```bash
node html_app.js
```

The application will start at `http://127.0.0.1:3067/d0`

The browser will automatically open on the first slide.

## Project Structure

```
node_diapo/
├── html_app.js              # Main Express server
├── views/                   # Templates and views
│   ├── diapos/             # Slideshow content
│   │   ├── d0.html         # Slide 0 (markdown)
│   │   ├── diapo0.html     # Jinja template for slide 0
│   │   └── ...
│   ├── saved/              # Saved versions
│   ├── config/             # Configuration (colors, etc.)
│   ├── diapo.html          # Presentation view
│   ├── text.html           # Editing view
│   └── diapo_all.html      # All slides view
├── static/js/              # Server-side scripts
│   ├── modify_html.js      # Markdown to HTML conversion
│   ├── read_emit.js        # Read and Socket.io emission
│   └── util.js             # Utilities (version saving)
├── lib/                    # Client libraries
│   ├── codemirror.js       # Code editor
│   ├── artyom.window.min.js # Voice recognition
│   ├── keymaster.js        # Keyboard shortcuts management
│   └── screenfull.js       # Fullscreen mode
├── scripts/                # Client scripts
│   └── edit_textarea.js    # Textarea editing
└── public/                 # Public resources (images, videos)
```

## Usage

### Keyboard Shortcuts

#### Navigation
- **Left/Right arrows**: Navigate between slides
- **Ctrl+A**: View all slides
- **Alt+M**: View miniatures

#### Editing
- **Double-click**: Switch to editing mode (on slide elements)
- **Alt+T**: Switch to markdown editing mode
- **Alt+T** (in edit mode): Return to presentation mode

#### Slide Management
- **Ctrl+P**: Create a new slide
- **Alt+Ctrl+X**: Delete current slide

#### Display & Presentation
- **Alt+S**: Show/hide syntax help
- **Alt+N**: Show next line (progressive visualization)
- **Ctrl+M**: Show/hide memos indicators
- **Ctrl+I**: Save position of images and equations

#### Help
- **Alt+K**: Show keyboard shortcuts help
- **Alt+V**: Show voice commands help
- **Alt+C**: Show configuration

### Available URLs

- `/d0`, `/d1`, `/d2`, etc.: Individual slides
- `/text0`, `/text1`, etc.: Editing mode
- `/all`: View all slides

### Editing

1. Access the text view (e.g., `http://127.0.0.1:3067/text0`)
2. Edit the markdown content in the CodeMirror editor
3. Submit the changes
4. Changes are automatically saved with versioning

### Voice Control

The application supports voice commands in French via Artyom.js for:
- Navigation between slides
- Fullscreen mode activation
- Displaying memos
- And more

### Special Syntax

The system supports enriched markdown syntax with special markers:
- `!memo0`, `!memo1`: Define notes/memos
- `$memo0`: Display a memo
- `!head`: Define a custom header
- `!foot`: Define a footer
- `!stp`: Step marker
- Color annotations: `"text"cb`, `"text"cg`, etc.

## Main Dependencies

- **Express**: Web framework
- **Socket.io**: Real-time communication
- **Nunjucks**: Template engine
- **CodeMirror**: Code editor
- **Artyom.js**: Voice recognition
- **JSDOM**: Server-side DOM manipulation

## Configuration

Configuration settings are located in `views/config/config.json`:
- Progress bar colors
- Presentation title
- Author email
- And other parameters

## Slide Versioning

Each slide modification is automatically saved in `views/saved/` with a timestamp. The system keeps up to 10 versions per slide.

## Known Issues

### External dependency rawgit.com

The project loads `straptoc.js` from rawgit.com which has been shut down since 2019. To fix:

1. Download the file locally from the original repository
2. Modify `views/header.html` line 14 to point to the local version

### Outdated Dependencies

Several dependencies are outdated and have security vulnerabilities. It is recommended to update them:

```bash
npm audit fix
```

## Author

LC

## License

ISC
