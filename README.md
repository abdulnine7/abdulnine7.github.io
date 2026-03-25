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
│  ├─ render.js
│  ├─ terminal.js
│  └─ windowManager.js
├─ styles/
│  ├─ main.css
│  ├─ terminal.css
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
- `js/terminal.js` is the complete terminal engine — handles prompt, input, history, filesystem, command parsing, pipe/redirect, and all command implementations
- `styles/terminal.css` contains all terminal-specific styling (base, colors, themes, overlays)

## Terminal Commands

### Navigation & Files

- `ls`, `ls -la`, `ls -l`, `ls -a` — colored output (dirs=blue, files=white, hidden=gray, executables=green)
- `cd <dir>`, `cd ..`, `cd ~`, `cd /`
- `pwd`
- `mkdir <dir>` — creates in-memory directory
- `touch <file>` — creates empty file
- `rm <file>`, `rm -r <dir>`
- `rmdir <dir>`
- `cp <src> <dest>`, `mv <src> <dest>`
- `cat <file>` — displays file contents (portfolio data files + in-memory filesystem)
- `nano <file>` — in-terminal text editor (Ctrl+X to exit, Ctrl+S to save)
- `echo "text"`, `echo "text" > file`, `echo "text" >> file`
- `find . -name "*.txt"`
- `tree` — ASCII tree of current directory
- `grep <pattern> <file>`

### System Info

- `whoami`, `hostname`, `uname -a`
- `uptime` — fake uptime incrementing from page load
- `date` — real current date/time
- `cal` — calendar for current month
- `df -h`, `free -h` — fake disk/memory stats
- `top` / `htop` — animated process list (q to quit)
- `ps aux` — fake process list
- `lscpu`, `lsblk` — fake hardware info
- `ifconfig` / `ip addr` — fake network interfaces
- `neofetch` — system info with ASCII Ubuntu logo

### Fun Commands

- `sudo <anything>` — sassy rotating responses
- `hack` — fake hacking animation
- `matrix` / `cmatrix` — matrix rain animation
- `sl` — ASCII steam locomotive
- `cowsay <text>` — ASCII cow with speech bubble
- `fortune` — random sarcastic quote
- `figlet <text>` / `banner <text>` — large ASCII art text
- `yes <text>` — spams text until Ctrl+C
- `ping <host>` — fake ping with Ctrl+C to stop
- `weather` / `curl wttr.in` — fake ASCII weather report
- `telnet towel.blinkenlights.nl` — ASCII Star Wars crawl
- `apt install <pkg>` — fake install with progress bar
- `joke` — random programmer joke
- `quote` — random motivational/sarcastic quote
- `easter` / `easteregg` — hidden easter egg

### Editors & REPLs

- `vim` / `vi` — fake vim UI with `:q` escape hint
- `nano <file>` — textarea-based editor overlay
- `python3` — fake Python REPL (eval math, print(), exit())
- `node` — fake Node.js REPL

### Portfolio Integration

- `open <section>` — open GUI section (about, education, skills, experience, projects, resume, contact)
- `gui` — open the profile window
- `login` — fetch login IP/location (opt-in)
- `stats` — show profile highlights
- `help` or `help <command>` — formatted command reference
- `man <command>` — man page for supported commands
- `theme <default|amber|green|mono>` — switch terminal theme

### Pipe & Redirect

- `|` between commands: `echo hello | lolcat`, `ls | grep txt`
- `>` and `>>` for file redirection: `echo hello > file.txt`
- `&&` for chaining: `mkdir test && cd test`

### Keyboard Shortcuts

- `Ctrl+C` — interrupt running command
- `Ctrl+L` — clear screen
- `Up/Down` — command history navigation
- `Tab` — autocomplete filenames and commands
- `Ctrl+A` / `Ctrl+E` — jump to start/end of line

### Behavior Notes

- Terminal intro text is typed automatically on first open
- `login` is auto-typed/executed after intro
- Closing terminal resets it to initial state for next open
- In-memory filesystem persists during session (mkdir, touch, echo > file all work)
- Files from `profile.json` are available as `.txt` files in the home directory

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

- Edit `js/terminal.js`

Update terminal styling:

- Edit `styles/terminal.css`

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
- Check command wiring in `js/terminal.js`

## License

This project is licensed under the MIT License. See `LICENSE`.
