# Abdul's Terminal Portfolio

A GNOME-style desktop with a CLI-first personal site. All content is data-driven via JSON.

## Update Your Content

Edit `data/profile.json` to update:
- Name, bio, skills, projects, experience
- Social links and email
- Resume PDF path
- Images and logos

Put images and PDFs in `assets/` and reference them from the JSON.

## Local Dev

```bash
cd /Users/asheikh9725/aiprojects/abdulnine7.github.io
python3 -m http.server 8000
```

Open `http://localhost:8000`.
