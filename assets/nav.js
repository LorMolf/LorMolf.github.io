import { site } from "/data/site.js";
import { escapeHtml, parseLinks, GLYPHS } from "/assets/util.js";

const NAV = [
  { id: "home", label: "About", href: "/", cls: "" },
  { id: "pubs", label: "Publications", href: "/publications/", cls: "pubs" },
  { id: "cv", label: "CV", href: "/cv/", cls: "cv" }
];

// Brand paths from Simple Icons (CC0); decorative, with visible link labels.
const ICONS = {
  Scholar: '<path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/>',
  GitHub: '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
  X: '<path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/>',
  'University page': '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m3 8 9-5 9 5v2H3zM5 10v9m5-9v9m4-9v9m5-9v9M3 19h18v2H3z"/></g>',
  Email: '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14"/><path d="m3 6 9 7 9-7"/></g>'
};

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
    `<a href="${escapeHtml(l.href)}" target="_blank" rel="me noopener">${ICONS[l.label] ? `<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">${ICONS[l.label]}</svg>` : ""}<span class="link-label">${escapeHtml(l.label)} ↗</span></a>`).join("");

  host.innerHTML = `
    <a class="nav-name" href="/">${escapeHtml(site.name)}</a>
    <div class="nav-role">${role}</div>
    <hr class="nav-divider">
    <nav class="nav-items">${items}</nav>
    <div class="nav-links">${links}</div>
    <div class="nav-foot">
      <button class="theme-toggle" id="theme-toggle" type="button" aria-label="Toggle light and dark theme">○ / ●</button>
    </div>`;

  const btn = document.getElementById("theme-toggle");
  btn.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", cur);
    try{ localStorage.setItem("theme", cur); }catch(e){}
  });
}
