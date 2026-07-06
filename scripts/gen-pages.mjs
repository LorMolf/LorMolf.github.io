import { publications } from "../data/publications.js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const ORIGIN = "https://lormolf.github.io";

const escapeHtml = (s) =>
  String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

const shell = (p) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(p.title)} — Lorenzo Molfetta</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="canonical" href="${ORIGIN}/publications/${encodeURIComponent(p.id)}/">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/aaaakshat/cm-web-fonts@latest/fonts.css">
<link rel="stylesheet" href="/assets/styles.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<script>(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js"></script>
</head>
<body>
<div class="shell">
  <header id="nav" data-current="pubs"></header>
  <main id="content" class="main"></main>
  <footer id="foot"></footer>
</div>
<script type="module">
  import { renderNav } from "/assets/nav.js";
  import { renderPaper } from "/assets/paper.js";
  renderNav("pubs");
  renderPaper();
</script>
</body>
</html>
`;

const written = [];
for (const p of publications) {
  const dir = resolve(root, "publications", p.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "index.html"), shell(p));
  written.push(p.id);
}

const top = [
  { loc: `${ORIGIN}/`, priority: "1.0" },
  { loc: `${ORIGIN}/publications/`, priority: "0.8" },
  { loc: `${ORIGIN}/cv/`, priority: "0.7" },
];
const paperUrls = publications.map((p) => ({
  loc: `${ORIGIN}/publications/${encodeURIComponent(p.id)}/`,
  priority: "0.6",
}));
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  [...top, ...paperUrls]
    .map((u) => `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority></url>`)
    .join("\n") +
  `\n</urlset>\n`;
writeFileSync(resolve(root, "sitemap.xml"), sitemap);

console.log(`wrote ${written.length} paper pages:`);
for (const id of written) console.log(`  publications/${id}/index.html`);
console.log("updated sitemap.xml");
