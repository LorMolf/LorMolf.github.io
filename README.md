# lormolf.github.io

Personal site of Lorenzo Molfetta — plain static (no build), a warm LaTeX-inspired
layout with a light beige palette and dark-green / dark-red accents.

## Structure
- `index.html` — home (bio, research, news, selected pubs, contact)
- `publications/index.html` — full publication list (filters, year groups)
- `cv/index.html` — curriculum vitae
- `assets/` — `styles.css`, `util.js`, `nav.js`, `home.js`, `pubs.js`, `cv.js`
- `data/` — `site.js`, `news.js`, `publications.js`, `cv.js` (edit content here)
- `photo.svg` — placeholder portrait (replace with `photo.png`, then update
  `photo:` in `data/site.js`)

## Run locally
```
python3 -m http.server 8000
```
then open http://localhost:8000/

## Deploy
Force-push this directory's contents to `main` of
`https://github.com/LorMolf/LorMolf.github.io.git`. GitHub Pages will serve it
at https://lormolf.github.io/ (`.nojekyll` keeps raw files untouched).
