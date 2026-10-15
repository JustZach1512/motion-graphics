// ---------- helpers (pure functions of time) ----------
function spring(t, w = 14, z = 0.82) {
  if (t <= 0) return 0;
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
}
const track = (v0, keys) => t => { let v = v0, p = v0; for (const [tk, val, w, z] of keys) { v += (val - p) * spring(t - tk, w, z); p = val; } return v; };
const kf = keys => t => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) { const [a, va] = keys[i - 1], [b, vb, e = ease] = keys[i]; if (t <= b) return lerp(va, vb, e((t - a) / (b - a))); } return keys[keys.length - 1][1]; };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = x => (x = clamp(x), x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = x => Math.pow(clamp(x), 3);
const easeIn2 = x => Math.pow(clamp(x), 2);
const lin = x => clamp(x);
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const rng = s => () => (s = (s + 0x6D2B79F5) | 0, s = Math.imul(s ^ (s >>> 15), 1 | s), s ^= s + Math.imul(s ^ (s >>> 7), 61 | s), ((s ^ (s >>> 14)) >>> 0) / 4294967296);
function hash1(i) { let s = (i * 374761393 + 668265263) | 0; s = Math.imul(s ^ (s >>> 13), 1274126177); s ^= s >>> 16; return (s >>> 0) / 4294967296; }
function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash1(i + seed * 1013) * 2 - 1, hash1(i + 1 + seed * 1013) * 2 - 1, u); }
// quick rise then decay: a hit reaction 0 -> ~1 -> 0
const bump = (t, t0, k = 9) => { const d = t - t0; return d < 0 ? 0 : Math.sin(Math.min(d * 28, Math.PI / 2)) * Math.exp(-k * d); };
// jab: out fast, hold, come back
function jab(t, t0, out = 0.06, hold = 0.08, back = 0.14) { const d = t - t0; if (d < 0) return 0; if (d < out) return easeOut(d / out); if (d < out + hold) return 1; return 1 - ease((d - out - hold) / back); }
// landing squash: damped wobble after an impact
const squash = (t, t0, a = 0.22) => { const d = t - t0; return d < 0 ? 0 : a * Math.exp(-9 * d) * Math.cos(d * 26); };
// last value whose time has passed
const at = (t, list, def) => { let v = def; for (const [tk, val] of list) if (t >= tk) v = val; return v; };
const hop = u => Math.sin(Math.PI * clamp(u));

// ---------- DOM / SVG ----------
const NS = 'http://www.w3.org/2000/svg';
function E(tag, attrs, parent) { const e = document.createElementNS(NS, tag); if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
const f2 = v => (Math.round(v * 100) / 100);
function T(e, x = 0, y = 0, r = 0, sx = 1, sy = sx) { e.setAttribute('transform', `translate(${f2(x)},${f2(y)}) rotate(${f2(r)}) scale(${f2(sx * 1000) / 1000},${f2(sy * 1000) / 1000})`); }
function vis(e, v) { e.style.display = v ? '' : 'none'; }
function opa(e, v) { v = clamp(v); e.style.display = v > 0.002 ? '' : 'none'; e.style.opacity = v.toFixed(3); }
function SV(parent) { return E('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, parent); }
function txt(parent, s, o = {}) {
  const e = E('text', {
    x: o.x || 0, y: o.y || 0, 'text-anchor': o.anchor || 'middle', 'font-family': `'${o.font || 'Bangers'}'`, 'font-size': o.size || 100,
    'font-weight': o.weight || 400, fill: o.fill || '#fff', 'letter-spacing': o.ls || 0
  }, parent);
  if (o.stroke) { e.setAttribute('stroke', o.stroke); e.setAttribute('stroke-width', o.sw || 10); e.setAttribute('paint-order', 'stroke'); e.setAttribute('stroke-linejoin', 'round'); }
  e.textContent = s; return e;
}

// ---------- palette ----------
const INK = '#17120F', CREAM = '#F4EFE6', CL = '#D97757', GP = '#10A37F', MB = '#0081FB', YEL = '#FFD23F', RED = '#E63946';
const CL_GLOVE = '#E8473B', GP_GLOVE = '#262A30', GOLD = '#FFC83D', GOLD2 = '#E39B00';

// ---------- logos (unit radius 100) ----------
function sparkD(seed = 11) {
  const r = rng(seed); let d = '';
  const n = 12;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (r() - .5) * 0.2 - Math.PI / 2;
    const L = 100 * (0.8 + r() * 0.2);
    const w0 = 6.5, w1 = 8.5 + r() * 2.5;
    const ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
    const x0 = ca * 10, y0 = sa * 10, x1 = ca * L, y1 = sa * L;
    d += `M${f2(x0 + px * w0)},${f2(y0 + py * w0)} L${f2(x1 + px * w1)},${f2(y1 + py * w1)} A${f2(w1)},${f2(w1)} 0 0 0 ${f2(x1 - px * w1)},${f2(y1 - py * w1)} L${f2(x0 - px * w0)},${f2(y0 - py * w0)} Z `;
  }
  return d;
}
const SPARK_D = sparkD(11);
function drawSpark(g, col = CL, disc = true, ol = 9) {
  if (ol) { E('path', { d: SPARK_D, fill: INK, stroke: INK, 'stroke-width': ol, 'stroke-linejoin': 'round' }, g); if (disc) E('circle', { r: 34 + ol / 2, fill: INK }, g); }
  E('path', { d: SPARK_D, fill: col }, g);
  if (disc) E('circle', { r: 34, fill: col }, g);
}
function rrPath(x, y, w, h, r) {
  return `M${x},${y + h - r} L${x},${y + r} A${r},${r} 0 0 1 ${x + r},${y} L${x + w - r},${y} A${r},${r} 0 0 1 ${x + w},${y + r} L${x + w},${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} L${x + r},${y + h} A${r},${r} 0 0 1 ${x},${y + h - r}`;
}
let UID = 0;
function drawKnot(g, col = GP, R = 96, ol = 9) {
  // six interlocking links: all "A" halves first, then all "B" halves; B's ink edge cuts a gap where it crosses A
  const [a, w, h, top, rx, sw] = [-0.08, 0.53, 0.82, -0.95, 0.26, 0.125];
  const d = rrPath(a * R, top * R, w * R, h * R, rx * R);
  const half = (off, len, inset) => { const k = E('g', { fill: 'none' }, g);
    for (let i = 0; i < 6; i++) {
      if (ol) E('path', { d, transform: `rotate(${i * 60})`, pathLength: 100, stroke: INK, 'stroke-width': sw * R + ol, 'stroke-dasharray': `${len - 2 * inset} 100`, 'stroke-dashoffset': -(off + inset) }, k);
    }
    for (let i = 0; i < 6; i++) E('path', { d, transform: `rotate(${i * 60})`, pathLength: 100, stroke: col, 'stroke-width': sw * R, 'stroke-dasharray': `${len} 100`, 'stroke-dashoffset': -off }, k);
  };
  half(50, 50, 0); half(0, 50, 5);
}
const META_D = 'M100 55 C120 20,140 10,158 10 C182 10,195 45,195 65 C195 85,185 92,172 92 C150 92,125 70,100 55 C80 30,65 12,45 12 C22 12,6 45,6 66 C6 84,16 92,28 92 C50 92,78 68,100 55 Z';
function drawMeta(g, sw = 17, ol = 9) {
  const k = E('g', { transform: 'translate(-100,-51)' }, g);
  if (ol) E('path', { d: META_D, fill: 'none', stroke: INK, 'stroke-width': sw + ol, 'stroke-linejoin': 'round' }, k);
  E('path', { d: META_D, fill: 'none', stroke: 'url(#metaGrad)', 'stroke-width': sw, 'stroke-linejoin': 'round' }, k);
}
function gloveMarkup(g, col, cuff = '#fff', s = 115) {
  E('rect', { x: -0.44 * s, y: -0.16 * s, width: 0.2 * s, height: 0.32 * s, rx: 0.07 * s, fill: cuff, stroke: INK, 'stroke-width': 0.04 * s }, g);
  E('path', { d: `M${-0.26 * s},${-0.18 * s} C${-0.12 * s},${-0.33 * s} ${0.25 * s},${-0.32 * s} ${0.3 * s},${-0.03 * s} C${0.33 * s},${0.2 * s} ${0.12 * s},${0.29 * s} ${-0.04 * s},${0.26 * s} C${-0.22 * s},${0.24 * s} ${-0.3 * s},${0.12 * s} ${-0.26 * s},${-0.18 * s} Z`, fill: col, stroke: INK, 'stroke-width': 0.04 * s }, g);
  E('ellipse', { cx: 0.06 * s, cy: -0.19 * s, rx: 0.1 * s, ry: 0.045 * s, fill: '#fff', opacity: .5 }, g);
}
function starPath(r1 = 20, r2 = 9, n = 5) {
  let d = '';
  for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? r2 : r1; d += (i ? 'L' : 'M') + f2(Math.cos(a) * r) + ',' + f2(Math.sin(a) * r); }
  return d + 'Z';
}
function drawTrophy(g) {
  // base bottom at y=0, ~232 tall
  const o = { stroke: INK, 'stroke-width': 6, 'stroke-linejoin': 'round' };
  E('path', { d: 'M-70,-150 C-128,-150 -128,-82 -52,-84', fill: 'none', stroke: INK, 'stroke-width': 28, 'stroke-linecap': 'round' }, g);
  E('path', { d: 'M70,-150 C128,-150 128,-82 52,-84', fill: 'none', stroke: INK, 'stroke-width': 28, 'stroke-linecap': 'round' }, g);
  E('path', { d: 'M-70,-150 C-128,-150 -128,-82 -52,-84', fill: 'none', stroke: GOLD, 'stroke-width': 15, 'stroke-linecap': 'round' }, g);
  E('path', { d: 'M70,-150 C128,-150 128,-82 52,-84', fill: 'none', stroke: GOLD, 'stroke-width': 15, 'stroke-linecap': 'round' }, g);
  E('rect', { x: -72, y: -42, width: 144, height: 42, rx: 9, fill: '#3B2A55', ...o }, g);
  E('rect', { x: -38, y: -30, width: 76, height: 18, rx: 4, fill: GOLD2 }, g);
  E('path', { d: 'M-22,-42 L22,-42 L13,-96 L-13,-96 Z', fill: GOLD2, ...o }, g);
  E('ellipse', { cx: 0, cy: -98, rx: 30, ry: 10, fill: GOLD, ...o }, g);
  E('path', { d: 'M-80,-222 L80,-222 C80,-146 44,-108 0,-108 C-44,-108 -80,-146 -80,-222 Z', fill: GOLD, ...o }, g);
  E('path', { d: 'M-48,-206 C-52,-170 -40,-140 -18,-124', fill: 'none', stroke: '#FFF3C4', 'stroke-width': 9, 'stroke-linecap': 'round', opacity: .9 }, g);
  E('ellipse', { cx: 0, cy: -222, rx: 80, ry: 14, fill: '#FFE59A', ...o }, g);
  txt(g, '1', { x: 8, y: -132, size: 76, fill: GOLD2 });
}

// ---------- fighters ----------
const KIND = {
  claude: { eyes: [[-20, -3], [20, -3]], k: 1.1, my: 26, lid: CL, glove: CL_GLOVE, cuff: '#fff', gs: 115 },
  gpt: { eyes: [[-20, -3], [20, -3]], k: 1.1, my: 26, lid: GP, glove: GP_GLOVE, cuff: '#fff', gs: 115 },
  meta: { eyes: [[-60, 6], [66, 6]], k: 1.3, my: 66, lid: '#0A6CF0', glove: '#fff', cuff: '#DDE6F5', gs: 72 },
};
const MOODS = {
  angry: { eyes: 'open', lid: 0.2, brow: 'angry', mouth: 'frown' },
  grit: { eyes: 'open', lid: 0.28, brow: 'angry', mouth: 'teeth' },
  hit: { eyes: 'chev', brow: 'worried', mouth: 'O' },
  strain: { eyes: 'chev', brow: 'angry', mouth: 'teeth' },
  shock: { eyes: 'open', lid: 0, big: 1.22, pup: 0.6, brow: 'raised', mouth: 'o' },
  smug: { eyes: 'open', lid: 0.5, brow: 'smug', mouth: 'smirk' },
  proud: { eyes: 'open', lid: 0.48, brow: 'raised', mouth: 'smile' },
  happy: { eyes: 'arc', brow: 'none', mouth: 'grin' },
  sneaky: { eyes: 'open', lid: 0.42, brow: 'smug', mouth: 'smirk' },
  ko: { eyes: 'x', brow: 'none', mouth: 'wavy' },
  dizzy: { eyes: 'spiral', brow: 'none', mouth: 'wavy' },
  neutral: { eyes: 'open', lid: 0.1, brow: 'flat', mouth: 'line' },
};
function spiralD(cx, cy, k) {
  let d = '';
  for (let i = 0; i <= 28; i++) { const a = i / 28 * Math.PI * 4, r = (1.5 + i * 0.36) * k; d += (i ? 'L' : 'M') + f2(cx + Math.cos(a) * r) + ',' + f2(cy + Math.sin(a) * r); }
  return d;
}
class Fighter {
  constructor(kind, parent) {
    const K = this.K = KIND[kind]; this.kind = kind;
    const g = this.g = E('g', null, parent);
    this.shadow = E('ellipse', { cx: 0, cy: kind === 'meta' ? 62 : 126, rx: 84, ry: 13, fill: 'rgba(0,0,0,.2)' }, g);
    this.inner = E('g', null, g);
    this.armB = E('path', { fill: 'none', stroke: INK, 'stroke-width': 7, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, this.inner);
    this.gB = E('g', null, this.inner); gloveMarkup(this.gB, K.glove, K.cuff, K.gs);
    this.body = E('g', null, this.inner);
    this.logo = E('g', null, this.body);
    if (kind === 'claude') drawSpark(this.logo);
    else if (kind === 'gpt') { drawKnot(this.logo); E('circle', { r: 35, fill: INK }, this.logo); E('circle', { r: 30.5, fill: GP }, this.logo); }
    else drawMeta(this.logo);
    if (kind === 'meta') this.logo.setAttribute('transform', 'scale(1.06)');
    const face = this.face = E('g', null, this.body);
    const k = K.k, rx = 16 * k, ry = 20 * k;
    this.eyes = K.eyes.map(([ex, ey]) => {
      const eg = E('g', null, face);
      const sc = E('ellipse', { rx, ry, fill: '#fff', stroke: INK, 'stroke-width': 4.5 }, eg);
      const pg = E('g', null, eg);
      E('circle', { r: 8.6 * k, fill: INK }, pg); E('circle', { cx: 2.8 * k, cy: -3.2 * k, r: 2.8 * k, fill: '#fff' }, pg);
      const lid = E('path', { fill: K.lid, stroke: INK, 'stroke-width': 4.5, 'stroke-linejoin': 'round' }, eg);
      return { eg, sc, pg, lid, ex, ey };
    });
    this.alt = E('path', { fill: 'none', stroke: INK, 'stroke-width': 6.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, face);
    this.brow = E('path', { fill: 'none', stroke: INK, 'stroke-width': 7.5 * Math.sqrt(k), 'stroke-linecap': 'round' }, face);
    this.mouth = E('path', { stroke: INK, 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, face);
    this.armF = E('path', { fill: 'none', stroke: INK, 'stroke-width': 7, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, this.inner);
    this.gF = E('g', null, this.inner); gloveMarkup(this.gF, K.glove, K.cuff, K.gs);
    this.fx = E('g', null, g);
    this.sweat = E('path', { d: 'M0,-16 C6,-6 10,0 10,6 A10,10 0 0 1 -10,6 C-10,0 -6,-6 0,-16 Z', fill: '#8FD3FF', stroke: INK, 'stroke-width': 3.5 }, this.fx);
    this.stars = [0, 1, 2].map(() => E('path', { d: starPath(13, 6), fill: YEL, stroke: INK, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, this.fx));
    this.q = E('g', null, this.fx);
    txt(this.q, '?', { y: 30, size: 110, fill: '#fff', stroke: INK, sw: 12 });
    this.mood = null;
  }
  setMood(m, big = 1, look = [0, 0], blink = 0) {
    const M = MOODS[m], K = this.K, k = K.k;
    const open = M.eyes === 'open';
    const sz = (M.big || 1) * big;
    for (const e of this.eyes) {
      vis(e.eg, open);
      if (!open) continue;
      const lid = clamp(Math.max(M.lid || 0, blink));
      T(e.eg, e.ex, e.ey, 0, sz, sz);
      const pupS = M.pup || 1;
      T(e.pg, look[0] * 6.5 * k, look[1] * 7 * k + lid * 6 * k, 0, pupS);
      const rx = 16 * k + 1, ry = 20 * k + 1;
      if (lid < 0.02) { vis(e.lid, false); }
      else {
        vis(e.lid, true);
        const yc = -ry + 2 * ry * Math.min(lid, 0.999), xw = rx * Math.sqrt(Math.max(0, 1 - (yc / ry) ** 2));
        e.lid.setAttribute('d', `M${f2(-xw)},${f2(yc)} A${f2(rx)},${f2(ry)} 0 ${yc > 0 ? 1 : 0} 1 ${f2(xw)},${f2(yc)} Z`);
      }
    }
    if (this.mood === m && !this._dyn) return;
    this.mood = m;
    const [[lx, ly], [rx2, ry2]] = K.eyes;
    let a = '';
    if (M.eyes === 'chev') a = `M${lx - 9 * k},${ly - 10 * k} L${lx + 7 * k},${ly} L${lx - 9 * k},${ly + 10 * k} M${rx2 + 9 * k},${ry2 - 10 * k} L${rx2 - 7 * k},${ry2} L${rx2 + 9 * k},${ry2 + 10 * k}`;
    if (M.eyes === 'arc') a = `M${lx - 11 * k},${ly + 4 * k} Q${lx},${ly - 13 * k} ${lx + 11 * k},${ly + 4 * k} M${rx2 - 11 * k},${ry2 + 4 * k} Q${rx2},${ry2 - 13 * k} ${rx2 + 11 * k},${ry2 + 4 * k}`;
    if (M.eyes === 'x') a = `M${lx - 9 * k},${ly - 9 * k} L${lx + 9 * k},${ly + 9 * k} M${lx + 9 * k},${ly - 9 * k} L${lx - 9 * k},${ly + 9 * k} M${rx2 - 9 * k},${ry2 - 9 * k} L${rx2 + 9 * k},${ry2 + 9 * k} M${rx2 + 9 * k},${ry2 - 9 * k} L${rx2 - 9 * k},${ry2 + 9 * k}`;
    if (M.eyes === 'spiral') a = spiralD(lx, ly, k) + spiralD(rx2, ry2, k);
    vis(this.alt, !open); this.alt.setAttribute('d', a);
    // brows
    const bw = (ex, ey, s) => {
      const o = ey - 28 * k;
      switch (M.brow) {
        case 'angry': return `M${ex + s * 14 * k},${o - 5 * k} L${ex - s * 12 * k},${o + 5 * k}`;
        case 'worried': return `M${ex + s * 14 * k},${o + 4 * k} L${ex - s * 12 * k},${o - 6 * k}`;
        case 'raised': return `M${ex - 13 * k},${o - 2 * k} Q${ex},${o - 13 * k} ${ex + 13 * k},${o - 2 * k}`;
        case 'flat': return `M${ex - 12 * k},${o} L${ex + 12 * k},${o}`;
        case 'smug': return s < 0 ? `M${ex - 12 * k},${o + 2 * k} L${ex + 12 * k},${o + 3 * k}` : `M${ex - 13 * k},${o - 2 * k} Q${ex},${o - 14 * k} ${ex + 13 * k},${o - 4 * k}`;
        default: return '';
      }
    };
    this.brow.setAttribute('d', bw(lx, ly, -1) + ' ' + bw(rx2, ry2, 1));
    const my = K.my, mx = this.kind === 'meta' ? 4 : 0;
    let md = '', mf = 'none';
    switch (M.mouth) {
      case 'frown': md = `M${mx - 11},${my + 3} Q${mx},${my - 5} ${mx + 11},${my + 3}`; break;
      case 'teeth': md = `M${mx - 15},${my - 6} h30 v13 h-30 Z M${mx - 5},${my - 6} v13 M${mx + 5},${my - 6} v13 M${mx - 15},${my + 0.5} h30`; mf = '#fff'; break;
      case 'O': md = `M${mx - 9},${my + 2} A9,11 0 1 0 ${mx + 9},${my + 2} A9,11 0 1 0 ${mx - 9},${my + 2} Z`; mf = '#4A1410'; break;
      case 'o': md = `M${mx - 5.5},${my + 2} A5.5,7 0 1 0 ${mx + 5.5},${my + 2} A5.5,7 0 1 0 ${mx - 5.5},${my + 2} Z`; mf = '#4A1410'; break;
      case 'smirk': md = `M${mx - 10},${my + 2} Q${mx + 2},${my + 8} ${mx + 12},${my - 3}`; break;
      case 'smile': md = `M${mx - 12},${my} Q${mx},${my + 11} ${mx + 12},${my}`; break;
      case 'grin': md = `M${mx - 16},${my - 3} Q${mx},${my + 22} ${mx + 16},${my - 3} Z`; mf = '#4A1410'; break;
      case 'wavy': md = `M${mx - 13},${my + 2} q3.25,-5 6.5,0 t6.5,0 t6.5,0 t6.5,0`; break;
      case 'line': md = `M${mx - 8},${my} h16`; break;
    }
    this.mouth.setAttribute('d', md); this.mouth.setAttribute('fill', mf);
  }
  // p: x,y,s,rot,sq,dir,op,look,mood,blink,flash,air,shadow,gF,gB,armF,armB,dizzy,q,sweat,tt,big
  set(p) {
    const { x = 0, y = 0, s = 1, rot = 0, sq = 0, dir = 1, op = 1, mood = 'angry', blink = 0, flash = 0, air = 0, shadow = 1, dizzy = 0, q = 0, sweat = 0, tt = 0, big = 1 } = p;
    if (op <= 0.002) { vis(this.g, false); return; }
    vis(this.g, true); this.g.style.opacity = op < 1 ? op.toFixed(3) : '';
    T(this.g, x, y, 0, s);
    const look = p.look || [dir, 0];
    vis(this.shadow, shadow > 0.01);
    if (shadow > 0.01) { const k = 1 - clamp(air / 500) * 0.6; this.shadow.setAttribute('rx', f2(84 * k)); this.shadow.setAttribute('opacity', f2(shadow * k)); }
    this.inner.setAttribute('transform', `translate(0,${f2(-air)}) rotate(${f2(rot)}) translate(0,100) scale(${f2((1 + sq) * 1000) / 1000},${f2((1 - sq) * 1000) / 1000}) translate(0,-100)`);
    this.body.setAttribute('filter', flash > 0.5 ? 'url(#fWhite)' : '');
    this.setMood(mood, big, look, blink);
    const meta = this.kind === 'meta';
    const gF = p.gF || (meta ? [128, 46, -10, 1] : [82, 32, -8, 1]);
    const gB = p.gB || (meta ? [-124, 46, 10, 1] : [-74, 48, 10, 1]);
    T(this.gF, dir * gF[0], gF[1], dir * gF[2], dir * gF[3], gF[3]);
    T(this.gB, dir * gB[0], gB[1], dir * gB[2], dir * gB[3], gB[3]);
    this.armF.setAttribute('d', p.armF ? this.zig(dir * 34, 18, dir * gF[0] - dir * 36 * gF[3], gF[1]) : '');
    this.armB.setAttribute('d', p.armB ? this.zig(-dir * 30, 24, dir * gB[0] + dir * 36 * gB[3], gB[1]) : '');
    // fx
    vis(this.sweat, sweat > 0.01);
    if (sweat > 0.01) { T(this.sweat, -dir * 70, -70 + 8 * Math.sin(tt * 18), 0, sweat); }
    for (let i = 0; i < 3; i++) {
      const st = this.stars[i]; vis(st, dizzy > 0.01);
      if (dizzy > 0.01) { const a = tt * 7 + i * 2.094; T(st, Math.cos(a) * 66, -128 + Math.sin(a) * 15, tt * 200, dizzy * (0.85 + 0.25 * Math.sin(a))); }
    }
    vis(this.q, q > 0.01);
    if (q > 0.01) T(this.q, -dir * 40, -168, -dir * 8, q);
  }
  zig(x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
    if (L < 30) return '';
    const n = Math.max(3, Math.round(L / 26)), ux = dx / L, uy = dy / L, px = -uy, py = ux;
    let d = `M${f2(x0)},${f2(y0)}`;
    for (let i = 1; i < n; i++) { const a = (i % 2 ? 1 : -1) * 11; d += ` L${f2(x0 + dx * i / n + px * a)},${f2(y0 + dy * i / n + py * a)}`; }
    return d + ` L${f2(x1)},${f2(y1)}`;
  }
}

// ---------- comic burst ----------
function makeBurst(parent, text, o = {}) {
  const g = E('g', null, parent);
  const r = rng(o.seed || 3), n = 15, pts = [];
  for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rad = (i % 2 ? 0.6 : 1) * (0.86 + r() * 0.26); pts.push([Math.cos(a) * rad, Math.sin(a) * rad]); }
  const sz = o.size || 1, Rx = 205 * sz, Ry = 158 * sz;
  const P = k => pts.map(p => `${f2(p[0] * Rx * k)},${f2(p[1] * Ry * k)}`).join(' ');
  E('polygon', { points: P(1), fill: o.c1 || YEL, stroke: INK, 'stroke-width': 9, 'stroke-linejoin': 'round' }, g);
  E('polygon', { points: P(0.74), fill: o.c2 || '#FF6236' }, g);
  const fs = 112 * sz;
  txt(g, text, { y: fs * 0.36, size: fs, fill: o.c3 || '#fff', stroke: INK, sw: 11 * sz });
  vis(g, false);
  return {
    g, set(x, y, age, life = 0.5, rot = 0) {
      if (age < 0 || age > life) { vis(g, false); return; }
      vis(g, true);
      let s = spring(age, 26, 0.42);
      s *= 1 - easeIn(seg(age, life - 0.12, life));
      const j = age < 0.16 ? 5 : 0;
      T(g, x + j * noise1(age * 60, 1), y + j * noise1(age * 60, 2), rot + 10 * (1 - spring(age, 20, 0.6)), Math.max(0.001, s));
    }
  };
}
function speechBubble(parent, text, o = {}) {
  const g = E('g', null, parent);
  const w = o.w || 230, h = o.h || 120, tail = o.tail || 1;
  const tx = tail * w * 0.16, yb = (h / 2) * Math.sqrt(1 - (tx / (w / 2)) ** 2);
  E('path', { d: `M${tx - 22},${yb - 14} L${tx + tail * 34},${yb + 46} L${tx + 22},${yb - 14} Z`, fill: '#fff', stroke: INK, 'stroke-width': 7, 'stroke-linejoin': 'round' }, g);
  E('ellipse', { rx: w / 2, ry: h / 2, fill: '#fff', stroke: INK, 'stroke-width': 7 }, g);
  E('path', { d: `M${tx - 16},${yb - 12} L${tx + 16},${yb - 12} L${tx + 16 + tail * 4},${yb + 6} L${tx - 14 + tail * 6},${yb + 6} Z`, fill: '#fff' }, g);
  txt(g, text, { y: (o.size || 62) * 0.36, size: o.size || 62, fill: o.fill || INK });
  vis(g, false);
  return g;
}
