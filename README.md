# Md Tamim Iqbal — Portfolio (Full-Stack)

Premium dark-futuristic portfolio + built-in admin CMS.
**Stack:** Node.js · Express · MongoDB (optional) · Vanilla JS · JWT auth

## ✦ Features
| Area | What you get |
|---|---|
| Public site | Hero with neural-net animation, typing roles, About + count-up stats, Education & test scores (IELTS/GRE), Research/Publications (status filter, abstract toggle, **one-click BibTeX cite**), Projects (category filter, 3D tilt, detail modal + shareable page), Experience timeline, Skills, Awards/Certifications, Blog (Markdown + code highlighting), Contact form, social links, ⌘K command palette, scroll progress, SEO + JSON-LD, mobile responsive, reduced-motion support |
| Admin `/admin` | Password login, add/edit/delete/reorder: Projects, Research, Blog posts (live Markdown preview), Education, Test scores, Experience, Skills, Achievements · Profile & 10 social links · Contact inbox · Backup/restore JSON |
| Backend | REST API, JWT (7-day), rate-limited login & contact, honeypot spam filter, Helmet security headers, input sanitizing, JSON-file **or** MongoDB storage |

## ✦ Run locally (2 minute)
```bash
npm install
cp .env.example .env        # then edit ADMIN_PASSWORD and JWT_SECRET
npm start
```
- Site → http://localhost:3000
- Admin → http://localhost:3000/admin

Without `MONGODB_URI`, data is saved in `data/db.json`.

## ✦ Deploy (free) — Render + MongoDB Atlas (recommended)
1. **MongoDB Atlas** → create free M0 cluster → Database Access: add user → Network Access: allow `0.0.0.0/0` → copy connection string (`mongodb+srv://...`).
2. Push this folder to a **GitHub** repo.
3. **render.com** → New → *Blueprint* → select the repo (it reads `render.yaml`).
4. Set env vars: `ADMIN_PASSWORD` (strong), `MONGODB_URI` (from step 1). `JWT_SECRET` auto-generates.
5. Deploy → open `https://your-app.onrender.com/admin` and start adding content.

> ⚠ Render/Railway free disks reset on redeploy, so **use MongoDB** there, otherwise edits will be lost.

**Other options:** Railway (`Procfile` included) · any VPS (`npm start` behind Nginx, or `docker build -t portfolio . && docker run -p 3000:3000 --env-file .env portfolio`).

## ✦ Photo, CV & images
Put files in `public/assets/` (e.g. `photo.jpg`, `cv.pdf`), push, then in Admin → Profile use `/assets/photo.jpg` and `/assets/cv.pdf`. Any public image URL also works (GitHub, Cloudinary, Imgur).

## ✦ Custom domain
Render → Settings → Custom Domains → add your domain → set the CNAME at your registrar.

## ✦ Customize design
All colors/fonts are CSS variables at the top of `public/css/style.css` (`--mint`, `--violet`, `--f-display`…).

## ✦ Project structure
```
server/   index.js (API + static), store.js (JSON/Mongo), seed.js (starter content)
public/   index.html, post.html, project.html, 404.html, css/, js/, vendor/, assets/
public/admin/  CMS (index.html, admin.js, admin.css)
```
`npm run reset-data` restores starter content (local JSON mode).
