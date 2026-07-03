import { publications, me, venueLinks } from "/data/publications.js";
import { escapeHtml, boldAuthor, mark, venueHtml } from "/assets/util.js";

const FILTERS = [
  { id: "all", label: "ALL" },
  { id: "conference", label: "CONFERENCE" },
  { id: "journal", label: "JOURNAL" },
  { id: "preprint", label: "PREPRINT" }
];

const state = { filter: "all" };

function markFor(type){
  if(type === "conference") return mark("circle");
  if(type === "journal") return mark("square");
  return mark("triangle");
}

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
      ${markFor(p.type)}
      <div>
        <div class="pt">${escapeHtml(p.title)}</div>
        <div class="pa">${boldAuthor(p.authors, me)}</div>
        <div class="pm">${venueHtml(p.venue, venueLinks)} · ${p.type}${arxiv?` <a href="${escapeHtml(arxiv)}" target="_blank" rel="noopener">arXiv ↗</a>`:""}${code?` <a href="${escapeHtml(code)}" target="_blank" rel="noopener">code ↗</a>`:""}</div>
      </div>
    </div>`;
  }

  const chips = FILTERS.map(f=>`<button class="chip ${state.filter===f.id?"on":""}" data-f="${f.id}">${f.label}</button>`).join("");

  root.innerHTML = `
    <div class="eyebrow">PUBLICATIONS</div>
    <h1 class="page-title">Publications</h1>
    <p class="page-lede">Full list, newest first. <strong>${escapeHtml(me)}</strong> is highlighted in author lists.</p>
    <div class="filters">${chips}</div>
    <div class="pub-list">${body || "<p>No entries.</p>"}</div>`;

  root.querySelectorAll(".chip").forEach(c=>{
    c.addEventListener("click", ()=>{ state.filter = c.dataset.f; renderPubs(); });
  });
}
