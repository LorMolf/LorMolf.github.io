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
1. Add hand-maintained metadata to `data/publications.js` (title, ordered authors,
   status, links, `tldr` and the official abstract). Add its citation to
   `data/bibtex.js` and any announcement to `data/news.js`.
2. Audit the complete source inventory into `../all-visuals/<id>.json` and place
   its crops in `assets/paper-img/<id>/complete/`. Keep source PDFs, extraction
   notes and local filesystem paths outside the published tree.
3. Write sections in `../all-visuals/narrative-review/<id>.json`, classify every
   visual as main, selected appendix or omitted with a reason, and update the
   independent `parent-main-coverage.json` audit. Reference each selected visual
   once with `{{visual:Figure 1}}` (or its source label) on its own line. Preserve
   assets for omitted inventory entries: the visual importer verifies them too.
4. From the site root, run the pipeline in order:
   ```sh
   uv run --with pillow python scripts/import-visuals.py ../all-visuals
   python3 scripts/import-narratives.py ../all-visuals/narrative-review
   node scripts/gen-pages.mjs
   ```
5. Run the checks below and inspect the rendered page before publishing.

Publication metadata is hand-maintained in `data/publications.js`; its narrative
sections, `visualSelection` and optional `abstractRich` are regenerated from the
review JSON. `data/paper-visuals.js`, the per-paper HTML shells and `sitemap.xml`
are generated. Edit the source records, not those generated fields. A rich
abstract may add emphasis only: the importer requires its plain text to equal
the official abstract exactly. Public source-note wording is deliberately
maintained in `scripts/import-visuals.py`, never copied from private audit notes.

**Never disclose an under-review venue**, including in news, source notes or
comments. For an unpublished manuscript with a public arXiv version, use
`type: "preprint"`, `venue: "arXiv preprint"` and the authoritative arXiv citation.
Use `conference` or `journal` only after acceptance is established, and describe
accepted work as accepted until proceedings or a journal publication is verified.
Use `type: "thesis"` for theses. `abstractSource` links to public provenance.

## Verify before publishing
Bind the local server explicitly to the address used by the browser check:
```
python3 -m http.server 8766 --bind 127.0.0.1
```
Then, in another terminal:
```
uv run --with playwright python scripts/check-site.py --base http://127.0.0.1:8766/
python3 scripts/check-spsd-numbers.py
git diff --check
```
The browser check covers every page at five widths in both themes, paper
descriptions, math, images, sidebar icons, filters, citation copying and links.
Use `--base https://lormolf.github.io/` to repeat it after deployment.

`check-spsd-numbers.py` re-derives every figure quoted on the SPSD page from the
manuscript itself (Table 1, the Figure 3 CSV, and the abstract) and fails on any
drift. It needs the Overleaf clone and skips where that is absent.

Note: if you rename a paper's `id`, the script writes the new directory but does
not delete the old one — remove it by hand.
