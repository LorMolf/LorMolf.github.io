/* Interactive SPSD corpus explorer.

   A live restaging of Figure 2: one decision state shown as a board, as the
   trace the frozen search expert produced, and as the linearized row a language
   model trains on. The reader picks game, rule variant and task, then steps
   through the stages that turn one into the other.

   Every string comes from /data/spsd-data.js, generated from the public dataset
   LorMolf/SPSD-Variants-opsd and re-verified against the raw rows on import.
   The module renders no <img> and no <figure>, so the site's figure invariants
   are untouched, and it degrades to plain prose if the import fails. */
import { spsdData } from "/data/spsd-data.js";
import { escapeHtml } from "/assets/util.js";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const GAME_ORDER = ["connect4", "domineering", "simplified__othello",
  "simplified__first_attack", "tic_tac_chess"];
const TASK_ORDER = ["move_choice", "occupancy", "legality", "threat_count",
  "legal_action_count", "legal_action_enumeration", "successor_state"];

const STAGES = {
  move_choice: [
    ["board", "position",
      "One decision state from a self-play trajectory. Trajectories start from a uniformly random legal prefix, so retained decisions spread across the reachable state space instead of clustering on one line of play."],
    ["search", "search network",
      "The frozen MuZero-class expert evaluates the position: a policy prior over legal actions, a value for each, and 50 simulations that concentrate where prior and value agree. This is the state the linearizer reads."],
    ["trace", "reasoning chain",
      "The renderer linearizes that search into language, keeping only what replay could reproduce: the alternative that tempted the search, the opponent's sharpest reply, and the consequence of each."],
    ["answer", "reference answer",
      "The row the model is trained against. The teacher sees the reasoning chain; the student sees only the board and the legal handles."],
  ],
  state: [
    ["board", "position",
      "The same decision states carry state questions, so reading the board is supervised alongside choosing a move. A position belongs to exactly one row family, never both."],
    ["trace", "executable criterion",
      "The answer is recomputed from the restored board rather than asserted: counts recounted, enumerations matched to replay-verified action ids, successors obtained by applying the transition."],
    ["answer", "reference answer",
      "One boxed answer with an executable criterion behind it. The supervision is auditable by construction rather than by how convincing it reads."],
  ],
};

// Figure 2's palette, so the page and the manuscript agree.
const FIG = {
  policy: "#e0479e",     // pi, magenta
  value: "#1f9ed6",      // v, cyan
  state: "#00a651",      // s, green
  retained: "#0f9d3a",   // kept edge
  terminal: "#e23b2e",   // dashed terminal edge
};

const css = (n, f) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;
const stagesOf = (s) => STAGES[s.task === "move_choice" ? "move_choice" : "state"];

// ------------------------------------------------------------- board geometry
const cellName = (b, r, c) => `${b.colLabels[c]}${b.rowLabels[r]}`;

function findCell(board, name) {
  const m = String(name).trim().match(/^([a-h])(\d+)$/);
  if (!m) return null;
  const c = board.colLabels.indexOf(m[1]);
  const r = board.rowLabels.indexOf(Number(m[2]));
  return c < 0 || r < 0 ? null : { r, c };
}

// A handle names cells in one of a few shapes across the five games:
//   "column 3"               -> lands in the lowest empty cell of column 3
//   "place horizontal a5-b5" -> both named cells
//   "move queen c2 -> b3"    -> origin and destination
//   "e6" / "place e1"        -> one named cell
function handleCells(board, handle) {
  if (!board || !handle) return [];
  const text = String(handle).split(":")[0].trim();
  const col = text.match(/column (\d+)/);
  if (col) {
    const c = Number(col[1]) - 1;
    for (let r = board.rows - 1; r >= 0; r--) if (board.grid[r][c] === 0) return [{ r, c }];
    return [];
  }
  const names = text.match(/\b[a-h]\d\b/g) || [];
  return names.map((n) => findCell(board, n)).filter(Boolean);
}

// Which cells each stage puts under the reader's attention.
// Returns {focus, reject} so a rejected alternative reads differently from the
// move the expert actually chose.
function focusCells(sample, stage) {
  const b = sample.board;
  const none = { focus: [], reject: [] };
  if (stage === "board") return none;
  // The legal wash marks every playable cell on the search stage; painting the
  // same cells as focus too would double-blend and stop matching the key.
  if (stage === "search") {
    const focus = handleCells(b, sample.answer);
    const alt = sample.root && sample.root.alternative;
    return { focus, reject: alt ? handleCells(b, alt) : [] };
  }

  if (sample.task === "move_choice") {
    const focus = handleCells(b, sample.answer);
    const alt = stage === "trace" ? sample.traceFeatures.alternative : null;
    return { focus, reject: alt ? handleCells(b, alt) : [] };
  }
  const q = sample.question || "";
  const at = (cells) => ({ focus: cells, reject: [] });
  if (sample.task === "occupancy") return at(handleCells(b, (q.match(/occupies ([a-h]\d)/) || [])[1]));
  if (sample.task === "successor_state") {
    const m = q.match(/After (.+?), what (?:player )?value occupies ([a-h]\d)/);
    return m ? { focus: handleCells(b, m[2]), reject: handleCells(b, m[1]) } : none;
  }
  if (sample.task === "legality") return at(handleCells(b, (q.match(/Is (.+?) an exact legal handle/) || [])[1]));
  if (sample.task === "threat_count") {
    const won = (sample.trace.match(/Verified winning replies: (.+?)\./) || [])[1];
    return !won || won === "none" ? none : at(won.split(", ").flatMap((h) => handleCells(b, h)));
  }
  return at((sample.legalOptions || []).flatMap((o) => handleCells(b, o)));   // counting, enumeration
}

// ------------------------------------------------------------------- drawing
function drawBoard(canvas, sample, stage, progress, hover) {
  const board = sample.board;
  const key = (p) => `${p.r},${p.c}`;
  const legal = new Set((sample.legalOptions || []).flatMap((o) => handleCells(board, o)).map(key));
  const marks = focusCells(sample, stage);
  const focus = new Set(marks.focus.map(key));
  const reject = new Set(marks.reject.map(key));
  const hot = new Set(hover ? handleCells(board, hover).map(key) : []);

  const avail = canvas.parentElement.getBoundingClientRect().width || 250;
  const pad = 20;
  const size = Math.max(14, Math.min((avail - pad * 2) / board.cols,
                                     (250 - pad * 2) / board.rows, 38));
  const W = size * board.cols + pad * 2, H = size * board.rows + pad * 2;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const muted = css("--muted", "#6f685c"), soft = css("--line-soft", "#cfcabb");
  const card = css("--card", "#fff"), red = css("--red", "#8a2424");
  const blue = css("--b", "#4295e3"), gold = css("--gold", "#9a7b1a");

  ctx.fillStyle = card;
  ctx.fillRect(pad, pad, size * board.cols, size * board.rows);
  ctx.textBaseline = "middle";

  const total = board.rows * board.cols;
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      const x = pad + c * size, y = pad + r * size, k = `${r},${c}`;
      const reveal = Math.min(1, Math.max(0, progress * total * 1.6 - (r * board.cols + c)));
      // The legal wash carries the whole message on the handles stage, so it
      // reads stronger there and stays a background hint elsewhere.
      if (legal.has(k)) {
        ctx.globalAlpha = stage === "search" ? 0.22 * reveal : 0.13;
        ctx.fillStyle = gold; ctx.fillRect(x, y, size, size);
      }
      if (reject.has(k)) {                       // the alternative search dropped
        ctx.globalAlpha = 0.3 * reveal; ctx.fillStyle = blue; ctx.fillRect(x, y, size, size);
        ctx.globalAlpha = 0.9 * reveal; ctx.strokeStyle = blue; ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 2]); ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
        ctx.setLineDash([]);
      }
      if (focus.has(k)) { ctx.globalAlpha = 0.34 * reveal; ctx.fillStyle = red; ctx.fillRect(x, y, size, size); }
      if (hot.has(k)) { ctx.globalAlpha = 0.5; ctx.fillStyle = gold; ctx.fillRect(x, y, size, size); }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = soft; ctx.lineWidth = 0.7;
      ctx.strokeRect(x + 0.35, y + 0.35, size, size);

      const v = board.grid[r][c], cx = x + size / 2, cy = y + size / 2;
      const kind = (PIECES[sample.game] || PIECES.connect4).p1;
      if (v === 1 || v === 2) {
        drawPiece(ctx, kind, v, cx, cy, size, red, blue);
      } else if (size >= 26 && sample.labelsEmptyCells) {
        // Only games whose own rendering labels empty cells get labels here.
        ctx.fillStyle = soft; ctx.textAlign = "center";
        ctx.font = `${Math.round(size * 0.3)}px 'Computer Modern Typewriter', monospace`;
        ctx.fillText(cellName(board, r, c), cx, cy);
      }
    }
  }

  ctx.font = "11px 'Computer Modern Typewriter', monospace";
  ctx.fillStyle = muted; ctx.textAlign = "center";
  board.colLabels.forEach((l, c) => ctx.fillText(l, pad + c * size + size / 2, pad + size * board.rows + 10));
  ctx.textAlign = "right";
  board.rowLabels.forEach((l, r) => ctx.fillText(String(l), pad - 6, pad + r * size + size / 2));
}

// --------------------------------------------------------------- text panels
const pre = (text, cls = "") => `<pre class="sx-pre ${cls}">${escapeHtml(text)}</pre>`;

function optionsPanel(s) {
  const answer = s.task === "move_choice" ? s.answer : null;
  return `<ul class="sx-opts">${s.legalOptions.map((o) => {
    const handle = o.split(":")[0].trim();
    const desc = o.includes(":") ? o.split(":").slice(1).join(":").trim() : "";
    return `<li class="sx-opt${handle === answer ? " is-ans" : ""}" data-handle="${escapeHtml(handle)}">
      <span class="sx-opt-h">${escapeHtml(handle)}</span>${desc ? `<span class="sx-opt-d">${escapeHtml(desc)}</span>` : ""}</li>`;
  }).join("")}</ul>
  <p class="sx-note">${s.legalOptions.length} replay-verified handle${s.legalOptions.length === 1 ? "" : "s"}. Hover one to see where it lands.${
    s.question ? "" : " The answer must be one of these, copied exactly."}</p>`;
}

// ------------------------------------------------- search-network animation
// Simulations land one at a time on the action they would have visited, so the
// visit distribution builds up instead of appearing finished. Priors and values
// keep Figure 2's magenta/cyan so the page and the manuscript agree.

// Each game gets its own piece shapes. Connect4 drops discs, Domineering lays
// dominoes, Othello flips stones, Tic-Tac-Chess moves a queen. Drawing them all
// as X/O loses exactly the distinction the variant selector is there to show.
const PIECES = {
  connect4: { p1: "disc", p2: "disc" },
  domineering: { p1: "tile", p2: "tile" },
  simplified__othello: { p1: "stone", p2: "stone" },
  simplified__first_attack: { p1: "stone", p2: "stone" },
  tic_tac_chess: { p1: "queen", p2: "queen" },
};
const PIECE_LABEL = {
  disc: ["player 1 disc", "player 2 disc"],
  tile: ["player 1 tile", "player 2 tile"],
  stone: ["player 1 stone", "player 2 stone"],
  queen: ["player 1 queen", "player 2 queen"],
};

// One piece, drawn into a canvas cell. `kind` comes from PIECES[game].
function drawPiece(ctx, kind, player, cx, cy, size, red, blue) {
  const col = player === 1 ? red : blue, rad = size * 0.3;
  ctx.strokeStyle = col; ctx.fillStyle = col;
  ctx.lineWidth = Math.max(1.4, size * 0.085);
  if (kind === "disc") {
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    if (player === 1) ctx.fill(); else ctx.stroke();
  } else if (kind === "tile") {
    ctx.globalAlpha = player === 1 ? 0.75 : 0.32;
    ctx.fillRect(cx - size * 0.38, cy - size * 0.38, size * 0.76, size * 0.76);
    ctx.globalAlpha = 1;
    ctx.strokeRect(cx - size * 0.38, cy - size * 0.38, size * 0.76, size * 0.76);
  } else if (kind === "stone") {
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    if (player === 1) ctx.fill(); else { ctx.stroke(); }
  } else if (kind === "queen") {
    // A small crown: three points over a base.
    const w = size * 0.3, h = size * 0.26;
    ctx.beginPath();
    ctx.moveTo(cx - w, cy + h);
    ctx.lineTo(cx - w, cy - h * 0.2);
    ctx.lineTo(cx - w * 0.5, cy + h * 0.25);
    ctx.lineTo(cx, cy - h);
    ctx.lineTo(cx + w * 0.5, cy + h * 0.25);
    ctx.lineTo(cx + w, cy - h * 0.2);
    ctx.lineTo(cx + w, cy + h);
    ctx.closePath();
    if (player === 1) ctx.fill(); else ctx.stroke();
  }
}

// Cross-highlight: mark every element that refers to one action handle.
// A handle only identifies an action WITHIN one ply: "column 1" is both the
// root's move and the opponent's reply two plies down, so matching on the text
// alone lights up unrelated nodes. Only root-ply elements participate.
function markLinked(host, handle) {
  host.querySelectorAll(".is-linked").forEach((n) => n.classList.remove("is-linked"));
  if (!handle) return;
  const esc = (window.CSS && CSS.escape) ? CSS.escape(handle) : handle.replace(/"/g, '\\"');
  // Table rows, option list and board cells are all root-ply by construction.
  host.querySelectorAll(`[data-handle="${esc}"]`).forEach((n) => n.classList.add("is-linked"));
  // Tree edges are not: keep only those leaving the root.
  host.querySelectorAll(`.sx-edge[data-action="${esc}"][data-from="s0"]`).forEach((e) => {
    e.classList.add("is-linked");
    const n = host.querySelector(`.sx-node[data-node="${e.dataset.to}"]`);
    if (n) n.classList.add("is-linked");
  });
}

// ------------------------------------------------- search tree (Figure 2)
// Depth-2 tree: root state, the actions search examined, and the opponent's
// reply under the branch it dropped. Edge styling follows the manuscript:
// solid green = retained principal variation, dashed red = terminal,
// dashed grey = examined and dropped.
function svgPiece(kind, player, cx, cy, s, changed) {
  const col = player === 1 ? "var(--red)" : "#1f6fd6";
  const r = s * 0.3, fill = player === 1 ? col : "none";
  const glow = changed ? ` class="sx-just-moved"` : "";
  if (kind === "tile") {
    return `<rect${glow} x="${cx - s * 0.36}" y="${cy - s * 0.36}" width="${s * 0.72}" height="${s * 0.72}"
      fill="${col}" fill-opacity="${player === 1 ? 0.75 : 0.3}" stroke="${col}" stroke-width="1"/>`;
  }
  if (kind === "queen") {
    const w = s * 0.3, h = s * 0.25;
    const d = `M${cx - w} ${cy + h} L${cx - w} ${cy - h * 0.2} L${cx - w * 0.5} ${cy + h * 0.25}` +
              ` L${cx} ${cy - h} L${cx + w * 0.5} ${cy + h * 0.25} L${cx + w} ${cy - h * 0.2} L${cx + w} ${cy + h} Z`;
    return `<path${glow} d="${d}" fill="${fill}" stroke="${col}" stroke-width="1.1"/>`;
  }
  return `<circle${glow} cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${col}" stroke-width="1.3"/>`;
}

// A board small enough to sit inside a tree node, drawn from the node's own
// (validated) successor board. Cells the move changed are marked, so the reader
// can see WHAT the action did rather than just that the state differs.
// Figure 2 draws each state as a plate seen at an angle rather than flat on.
// The skew is a pure presentation transform on the group: cell geometry stays
// axis-aligned underneath, so hit-testing and piece drawing are unchanged.
const TILT = "matrix(1,0,-0.26,0.94,0,0)";

function miniBoard(node, rows, cols, game, x, y, cell) {
  const kind = (PIECES[game] || PIECES.connect4).p1;
  const changed = new Set(node.changed || []);
  const bw = cols * cell, bh = rows * cell;
  // A thin slab under the plate reads as thickness once the plate is leaned.
  let out = `<path d="M${x} ${y + bh} L${x + bw} ${y + bh} L${x + bw} ${y + bh + 3}
    L${x} ${y + bh + 3} Z" class="sx-mini-edge"/>`;
  out += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}"
    class="sx-mini-bg"/>`;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = x + c * cell + cell / 2, cy = y + r * cell + cell / 2;
      const name = String.fromCharCode(97 + c) + (rows - r);
      const v = node.board[r * cols + c];
      if (changed.has(name)) {
        out += `<rect x="${x + c * cell}" y="${y + r * cell}" width="${cell}" height="${cell}"
          class="sx-mini-change"/>`;
      }
      if (v === 1 || v === 2) out += svgPiece(kind, v, cx, cy, cell, changed.has(name));
    }
  }
  out += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" class="sx-mini-frame"/>`;
  // Lean the finished plate about its own centre.
  return `<g transform="translate(${x + bw / 2} ${y + bh / 2}) ${TILT} translate(${-(x + bw / 2)} ${-(y + bh / 2)})"
    class="sx-plate">${out}</g>`;
}

function treeSvg(root, game) {
  const t = root.tree, rows = t.rows, cols = t.cols;
  const kids = t.nodes.filter((n) => n.depth === 1);
  const deep = t.nodes.filter((n) => n.depth === 2);
  // Node size follows the board's aspect so a 3x3 and a 6x7 both read clearly.
  const cell = Math.max(7, Math.min(13, Math.round(96 / Math.max(rows, cols))));
  const bw = cols * cell, bh = rows * cell;
  // The 0.26 skew pushes each plate sideways by 0.26*bh, so columns need that
  // much extra room or leaned boards overlap their neighbours.
  const lean = Math.ceil(bh * 0.26);
  const colW = Math.max(bw + lean + 54, 132);
  const PAD = 26;   // room for the leaned plate and its pi,v head at the edges
  const W = Math.max(360, kids.length * colW) + PAD * 2;
  // Each tier needs the board plus its label above (16) and value below (20),
  // plus room for the edge and its label between tiers (34).
  const TOP = 18, LABEL = 16, VALUE = 20, LINK = 34;
  const rowGap = bh + VALUE + LINK + LABEL;
  const depths = 1 + (kids.length ? 1 : 0) + (deep.length ? 1 : 0);
  const H = TOP + depths * (LABEL + bh + VALUE) + (depths - 1) * LINK + 10;

  const pos = {};
  pos.s0 = { x: W / 2 - bw / 2, y: TOP + LABEL };
  kids.forEach((n, i) => {
    pos[n.id] = { x: PAD + ((W - PAD * 2) / kids.length) * (i + 0.5) - bw / 2,
                  y: TOP + LABEL + rowGap };
  });
  deep.forEach((n) => {
    const par = pos[n.id.slice(0, -1)];
    pos[n.id] = { x: par.x, y: par.y + rowGap };
  });

  const centre = (id) => ({ x: pos[id].x + bw / 2, y: pos[id].y + bh / 2 });

  const node = (n) => {
    const p = pos[n.id];
    const cls = ["sx-node", n.depth === 1 && n.selected ? "is-sel" : "",
                 n.alternative ? "is-alt" : "", n.reply ? "is-reply" : "",
                 n.terminal ? "is-term" : ""].filter(Boolean).join(" ");
    const heads = [
      n.pi ? `<tspan class="sx-pi">&#960;</tspan>` : "",
      n.value !== null && n.value !== undefined ? `<tspan class="sx-v">v</tspan>` : "",
    ].filter(Boolean).join(`<tspan class="sx-comma">,</tspan>`);
    return `<g class="${cls}" data-node="${n.id}" tabindex="0"
        role="img" aria-label="${escapeHtml(n.label)}${n.value != null ? `, value ${n.value.toFixed(2)}` : ""}">
      <rect class="sx-node-hit" x="${p.x - 7 - lean / 2}" y="${p.y - 15}" width="${bw + lean + 14}" height="${bh + 46}" rx="3"/>
      ${miniBoard(n, rows, cols, game, p.x, p.y, cell)}
      <text class="sx-node-s" x="${p.x + bw / 2}" y="${p.y - 5}">${escapeHtml(n.label)}</text>
      ${(() => {
        if (!heads) return "";
        const outerRight = n.depth === 1 && p.x + bw / 2 > W / 2;
        return outerRight
          ? `<text class="sx-node-h" x="${p.x + bw + lean / 2 + 6}" y="${p.y - 4}" text-anchor="start">${heads}</text>`
          : `<text class="sx-node-h" x="${p.x + lean / 2 - 7}" y="${p.y - 4}" text-anchor="end">${heads}</text>`;
      })()}
      ${n.value !== null && n.value !== undefined
        ? `<text class="sx-node-v" x="${p.x + bw / 2}" y="${p.y + bh + 13}">${n.value >= 0 ? "+" : ""}${n.value.toFixed(2)}${
            n.visits ? `<tspan class="sx-node-n">  N=${n.visits}</tspan>` : ""}</text>` : ""}
    </g>`;
  };

  // Longest common prefix over the drawn edge labels, trimmed to a word break.
  const shared = (() => {
    const xs = t.edges.map((o) => o.action);
    if (xs.length < 2) return "";
    let n = 0;
    while (n < xs[0].length && xs.every((s) => s[n] === xs[0][n])) n++;
    const cut = xs[0].slice(0, n).lastIndexOf(" ");
    if (cut <= 0) return "";
    const pre = xs[0].slice(0, cut + 1);
    // Only worth dropping when the labels are long AND the remainder still
    // reads as an action: "column 3" -> "3" is shorter but meaningless.
    const rest = xs.map((s) => s.slice(pre.length));
    const longest = Math.max(...xs.map((s) => s.length));
    return longest > 14 && rest.every((r) => r.length >= 4) ? pre : "";
  })();
  const short = (a) => (shared && a.startsWith(shared) ? a.slice(shared.length) : a);


  // Shared geometry: the stroke endpoints and where the label sits.
  const edgeGeom = (e) => {
    const a = centre(e.from), b = centre(e.to);
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    // Leave the parent at its border, stop short of the child's.
    const pad = bh / 2 + 16, padTo = bh / 2 + 20;
    const x1 = a.x + ux * pad, y1 = a.y + uy * pad;
    const x2 = b.x - ux * padTo, y2 = b.y - uy * padTo;
    const sibs = t.edges.filter((o) => o.from === e.from);
    const k = sibs.indexOf(e);
    const stagger = (k - (sibs.length - 1) / 2) * (sibs.length > 1 ? 15 : 0);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const nx = -uy, ny = ux;
    const side = mx < W / 2 ? -1 : 1;
    // A near-vertical edge has no room beside it: put the label just below the
    // parent, in the gap before the child's plate. Diagonals get the usual
    // perpendicular offset plus a per-sibling vertical stagger.
    const vertical = Math.abs(dx) < 14;
    return {
      x1, y1, x2, y2,
      lx: vertical ? mx + stagger : mx + nx * 12 * side,
      ly: vertical ? y1 + 12 : my + ny * 12 * side + stagger,
    };
  };

  const edgeLabel = (e, i) => {
    const g = edgeGeom(e);
    return `<g class="sx-edge-lab is-${e.kind}" data-edge="${i}" data-from="${e.from}"
        data-action="${escapeHtml(e.action)}">
      <text x="${g.lx}" y="${g.ly}"><tspan class="sx-edge-bg">${escapeHtml(short(e.action))}</tspan></text>
      <text class="sx-edge-fg" x="${g.lx}" y="${g.ly}">${escapeHtml(short(e.action))}</text>
    </g>`;
  };

  const edge = (e, i) => {
    const g = edgeGeom(e);
    return `<g class="sx-edge is-${e.kind}" data-edge="${i}" data-from="${e.from}" data-to="${e.to}"
        data-action="${escapeHtml(e.action)}">
      <path d="M${g.x1} ${g.y1} L${g.x2} ${g.y2}" marker-end="url(#sx-ah-${e.kind})"/>
    </g>`;
  };

  const marker = (k) => `<marker id="sx-ah-${k}" viewBox="0 0 8 8" refX="6" refY="4"
      markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
      <path class="sx-ah is-${k}" d="M0 0 L8 4 L0 8 z"/></marker>`;

  return `<svg class="sx-tree" viewBox="0 0 ${W} ${H}" role="group"
      aria-label="Search tree with the board at every node">
    <defs>${["retained", "terminal", "dropped", "reply"].map(marker).join("")}</defs>
    ${t.edges.map(edge).join("")}
    ${t.nodes.map(node).join("")}
    ${t.edges.map(edgeLabel).join("")}
  </svg>`;
}

function searchPanel(s) {
  const root = s.root;
  if (!root) return tracePanel(s);
  const shown = root.actions.slice(0, 6);
  const rest = root.actions.length - shown.length;
  return `<div class="sx-net" data-sim-total="${root.simulations}">
    <div class="sx-net-head">
      <span class="sx-net-title">root search</span>
      <span class="sx-net-sims"><b data-role="simcount">0</b> / ${root.simulations} simulations</span>
    </div>
    ${treeSvg(root, s.game)}
    <ul class="sx-legend">${
      [["retained", "sx-k-ret", "retained"],
       ["terminal", "sx-k-term", "retained, reaches a terminal state"],
       ["dropped", "sx-k-drop", "examined, dropped"],
       ["reply", "sx-k-rep", "opponent reply"]]
        .filter(([kind]) => root.tree.edges.some((e) => e.kind === kind))
        .map(([, cls, label]) => `<li><i class="${cls}"></i>${label}</li>`).join("")
    }</ul>
    <div class="sx-net-cols"><span>action</span><span class="sx-col-p">prior &pi;</span><span class="sx-col-v">value v</span><span>visits N</span></div>
    ${shown.map((a) => `
      <div class="sx-act${a.selected ? " is-sel" : ""}${a.handle === root.alternative ? " is-alt" : ""}" data-handle="${escapeHtml(a.handle)}" data-visits="${a.visits}">
        <span class="sx-act-h">${escapeHtml(a.handle)}</span>
        <span class="sx-act-p"><i style="width:${Math.round(a.prior * 100)}%"></i><b>${a.prior.toFixed(3)}</b></span>
        <span class="sx-act-v"><i class="${a.value >= 0 ? "pos" : "neg"}" style="width:${Math.round(Math.abs(a.value) * 50)}%"></i><b>${a.value >= 0 ? "+" : ""}${a.value.toFixed(2)}</b></span>
        <span class="sx-act-n"><i data-role="visitbar" style="width:0%"></i><b data-role="visitnum">0</b></span>
      </div>`).join("")}
    ${rest > 0 ? `<p class="sx-net-rest">+ ${rest} further legal action${rest === 1 ? "" : "s"}, all below the shown values.</p>` : ""}
  </div>
  <p class="sx-note">Search concentrates on <strong>${escapeHtml(s.answer)}</strong>${
    root.alternative ? `, with <strong>${escapeHtml(root.alternative)}</strong> the branch it examined and dropped` : ""}.${
    root.terminal === "win" ? " Replay reaches a win, so that value is pinned rather than estimated." : ""}</p>
  <p class="sx-note sx-caveat">Value bands are <strong>recovered</strong> from the published trace: the renderer quantises each value into the phrase it prints, so the true number lies inside the band shown. Priors and per-simulation counts are <strong>illustrative</strong> — the corpus ships the linearized chain, not the raw tensors.</p>`;
}

function tracePanel(s) {
  const f = s.traceFeatures || {};
  const tags = [
    f.forced && "forced reply",
    f.alternative && "rejected alternative",
    f.reply && "opponent reply",
    f.terminal && "terminal evidence",
  ].filter(Boolean);
  const note = s.question
    ? `Checked by ${s.verifier}. Nothing here is asserted: the value is recomputed from the restored position.`
    : `${s.simulations || 50} simulations, ${s.evidence === "rich" ? "full" : "partial"} replay evidence, from a checkpoint trained for ${(s.checkpointStep || 0).toLocaleString()} environment steps. A win, loss or draw is stated only when replay actually reaches that terminal state.`;
  return `${s.question ? `<p class="sx-q">${escapeHtml(s.question)}</p>` : ""}
    ${pre(s.trace)}
    ${tags.length ? `<p class="sx-tags">${tags.map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</p>` : ""}
    <p class="sx-note">${escapeHtml(note)}</p>`;
}

function answerPanel(s) {
  const accepts = s.acceptedAnswers && s.acceptedAnswers.length > 1
    ? ` · accepts ${s.acceptedAnswers.map((a) => `<code>${escapeHtml(a)}</code>`).join(", ")}` : "";
  return `${pre(s.completion, "sx-answer")}
    <p class="sx-note">Verifier <code>${escapeHtml(s.verifier)}</code>${accepts}.</p>
    <p class="sx-note">Everything above the chain is discarded: the student is trained on the board, the legal handles and this answer. The search is paid for once, when the corpus is built, never at inference.</p>`;
}


function boardPanel(s) {
  const moves = s.history || [];
  const recent = moves.slice(-4);
  return `<dl class="sx-facts">
      <div><dt>game</dt><dd>${escapeHtml(s.gameLabel)}</dd></div>
      <div><dt>rule variant</dt><dd>${escapeHtml(s.variantLabel)}</dd></div>
      ${s.toMove ? `<div><dt>to move</dt><dd>${escapeHtml(s.toMove)}</dd></div>` : ""}
      ${s.moveIndex != null ? `<div><dt>ply</dt><dd>${s.moveIndex}</dd></div>` : ""}
      <div><dt>legal actions</dt><dd>${s.legalOptions.length}</dd></div>
    </dl>
    ${recent.length ? `<p class="sx-note"><strong>How the position arose.</strong> ${
      moves.length > recent.length ? `${moves.length - recent.length} earlier plies, then ` : ""}${
      escapeHtml(recent.map((m) => m.replace(/\.$/, "")).join("; "))}.</p>` : ""}
    <p class="sx-note">Variants change scoring, openings, movement or winning conditions while preserving board topology, observation shape and action-space size, so the student meets new decision patterns through an interface that never moves.</p>`;
}

const PANEL = { board: boardPanel, search: searchPanel, options: optionsPanel,
                trace: tracePanel, answer: answerPanel };

// Run the visit counts up from zero, so the reader watches the budget being
// spent rather than reading a finished table.
function runSimulations(host, duration = 1100) {
  const net = host.querySelector(".sx-net");
  if (!net) return;
  const rows = [...net.querySelectorAll(".sx-act")];
  const total = Number(net.dataset.simTotal) || 50;
  const peak = Math.max(...rows.map((r) => Number(r.dataset.visits) || 0), 1);
  const counter = net.querySelector('[data-role="simcount"]');
  const svg = net.querySelector(".sx-tree");
  // Reveal by tree depth: root, then the examined actions, then the replies —
  // the order search actually discovers them in.
  const tiers = svg ? [
    [...svg.querySelectorAll('.sx-node[data-node="s0"]')],
    [...svg.querySelectorAll(".sx-edge:not(.is-reply)"),
     ...svg.querySelectorAll('.sx-node:not([data-node="s0"]):not(.is-reply)')],
    [...svg.querySelectorAll(".sx-edge.is-reply"), ...svg.querySelectorAll(".sx-node.is-reply")],
  ] : [];
  const paint = (t) => {
    let spent = 0;
    tiers.forEach((tier, d) => {
      const at = d === 0 ? 0 : 0.12 + d * 0.32;
      tier.forEach((g) => { g.style.opacity = t >= at ? 1 : 0.05; });
    });
    rows.forEach((row) => {
      const target = Number(row.dataset.visits) || 0;
      const n = Math.round(target * t);
      spent += n;
      row.querySelector('[data-role="visitnum"]').textContent = n;
      row.querySelector('[data-role="visitbar"]').style.width = (100 * n / peak) + "%";
    });
    if (counter) counter.textContent = Math.min(total, Math.round(total * t));
    return spent;
  };
  if (reduced()) return void paint(1);
  let start = 0;
  const frame = (now) => {
    if (!start) start = now;
    const t = Math.min(1, (now - start) / duration);
    paint(t < 1 ? t * t * (3 - 2 * t) : 1);        // smoothstep
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// ------------------------------------------------------------------ mounting
export function mountSpsdExplorer(root) {
  const host = root.querySelector("[data-spsd-explorer]");
  if (!host) return;
  const probe = document.createElement("canvas");
  const canvasOk = !!(probe.getContext && probe.getContext("2d"));

  const all = spsdData.samples;
  const games = GAME_ORDER.filter((g) => all.some((s) => s.game === g));
  let game = games[0], task = "move_choice", variant = null, stage = 0, hover = null;

  const pool = () => all.filter((s) => s.game === game && s.task === task);
  const pick = () => pool().find((s) => s.variant === variant) || pool()[0];

  host.innerHTML = `
    <div class="sx">
      <div class="sx-head">
        <span class="sx-kicker">corpus explorer</span>
        <span class="sx-sub">one decision state, three representations</span>
      </div>
      <div class="sx-controls">
        <div class="sx-ctl"><span class="sx-lbl">game</span><div class="sx-chips" data-role="games"></div></div>
        <div class="sx-ctl"><span class="sx-lbl">task</span><div class="sx-chips" data-role="tasks"></div></div>
        <div class="sx-ctl"><span class="sx-lbl">variant</span><div class="sx-chips" data-role="variants"></div></div>
      </div>
      <div class="sx-body">
        <div class="sx-left">
          <div class="sx-boardwrap"><canvas class="sx-board" role="img" data-role="canvas"></canvas></div>
          <p class="sx-legend" data-role="legend"></p>
        </div>
        <div class="sx-right">
          <div class="sx-stages" data-role="stages" role="tablist"></div>
          <p class="sx-blurb" data-role="blurb"></p>
          <div class="sx-panel" data-role="panel"></div>
        </div>
      </div>
      <p class="sx-prov" data-role="prov"></p>
    </div>`;

  const el = (role) => host.querySelector(`[data-role="${role}"]`);
  const canvas = el("canvas");
  const chips = (items, active) => items.map(([v, label]) =>
    `<button type="button" class="sx-chip${v === active ? " on" : ""}" data-v="${escapeHtml(String(v))}">${escapeHtml(label)}</button>`).join("");

  let raf = 0, start = 0;
  const paint = (p) => { if (canvasOk) drawBoard(canvas, pick(), stagesOf(pick())[stage][0], p, hover); };
  function animate() {
    if (!canvasOk || reduced()) return paint(1);
    cancelAnimationFrame(raf); start = 0;
    const frame = (now) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / 400);
      paint(t);
      raf = t < 1 ? requestAnimationFrame(frame) : 0;
    };
    raf = requestAnimationFrame(frame);
  }

  function render(withAnimation = true) {
    const tasks = TASK_ORDER.filter((t) => all.some((s) => s.game === game && s.task === t));
    if (!tasks.includes(task)) task = tasks[0];
    const variants = pool().map((s) => s.variant);
    if (!variants.includes(variant)) variant = variants[0];
    const s = pick();
    if (!s) return;

    el("games").innerHTML = chips(games.map((g) =>
      [g, all.find((x) => x.game === g).gameLabel]), game);
    el("tasks").innerHTML = chips(tasks.map((t) =>
      [t, all.find((x) => x.game === game && x.task === t).taskLabel]), task);
    el("variants").innerHTML = chips(pool().map((x) => [x.variant, x.variantLabel]), variant);

    const stages = stagesOf(s);
    if (stage >= stages.length) stage = stages.length - 1;
    el("stages").innerHTML = stages.map(([, label], i) =>
      `<button type="button" class="sx-step${i === stage ? " on" : i < stage ? " done" : ""}" role="tab" aria-selected="${i === stage}" data-i="${i}"><span class="sx-step-n">${i + 1}</span>${escapeHtml(label)}</button>`).join("");
    el("blurb").textContent = stages[stage][2];
    el("panel").innerHTML = PANEL[stages[stage][0]](s);
    const stageId = stages[stage][0];
    const FOCUS_LABEL = {
      move_choice: "expert's move",
      threat_count: "winning reply",
      legal_action_count: "counted handle",
      legal_action_enumeration: "enumerated handle",
      successor_state: "queried cell",
    };
    const keys = [
      stageId === "search" && ["legal", "legal action"],
      stageId !== "board" && ["chosen", FOCUS_LABEL[s.task] || "queried cell"],
      (stageId === "trace" || stageId === "search") && s.traceFeatures.alternative && ["rejected", "alternative dropped"],
      stageId === "trace" && s.task === "successor_state" && ["rejected", "replayed action"],
    ].filter(Boolean);
    el("legend").innerHTML = `${escapeHtml(s.legend)}${keys.length
      ? `<span class="sx-keys">${keys.map(([c, label]) =>
          `<span class="sx-key sx-key-${c}">${escapeHtml(label)}</span>`).join("")}</span>` : ""}`;
    canvas.setAttribute("aria-label", `${s.gameLabel} position, ${s.taskLabel.toLowerCase()} row`);
    el("prov").innerHTML = `${escapeHtml(s.gameLabel)} · ${escapeHtml(s.taskLabel)} · rule variant ${escapeHtml(s.variantLabel)}`;

    // One hover model for the whole panel: the option list, the value table and
    // the tree all key off the same action handle, so pointing at any of them
    // lights up the others and the board cells the action touches.
    const linkHover = (node, handle) => {
      const on = () => { hover = handle; markLinked(host, handle); paint(1); };
      const off = () => { hover = null; markLinked(host, null); paint(1); };
      node.addEventListener("mouseenter", on);
      node.addEventListener("mouseleave", off);
      node.addEventListener("focus", on);
      node.addEventListener("blur", off);
    };
    host.querySelectorAll(".sx-opt, .sx-act").forEach((n) => linkHover(n, n.dataset.handle));
    host.querySelectorAll(".sx-edge[data-action]").forEach((n) => linkHover(n, n.dataset.action));
    host.querySelectorAll(".sx-node[data-node]").forEach((n) => {
      const e = host.querySelector(`.sx-edge[data-to="${n.dataset.node}"]`);
      linkHover(n, e ? e.dataset.action : null);
    });
    if (stageId === "search") runSimulations(host, withAnimation ? 1100 : 0);
    if (withAnimation) animate(); else paint(1);
  }

  host.addEventListener("click", (event) => {
    const chip = event.target.closest(".sx-chip");
    if (chip) {
      const group = chip.closest("[data-role]").dataset.role;
      if (group === "games") { game = chip.dataset.v; variant = null; stage = 0; }
      else if (group === "tasks") { task = chip.dataset.v; variant = null; stage = 0; }
      else { variant = chip.dataset.v; }
      return render();
    }
    const step = event.target.closest(".sx-step");
    if (step) { stage = Number(step.dataset.i); render(); }
  });

  let timer;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => paint(1), 120);
  });

  render(false);
  // Draw in once when the reader arrives, then hold the position still.
  if (window.IntersectionObserver && !reduced()) {
    let seen = false;
    new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting && !seen) { seen = true; animate(); }
    }), { threshold: 0.3 }).observe(host);
  }
}
