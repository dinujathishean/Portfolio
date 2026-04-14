# Portfolio — Dinuja Thishean

Personal portfolio site: skills, education, experience, extracurricular achievements, certifications, and projects.

## About

A passionate Cyber Security undergraduate at SLIIT with hands-on experience in networking, vulnerability assessment, and web application development. I enjoy solving real-world problems through projects and aim to grow as a skilled security professional.

## Live site

### Vercel (recommended)

Import this repo in [Vercel](https://vercel.com) — set **Root Directory** to **`web`** (see **`VERCEL-DEPLOY.txt`**). Static site, no build command. You get an `https://*.vercel.app` URL that updates on every push.

### GitHub Pages (optional)

See **`SETUP-GITHUB-PAGES.txt`**. Use **Deploy from a branch** → **`main`** → **`/web`** (the site files live under **`web/`**) — not **GitHub Actions**, or old workflows can show failed **`github-pages`** deployments.

**https://dinujathishean.github.io/Portfolio/** (after Pages is enabled as above.)

## Tech stack

- Static HTML, CSS, and JavaScript (no framework build step)
- Responsive layout, light/dark theme
- Content driven by `web/data.json` (with an embedded copy in `web/index.html` for local `file://` use)

## Repository layout

- **`web/`** — the static site (HTML, CSS, JS, `assets/`, manifest). This is what Vercel/Netlify/GitHub Pages should publish.
- **Repo root** — scripts (`start.bat`), deployment notes, and `README.md`.

## Run locally

- Open **`web/index.html`** in a browser, or  
- Use **`start.bat`** / **`serve-static.ps1`** (serves the **`web/`** folder over HTTP).

## GitHub repository description (optional)

To set the short description under the repository name on GitHub: **Settings → General → Description**, and paste:

`Cyber Security undergraduate portfolio — SLIIT | HTML/CSS/JS static site`

You can shorten or edit that line to fit the character limit.
