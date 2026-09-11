/* Animated replacements for the SPSD line panels and Q50 surfaces.
   The source PNG stays in the DOM (site check counts one img per visual) and is
   hidden with visibility, so its layout box and aspect ratio survive. Falls back
   to that PNG when canvas, IntersectionObserver, or reduced motion say no. */
import { spsdTrajectories, spsdSurfaces } from "/data/spsd-plots.js";

const css = (name, fallback) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

function fitCanvas(canvas, cssWidth, cssHeight) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  canvas.style.width = cssWidth + "px";
  canvas.style.height = cssHeight + "px";
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

// ---------------------------------------------------------------- line panels
function drawTrajectories(ctx, W, H, progress) {
  const { panels, series, xticks } = spsdTrajectories;
  const ink = css("--ink", "#1a1611"), muted = css("--muted", "#6f685c");
  const soft = css("--line-soft", "#cfcabb"), card = css("--card", "#fff");
  const cols = panels.length;
  const padL = 42, padR = 12, padT = 26, padB = 46, gap = 22;
  const pw = (W - padL * cols - padR * cols - gap * (cols - 1)) / cols;
  const ph = H - padT - padB;
  const xmax = xticks[xticks.length - 1];

  ctx.clearRect(0, 0, W, H);
  ctx.textBaseline = "middle";

  panels.forEach((panel, pi) => {
    const ox = pi * (pw + padL + padR + gap) + padL;
    const X = (s) => ox + (s / xmax) * pw;
    const Y = (v) => padT + ph - ((v - panel.ymin) / (panel.ymax - panel.ymin)) * ph;

    ctx.fillStyle = card;
    ctx.fillRect(ox, padT, pw, ph);

    ctx.strokeStyle = soft;
    ctx.lineWidth = 0.6;
    ctx.font = "9px 'Computer Modern Typewriter', monospace";
    ctx.fillStyle = muted;
    ctx.textAlign = "right";
    panel.ticks.forEach((t) => {
      ctx.beginPath(); ctx.moveTo(ox, Y(t)); ctx.lineTo(ox + pw, Y(t)); ctx.stroke();
      ctx.fillText(String(t), ox - 5, Y(t));
    });
    ctx.textAlign = "center";
    xticks.forEach((t) => {
      ctx.beginPath(); ctx.moveTo(X(t), padT); ctx.lineTo(X(t), padT + ph); ctx.stroke();
      ctx.fillText(t === 1000 ? "1,000" : String(t), X(t), padT + ph + 12);
    });

    ctx.strokeStyle = soft; ctx.lineWidth = 1;
    ctx.strokeRect(ox, padT, pw, ph);

    ctx.fillStyle = ink;
    ctx.font = "10px 'Computer Modern Typewriter', monospace";
    ctx.fillText(panel.title, ox + pw / 2, padT - 13);
    ctx.fillStyle = muted;
    ctx.font = "9px 'Computer Modern Typewriter', monospace";
    ctx.fillText("training step", ox + pw / 2, padT + ph + 27);
    ctx.save();
    ctx.translate(ox - 30, padT + ph / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText(panel.ylabel, 0, 0);
    ctx.restore();

    // one continuous stroke per series, revealed left to right
    series.forEach((s) => {
      const vals = s[panel.key];
      const reach = progress * (s.steps.length - 1);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.7; ctx.lineJoin = "round"; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(X(s.steps[0]), Y(vals[0]));
      const whole = Math.floor(reach);
      for (let i = 1; i <= whole; i++) ctx.lineTo(X(s.steps[i]), Y(vals[i]));
      const frac = reach - whole;
      if (whole < s.steps.length - 1 && frac > 0) {
        ctx.lineTo(lerp(X(s.steps[whole]), X(s.steps[whole + 1]), frac),
                   lerp(Y(vals[whole]), Y(vals[whole + 1]), frac));
      }
      ctx.stroke();
      const hx = whole < s.steps.length - 1 && frac > 0
        ? lerp(X(s.steps[whole]), X(s.steps[whole + 1]), frac) : X(s.steps[whole]);
      const hy = whole < s.steps.length - 1 && frac > 0
        ? lerp(Y(vals[whole]), Y(vals[whole + 1]), frac) : Y(vals[whole]);
      ctx.fillStyle = s.color;
      ctx.beginPath(); ctx.arc(hx, hy, 2.2, 0, Math.PI * 2); ctx.fill();
    });
  });

  // shared legend
  ctx.font = "9px 'Computer Modern Typewriter', monospace";
  ctx.textAlign = "left";
  const widths = series.map((s) => ctx.measureText(s.label).width + 26);
  let lx = (W - widths.reduce((a, b) => a + b, 0)) / 2;
  const ly = H - 11;
  series.forEach((s, i) => {
    ctx.strokeStyle = s.color; ctx.lineWidth = 1.7;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 15, ly); ctx.stroke();
    ctx.fillStyle = muted; ctx.fillText(s.label, lx + 19, ly);
    lx += widths[i];
  });
}

// ------------------------------------------------------------------ surfaces
const VIRIDIS = [[68,1,84],[72,40,120],[62,74,137],[49,104,142],[38,130,142],
                 [31,158,137],[53,183,121],[109,205,89],[180,222,44],[253,231,37]];
function viridis(t) {
  const u = Math.max(0, Math.min(1, t)) * (VIRIDIS.length - 1);
  const i = Math.min(Math.floor(u), VIRIDIS.length - 2), f = u - i;
  const a = VIRIDIS[i], b = VIRIDIS[i + 1];
  return `rgb(${Math.round(lerp(a[0],b[0],f))},${Math.round(lerp(a[1],b[1],f))},${Math.round(lerp(a[2],b[2],f))})`;
}

const SURFACE_LEGEND_H = 20;   // key row under the panels
const SURFACE_BAR_W = 54;      // right-hand colour bar column

function drawSurfaces(ctx, W, H, progress) {
  const { panels, axes, view } = spsdSurfaces;
  const ink = css("--ink", "#1a1611"), muted = css("--muted", "#6f685c");
  const card = css("--card", "#fff");
  const cols = panels.length, gap = 10;
  const pw = (W - SURFACE_BAR_W - gap * (cols - 1)) / cols;
  const ph = H - SURFACE_LEGEND_H - 14;   // room for subcaptions + key row

  ctx.clearRect(0, 0, W, H);
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  panels.forEach((panel, pi) => {
    const ox = pi * (pw + gap), oy = 0;
    ctx.fillStyle = card;
    ctx.fillRect(ox, oy, pw, ph);

    // pgfplots view={az}{el}: basis vectors for azimuth h and elevation v.
    // Reproducing it exactly means the settled frame matches the paper.
    const h = (view.az * Math.PI) / 180, v = (view.el * Math.PI) / 180;
    const scale = Math.min(pw / 1.75, ph / 1.75);
    // Vertical extent of the projected box runs -1.221..0.373 in scale units.
    const cx = ox + pw / 2 + 8, cy = oy + ph / 2 + 0.424 * scale;
    const nx = (t) => (t - axes.xmin) / (axes.xmax - axes.xmin) - 0.5;
    const ny = (t) => (t - axes.ymin) / (axes.ymax - axes.ymin) - 0.5;
    const nz = (t) => (t - axes.zmin) / (axes.zmax - axes.zmin);
    const project = (x, y, z) => ({
      sx: cx + (x * Math.cos(h) + y * Math.sin(h)) * scale,
      sy: cy - (-x * Math.sin(h) * Math.sin(v) + y * Math.cos(h) * Math.sin(v)
                + z * Math.cos(v)) * scale,
      // positive = nearer the camera, for the painter's algorithm
      depth: x * Math.sin(h) * Math.cos(v) - y * Math.cos(h) * Math.cos(v) + z * Math.sin(v),
    });

    // floor
    ctx.strokeStyle = css("--line-soft", "#cfcabb");
    ctx.lineWidth = 0.5;
    for (let g = 0; g <= 4; g++) {
      const t = g / 4 - 0.5;
      const a = project(t, -0.5, 0), b = project(t, 0.5, 0);
      const c = project(-0.5, t, 0), d = project(0.5, t, 0);
      ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(c.sx, c.sy); ctx.lineTo(d.sx, d.sy); ctx.stroke();
    }

    // z scale on the left corner (xmin, ymax), where pgfplots puts it
    ctx.strokeStyle = muted; ctx.lineWidth = 0.7;
    const zBase = project(-0.5, 0.5, 0), zTop = project(-0.5, 0.5, 1);
    ctx.beginPath(); ctx.moveTo(zBase.sx, zBase.sy); ctx.lineTo(zTop.sx, zTop.sy); ctx.stroke();
    ctx.font = "7px 'Computer Modern Typewriter', monospace";
    ctx.fillStyle = muted; ctx.textAlign = "right";
    [0, 0.5, 1].forEach((t) => {
      const p = project(-0.5, 0.5, t);
      ctx.beginPath(); ctx.moveTo(p.sx - 2, p.sy); ctx.lineTo(p.sx + 2, p.sy); ctx.stroke();
      ctx.fillText(String(t), p.sx - 4, p.sy);
    });
    ctx.textAlign = "center";

    // The corner that matters: high value AND high agreement. Anchored to the
    // same (+x, +y) end the two arrows point at, drawn before the surface so
    // the mesh stays on top.
    const gq = [[0.2, 0.2], [0.5, 0.2], [0.5, 0.5], [0.2, 0.5]].map(([gx, gy]) => project(gx, gy, 0));
    ctx.beginPath();
    ctx.moveTo(gq[0].sx, gq[0].sy);
    for (let k = 1; k < 4; k++) ctx.lineTo(gq[k].sx, gq[k].sy);
    ctx.closePath();
    ctx.fillStyle = css("--red", "#8a2424");
    ctx.globalAlpha = 0.18; ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = css("--red", "#8a2424");
    ctx.lineWidth = 1; ctx.stroke();

    // quads, painter's algorithm, height eased in
    const quads = [];
    for (let j = 0; j < panel.y.length - 1; j++) {
      for (let i = 0; i < panel.x.length - 1; i++) {
        const corners = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([a, b]) => {
          const z = nz(panel.z[b][a]) * progress;
          return { ...project(nx(panel.x[a]), ny(panel.y[b]), z), z: panel.z[b][a] };
        });
        quads.push({ corners, depth: corners.reduce((s, c) => s + c.depth, 0) / 4,
                     mean: corners.reduce((s, c) => s + c.z, 0) / 4 });
      }
    }
    quads.sort((a, b) => a.depth - b.depth);   // farthest first
    quads.forEach((q) => {
      ctx.beginPath();
      ctx.moveTo(q.corners[0].sx, q.corners[0].sy);
      for (let k = 1; k < 4; k++) ctx.lineTo(q.corners[k].sx, q.corners[k].sy);
      ctx.closePath();
      ctx.fillStyle = viridis(q.mean / (axes.zmax || 1));
      ctx.globalAlpha = 0.72; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(0,0,0,.16)"; ctx.lineWidth = 0.35; ctx.stroke();
    });

    // Arrows run along the two floor edges that terminate at the marked
    // corner, so both point the way their variable increases. The label is
    // pushed perpendicular to its own arrow, on whichever side faces away
    // from the plot centre, so it never lands on the line or the surface.
    const origin = project(0, 0, 0);
    const arrow = (from, to, label) => {
      const a = project(...from), b = project(...to);
      ctx.strokeStyle = muted; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
      const ang = Math.atan2(b.sy - a.sy, b.sx - a.sx);
      ctx.beginPath();
      ctx.moveTo(b.sx, b.sy);
      ctx.lineTo(b.sx - 4 * Math.cos(ang - 0.42), b.sy - 4 * Math.sin(ang - 0.42));
      ctx.lineTo(b.sx - 4 * Math.cos(ang + 0.42), b.sy - 4 * Math.sin(ang + 0.42));
      ctx.closePath(); ctx.fillStyle = muted; ctx.fill();
      ctx.font = "7.5px 'Computer Modern Typewriter', monospace";
      ctx.fillStyle = muted;
      const cxm = (a.sx + b.sx) / 2, cym = (a.sy + b.sy) / 2;
      const px = -Math.sin(ang), py = Math.cos(ang);
      // Point the offset away from the plot centre.
      const side = (cxm - origin.sx) * px + (cym - origin.sy) * py >= 0 ? 1 : -1;
      const off = 14;
      const mx = cxm + px * off * side, my = cym + py * off * side;
      // Keep the label inside its own panel, allowing for its rendered width.
      const half = ctx.measureText(label).width / 2 + 3;
      ctx.fillText(label, Math.max(ox + half, Math.min(mx, ox + pw - half)), my);
    };
    arrow([-0.5, -0.6, 0], [0.5, -0.6, 0], `${axes.xlabel} →`);
    arrow([0.6, -0.5, 0], [0.6, 0.5, 0], `${axes.ylabel} →`);

    ctx.fillStyle = ink;
    ctx.font = "9px 'Computer Modern Typewriter', monospace";
    ctx.fillText(`(${"abcd"[pi]}) ${panel.title}`, ox + pw / 2, ph + 11);
  });

  // Vertical colour bar on the right, as in the paper, labelled 0..1.
  const barW = 9, barH = Math.max(40, ph * 0.52);
  const barX = W - SURFACE_BAR_W + 10, barY = (ph - barH) / 2;
  const grad = ctx.createLinearGradient(0, barY + barH, 0, barY);   // low at foot
  for (let s = 0; s <= 10; s++) grad.addColorStop(s / 10, viridis(s / 10));
  ctx.fillStyle = grad;
  ctx.fillRect(barX, barY, barW, barH);
  ctx.strokeStyle = css("--line-soft", "#cfcabb"); ctx.lineWidth = 0.5;
  ctx.strokeRect(barX, barY, barW, barH);
  ctx.font = "7.5px 'Computer Modern Typewriter', monospace";
  ctx.fillStyle = muted; ctx.textAlign = "left";
  ctx.fillText("1", barX + barW + 3, barY + 3);
  ctx.fillText("0", barX + barW + 3, barY + barH - 3);
  ctx.save();
  ctx.translate(barX + barW + 19, barY + barH / 2);
  ctx.rotate(Math.PI / 2);
  ctx.textAlign = "center";
  ctx.fillText(axes.zlabel, 0, 0);
  ctx.restore();

  // Winning-corner key, centred under the panels.
  ctx.textAlign = "left";
  const key = "high Q50 + high oracle@50: wins concentrate here";
  const keyW = ctx.measureText(key).width + 15;
  const kx = Math.max(8, (W - SURFACE_BAR_W - keyW) / 2), ky = H - 8;
  ctx.fillStyle = css("--red", "#8a2424");
  ctx.globalAlpha = 0.18; ctx.fillRect(kx, ky - 4, 9, 8); ctx.globalAlpha = 1;
  ctx.strokeStyle = css("--red", "#8a2424"); ctx.lineWidth = 1;
  ctx.strokeRect(kx, ky - 4, 9, 8);
  ctx.fillStyle = muted;
  ctx.fillText("high Q50 + high oracle@50: wins concentrate here", kx + 15, ky);
}

// ------------------------------------------------------------------ mounting
function animate(figure, draw, duration, extraHeight = 0) {
  const img = figure.querySelector("img");
  const canvas = document.createElement("canvas");
  canvas.className = "live-plot";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", img.alt);
  figure.querySelector("a").appendChild(canvas);
  figure.classList.add("has-live-plot");

  let raf = 0, started = 0, grown = false;
  // Below this the multi-panel canvas is illegible; the PNG (which links to
  // full resolution) serves narrow screens better than a 39px-wide panel.
  const MIN_LIVE_WIDTH = 520;
  const render = (progress) => {
    // Match the image width; fall back only when it measures as zero.
    const box = img.getBoundingClientRect();
    const w = Math.round(box.width || img.clientWidth || 600);
    const h = Math.round(box.height || img.clientHeight || 240);
    if (w < 2 || h < 2) return;
    if (w < MIN_LIVE_WIDTH) {
      figure.classList.remove("has-live-plot");
      canvas.style.display = "none";
      figure.style.removeProperty("--live-extra");
      return;
    }
    canvas.style.display = "";
    figure.classList.add("has-live-plot");
    // Legend rows need vertical room the source crop does not have; the
    // anchor grows by exactly that much so nothing overlaps the caption.
    figure.style.setProperty("--live-extra", extraHeight + "px");
    draw(fitCanvas(canvas, w, h + extraHeight), w, h + extraHeight, progress);
  };

  // Grow in on entry, then hold the manuscript's orientation so the labelled
  // axes and the marked winning corner stay where the reader found them.
  const frame = (now) => {
    if (!started) started = now;
    const t = Math.min(1, (now - started) / duration);
    if (t >= 1) grown = true;
    render(ease(t));
    raf = grown ? 0 : requestAnimationFrame(frame);
  };

  const start = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? start() : stop()));
  }, { threshold: 0.25 }).observe(figure);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => render(grown ? 1 : 0), 120);
  });
  render(0);
}

export function mountLivePlots(root) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !window.IntersectionObserver) return;
  const canvas = document.createElement("canvas");
  if (!canvas.getContext || !canvas.getContext("2d")) return;

  const targets = [
    ["Figure 3", (c, w, h, p) => drawTrajectories(c, w, h, p), 1500, 0],
    ["Figure 4", (c, w, h, p) => drawSurfaces(c, w, h, p), 1800, 58],
  ];
  targets.forEach(([label, draw, duration, extra]) => {
    const figure = root.querySelector(`.source-visual[data-label="${label}"]`);
    if (figure) animate(figure, draw, duration, extra);
  });
}
