import { publications, me, venueLinks } from "/data/publications.js";
import { paperVisuals } from "/data/paper-visuals.js";
import { escapeHtml, boldAuthor, typeLabel, topicTag, venueHtml, bibtex } from "/assets/util.js";

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

// Keep native Markdown tables readable on narrow screens.
function wrapMarkdownTables(root){
  root.querySelectorAll("table").forEach(t=>{
    if(t.parentElement.classList.contains("paper-table-wrap")) return;
    const wrap = document.createElement("div");
    wrap.className = "paper-table-wrap";
    t.parentNode.insertBefore(wrap, t);
    wrap.appendChild(t);
  });
}

function configureMarked(visuals){
  if(!window.marked) return;
  const m = window.marked;
  if(m.setOptions){
    m.setOptions({ gfm:true, breaks:false, headerIds:true, mangle:false });
  }
  // Keep Markdown from interpreting TeX subscripts as emphasis before KaTeX runs.
  m.use({ extensions: [{
    // Callout block:  :::claim Title\n body \n:::   (kinds: claim, note, warn)
    // Gives the narrative structure beyond flat paragraphs.
    name: "calloutBlock",
    level: "block",
    start(src){ return src.indexOf("\n:::"); },
    tokenizer(src){
      const match = /^:::(claim|note|warn|key)(?:[ \t]+([^\n]*))?\n([\s\S]*?)\n:::(?:\n|$)/.exec(src);
      if(match) return {
        type:"calloutBlock", raw:match[0], kind:match[1],
        title:(match[2]||"").trim(), tokens:this.lexer.blockTokens(match[3])
      };
    },
    renderer(token){
      const head = token.title
        ? `<p class="callout-h">${escapeHtml(token.title)}</p>` : "";
      return `<aside class="callout callout-${token.kind}">${head}${this.parser.parse(token.tokens)}</aside>`;
    }
  },{
    // Inline accent: [c:red]text[/c]. Colours come from the site palette and
    // Figure 2, so prose highlights match the diagrams they describe.
    name: "accentSpan",
    level: "inline",
    start(src){ return src.indexOf("[c:"); },
    tokenizer(src){
      const match = /^\[c:(red|blue|green|gold|pink|cyan)\]([\s\S]+?)\[\/c\]/.exec(src);
      if(match) return {
        type:"accentSpan", raw:match[0], tone:match[1],
        tokens:this.lexer.inlineTokens(match[2])
      };
    },
    renderer(token){
      return `<span class="accent accent-${token.tone}">${this.parser.parseInline(token.tokens)}</span>`;
    }
  },{
    name: "sourceVisual",
    level: "block",
    start(src){ return src.indexOf("{{visual:"); },
    tokenizer(src){
      const match = /^\{\{visual:([^}\n]+)\}\}(?:\n|$)/.exec(src);
      if(match) return {type:"sourceVisual", raw:match[0], label:match[1]};
    },
    renderer(token){
      const v = visuals.items.find(v => v.label === token.label);
      if(!v) throw new Error(`Unknown source visual: ${token.label}`);
      return `<figure class="source-visual" data-label="${escapeHtml(v.label)}" data-kind="${v.kind}">
        <a href="${escapeHtml(v.src)}" aria-label="Open full-resolution ${escapeHtml(v.label)}">
          <img src="${escapeHtml(v.src)}" alt="${escapeHtml(v.caption)}" width="${v.width}" height="${v.height}" loading="lazy" style="max-width:min(100%,${v.displayWidth}px)">
        </a>
        <figcaption><strong>${escapeHtml(v.label)}</strong> · PDF ${v.pages?.length > 1 ? `pp. ${escapeHtml(v.pages.join(", "))}` : `p. ${v.page}`}<br>${escapeHtml(v.caption)}${v.sourceNote ? ` ${escapeHtml(v.sourceNote)}` : ""}${v.sourceUrl ? ` <a href="${escapeHtml(v.sourceUrl)}" target="_blank" rel="noopener">Supplement source ↗</a>` : ""}</figcaption>
      </figure>`;
    }
  }, {
    // Interactive corpus explorer. Renders only a mount point: no <img> and no
    // <figure>, so the figure invariants the site check enforces are untouched.
    name: "sourceExplorer",
    level: "block",
    start(src){ return src.indexOf("{{explorer:"); },
    tokenizer(src){
      const match = /^\{\{explorer:([a-z0-9-]+)\}\}(?:\n|$)/.exec(src);
      if(match) return {type:"sourceExplorer", raw:match[0], name:match[1]};
    },
    renderer(token){
      return `<div class="paper-interactive" data-spsd-explorer="${escapeHtml(token.name)}"></div>`;
    }
  }, {
    name: "mathSource",
    level: "inline",
    start(src){ return src.search(/\$|\\\(|\\\[/); },
    tokenizer(src){
      const match = /^(\$\$[\s\S]+?\$\$|\$[^\n$]+?\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\])/.exec(src);
      if(match) return { type: "mathSource", raw: match[0] };
    },
    renderer(token){ return `<span class="math-source">${escapeHtml(token.raw)}</span>`; }
  }] });
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
  const visuals = paperVisuals[p.id];
  // Anchor order follows document order: abstract now leads the page.
  const anchorLinks = [{ id: "abstract", title: "Abstract" }, ...sections, { id: "citation", title: "Citation" }]
    .map(s=>`<a href="#${escapeHtml(s.id)}">${escapeHtml(s.title)}</a>`)
    .join("");

  root.innerHTML = `
    <div class="paper-back"><a href="/publications/">← all publications</a></div>
    <div class="paper-tags">${(p.tags||[]).map(topicTag).join("")}</div>
    <h1 class="paper-title">${escapeHtml(p.title)}</h1>
    <p class="paper-sub">${escapeHtml(p.tldr || "")}</p>
    <div class="paper-authors">${boldAuthor(p.authors, me)}</div>
    <div class="paper-meta">${typeLabel(p.type)} <span class="paper-venue">${venueHtml(p.venue, venueLinks)} · ${p.year}</span></div>
    <div class="paper-links">
      ${read?`<a class="plink" href="${escapeHtml(read)}" target="_blank" rel="noopener">paper ↗</a>`:""}
      ${arxiv?`<a class="plink" href="${escapeHtml(arxiv)}" target="_blank" rel="noopener">arXiv ↗</a>`:""}
      ${pdf?`<a class="plink" href="${escapeHtml(pdf)}" target="_blank" rel="noopener">PDF ↗</a>`:""}
      ${code?`<a class="plink" href="${escapeHtml(code)}" target="_blank" rel="noopener">code ↗</a>`:""}
      ${doi?`<a class="plink" href="${escapeHtml(doi)}" target="_blank" rel="noopener">DOI ↗</a>`:""}
    </div>
    <nav class="paper-anchors" aria-label="On this page">${anchorLinks}</nav>
    <p class="paper-source">${escapeHtml(visuals.source.note)} ${visuals.source.url ? `<a href="${escapeHtml(visuals.source.url)}" target="_blank" rel="noopener">Source ↗</a>` : ""}</p>

    <h2 class="paper-h" id="abstract">Abstract</h2>
    <p class="paper-abs"${p.abstractRich ? ' data-abs-rich' : ''}>${p.abstract ? escapeHtml(p.abstract) : '<span class="muted">Official abstract to be added.</span>'}</p>
    ${p.abstractSource ? `<p class="paper-source"><a href="${escapeHtml(p.abstractSource)}" target="_blank" rel="noopener">Abstract source ↗</a></p>` : ""}

    ${sections.map(s=>`
      <h2 class="paper-h" id="${escapeHtml(s.id)}">${escapeHtml(s.title)}</h2>
      <div class="paper-body" data-section="${escapeHtml(s.id)}"></div>
    `).join("")}

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
    configureMarked(visuals);
    sections.forEach(s=>{
      const host = root.querySelector(`[data-section="${CSS.escape(s.id)}"]`);
      if(host){ host.innerHTML = window.marked.parse(s.body||""); }
    });
    // The abstract carries inline emphasis only; parseInline keeps it one <p>.
    const abs = root.querySelector(".paper-abs[data-abs-rich]");
    if(abs && p.abstractRich){ abs.innerHTML = window.marked.parseInline(p.abstractRich); }
    // Preserve old incoming #visuals links without a separate gallery section.
    const firstVisual = root.querySelector(".source-visual");
    if(firstVisual) firstVisual.id = "visuals";
    wrapMarkdownTables(root);
    runKatex(root);
    import("/assets/live-plots.js")
      .then(m => m.mountLivePlots(root))
      .catch(() => { /* static figures remain */ });
    if(root.querySelector("[data-spsd-explorer]")){
      import("/assets/spsd-explorer.js")
        .then(m => m.mountSpsdExplorer(root))
        .catch(() => { /* prose remains without the explorer */ });
    }
  });
}
