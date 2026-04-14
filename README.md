# Portfolio — Dinuja Thishean

Personal portfolio site: skills, education, experience, extracurricular achievements, certifications, and projects.

## About

A passionate Cyber Security undergraduate at SLIIT with hands-on experience in networking, vulnerability assessment, and web application development. I enjoy solving real-world problems through projects and aim to grow as a skilled security professional.

## Live site

GitHub Pages must be turned on once in the repo (see **`SETUP-GITHUB-PAGES.txt`**). If **Deployments** shows failed **`github-pages`** runs, your Pages **Source** is probably still set to **GitHub Actions** — switch it to **Deploy from a branch** → **`main`** as described there.

**Quick setup:** **Settings → Pages → Source:** *Deploy from a branch* → **Branch:** `main` → folder **`/ (root)`** → Save. Wait a minute, then open:

**https://dinujathishean.github.io/Portfolio/**

Pushing to `main` updates the site automatically; no separate deploy workflow is required.

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
