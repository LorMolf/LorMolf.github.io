import { cv } from "/data/cv.js";
import { escapeHtml, parseLinks } from "/assets/util.js";

function rows(items){
  return (items||[]).map(it=>`
    <div class="cv-row">
      <div class="where">
        <a class="org" href="${escapeHtml(it.href||"#")}" target="_blank" rel="noopener">${escapeHtml(it.org||it.school)}</a>
        <div class="role">${escapeHtml(it.degree||it.role||"")}</div>
        ${it.notes && it.notes.length ? `<ul class="notes">${it.notes.map(n=>`<li>${parseLinks(n)}</li>`).join("")}</ul>`:""}
      </div>
      <div class="meta">${escapeHtml(it.dates||"")}<br>${escapeHtml(it.place||"")}</div>
    </div>`).join("");
}

export function renderCV(){
  const root = document.getElementById("content");
  if(!root) return;

  const skills = Object.entries(cv.skills||{}).map(([k,v])=>
    `<div class="k">${escapeHtml(k)}</div><div>${escapeHtml(v)}</div>`).join("");

  const service = (cv.service||[]).map(s=>`<li>${parseLinks(s)}</li>`).join("");
  const awards = (cv.awards||[]).map(s=>`<li>${parseLinks(s)}</li>`).join("");
  const talks = (cv.talks||[]).map(t=>`<li>${escapeHtml(t.title)} — ${escapeHtml(t.venue)}, ${escapeHtml(t.date||"")}</li>`).join("");

  function thesesBlock(list){
    if(!list || !list.length) return "";
    const years = [...new Set(list.map(t=>t.y))].sort((a,b)=>b-a);
    let html = "";
    for(const y of years){
      html += `<div class="thesis-yr">${y}</div>`;
      for(const th of list.filter(t=>t.y===y)){
        const title = th.h ? `<a href="${escapeHtml(th.h)}" target="_blank" rel="noopener">${escapeHtml(th.t)}</a>` : escapeHtml(th.t);
        html += `<div class="thesis">
          <span class="lvl ${escapeHtml(th.l)}">${th.l==="m"?"MSc":"BSc"}</span>
          <div class="body"><div class="tt">${title}</div><div class="tc">${escapeHtml(th.c)}</div></div>
        </div>`;
      }
    }
    return `<div class="cv-block"><div class="cv-h">Supervised theses</div>${html}</div>`;
  }

  root.innerHTML = `
    <div class="eyebrow">Curriculum vitae</div>
    <h1 class="page-title">CV</h1>
    ${cv.pdfHref ? `<a class="btn cv-pdf" href="${escapeHtml(cv.pdfHref)}" target="_blank" rel="noopener">Download PDF ↓</a>` : `<p class="page-lede">PDF coming soon — fields marked [to edit] are placeholders.</p>`}

    <div class="cv-block"><div class="cv-h">Education</div>${rows(cv.education)}</div>
    <div class="cv-block"><div class="cv-h">Experience</div>${rows(cv.experience)}</div>
    ${talks?`<div class="cv-block"><div class="cv-h">Talks & posters</div><ul class="cv-list">${talks}</ul></div>`:""}
    ${service?`<div class="cv-block"><div class="cv-h">Service</div><ul class="cv-list">${service}</ul></div>`:""}
    ${awards?`<div class="cv-block"><div class="cv-h">Awards</div><ul class="cv-list">${awards}</ul></div>`:""}
    ${thesesBlock(cv.theses)}
    <div class="cv-block"><div class="cv-h">Skills & languages</div><div class="cv-skills">${skills}</div></div>
    <div class="cv-block"><div class="cv-h">Interests</div><p style="margin:0;font-size:16px;color:var(--muted)">${escapeHtml(cv.interests||"")}</p></div>`;
}
