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
  const e = escapeHtml(authors);
  return e.replace(name, `<strong>${name}</strong>`);
}

// geometric mark by index/type
export function mark(kind){
  if(kind === "circle") return `<span class="mk mk-circle"></span>`;
  if(kind === "triangle") return `<span class="mk mk-tri"></span>`;
  return `<span class="mk mk-square"></span>`;
}
export function markByIndex(i){
  return mark(["square","circle","triangle"][i % 3]);
}

export function venueHtml(venue, venueLinks){
  const key = Object.keys(venueLinks).find(k => venue.includes(k));
  if(key) return `<a href="${venueLinks[key]}" target="_blank" rel="noopener">${escapeHtml(venue)}</a>`;
  return escapeHtml(venue);
}
