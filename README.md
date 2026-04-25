# Shellfolio

A fully interactive Ubuntu GNOME desktop environment built entirely with HTML, CSS, and JavaScript. No frameworks, no build tools, no dependencies — just open `index.html` in a browser.

Shellfolio works as a developer portfolio disguised as a Linux desktop. Visitors interact with a working terminal, explore apps, and discover your profile through a familiar desktop experience.

**Live:** [linuxy.us](https://linuxy.us)

---

## Features

- **Window Management** — Drag, resize, minimize, maximize, and layer windows like a real desktop
- **Working Terminal** — 70+ commands, fake filesystem, nano/vim editors, Python & Node REPLs
- **Profile Portfolio** — About, Experience, Education, Skills, Projects, and Contact sections
- **Settings App** — Theme (dark/light), accent colors, wallpapers, dock position, font scaling
- **Activities Launcher** — Search and launch apps with the grid overlay (click "Activities" or press Super)
- **Dock** — Pinned app shortcuts with active indicators and customizable icon size/position
- **15 Apps** — Terminal, Files, Text Editor, Browser, Calculator, Calendar, Weather, Music Player, System Monitor, Snake Game, Image Viewer, PDF Viewer, Photo Booth, Profile, Settings

---

## Project Structure

```
shellfolio/
├── index.html                  # Entry point — loads CSS, defines dock & layout
├── data/
│   └── profile.js              # All personal data (edit this to make it yours)
├── js/
│   ├── window-loader.js        # Fetches window HTML and loads JS dynamically
│   ├── desktop.js              # Window drag/resize, titlebar buttons, clock
│   ├── window-utils.js         # Shared positioning helpers
│   └── activities.js           # App launcher overlay and search
├── css/
│   ├── main.css                # Base typography, reset, shared styles
│   ├── desktop.css             # Grid layout, top panel, dock, context menu
│   ├── terminal.css            # Terminal colors and themes
│   ├── settings.css            # Settings panel UI components
│   ├── profile.css             # Profile card layouts
│   └── [app].css               # One stylesheet per app (13 more)
├── windows/                    # Each app is a folder with .html and .js
│   ├── terminal/
│   ├── profile/
│   ├── settings/
│   ├── files/
│   ├── notepad/
│   ├── browser/
│   ├── calculator/
│   ├── calendar/
│   ├── weather/
│   ├── music/
│   ├── monitor/
│   ├── snake/
│   ├── imageviewer/
│   ├── pdfviewer/
│   └── photobooth/
└── assets/
    ├── wallpapers/             # Ubuntu wallpaper images
    ├── music/                  # Audio tracks for the music player
    └── images/                 # Profile photo, company logos, icons
```

---

## Make It Your Own

All personal data lives in a single file: **`data/profile.js`**. Edit it and reload the page.

### What to Change

| Section | What It Controls |
|---|---|
| `site.title` | Browser tab title |
| `site.domain` | Domain shown in terminal and profile |
| `terminal.promptUser` | Username in the terminal prompt |
| `terminal.promptHost` | Hostname in the terminal prompt |
| `about.name` | Your name displayed in the Profile app |
| `about.headline` | Tagline under your name |
| `about.profileImage` | Path to your profile photo |
| `about.bio` | Array of bio paragraphs |
| `quickStats` | Key-value pairs shown in the About card |
| `education` | School, degree, period, GPA |
| `experience` | Company, role, period, location, logo path, bullet points |
| `skills.proficient` | Skill tags (primary) |
| `skills.familiar` | Skill tags (secondary) |
| `projects` | Name, description, tech stack, URL |
| `contact` | GitHub, LinkedIn, Instagram, email, repo URL |
| `resume.pdf` | Path to your resume PDF |
| `aboutDesktop` | Copyright, credits, OS label |

### Example

```javascript
// data/profile.js

var PROFILE = {
  site: {
    title: "Jane's Shellfolio",
    domain: "janedoe.dev"
  },
  terminal: {
    promptUser: "jane",
    promptHost: "janedoe.dev",
    hostname: "ubuntu-server"
  },
  about: {
    name: "Jane Doe",
    headline: "Full-Stack Engineer",
    profileImage: "assets/images/profile.png",
    bio: [
      "I build things for the web.",
      "Currently at Acme Corp working on distributed systems."
    ]
  },
  // ... rest of your data
};
```

### Adding Your Assets

- **Profile photo** — Replace `assets/images/profile.png` with your image (keep the same filename, or update the path in `profile.js`)
- **Company logos** — Add SVG/JPG/PNG files to `assets/images/` and reference them in the `experience[].logo` field
- **Resume** — Place your PDF in `assets/pdf/` and update `resume.pdf` in `profile.js`

---

## Adding a New App

1. **Create the app folder and files:**

```
windows/myapp/
├── myapp.html
└── myapp.js
```

2. **Write the HTML** (`windows/myapp/myapp.html`):

```html
<div id="myapp-window" class="desktop-window minimized">
  <div id="myapp-header">
    <div id="myapp-title">My App</div>
    <div class="title-buttons">
      <span class="title-btn btn-min" title="Minimize">&#x2013;</span>
      <span class="title-btn btn-max" title="Maximize">&#x25FB;</span>
      <span class="title-btn btn-close" title="Close">&#x2715;</span>
    </div>
  </div>
  <div id="myapp-body">
    <!-- Your app content -->
  </div>
  <div id="myapp-resize-handle"></div>
</div>
```

3. **Write the JS** (`windows/myapp/myapp.js`) — Reference any existing app (e.g., `windows/weather/weather.js`) for the standard pattern: dock click handler, window button handlers, and initial positioning with `randomPositionWindow()`.

4. **Register in the window loader** (`js/window-loader.js`):

```javascript
var windows = [
  // ... existing entries
  { html: 'windows/myapp/myapp.html', js: 'windows/myapp/myapp.js' }
];
```

5. **Add a dock icon** in `index.html` inside the `#dock` div:

```html
<div class="dock-icon" data-app="myapp" data-pinned title="My App">
  <svg viewBox="0 0 24 24" fill="#ffffff"><!-- your icon SVG --></svg>
</div>
```

6. **Add to the Activities launcher** in `js/activities.js` — add an entry to the `apps` array and the `windowMap` object.

7. **(Optional) Add a CSS file** — Create `css/myapp.css` and link it in `index.html`.

---

## Theming

The theming system uses CSS custom properties and body classes. All settings persist in `localStorage`.

| Setting | CSS Mechanism | Storage Key |
|---|---|---|
| Accent color | `--accent-color` on `:root` | `shell-accent` |
| Dark/Light theme | `body.light-theme` class | `shell-theme` |
| Font scaling | `body.font-small` / `body.font-large` classes (CSS `zoom`) | `shell-font-size` |
| Wallpaper | Inline `background-image` on `#desktop-area` | `shell-wallpaper` |
| Dock icon size | Inline style on `#dock` | `shell-dock-icon-size` |
| Dock position | `#ubuntu-desktop.dock-bottom` class | `shell-dock-position` |
| Animations | `body.no-animations` class | `shell-animations` |

To reset all settings, clear localStorage: `localStorage.clear()` in the browser console.

---

## Terminal Commands

The terminal supports 70+ commands. Here are the highlights:

**Navigation & Files:** `ls`, `cd`, `pwd`, `mkdir`, `touch`, `rm`, `cp`, `mv`, `cat`, `find`, `tree`

**Editors:** `nano`, `vim` (both open interactive editors inside the terminal)

**System Info:** `whoami`, `hostname`, `uname`, `uptime`, `date`, `cal`, `df`, `free`, `ps`, `top`, `neofetch`

**Dev Tools:** `git`, `python3` (REPL), `node` (REPL), `ssh`, `wget`, `curl`, `grep`, `sort`, `head`, `tail`, `wc`

**Fun:** `cowsay`, `fortune`, `figlet`, `sl`, `matrix`, `cmatrix`, `hack`, `snake`, `weather`, `joke`, `quote`

**Terminal themes:** Type `theme` to cycle through green, amber, blue, and light terminal color schemes.

---

## Running Locally

No build step required. Just serve the files:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .

# Or open index.html directly in a browser
```

> Note: Some features (fetch-based window loading, audio playback) require serving over HTTP rather than opening the file directly.

---

## Tech Stack

- **HTML5** — Semantic markup, no templates or frameworks
- **CSS3** — Grid layout, custom properties, `color-mix()`, transitions
- **Vanilla JavaScript** — ES5-compatible, no transpilation needed
- **Google Fonts** — Ubuntu font family (300, 400, 500, 700)

Zero runtime dependencies. Total project size is under 2 MB.

---

## License

&copy; Abdul Noushad Sheikh 2026
