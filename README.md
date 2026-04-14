# Portfolio — Dinuja Thishean

Personal portfolio site: skills, education, experience, extracurricular achievements, certifications, and projects.

## About

A passionate Cyber Security undergraduate at SLIIT with hands-on experience in networking, vulnerability assessment, and web application development. I enjoy solving real-world problems through projects and aim to grow as a skilled security professional.

## Live site

The [workflow](.github/workflows/deploy-github-pages.yml) pushes this folder to the **`gh-pages`** branch on every push to `main`.

1. Wait until the **Actions** tab shows a green run for **Deploy portfolio to GitHub Pages**.
2. **Settings → Pages → Build and deployment**
3. **Source:** choose **Deploy from a branch**
4. **Branch:** `gh-pages` — folder **`/ (root)`** — Save.

Then open:

**https://dinujathishean.github.io/Portfolio/**

## Tech stack

- Static HTML, CSS, and JavaScript (no framework build step)
- Responsive layout, light/dark theme
- Content driven by `data.json` (with an embedded copy in `index.html` for local `file://` use)

## Run locally

- Open `index.html` in a browser, or  
- Use `start.bat` / `serve-static.ps1` for a simple local server.

## GitHub repository description (optional)

To set the short description under the repository name on GitHub: **Settings → General → Description**, and paste:

`Cyber Security undergraduate portfolio — SLIIT | HTML/CSS/JS static site`

You can shorten or edit that line to fit the character limit.
