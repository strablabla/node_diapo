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

- Node.js 20.19 or later (jsdom 27 needs `^20.19`, `^22.12` or `>=24`), with npm: https://nodejs.org

Once installed, presenting needs no internet connection: all libraries and fonts are served locally (`scripts/vendor/`). Only YouTube videos need the network.

## Installation

```bash
git clone https://github.com/strablabla/node_diapo.git
```

Then run the installer of your system, from the `node_diapo` folder:

- **Windows**: double-click `install.bat`
- **Linux, macOS**: `./install.sh` (or double-click it, if your file manager runs scripts)

It checks the Node version, runs `npm install` (which also downloads the headless Chrome that Puppeteer uses for the slide thumbnails), and puts a **node_diapo** launcher on the Desktop:

- Linux: a `.desktop` file, also added to the applications menu
- macOS: a `node_diapo.app`
- Windows: a shortcut, with the application's icon

The launcher starts the server with no window. Its messages are in the page (**Ctrl+Shift+D**, Terminal tab) and in `logs/node_diapo.log`, started afresh at each launch. `start_diapo.bat`, or `start_diapo.sh` from a terminal, keeps them in a window, to look into a server that does not start.

The work is done by `install.js`, the same on every OS. Run it again after moving the folder or upgrading Node: the launcher calls Node by its full path, so that it works where the `PATH` is not set (an app started from the macOS Finder, Node installed with nvm). `node install.js --no-npm` only recreates the launcher.

## Starting the Application

Double-click the **node_diapo** launcher on the Desktop, or run `start_diapo.sh` (Linux, macOS) / `start_diapo.bat` (Windows), or simply:

```bash
node html_app.js
```

The application will start at `http://127.0.0.1:3067/d0`

The browser will automatically open on the first slide. A few seconds after startup, the server takes a screenshot of every slide with Puppeteer; these thumbnails (`views/thumbnails/`, not tracked by git) are shown above the slider at the bottom of the screen and used for the PDF export.

### Stopping the Application

It can be stopped from the right-click menu ("Stop node_diapo"). Otherwise the server stops by itself 2 minutes after the last browser tab on it was closed (changing slides reloads the page, which is why it waits). Set `idle_shutdown_sec` in `config.yaml`, or in the configuration panel (Ctrl+Shift+C), to change the delay, or to `0` to keep it running until stopped by hand (Ctrl+C in its terminal). The hidden tabs that make the thumbnails do not count.

If the server stops while pages are still open (Ctrl+C, terminal closed, crash), those pages show a red banner saying so, instead of looking alive while nothing is saved any more. Once node_diapo is started again they reconnect by themselves and the banner goes.

Starting the application while it is already running does not fail: the browser opens on the running instance. If port 3067 is held by another program, the start stops with a message saying so.

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
- **Ctrl+Shift+C**: Configuration panel (slide style, general settings)
- **Ctrl+Shift+D**: Debug panel (the server's terminal, the page's console)
- **Alt+Ctrl+P**: Generate a PDF from the thumbnails as they are
- **Right click** on the slide: menu to export the PDF (thumbnails taken again first, so it shows the slides as they are now), open the configuration, or stop node_diapo. Shift+right click gives the browser's menu.

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
- `[title %%](videos/file.mp4)`: local video, from `public/` (subtitles from `file.vtt` next to it, if present). MP4 (H.264), WebM or Ogg.
- **Drag and drop** a video file onto a slide to add it: it is stored in `public/videos/` and a `[title %%](videos/...)` line is appended to the slide. `public/videos/` is not tracked by git (videos are heavy): copy it by hand to another machine.
- A video sits folded under its title; click **[-]** to unfold it. It opens over the slide without moving the text, in a white frame: drag the frame to move it, click **×** in its top-right corner to close it (a playing video stops).
- Resize it from the bottom-right corner: of the video for YouTube (16/9 kept), of the frame for a local video (the video's own corner holds the fullscreen button). The size and position are not saved.

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

- `config.yaml`: viewport size (also used for the thumbnails), color bar, number of miniatures per row, favicon, `idle_shutdown_sec` (see Stopping the Application)...
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
