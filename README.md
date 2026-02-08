# Terminal Portfolio

A GNOME-style desktop with a CLI-first personal site. The UI is windowed, data-driven, and easy to customize by editing a single JSON file.

## Project Structure

```
assets/
  images/
  pdf/
data/
  profile.json
js/
  cli.js
  loginInfo.js
  render.js
  shell.js
  windowManager.js
styles/
  main.css
  prettyUI.css
windows/
  about-desktop.html
  profile.html
  terminal.html
index.html
```

## Customize Content

Edit `data/profile.json` to update all text and links.

Key areas in `data/profile.json`:
- `site` for the owner name, handle, domain, and prompt text.
- `about` for the bio and contact quick facts.
- `skills`, `education`, `experience`, `projects` for the main profile sections.
- `contact` for email, social links, and location.
- `resume` for the PDF path.
- `aboutDesktop` for the GNOME-style About window details.
- `assets` for image paths used across the site.

Put images in `assets/images` and PDFs in `assets/pdf`. Use relative paths in the JSON, for example `assets/images/profile.png`.

## Add Or Rename Sections

To add a new GUI section:
1. Add a new section in `data/profile.json`.
2. Update `js/render.js` to render the section.
3. Add a sidebar entry in `windows/profile.html` and wire it to `showSection`.

To add a new window:
1. Create a new file in `windows/`.
2. Add a dock button in `index.html` with `data-window`.
3. Add a window `<section>` in `index.html` with `data-window-id` and `data-window-src`.
4. If the window needs data, create a render function in `js/render.js` and call it from `js/windowManager.js` after the HTML loads.

To change CLI commands or directories, update `struct` and `commandHelp` in `js/cli.js`.


## License

This project is licensed under the MIT License. See `LICENSE`.
