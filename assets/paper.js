import { publications, me, venueLinks } from "/data/publications.js";
import { escapeHtml, boldAuthor, typeLabel, authorTag, topicTag, venueHtml, bibtex } from "/assets/util.js";

// wait for the deferred vendor scripts (KaTeX + marked) to be ready
function whenReady(){
  return new Promise(resolve=>{
    const check = () => {
      if(window.marked && window.renderMathInElement) return resolve();
      setTimeout(check, 30);
    };
    check();
  });
}

// post-process rendered markdown: standalone images w/ title -> <figure><figcaption>,
// tables -> wrapped in scroll container, narrow images flagged
function enhanceMarkdown(root){
  // figures: <p><img ...></p> or lone <img> with a title attribute
  root.querySelectorAll("img").forEach(img=>{
    const p = img.parentElement;
    const isAlone = p && p.tagName === "P" && p.childNodes.length === 1;
    const fig = document.createElement("figure");
    if(/narrow/i.test(img.alt)) img.classList.add("narrow");
    img.removeAttribute("title");
    if(isAlone){ p.replaceWith(fig); }
    else { img.parentNode.insertBefore(fig, img); }
    fig.appendChild(img);
    const cap = img.getAttribute("data-caption") || img.getAttribute("alt") || "";
    if(cap && cap !== "narrow"){
      const fc = document.createElement("figcaption");
      fc.innerHTML = window.marked && window.marked.parseInline ? window.marked.parseInline(cap) : cap;
      fig.appendChild(fc);
    }
  });
  // tables: wrap for horizontal scroll
  root.querySelectorAll("table").forEach(t=>{
    if(t.parentElement.classList.contains("paper-table-wrap")) return;
    const wrap = document.createElement("div");
    wrap.className = "paper-table-wrap";
    t.parentNode.insertBefore(wrap, t);
    wrap.appendChild(t);
  });
  // mark cells containing ** ** or <strong> as best? leave as-is; authors can add a class.
}

// Custom handling: we author captions via the title attribute of ![](), which marked
// turns into title="...". We move it to data-caption before stripping above.
function rescueImageTitles(html){
  // marked keeps the title verbatim; we capture it into data-caption.
  return html.replace(/<img([^>]*?)title="([^"]*)"([^>]*)>/gi, (m, a, title, b)=>{
    return `<img${a} data-caption="${title.replace(/"/g,"&quot;")}"${b}>`;
  });
}

// marked image rendering: we want a <figure> friendly output. We use the default <img>
// and post-process. But marked wraps lone images in <p>; that's fine (handled above).
function configureMarked(){
  if(!window.marked) return;
  const m = window.marked;
  if(m.setOptions){
    m.setOptions({ gfm:true, breaks:false, headerIds:true, mangle:false });
  }
}

function runKatex(root){
  try{
    window.renderMathInElement(root, {
      delimiters:[
        {left:"$$", right:"$$", display:true},
        {left:"$", right:"$", display:false},
        {left:"\\[", right:"\\]", display:true},
        {left:"\\(", right:"\\)", display:false}
      ],
      throwOnError:false,
      strict:false
    });
  }catch(e){ /* KaTeX not ready — ignore */ }
}

export function renderPaper(){
  const root = document.getElementById("content");
  if(!root) return;
  const id = (location.pathname.split("/").filter(Boolean).pop() || "");
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
  const read = p.links && p.links.read;

  const sections = Array.isArray(p.sections) ? p.sections : [];
  const anchorLinks = sections
    .map(s=>`<a href="#${escapeHtml(s.id)}">${escapeHtml(s.title)}</a>`)
    .join("");

  root.innerHTML = `
    <div class="paper-back"><a href="/publications/">← all publications</a></div>
    <div class="paper-tags">${(p.tags||[]).map(topicTag).join("")}</div>
    <h1 class="paper-title">${escapeHtml(p.title)}</h1>
    <p class="paper-sub">${escapeHtml(p.tldr || "")}</p>
    <div class="paper-authors">${boldAuthor(p.authors, me)}</div>
    <div class="paper-meta">${typeLabel(p.type)} ${authorTag(p.role)} <span class="paper-venue">${venueHtml(p.venue, venueLinks)} · ${p.year}</span></div>
    <div class="paper-links">
      ${read?`<a class="plink" href="${escapeHtml(read)}" target="_blank" rel="noopener">paper ↗</a>`:""}
      ${arxiv?`<a class="plink" href="${escapeHtml(arxiv)}" target="_blank" rel="noopener">arXiv ↗</a>`:""}
      ${pdf?`<a class="plink" href="${escapeHtml(pdf)}" target="_blank" rel="noopener">PDF ↗</a>`:""}
      ${code?`<a class="plink" href="${escapeHtml(code)}" target="_blank" rel="noopener">code ↗</a>`:""}
      ${doi?`<a class="plink" href="${escapeHtml(doi)}" target="_blank" rel="noopener">DOI ↗</a>`:""}
    </div>
    ${sections.length?`<nav class="paper-anchors">${anchorLinks}</nav>`:""}

    ${sections.map(s=>`
      <h2 class="paper-h" id="${escapeHtml(s.id)}">${escapeHtml(s.title)}</h2>
      <div class="paper-body" data-section="${escapeHtml(s.id)}"></div>
    `).join("")}

    <h2 class="paper-h" id="abstract">Abstract</h2>
    <p class="paper-abs">${p.abstract ? escapeHtml(p.abstract) : '<span class="muted">Official abstract to be added.</span>'}</p>

    <h2 class="paper-h" id="citation">Citation</h2>
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

  // render markdown bodies once `marked` is available, then run KaTeX
  whenReady().then(()=>{
    configureMarked();
    sections.forEach(s=>{
      const host = root.querySelector(`[data-section="${CSS.escape(s.id)}"]`);
      if(host){ host.innerHTML = rescueImageTitles(window.marked.parse(s.body||"")); }
    });
    enhanceMarkdown(root);
    runKatex(root);
  });
}
