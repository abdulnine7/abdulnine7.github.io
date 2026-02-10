# Shellfolio Desktop Portfolio

A desktop-style personal website that combines a Linux-like terminal with floating GNOME-inspired windows.

The project is fully static (`HTML/CSS/JS`) and data-driven through one JSON file.

## What This Project Includes

- Floating desktop windows (drag, resize, minimize, maximize, close)
- Terminal-style interface with command handling and autocomplete
- Profile window with section navigation (`About`, `Education`, `Skills`, `Experience`, `Projects`, `Resume`, `Contact`)
- About Desktop window
- Resume Viewer window (in-app PDF preview)
- Notepad app with localStorage persistence, word count, and line numbers
- Mobile behavior with alert window and adapted layout

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- jQuery (for specific UI interactions)
- jQuery Terminal assets (loaded via CDN)
- Devicon + Font Awesome icon libraries

## Quick Start

1. Clone and enter the project:

```bash
cd /projects/abdulnine7.github.io
```

2. Start a local static server (required for `fetch()` to load JSON and window fragments):

```bash
python3 -m http.server 8000
```

3. Open:

```text
http://localhost:8000
```

## Project Structure

```text
abdulnine7.github.io/
├─ index.html
├─ CNAME
├─ LICENSE
├─ README.md
├─ assets/
│  ├─ images/
│  └─ pdf/
├─ data/
│  └─ profile.json
├─ js/
│  ├─ cli.js
│  ├─ loginInfo.js
│  ├─ render.js
│  ├─ shell.js
│  └─ windowManager.js
├─ styles/
│  ├─ main.css
│  └─ prettyUI.css
└─ windows/
   ├─ terminal.html
   ├─ profile.html
   ├─ about-desktop.html
   ├─ resume.html
   ├─ notepad.html
   └─ alert.html
```

## Data Model (`data/profile.json`)

Primary content is driven from `data/profile.json`.

Key sections:

- `site`: title, prompt identity, domain
- `about`: name, headline, bio, profile image
- `education`
- `skills`: summary, proficiency buckets, icons
- `experience`: company roles and bullet points
- `projects`
- `contact`
- `resume`: PDF path
- `aboutDesktop`: About window metadata
- `assets`: loader/background/media paths

### Customization rule

If you are adapting this template for your own portfolio, start by changing only `data/profile.json` and asset files. Touch JS/CSS only when behavior/layout must change.

## How Rendering Works

- `index.html` defines dock and window containers (`data-window-id`, `data-window-src`)
- `js/windowManager.js` loads window HTML files and manages window lifecycle
- `js/render.js` loads `data/profile.json` and renders profile/about/resume content
- `js/cli.js` maps terminal commands to output/actions
- `js/shell.js` handles prompt, history, key events, and command execution

## Terminal Commands

Implemented user-facing commands:

- `help` or `help <command>`
- `whoami`
- `stats`
- `path`
- `pwd`
- `ls`
- `cd <directory>`
- `cat <file>.txt`
- `open <section>`
- `gui`
- `theme <default|amber|green|mono>`
- `history`
- `login`
- `clear`

Behavior notes:

- Terminal intro text is typed automatically.
- `login` is auto-typed/executed after intro.
- Closing terminal resets it to initial state for next open.

## Window System Behavior

Managed in `js/windowManager.js`.

- Drag by header
- Resize by bottom-right handle
- Minimize animates toward dock icon
- Re-open animation reverses from dock to window
- Close hides the window and can trigger state reset (e.g., terminal/profile)
- Dock toggles window visibility
- Fullscreen window behavior differs by viewport (desktop vs mobile CSS rules)

## Notepad App

Defined in `windows/notepad.html`.

Features:

- Auto-save content to `localStorage`
- Clear notes button
- Download notes as `.txt`
- Word count
- Line number gutter synced with scroll

Storage key used by app logic:

- `notepad.content`

## Resume Viewer

Defined in `windows/resume.html`.

- Embedded PDF via iframe
- Opened by resume actions in profile/CLI flows

## Mobile Behavior

- Dock reflows for small screens
- Window interactions are adapted
- Alert window can appear for mobile-first guidance
- Some desktop interactions (drag/resize) are intentionally reduced on mobile

## Add A New Window/App

1. Create `windows/<your-window>.html`
2. Add dock button in `index.html` with `data-window="<id>"`
3. Add window section in `index.html`:

```html
<section class="window" data-window-id="<id>" data-window-src="windows/<your-window>.html"></section>
```

4. If needed, add render/init logic in `js/windowManager.js` and/or `js/render.js`
5. Add styles in `styles/main.css` or `styles/prettyUI.css`

## Common Development Tasks

Update content:

- Edit `data/profile.json`

Update terminal command behavior:

- Edit `js/cli.js` and `js/shell.js`

Update window styling:

- Edit `styles/main.css` (global/window behavior)
- Edit `styles/prettyUI.css` (profile/settings-like layouts)

## Troubleshooting

If windows are blank:

- Ensure you are running via HTTP server, not opening `index.html` directly
- Check browser console for `fetch`/syntax errors
- Verify JSON validity in `data/profile.json`

If profile/about content does not render:

- Confirm `js/render.js` is loaded
- Confirm `window.profileReady` resolves successfully

If terminal behaves oddly:

- Clear browser storage and reload
- Check command wiring in `js/cli.js`

## License

This project is licensed under the MIT License. See `LICENSE`.
