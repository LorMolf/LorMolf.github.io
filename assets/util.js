export const GLYPHS = ["§","¶","∇","‡"];

export function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

// [text](url) -> inline links; returns HTML string
export function parseLinks(str){
  const out = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0, m;
  while((m = re.exec(str))){
    if(m.index > last) out.push(escapeHtml(str.slice(last, m.index)));
    out.push(`<a href="${escapeHtml(m[2])}" target="_blank" rel="noopener">${escapeHtml(m[1])}</a>`);
    last = m.index + m[0].length;
  }
  if(last < str.length) out.push(escapeHtml(str.slice(last)));
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

// small-caps typewriter publication type label
export function typeLabel(type){
  const t = type === "conference" ? "Conf" : type === "journal" ? "Journal" : "Preprint";
  return `<span class="typelabel ${escapeHtml(type)}">${t}</span>`;
}

// first / co-first author tag
export function authorTag(role){
  if(role === "first") return `<span class="authortag first">First author</span>`;
  if(role === "cofirst") return `<span class="authortag cofirst">Co-first</span>`;
  return "";
}

export function venueHtml(venue, venueLinks){
  const key = Object.keys(venueLinks).find(k => venue.includes(k));
  if(key) return `<a href="${venueLinks[key]}" target="_blank" rel="noopener">${escapeHtml(venue)}</a>`;
  return escapeHtml(venue);
}
