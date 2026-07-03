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
    `<div class="k">${escapeHtml(k.toUpperCase())}</div><div>${escapeHtml(v)}</div>`).join("");

  const service = (cv.service||[]).map(s=>`<li>${parseLinks(s)}</li>`).join("");
  const awards = (cv.awards||[]).map(s=>`<li>${parseLinks(s)}</li>`).join("");
  const talks = (cv.talks||[]).map(t=>`<li>${escapeHtml(t.title)} — ${escapeHtml(t.venue)}, ${escapeHtml(t.date||"")}</li>`).join("");

  root.innerHTML = `
    <div class="eyebrow">CURRICULUM VITAE</div>
    <h1 class="page-title">CV</h1>
    ${cv.pdfHref ? `<a class="btn cv-pdf" href="${escapeHtml(cv.pdfHref)}" target="_blank" rel="noopener">DOWNLOAD PDF ↓</a>` : `<p class="page-lede">PDF coming soon — fields marked [to edit] are placeholders.</p>`}

    <div class="cv-block"><div class="cv-h">EDUCATION</div>${rows(cv.education)}</div>
    <div class="cv-block"><div class="cv-h">EXPERIENCE</div>${rows(cv.experience)}</div>
    ${talks?`<div class="cv-block"><div class="cv-h">TALKS & POSTERS</div><ul class="cv-list">${talks}</ul></div>`:""}
    ${service?`<div class="cv-block"><div class="cv-h">SERVICE</div><ul class="cv-list">${service}</ul></div>`:""}
    ${awards?`<div class="cv-block"><div class="cv-h">AWARDS</div><ul class="cv-list">${awards}</ul></div>`:""}
    <div class="cv-block"><div class="cv-h">SKILLS & LANGUAGES</div><div class="cv-skills">${skills}</div></div>
    <div class="cv-block"><div class="cv-h">INTERESTS</div><p style="margin:0;font-size:16px;color:var(--muted)">${escapeHtml(cv.interests||"")}</p></div>`;
}
