import { site } from "/data/site.js";
import { news } from "/data/news.js";
import { publications, me, venueLinks } from "/data/publications.js";
import { escapeHtml, parseLinks, boldAuthor, markByIndex, typeLabel, authorTag, venueHtml } from "/assets/util.js";

export function renderHome(){
  const root = document.getElementById("content");
  if(!root) return;

  const st = site.status || [];
  const status = st.length ? `
    <div class="status">
      ${st.map((s,i)=>`
        <div class="status-item s${s.c}">
          <span class="prompt">$</span>
          <span class="out">${escapeHtml(s.text)}${i===st.length-1?'<span class="cur"></span>':''}</span>
        </div>`).join("")}
    </div>` : "";

  const bio = (site.bio||[]).map(p => `<p>${parseLinks(p)}</p>`).join("");

  const items = (site.research.current||[]).concat(state.showMore ? (site.research.more||[]) : []);
  const researchItems = items.map((r,i)=>`
    <div class="research-item">
      ${markByIndex(i)}
      <div><div class="t">${escapeHtml(r.title)}</div><div class="b">${escapeHtml(r.blurb)}</div></div>
    </div>`).join("");

  const newsItems = (news||[]).slice(0,5).map((n,i)=>`
    <div class="news-item">
      ${markByIndex(i)}
      <span class="news-date">${escapeHtml(n.date)}</span>
      <span>${parseLinks(n.text)} ${n.href?`<a href="${escapeHtml(n.href)}" target="_blank" rel="noopener">↗</a>`:""}</span>
    </div>`).join("");

  const selected = publications.filter(p=>p.selected).sort((a,b)=>b.year-a.year);
  const pubs = selected.map(p=>{
    const arxiv = p.links && p.links.arxiv;
    return `<div class="pub-item">
      <div class="pub-top"><div class="pt">${escapeHtml(p.title)}</div>${typeLabel(p.type)}${authorTag(p.role)}</div>
      <div class="pm">${venueHtml(p.venue,venueLinks)} · ${p.year}${arxiv?` <a href="${escapeHtml(arxiv)}" target="_blank" rel="noopener">arXiv ↗</a>`:""}</div>
    </div>`;
  }).join("");

  root.innerHTML = `
    <div class="eyebrow">NLP · Retrieval-augmented LMs · Graph reasoning</div>
    ${status}
    <div class="bio-row">
      <div class="bio">${bio}</div>
      <div class="photo-frame">
        <div class="fr"><img src="${escapeHtml(site.photo)}" alt="${escapeHtml(site.name)}"></div>
        <div class="photo-cap">[ B/W portrait ]</div>
      </div>
    </div>
    <div class="research">
      <div class="research-lead">${escapeHtml(site.research.lead)}</div>
      <div class="research-list">${researchItems}</div>
      ${site.research.more && site.research.more.length ? `<button class="btn" id="more-btn" style="margin-top:18px">${state.showMore?"− show less":"+ more topics"}</button>`:""}
    </div>
    <div class="section">
      <div class="section-head"><span class="lbl">News</span><span class="mark">§</span></div>
      <div class="news-list">${newsItems}</div>
    </div>
    <div class="section">
      <div class="section-head"><span class="lbl">Selected publications</span><a class="all" href="/publications/">all →</a></div>
      <div class="pub-list">${pubs}</div>
    </div>
    <div class="contact">
      <span>Reach me at</span>
      <a class="em" href="${escapeHtml(site.emailHref)}">${escapeHtml(site.email)}</a>
      <span class="loc">${escapeHtml(site.location)}</span>
    </div>`;

  const mb = document.getElementById("more-btn");
  if(mb) mb.addEventListener("click", ()=>{ state.showMore = !state.showMore; renderHome(); });
}

const state = { showMore: false };
