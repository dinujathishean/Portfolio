# Portfolio — Dinuja Thishean

Personal portfolio site: skills, education, experience, extracurricular achievements, certifications, and projects.

## About

A passionate Cyber Security undergraduate at SLIIT with hands-on experience in networking, vulnerability assessment, and web application development. I enjoy solving real-world problems through projects and aim to grow as a skilled security professional.

## Live site

### Vercel (recommended)

Import this repo in [Vercel](https://vercel.com) — see **`VERCEL-DEPLOY.txt`**. Set **Root Directory** to **`project`**, framework **Other**, no build command. That is the most reliable setup (site loads at your `.vercel.app` URL root).

### GitHub Pages (optional)

See **`SETUP-GITHUB-PAGES.txt`**. Use **Deploy from a branch** → **`main`** → **`/project`** — not **GitHub Actions**, or old workflows can show failed **`github-pages`** deployments.

**https://dinujathishean.github.io/Portfolio/** (after Pages is enabled as above.)

## Tech stack

- Static HTML, CSS, and JavaScript (no framework build step)
- Responsive layout, light/dark theme
- Content driven by **`project/data.json`** (with an embedded copy in **`project/index.html`** for local `file://` use)

## Repository layout

- **`project/`** — static portfolio (HTML, CSS, JS, `assets/`, manifest).
- **Repo root** — `start.bat`, `serve-static.ps1`, deploy notes, `README.md`.

## Run locally

- Open **`project/index.html`** in a browser, or  
- Use **`start.bat`** / **`serve-static.ps1`** (serves the **`project/`** folder over HTTP).

## GitHub repository description (optional)

To set the short description under the repository name on GitHub: **Settings → General → Description**, and paste:

`Cyber Security undergraduate portfolio — SLIIT | HTML/CSS/JS static site`

You can shorten or edit that line to fit the character limit.
