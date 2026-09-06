import { bibTeX } from "/data/bibtex.js";

export const GLYPHS = ["§","¶","∇","‡"];

export function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

// Escape text before applying the small, authored inline-emphasis syntax.
function emphasis(text){
  return escapeHtml(text).replace(/\*\*([^*]+)\*\*|\*([^*]+)\*/g, (_, bold, italic) =>
    bold !== undefined ? `<strong>${bold}</strong>` : `<em>${italic}</em>`);
}

// [text](url), **bold**, *italic* -> safe inline HTML.
export function parseLinks(str){
  const out = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0, m;
  while((m = re.exec(str))){
    if(m.index > last) out.push(emphasis(str.slice(last, m.index)));
    out.push(`<a href="${escapeHtml(m[2])}" target="_blank" rel="noopener">${emphasis(m[1])}</a>`);
    last = m.index + m[0].length;
  }
  if(last < str.length) out.push(emphasis(str.slice(last)));
  return out.join("");
}

// bold occurrences of `name` within an author string
export function boldAuthor(authors, name){
  return escapeHtml(authors).replace(name, `<strong>${name}</strong>`);
}

// LaTeX-glyph mark in a colored box (cycles § ¶ ∇ ‡ and 3 tag colors)
export function markByIndex(i){
  return `<span class="mk c${i%3}">${GLYPHS[i%4]}</span>`;
}

// Shared publication-type tag across lists and paper pages.
export function typeLabel(type){
  const t = { conference: "Conference", journal: "Journal", preprint: "Preprint", submitted: "Submitted", thesis: "Thesis" }[type] || type;
  return `<span class="typelabel ${escapeHtml(type)}">${t}</span>`;
}


// topic tag chip
export function topicTag(t){
  return `<span class="topictag">${escapeHtml(t)}</span>`;
}

// return the official DBLP BibTeX for a publication if we have it; otherwise
// fall back to an approximate entry generated from the publication metadata.
export function bibtex(p){
  if(bibTeX && bibTeX[p.id]) return bibTeX[p.id];
  const last = (p.authors.split(",")[0].trim().match(/[A-Za-z]+$/)||["Molfetta"])[0].toLowerCase();
  const firstWord = (p.title.replace(/[^A-Za-z ]/g,"").trim().split(/\s+/)[0]||"paper").toLowerCase();
  const key = last + p.year + firstWord;
  const authors = p.authors.replace(/,\s*([^,]+)$/, " and $1");
  const entryType = p.type === "journal" || p.type === "preprint" ? "article" : "inproceedings";
  let s = `@${entryType}{${key},\n`;
  s += `  title   = {${p.title}},\n`;
  s += `  author  = {${authors}},\n`;
  s += `  year    = {${p.year}},\n`;
  if(p.type === "preprint"){
    const aid = (p.links && p.links.arxiv || "").replace("https://arxiv.org/abs/","");
    if(aid) s += `  eprint  = {${aid}},\n  archivePrefix = {arXiv},\n`;
    s += `  journal = {arXiv preprint},\n`;
  } else {
    s += `  booktitle = {${p.venue}},\n`;
  }
  if(p.links && p.links.arxiv) s += `  url     = {${p.links.arxiv}},\n`;
  s += `}`;
  return s;
}

export function venueHtml(venue, venueLinks){
  const key = Object.keys(venueLinks).find(k => venue.includes(k));
  if(key) return `<a href="${venueLinks[key]}" target="_blank" rel="noopener">${escapeHtml(venue)}</a>`;
  return escapeHtml(venue);
}
