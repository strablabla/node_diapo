# node_diapo

Interactive web application for creating and presenting slideshows with markdown support, voice control, and real-time editing. Slides are written in an enriched markdown rendered by [straptoc](https://github.com/strablabla/node_straptoc), whose `straptoc.js` is bundled in `scripts/`.

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
- Slide thumbnails above the bottom slider, and PDF export
- YouTube and local videos that open over the slide, framed and resizable

## Prerequisites

- Node.js 18 or higher (required by Puppeteer)
- npm

Once installed, presenting needs no internet connection: all libraries and fonts are served locally (`scripts/vendor/`). Only YouTube videos need the network.

## Installation

```bash
# Clone the repository
git clone https://github.com/strablabla/node_diapo.git
cd node_diapo

# Install dependencies
npm install
```

`npm install` also downloads the headless Chrome that Puppeteer uses to make the slide thumbnails.

## Starting the Application

```bash
node html_app.js
```

The application will start at `http://127.0.0.1:3067/d0`

The browser will automatically open on the first slide. A few seconds after startup, the server takes a screenshot of every slide with Puppeteer; these thumbnails (`views/thumbnails/`, not tracked by git) are shown above the slider at the bottom of the screen and used for the PDF export.

## Project Structure

```
node_diapo/
├── html_app.js              # Main Express server (port 3067)
├── config.yaml              # Viewport size, colors, favicon...
├── lib/                     # Server modules (routing, websocket, thumbnails,
│                            #   PDF, slide operations) and a few client
│                            #   scripts (shortcuts_help.js, syntax_help.js)
├── static/js/               # Server-side helpers (markdown to HTML, versioning)
├── scripts/                 # Client libraries: straptoc.js/.css, CodeMirror,
│   │                        #   keymaster, Artyom, screenfull
│   └── vendor/              # Third-party libraries and fonts, formerly
│                            #   loaded from CDNs (see its README)
├── views/                   # Nunjucks templates
│   ├── diapos/
│   │   ├── d0.html, d1.html ... # Slide contents (markdown)
│   │   └── diapo.html       # Template shared by all slides
│   ├── config_deck.yaml     # Deck title, background image, PDF title
│   ├── begin.html           # Page head shared by all views
│   ├── modif_css.html       # Slide-level CSS (videos, fonts...)
│   ├── <feature>/           # One folder per feature: navigation, memos,
│   │                        #   decorate, handle_position, voice...
│   ├── text.html            # Markdown editor
│   ├── diapo_all.html       # All slides view
│   ├── saved/               # Saved versions of the slides
│   └── thumbnails/          # Generated thumbnails (git-ignored)
└── public/                  # Public resources (images, videos)
```

## Usage

### Keyboard Shortcuts

#### Navigation
<small>

- **Left/Right arrows**: Navigate between slides
- **Page Up/Page Down**: Navigate between slides (alternative)
- **Alt+A**: View all slides
- **Alt+M**: View miniatures

</small>

#### Editing
<small>

- **Double-click**: Switch to editing mode (on slide elements)
- **Alt+T**: Switch to markdown editing mode
- **Alt+T** (in edit mode): Return to presentation mode

</small>

#### Slide Management
<small>

- **Ctrl+P**: Create a new slide
- **Ctrl+D**: Duplicate current slide
- **Alt+Ctrl+X**: Delete current slide

</small>

#### Display & Presentation
<small>

- **Down arrow**: Show next line (progressive visualization)
- **Up arrow**: Show previous line (progressive visualization)
- **Ctrl+M**: Show/hide memos indicators
- **Ctrl+S**: Save position of images and equations
- **Ctrl+C**: Edit the slide configuration (CSS)
- **Alt+Ctrl+P**: Generate a PDF from the thumbnails

</small>

#### Help
<small>

- **Ctrl+H**: Show keyboard shortcuts help
- **Alt+V**: Show voice commands help
- **Ctrl+V**: Toggle voice recognition
- In the editor, the **Syntax** button (or a double-click in the line-number gutter) shows the markdown syntax help

</small>

### Available URLs

- `/d0`, `/d1`, `/d2`, etc.: Individual slides
- `/text`: Editing mode (current slide)
- `/all`: View all slides
- `/all_mini`: View all slides as miniatures

### Editing

1. Access the text view (`http://127.0.0.1:3067/text`, or **Alt+T** from a slide)
2. Edit the markdown content in the CodeMirror editor
3. Submit the changes
4. Changes are automatically saved with versioning

### Voice Control

The application supports voice commands in French via Artyom.js for:
- Navigation between slides
- Fullscreen mode activation
- Displaying memos
- And more

### Special Markdown Syntax

The system supports enriched markdown syntax with special markers:

#### Page Layout
- `!deck_title`: Presentation title (title page)
- `!author`: Author name
- `!date`: Presentation date
- `!head`: Slide header
- `!foot`: Slide footer

#### Content
- `!eq <formula>`: Mathematical equation (LaTeX syntax)
- `!pos<x>/<y>`: Position an image or equation at coordinates (x,y)
- `!['description' WxH %id%](imgs/file.jpg)`: Insert image with dimensions

#### Memos/Notes
- `!memo0`, `!memo1`, etc.: Mark a phrase as having an associated memo
- `$memo0`, `$memo1`, etc.: Define the memo content
- Use **Ctrl+M** to show/hide memo indicators
- Click on a marked phrase to display its memo

#### Videos
- `[title ;;](https://www.youtube.com/watch?v=...)`: YouTube video
- `[title %%](videos/file.mp4)`: local video (subtitles from `file.vtt` if present)
- A video sits folded under its title; click **[-]** to unfold it. It opens over the slide without moving the text, in a frame with a translucent mat.
- Drag the bottom-right corner to resize it (16/9 kept), drag its frame to move it. The size is not saved.

#### Progressive Visualization & Styling
- `!stp`: Mark a stop point for progressive content reveal
- Color annotations: `"text"cb` (blue), `"text"cg` (green), `"text"co` (orange), etc.

## Main Dependencies

- **Express**: Web framework
- **Socket.io**: Real-time communication
- **Nunjucks**: Template engine
- **CodeMirror**: Code editor
- **Artyom.js**: Voice recognition
- **JSDOM**: Server-side DOM manipulation

## Configuration

- `config.yaml`: viewport size (also used for the thumbnails), color bar, number of miniatures per row, favicon...
- `views/config_deck.yaml`: deck title, background image, PDF title

## Slide Versioning

Each slide modification is automatically saved in `views/saved/` with a timestamp. The system keeps up to 10 versions per slide.

## Known Issues

### Outdated Dependencies

Several dependencies are outdated and have security vulnerabilities. It is recommended to update them:

```bash
npm audit fix
```

## Author

LC

## License

ISC
