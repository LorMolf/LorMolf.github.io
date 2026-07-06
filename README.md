# lormolf.github.io

Personal site of Lorenzo Molfetta — plain static (no build), a warm LaTeX-inspired
layout with a light beige palette and dark-green / dark-red accents.

## Structure
- `index.html` — home (bio, research, news, selected pubs, contact)
- `publications/index.html` — full publication list (filters, year groups)
- `publications/<id>/index.html` — one page per paper (clean URL, no query string)
- `cv/index.html` — curriculum vitae
- `assets/` — `styles.css`, `util.js`, `nav.js`, `home.js`, `pubs.js`, `cv.js`, `paper.js`
- `data/` — `site.js`, `news.js`, `publications.js`, `cv.js` (edit content here)
- `scripts/gen-pages.mjs` — regenerates the per-paper pages and `sitemap.xml`
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

## Adding a paper
1. Add the entry to `data/publications.js`.
2. Run `node scripts/gen-pages.mjs` — this writes `publications/<id>/index.html`
   for every paper and refreshes `sitemap.xml`.
3. Commit the generated files and push.

Note: if you rename a paper's `id`, the script writes the new directory but does
not delete the old one — remove it by hand.
