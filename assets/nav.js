import { site } from "/data/site.js";
import { escapeHtml, parseLinks, GLYPHS } from "/assets/util.js";

const NAV = [
  { id: "home", label: "About", href: "/", cls: "" },
  { id: "pubs", label: "Publications", href: "/publications/", cls: "pubs" },
  { id: "cv", label: "CV", href: "/cv/", cls: "cv" }
];

export function renderNav(current){
  const host = document.getElementById("nav");
  if(!host) return;
  host.className = "nav";
  const role = (site.roleLines || []).map(r => `<div>${parseLinks(r)}</div>`).join("");
  const items = NAV.map((n,i) => `
    <a class="nav-item ${n.cls} ${current===n.id?"active":""}" href="${n.href}">
      <span class="mk c${i%3}">${GLYPHS[i%4]}</span>${escapeHtml(n.label)}
    </a>`).join("");
  const links = (site.links || []).map(l =>
    `<a href="${escapeHtml(l.href)}" target="_blank" rel="me noopener">${escapeHtml(l.label)} ↗</a>`).join("");

  host.innerHTML = `
    <a class="nav-name" href="/">${escapeHtml(site.name)}</a>
    <div class="nav-role">${role}</div>
    <hr class="nav-divider">
    <nav class="nav-items">${items}</nav>
    <div class="nav-links">${links}</div>
    <div class="nav-foot">
      <button class="theme-toggle" id="theme-toggle" type="button">○ / ●</button>
    </div>`;

  const btn = document.getElementById("theme-toggle");
  btn.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", cur);
    try{ localStorage.setItem("theme", cur); }catch(e){}
  });
}
