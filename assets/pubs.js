import { publications, me, venueLinks } from "/data/publications.js";
import { escapeHtml, boldAuthor, typeLabel, authorTag, venueHtml } from "/assets/util.js";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "conference", label: "Conference" },
  { id: "journal", label: "Journal" },
  { id: "preprint", label: "Preprint" }
];

const state = { filter: "all" };

export function renderPubs(){
  const root = document.getElementById("content");
  if(!root) return;

  const list = publications
    .filter(p => state.filter === "all" || p.type === state.filter)
    .slice()
    .sort((a,b)=>b.year - a.year);

  let body = "", lastYear = null;
  for(const p of list){
    if(p.year !== lastYear){ body += `<div class="year-head">${p.year}</div>`; lastYear = p.year; }
    const arxiv = p.links && p.links.arxiv;
    const code = p.links && p.links.code;
    body += `<div class="pub-item">
      <div class="pub-top"><a class="pt" href="/publications/${escapeHtml(p.id)}/">${escapeHtml(p.title)}</a>${typeLabel(p.type)}${authorTag(p.role)}</div>
      <div class="pa">${boldAuthor(p.authors, me)}</div>
      <div class="pm">${venueHtml(p.venue, venueLinks)} · ${p.year}${arxiv?` <a href="${escapeHtml(arxiv)}" target="_blank" rel="noopener">arXiv ↗</a>`:""}${code?` <a href="${escapeHtml(code)}" target="_blank" rel="noopener">code ↗</a>`:""}</div>
    </div>`;
  }

  const chips = FILTERS.map(f=>`<button class="chip ${state.filter===f.id?"on":""}" data-f="${f.id}">${f.label}</button>`).join("");

  root.innerHTML = `
    <div class="eyebrow">Publications</div>
    <h1 class="page-title">Publications</h1>
    <p class="page-lede">Full list, newest first. <strong>${escapeHtml(me)}</strong> is highlighted in author lists. I am <strong>first or co-first</strong> author on every paper — <span class="authortag first">1st</span> first author, <span class="authortag cofirst">co-1st</span> co-first.</p>
    <div class="filters">${chips}</div>
    <div class="pub-list">${body || "<p>No entries.</p>"}</div>`;

  root.querySelectorAll(".chip").forEach(c=>{
    c.addEventListener("click", ()=>{ state.filter = c.dataset.f; renderPubs(); });
  });
}
