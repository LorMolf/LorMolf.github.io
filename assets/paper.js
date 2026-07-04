import { publications, me, venueLinks } from "/data/publications.js";
import { escapeHtml, boldAuthor, typeLabel, authorTag, topicTag, venueHtml, bibtex } from "/assets/util.js";

export function renderPaper(){
  const root = document.getElementById("content");
  if(!root) return;
  const id = new URLSearchParams(location.search).get("id");
  const p = publications.find(x => x.id === id);

  if(!p){
    root.innerHTML = `<div class="paper-back"><a href="/publications/">← all publications</a></div>
      <h1 class="paper-title">Paper not found</h1>
      <p class="page-lede">No paper matches <code>${escapeHtml(id||"")}</code>.</p>`;
    return;
  }

  const arxiv = p.links && p.links.arxiv;
  const code = p.links && p.links.code;
  const doi = p.links && p.links.doi;
  const pdf = p.links && p.links.pdf;

  root.innerHTML = `
    <div class="paper-back"><a href="/publications/">← all publications</a></div>
    <div class="paper-tags">${(p.tags||[]).map(topicTag).join("")}</div>
    <h1 class="paper-title">${escapeHtml(p.title)}</h1>
    <p class="paper-sub">${escapeHtml(p.tldr || "")}</p>
    <div class="paper-authors">${boldAuthor(p.authors, me)}</div>
    <div class="paper-meta">${typeLabel(p.type)} ${authorTag(p.role)} <span class="paper-venue">${venueHtml(p.venue, venueLinks)} · ${p.year}</span></div>
    <div class="paper-links">
      ${arxiv?`<a class="plink" href="${escapeHtml(arxiv)}" target="_blank" rel="noopener">arXiv ↗</a>`:""}
      ${pdf?`<a class="plink" href="${escapeHtml(pdf)}" target="_blank" rel="noopener">PDF ↗</a>`:""}
      ${code?`<a class="plink" href="${escapeHtml(code)}" target="_blank" rel="noopener">code ↗</a>`:""}
      ${doi?`<a class="plink" href="${escapeHtml(doi)}" target="_blank" rel="noopener">DOI ↗</a>`:""}
    </div>

    ${p.figure?`<figure class="paper-figure"><img src="${escapeHtml(p.figure)}" alt="${escapeHtml(p.title)}"><figcaption>${escapeHtml(p.figureCaption||"")}</figcaption></figure>`:""}

    <h2 class="paper-h">Abstract</h2>
    ${p.abstract ? `<p class="paper-abs">${escapeHtml(p.abstract)}</p>` : `<p class="paper-abs muted">Official abstract to be added.</p>`}

    <h2 class="paper-h">TL;DR</h2>
    <p class="paper-abs">${escapeHtml(p.tldr || "")}</p>

    <h2 class="paper-h">Citation</h2>
    <div class="bibtex">
      <button class="btn copy-btn" id="copy-bib" type="button">copy</button>
      <pre id="bib">${escapeHtml(bibtex(p))}</pre>
    </div>`;

  const cb = document.getElementById("copy-bib");
  if(cb) cb.addEventListener("click", ()=>{
    const txt = document.getElementById("bib").textContent;
    if(navigator.clipboard) navigator.clipboard.writeText(txt);
    cb.textContent = "copied"; setTimeout(()=>{ cb.textContent = "copy"; }, 1200);
  });

  document.title = (p.title || "Paper") + " — Lorenzo Molfetta";
}
