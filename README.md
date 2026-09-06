# lormolf.github.io

Personal site of Lorenzo Molfetta — plain static, with a Riso Notes print treatment,
Computer Modern typography, warm paper, green/red/gold accents and a monochrome portrait.

## Structure
- `index.html` — home (bio, research, news, selected pubs, contact)
- `publications/index.html` — full publication list (filters, year groups)
- `publications/<id>/index.html` — one page per paper (clean URL, no query string)
- `cv/index.html` — curriculum vitae
- `assets/` — `styles.css`, `util.js`, `nav.js`, `home.js`, `pubs.js`, `cv.js`, `paper.js`
- `data/` — `site.js`, `news.js`, `publications.js`, `cv.js` (edit content here)
- `scripts/gen-pages.mjs` — regenerates the per-paper pages and `sitemap.xml`
- `photo.jpg` — optimised profile portrait, displayed in grayscale via CSS

## Run locally
```
python3 -m http.server 8000
```
then open http://localhost:8000/

## Deploy
Commit reviewed changes and push normally (never force-push) to `main` of
`https://github.com/LorMolf/LorMolf.github.io.git`. GitHub Pages will serve it
at https://lormolf.github.io/ (`.nojekyll` keeps raw files untouched).

## Adding a paper
1. Add the entry to `data/publications.js`.
2. Run `node scripts/gen-pages.mjs` — this writes `publications/<id>/index.html`
   for every paper and refreshes `sitemap.xml`.
3. Commit the generated files and push.

Use `type: "submitted"` for a submitted manuscript, not `journal`; include an
explicit submission venue and an `@unpublished` citation until accepted. Use
`type: "thesis"` for theses. Every entry has a short `tldr`, a full sourced
`abstract`, and article `sections`; `abstractSource` links to public provenance.

## Verify before publishing
With the local server running on port 8766:
```
node scripts/gen-pages.mjs
uv run --with playwright python scripts/check-site.py
git diff --check
```
The browser check covers every page at five widths in both themes, paper
descriptions, math, images, sidebar icons, filters, citation copying and links.
Use `--base https://lormolf.github.io/` to repeat it after deployment.

Note: if you rename a paper's `id`, the script writes the new directory but does
not delete the old one — remove it by hand.
