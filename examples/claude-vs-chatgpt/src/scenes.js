// ===================================================================================
// CLAUDE vs CHATGPT — 15 s, 160 BPM (beat 0.375 s, bar 1.5 s)
// time    what happens                                                   | sound
// 0.000   S1 VS screen: orange / green panels slam in, fighters pop     | whoosh, stab, crash
// 0.375   "VS" slams in                                                  | big hit
// 0.750   "ROUND 1", both taunt-jab                                      | stab, snare roll, riser
// 1.125   "¡PELEA!" slam                                                 | punch + hit
// 1.300   ¡PELEA! zooms through the camera, panels split open            | whoosh
// 1.500   S2 chat window springs up, fighters drop in (the drop)         | crash, groove starts
// 1.875   Claude: "Yo soy el #1"                                         | pop + typing
// 2.625   ChatGPT: "¿Perdona? El #1 soy YO"                              | pop + typing
// 3.188   Claude's spring glove punches the bubble                       | chop whoosh
// 3.375   bubble smacks ChatGPT  ¡PUM!                                   | heavy punch
// 3.656   ChatGPT fires the three typing dots; hits 3.75 / 3.84 / 3.94   | blips + light punches, ¡ZAS!
// 4.125   both charge                                                    | whooshes, snare roll
// 4.313   collision ¡BAM!, the burst floods the screen yellow            | big hit
// 4.500   S3 ranking card; the rows swap places on every hit             | punch per swap
//         swaps 4.875 5.625 6.0 6.375 6.5625 6.75 6.9375 7.125
// 7.125   last swap knocks the #1 trophy loose; dark iris wipe           | punch + whoosh
// 7.500   S4 stage; the trophy drops onto the #1 podium (7.875)          | crash, ding
// 7.875   both dash in and hop onto #2 / #3                              | whooshes
// 8.250   tug-of-war over the trophy, "¡MÍO!" "¡MÍO!"                    | pops
// 8.813   trophy pops up, they collide -> fight cloud                    | punch, big hit
// 9.0     cloud fight, bursts on the beats                               | punches on 16ths
// 10.500  record scratch, freeze, "¡UN NUEVO RETADOR!"                   | scratch, music stops
// 10.875  Meta tiptoes in (a step every 8th)                             | pizzicato + ticks
// 11.625  Meta's stretchy hand snatches the trophy                       | ding
// 11.813  Meta hops onto #1                                              | power-up
// 12.000  cloud poofs; Claude & ChatGPT notice: "?" "?" (12.19)          | whoosh, pops
// 12.375  Meta raises the trophy, confetti                               | fanfare
// 12.750  K.O. — both faint                                              | big hit, chord
// 13.125  "¡META SE LO QUEDA!"                                           | punch, chord
// 13.6    "MIENTRAS ELLOS PELEABAN..." types in                          | ticks
// ===================================================================================
const W = 1920, H = 1080, DUR = 15, BT = 60 / 160;

// ---------- global camera shake / flashes ----------
const SWAPS = [4.875, 5.625, 6.0, 6.375, 6.5625, 6.75, 6.9375, 7.125];
const SHAKES = [[0.375, 20], [1.125, 24], [3.375, 14], [3.75, 6], [3.84375, 6], [3.9375, 10], [4.3125, 32], ...SWAPS.map((t, i) => [t, i === 7 ? 16 : 11]),
  [7.875, 8], [8.95, 20], [9.375, 9], [9.75, 9], [10.125, 10], [11.4375, 3], [12.0, 10], [12.75, 16], [13.0, 12], [13.125, 18]];
const FLASHES = [[0.375, .45, .1], [1.125, .65, .12], [3.375, .25, .08], [4.3125, .85, .16], [7.125, .25, .1], [8.95, .5, .1], [10.5, .55, .1], [12.75, .45, .12], [13.125, .35, .1]];
const INVERTS = [1.125, 4.3125, 8.95];
function shakeAt(t) {
  let x = 0, y = 0, r = 0;
  for (const [t0, a] of SHAKES) {
    const d = t - t0; if (d < 0 || d > 0.7) continue;
    const e = a * Math.exp(-8 * d), s = Math.round(t0 * 1000);
    x += e * noise1(d * 40, s); y += e * noise1(d * 40, s + 7); r += e * 0.04 * noise1(d * 32, s + 3);
  }
  return [x, y, r];
}
function flashAt(t) { let v = 0; for (const [t0, a, d] of FLASHES) if (t >= t0 && t < t0 + d) v = Math.max(v, a * (1 - (t - t0) / d)); return v; }

// ---------- health ----------
const DMG_C = [[3.75, 8], [3.84375, 8], [3.9375, 10], [4.3125, 6], ...SWAPS.filter((_, i) => i % 2 === 0).map(t => [t, 6]), [9.0, 8], [9.375, 10], [9.75, 8], [10.125, 10], [12.75, 100]];
const DMG_G = [[3.375, 14], [4.3125, 6], ...SWAPS.filter((_, i) => i % 2 === 1).map(t => [t, 6]), [9.0, 8], [9.375, 12], [9.75, 12], [10.125, 16], [12.75, 100]];
function hpKeys(list, w, z, delay = 0) { let h = 100; return track(100, list.map(([t, d]) => { h = Math.max(0, h - d); return [t + delay, h, w, z]; })); }
const HP_C = hpKeys(DMG_C, 30, 1), HP_G = hpKeys(DMG_G, 30, 1), TR_C = hpKeys(DMG_C, 7, 1, 0.22), TR_G = hpKeys(DMG_G, 7, 1, 0.22);

// =================================================================================== S1 intro
const S1 = {};
function buildS1() {
  const L = document.getElementById('L1'), svg = SV(L); S1.L = L;
  E('rect', { width: W, height: H, fill: CREAM }, svg);
  const mk = (pts, col, seed) => {
    const g = E('g', null, svg), id = 'clip' + (UID++);
    E('polygon', { points: pts }, E('clipPath', { id }, E('defs', null, g)));
    E('polygon', { points: pts, fill: col }, g);
    const inner = E('g', { 'clip-path': `url(#${id})` }, g);
    E('rect', { x: -700, y: 0, width: 3300, height: H, fill: 'url(#dotInk)', opacity: .12 }, inner);
    const r = rng(seed), lines = [];
    for (let i = 0; i < 18; i++) lines.push({ e: E('rect', { y: f2(r() * H), height: f2(5 + r() * 12), width: f2(220 + r() * 520), rx: 6, fill: '#fff', opacity: f2(.16 + r() * .2) }, inner), x0: r() * 2600, sp: 1500 + r() * 1500 });
    return { g, lines };
  };
  S1.pL = mk('-700,0 1060,0 860,1080 -700,1080', CL, 5);
  S1.pR = mk('1060,0 2620,0 2620,1080 860,1080', GP, 9);
  // lightning along the split
  let d = ''; const ax = 1060, ay = -30, bx = 860, by = 1110, n = 12;
  for (let i = 0; i <= n; i++) { const u = i / n, o = (i % 2 ? 1 : -1) * (i && i < n ? 30 : 0); d += (i ? 'L' : 'M') + f2(lerp(ax, bx, u) + o * 0.98) + ',' + f2(lerp(ay, by, u) + o * 0.18); }
  S1.bolt = E('g', null, svg);
  E('path', { d, fill: 'none', stroke: INK, 'stroke-width': 34, 'stroke-linejoin': 'miter' }, S1.bolt);
  E('path', { d, fill: 'none', stroke: YEL, 'stroke-width': 16, 'stroke-linejoin': 'miter' }, S1.bolt);
  // white pop-art bursts behind the fighters, so the orange / green logos read on their own colour
  const pop = seed => {
    const g = E('g', null, svg), r = rng(seed), n = 18, pts = [];
    for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rad = (i % 2 ? 0.8 : 1) * (0.94 + r() * 0.1) * 390; pts.push(`${f2(Math.cos(a) * rad)},${f2(Math.sin(a) * rad)}`); }
    E('polygon', { points: pts.join(' '), fill: CREAM, stroke: INK, 'stroke-width': 9, 'stroke-linejoin': 'round' }, g);
    E('polygon', { points: pts.join(' '), fill: 'url(#dotBig)', opacity: .08 }, g);
    return g;
  };
  S1.popC = pop(3); S1.popG = pop(4);
  S1.fC = new Fighter('claude', svg); S1.fG = new Fighter('gpt', svg);
  S1.nC = txt(svg, 'CLAUDE', { x: 0, y: 0, anchor: 'start', font: 'Press Start 2P', size: 60, fill: '#fff', stroke: INK, sw: 14 });
  S1.nG = txt(svg, 'CHATGPT', { x: 0, y: 0, anchor: 'end', font: 'Press Start 2P', size: 60, fill: '#fff', stroke: INK, sw: 14 });
  S1.vs = E('g', null, svg);
  txt(S1.vs, 'VS', { x: 14, y: 130, size: 360, fill: INK });
  txt(S1.vs, 'VS', { y: 116, size: 360, fill: YEL, stroke: INK, sw: 26 });
  S1.round = E('g', null, svg);
  txt(S1.round, 'ROUND 1', { y: 42, size: 120, fill: '#fff', stroke: INK, sw: 18 });
}
function setS1(t) {
  const on = t < 1.52; vis(S1.L, on); if (!on) return;
  const outK = easeIn(seg(t, 1.27, 1.5));
  const xL = -1400 * (1 - spring(t + 0.07, 13, 0.8)) - 1500 * outK, xR = 1400 * (1 - spring(t + 0.03, 13, 0.8)) + 1500 * outK;
  T(S1.pL.g, xL, 0); T(S1.pR.g, xR, 0);
  for (const l of S1.pL.lines) l.e.setAttribute('x', f2(((l.x0 - t * l.sp) % 2600 + 2600) % 2600 - 700));
  for (const l of S1.pR.lines) l.e.setAttribute('x', f2(((l.x0 + t * l.sp) % 2600 + 2600) % 2600 - 300));
  // bolt flickers after VS
  const bo = t < 0.375 ? 0 : (Math.floor(t * 24) % 3 === 0 ? 0.35 : 1) * (1 - outK);
  opa(S1.bolt, bo); if (bo) T(S1.bolt, 0, 0, 0, 1, 1);
  const bob = k => Math.abs(Math.sin(Math.PI * (t + k) / BT));
  const popC = spring(t - 0.06, 15, 0.55), popG = spring(t - 0.12, 15, 0.55);
  const jC = jab(t, 0.75, 0.05, 0.1, 0.15), jG = jab(t, 0.84375, 0.05, 0.1, 0.15);
  const flinch = bump(t, 0.375, 10);
  const moodC = at(t, [[0, 'angry'], [0.75, 'grit'], [0.95, 'angry'], [1.125, 'grit']], 'angry');
  const moodG = at(t, [[0, 'angry'], [0.84, 'grit'], [1.04, 'angry'], [1.125, 'grit']], 'angry');
  S1.fC.set({ x: 500 + xL - 40 * flinch, y: 640 - 16 * bob(0), s: 2.35 * (0.3 + 0.7 * popC), sq: 0.05 * (0.5 - bob(0)), rot: -6 * flinch, mood: moodC, look: [1, 0.1],
    gF: [82 + 120 * jC, 32 - 34 * jC, -8 - 10 * jC, 1 + 0.2 * jC], gB: [-74, 48 - 10 * bob(0.1), 10, 1], shadow: 0, tt: t });
  S1.fG.set({ x: 1420 + xR + 40 * flinch, y: 640 - 16 * bob(0.18), s: 2.35 * (0.3 + 0.7 * popG), sq: 0.05 * (0.5 - bob(0.18)), rot: 6 * flinch, dir: -1, mood: moodG, look: [-1, 0.1],
    gF: [82 + 120 * jG, 32 - 34 * jG, -8 - 10 * jG, 1 + 0.2 * jG], gB: [-74, 48 - 10 * bob(0.28), 10, 1], shadow: 0, tt: t });
  T(S1.popC, 500 + xL, 600, t * 14, 0.2 + 0.8 * popC); T(S1.popG, 1420 + xR, 600, -t * 14, 0.2 + 0.8 * popG);
  const nIn = k => 1 - spring(t - k, 16, 0.75);
  T(S1.nC, 90 + xL - 900 * nIn(0.45), 1020); T(S1.nG, 1830 + xR + 900 * nIn(0.5), 1020);
  // VS
  if (t >= 0.375 && t < 1.2) {
    const s = lerp(3.4, 1, spring(t - 0.375, 20, 0.5)) * (1 - easeIn(seg(t, 1.1, 1.2)));
    vis(S1.vs, true); T(S1.vs, 960 + 4 * noise1(t * 30, 4), 520 + 4 * noise1(t * 30, 5), -7 + 9 * (1 - spring(t - 0.375, 18, 0.6)), Math.max(0.001, s));
  } else vis(S1.vs, false);
  if (t >= 0.75 && t < 1.15) { vis(S1.round, true); T(S1.round, 960, 190, -3, Math.max(0.001, spring(t - 0.75, 22, 0.5) * (1 - easeIn(seg(t, 1.08, 1.15))))); } else vis(S1.round, false);
}

// =================================================================================== S2 chat
const S2 = {};
function winP(t) {
  const a = spring(t - 1.38, 15, 0.62), j = bump(t, 4.3125, 6);
  return { x: 960, y: 600 + 460 * (1 - a) + 26 * j, r: -12 * (1 - a) - 1.5 + 6 * j * Math.sin((t - 4.3125) * 45), s: lerp(0.3, 1.1, a) * (1 + 0.05 * j) };
}
function winToStage(p, x, y) { const c = Math.cos(p.r * Math.PI / 180), s = Math.sin(p.r * Math.PI / 180); return [p.x + p.s * (x * c - y * s), p.y + p.s * (x * s + y * c)]; }
function chatBubble(parent, text, col, side) {
  const g = E('g', null, parent);
  const t = txt(g, text, { anchor: 'start', font: 'Inter', weight: 800, size: 46, fill: INK });
  const w = t.getComputedTextLength() + 72, h = 92;
  t.setAttribute('x', f2(-w / 2 + 36)); t.setAttribute('y', 16);
  const tx = side * (w / 2 - 34);
  const tail = E('path', { d: `M${tx - 18},${h / 2 - 6} L${tx + side * 30},${h / 2 + 28} L${tx + 18},${h / 2 - 6} Z`, fill: col, stroke: INK, 'stroke-width': 5, 'stroke-linejoin': 'round' }, g);
  const r = E('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 34, fill: col, stroke: INK, 'stroke-width': 5 }, g);
  g.insertBefore(tail, t); g.insertBefore(r, tail);
  E('rect', { x: tx - 16, y: h / 2 - 9, width: 34, height: 7, fill: col }, g);
  g.appendChild(t);
  return { g, t, w, h, full: text };
}
function buildS2() {
  const L = document.getElementById('L2'), svg = SV(L); S2.L = L;
  E('rect', { width: W, height: H, fill: CREAM }, svg);
  E('rect', { width: W, height: H, fill: 'url(#dotInk)', opacity: .07 }, svg);
  S2.bigNum = txt(svg, '#1', { x: 960, y: 900, size: 1050, fill: 'none', stroke: INK, sw: 5 }); S2.bigNum.setAttribute('opacity', .07);
  E('rect', { width: W, height: H, fill: 'url(#vig)' }, svg);
  // streaks behind charging fighters
  S2.streaks = E('g', null, svg);
  const r = rng(21); S2.streakItems = [];
  for (let i = 0; i < 14; i++) S2.streakItems.push({ e: E('rect', { height: f2(6 + r() * 8), rx: 4, fill: INK, opacity: .5 }, S2.streaks), y: (r() - .5) * 260, l: 160 + r() * 260, side: i % 2 ? 1 : -1, o: r() });
  // window
  const gw = S2.win = E('g', null, svg);
  E('rect', { x: -504, y: -304, width: 1040, height: 640, rx: 32, fill: INK }, gw);
  E('rect', { x: -520, y: -320, width: 1040, height: 640, rx: 32, fill: '#fff', stroke: INK, 'stroke-width': 6 }, gw);
  E('path', { d: 'M-517,-245 V-288 A29,29 0 0 1 -488,-317 H488 A29,29 0 0 1 517,-288 V-245 Z', fill: '#F6F2EA' }, gw);
  E('path', { d: 'M-517,-245 H517', stroke: INK, 'stroke-width': 5 }, gw);
  ['#FF5F57', '#FEBC2E', '#28C840'].forEach((c, i) => E('circle', { cx: -474 + i * 36, cy: -282, r: 11, fill: c, stroke: INK, 'stroke-width': 3 }, gw));
  txt(gw, 'Nuevo chat', { y: -272, font: 'Inter', weight: 800, size: 28, fill: INK });
  E('rect', { x: -470, y: 206, width: 940, height: 84, rx: 42, fill: '#F4F1EB', stroke: INK, 'stroke-width': 4 }, gw);
  txt(gw, 'Pregunta lo que quieras…', { x: -428, y: 258, anchor: 'start', font: 'Inter', weight: 500, size: 29, fill: '#9C958B' });
  E('circle', { cx: 426, cy: 248, r: 30, fill: INK }, gw);
  E('path', { d: 'M426,262 V234 M413,247 L426,234 L439,247', fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gw);
  S2.bC = chatBubble(gw, 'Yo soy el #1', '#FBE1D6', -1);
  S2.bG = chatBubble(gw, '¿Perdona? El #1 soy YO', '#D3F1E6', 1);
  S2.bCpos = [-470 + S2.bC.w / 2, -160]; S2.bGpos = [470 - S2.bG.w / 2, -30];
  // typing indicator
  S2.typ = E('g', null, gw);
  E('path', { d: 'M40,30 L66,58 L58,28 Z', fill: '#D3F1E6', stroke: INK, 'stroke-width': 5, 'stroke-linejoin': 'round' }, S2.typ);
  E('rect', { x: -88, y: -40, width: 176, height: 80, rx: 40, fill: '#D3F1E6', stroke: INK, 'stroke-width': 5 }, S2.typ);
  E('rect', { x: 38, y: 30, width: 26, height: 8, fill: '#D3F1E6' }, S2.typ);
  S2.typDots = [-46, 0, 46].map(x => E('circle', { cx: x, cy: 0, r: 13, fill: INK }, S2.typ));
  S2.typPos = [470 - 100, 100];
  // fighters + projectiles + fx
  S2.fC = new Fighter('claude', svg); S2.fG = new Fighter('gpt', svg);
  S2.proj = [0, 1, 2].map(() => E('circle', { r: 24, fill: INK, stroke: '#fff', 'stroke-width': 5 }, svg));
  S2.sparks = [0, 1, 2].map(() => { const g = E('g', null, svg); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; E('path', { d: `M${f2(Math.cos(a) * 26)},${f2(Math.sin(a) * 26)} L${f2(Math.cos(a) * 54)},${f2(Math.sin(a) * 54)}`, stroke: INK, 'stroke-width': 7, 'stroke-linecap': 'round' }, g); } return g; });
  S2.bursts = [
    [3.375, makeBurst(svg, '¡PUM!', { seed: 4, size: 1.15 }), 1640, 380, 8],
    [3.9375, makeBurst(svg, '¡ZAS!', { seed: 8, size: 1.05, c1: '#fff', c2: YEL, c3: RED }), 250, 390, -10],
    [4.3125, makeBurst(svg, '¡BAM!', { seed: 12, size: 1.45 }), 960, 560, -4],
  ];
}
function setS2(t) {
  const on = t >= 1.25 && t < 4.52; vis(S2.L, on); if (!on) return;
  const p = winP(t);
  T(S2.win, p.x, p.y, p.r, p.s);
  T(S2.bigNum, 0, 18 * Math.sin(t * 2), 0, 1);
  // bubble C
  const bC = S2.bC, bG = S2.bG;
  if (t >= 1.875) {
    vis(bC.g, true); const s = spring(t - 1.875, 18, 0.55);
    T(bC.g, S2.bCpos[0], S2.bCpos[1], -2 * (1 - s), Math.max(0.001, s));
    bC.t.textContent = bC.full.slice(0, Math.round(bC.full.length * seg(t, 1.9, 2.25)));
  } else vis(bC.g, false);
  // bubble G (gets punched at 3.25, hits ChatGPT at 3.375, flies off)
  const fGx0 = 1665, fGy0 = 660;
  if (t >= 2.625 && t < 3.8) {
    vis(bG.g, true); const s = spring(t - 2.625, 18, 0.55);
    let [x, y] = S2.bGpos, r = 2 * (1 - s), sc = Math.max(0.001, s);
    if (t >= 3.25) {
      const tx = (fGx0 - 960) / p.s - 40, ty = (fGy0 - 70 - p.y) / p.s;
      const u = seg(t, 3.25, 3.375);
      x = lerp(S2.bGpos[0], tx, easeIn2(u)); y = lerp(S2.bGpos[1], ty, easeIn2(u)) - 60 * hop(u); r = 30 * u;
      if (t >= 3.375) { const d = t - 3.375; x = tx + 900 * d; y = ty - 1500 * d + 2600 * d * d; r = 30 + 900 * d; sc = 0.9 - 0.4 * seg(t, 3.375, 3.8); }
    }
    T(bG.g, x, y, r, sc);
    bG.t.textContent = bG.full.slice(0, Math.round(bG.full.length * seg(t, 2.65, 3.0)));
  } else vis(bG.g, false);
  // typing indicator bubble
  const L3 = [3.65625, 3.75, 3.84375];
  if (t >= 3.5 && t < 4.05) {
    vis(S2.typ, true);
    T(S2.typ, S2.typPos[0], S2.typPos[1], 0, Math.max(0.001, spring(t - 3.5, 20, 0.55) * (1 - easeIn(seg(t, 3.95, 4.05)))));
    S2.typDots.forEach((d, k) => { vis(d, t < L3[k]); d.setAttribute('cy', f2(-8 * Math.abs(Math.sin((t * 10 + k * 0.7))))); });
  } else vis(S2.typ, false);
  // fighters
  const landC = 1.6875, landG = 1.78125;
  const dropY = (t0, t1) => t < t0 ? -400 : t < t1 ? lerp(-300, 660, easeIn2(seg(t, t0, t1))) : 660;
  const bob = (k) => t < 1.8 ? 0 : 8 * Math.abs(Math.sin(Math.PI * (t + k) / BT));
  // Claude
  const wind = ease(seg(t, 3.0, 3.1875)), ext = easeOut(seg(t, 3.1875, 3.25)) * (1 - ease(seg(t, 3.34, 3.52)));
  const hitsC = L3.map(x => x + 0.094);
  const nHit = hitsC.filter(h => t >= h).length;
  const recoilC = hitsC.reduce((a, h) => a + bump(t, h, 10), 0);
  const charge = easeIn(seg(t, 4.125, 4.3125)), back = easeOut(seg(t, 4.3125, 4.47));
  let xC = 255 - 18 * nHit * (1 - charge) - 40 * recoilC;
  xC = lerp(xC, 815, charge) - 120 * back;
  const pC = { x: 0, y: 0 };
  const sC = 1.5;
  // punch target: bubble G in stage coords at 3.25
  const pw = winP(3.25), [btx, bty] = winToStage(pw, S2.bGpos[0], S2.bGpos[1]);
  const fxT = (btx - xC) / sC - 40, fyT = (bty - 660) / sC;
  const gF = [lerp(lerp(82, 18, wind), fxT, ext), lerp(lerp(32, 6, wind), fyT, ext), lerp(-8, 0, ext), 1 + 0.25 * ext];
  const moodC = at(t, [[1.5, 'angry'], [1.9, 'proud'], [2.65, 'angry'], [3.0, 'grit'], [3.3, 'smug'], [3.75, 'hit'], [4.07, 'angry'], [4.125, 'grit']], 'angry');
  const chargePose = seg(t, 4.1, 4.2) * (1 - seg(t, 4.33, 4.45));
  S2.fC.set({
    x: xC, y: dropY(1.5, landC) - bob(0), s: sC, sq: squash(t, landC, 0.26) + squash(t, 4.3125, 0.2),
    rot: -9 * wind * (1 - ext) + 7 * ext - 14 * recoilC + 10 * chargePose, mood: moodC,
    look: moodC === 'proud' ? [0.2, -0.6] : [1, 0], flash: hitsC.some(h => t >= h && t < h + 0.04) ? 1 : 0,
    gF: chargePose > 0 ? [lerp(82, 120, chargePose), lerp(32, 0, chargePose), 0, 1.1] : gF, armF: ext > 0.08, sweat: 0, tt: t
  });
  // ChatGPT
  const recoilG = bump(t, 3.375, 7);
  let xG = 1665 + 70 * recoilG;
  xG = lerp(xG, 1105, charge) + 120 * back;
  const moodG = at(t, [[1.5, 'angry'], [2.65, 'smug'], [3.1, 'shock'], [3.375, 'hit'], [3.6, 'angry'], [4.125, 'grit']], 'angry');
  const fire = L3.reduce((a, h) => a + jab(t, h - 0.03, 0.03, 0.03, 0.06), 0);
  S2.fG.set({
    x: xG, y: dropY(1.59, landG) - bob(0.19), s: 1.5, dir: -1, sq: squash(t, landG, 0.26) + squash(t, 4.3125, 0.2),
    rot: 16 * recoilG - 10 * chargePose, mood: moodG, look: moodG === 'shock' ? [-1, -0.4] : [-1, 0],
    flash: t >= 3.375 && t < 3.42 ? 1 : 0, q: 0,
    gF: chargePose > 0 ? [lerp(82, 120, chargePose), lerp(32, 0, chargePose), 0, 1.1] : [82 + 50 * fire, 32 - 20 * fire, -8, 1 + 0.1 * fire], tt: t
  });
  // projectiles (typing dots)
  S2.proj.forEach((e, k) => {
    const l = L3[k], h = l + 0.094;
    if (t < l || t >= h) { vis(e, false); return; }
    vis(e, true);
    const [sx, sy] = winToStage(p, S2.typPos[0] + (k - 1) * 46, S2.typPos[1]);
    const u = seg(t, l, h);
    e.setAttribute('cx', f2(lerp(sx, xC + 40, u))); e.setAttribute('cy', f2(lerp(sy, 630, u) - 70 * hop(u)));
  });
  S2.sparks.forEach((g, k) => {
    const h = L3[k] + 0.094, a = t - h;
    if (a < 0 || a > 0.14) { vis(g, false); return; }
    vis(g, true); T(g, xC + 40, 630, k * 20, 0.8 + 3 * a);
    g.style.opacity = (1 - a / 0.14).toFixed(2);
  });
  // speed streaks during the charge
  const so = seg(t, 4.12, 4.18) * (1 - seg(t, 4.3, 4.36));
  opa(S2.streaks, so);
  if (so > 0) for (const it of S2.streakItems) {
    const fx = it.side < 0 ? xC : xG, k = (t * 7 + it.o) % 1;
    it.e.setAttribute('x', f2(fx - it.side * (120 + k * 220) - (it.side < 0 ? it.l : 0)));
    it.e.setAttribute('y', f2(620 + it.y)); it.e.setAttribute('width', f2(it.l));
  }
  for (const [t0, b, x, y, r] of S2.bursts) b.set(x, y, t - t0, t0 === 4.3125 ? 0.25 : 0.45, r);
}

// =================================================================================== S3 ranking
const S3 = {};
const SLOT = [432, 558, 684, 810];
function buildS3() {
  S3.L = document.getElementById('L3');
  const bg = SV(document.getElementById('L3bg'));
  E('rect', { width: W, height: H, fill: YEL }, bg);
  S3.rays = E('g', { transform: 'translate(960,560)' }, bg);
  const r = rng(31);
  for (let i = 0; i < 46; i++) {
    const a = r() * Math.PI * 2, w = 0.012 + r() * 0.03, r0 = 380 + r() * 260, r1 = 1500;
    E('polygon', { points: `${f2(Math.cos(a - w) * r1)},${f2(Math.sin(a - w) * r1)} ${f2(Math.cos(a + w) * r1)},${f2(Math.sin(a + w) * r1)} ${f2(Math.cos(a) * r0)},${f2(Math.sin(a) * r0)}`, fill: '#fff', opacity: .55 }, S3.rays);
  }
  E('rect', { width: W, height: H, fill: 'url(#dotInk)', opacity: .1 }, bg);
  E('rect', { width: W, height: H, fill: 'url(#vig)' }, bg);
  S3.tilt = document.getElementById('L3tilt');
  const svg = SV(S3.tilt);
  E('rect', { x: 398, y: 193, width: 1160, height: 760, rx: 36, fill: INK }, svg);
  E('rect', { x: 380, y: 175, width: 1160, height: 760, rx: 36, fill: '#fff', stroke: INK, 'stroke-width': 7 }, svg);
  E('path', { d: starPath(24, 11), transform: 'translate(440,238)', fill: GOLD, stroke: INK, 'stroke-width': 4, 'stroke-linejoin': 'round' }, svg);
  txt(svg, 'RANKING DE IAs', { x: 480, y: 256, anchor: 'start', font: 'Inter', weight: 900, size: 50, fill: INK });
  S3.live = E('circle', { cx: 1316, cy: 240, r: 10, fill: RED }, svg);
  txt(svg, 'EN DIRECTO', { x: 1334, y: 249, anchor: 'start', font: 'Inter', weight: 800, size: 24, fill: RED, ls: 2 });
  E('path', { d: 'M410,298 H1510', stroke: '#E5DFD4', 'stroke-width': 3 }, svg);
  txt(svg, '#', { x: 445, y: 352, font: 'Inter', weight: 800, size: 19, fill: '#9C958B', ls: 3 });
  txt(svg, 'MODELO', { x: 530, y: 352, anchor: 'start', font: 'Inter', weight: 800, size: 19, fill: '#9C958B', ls: 3 });
  txt(svg, 'PUNTUACIÓN', { x: 1010, y: 352, anchor: 'start', font: 'Inter', weight: 800, size: 19, fill: '#9C958B', ls: 3 });
  S3.rowsG = E('g', null, svg);
  const mkRow = (fill, stroke, sw) => { const g = E('g', null, S3.rowsG); E('rect', { x: 476, y: -52, width: 1040, height: 104, rx: 24, fill, stroke, 'stroke-width': sw }, g); return g; };
  // fixed rank badges
  [GOLD, '#CDD2DA', '#E3A06C', '#E2DCD1'].forEach((c, i) => { E('circle', { cx: 434, cy: SLOT[i], r: 32, fill: c, stroke: INK, 'stroke-width': 5 }, svg); txt(svg, String(i + 1), { x: 434, y: SLOT[i] + 17, size: 48, fill: INK }); });
  const bar = (g, col, w) => { E('rect', { x: 1010, y: -15, width: 400, height: 30, rx: 15, fill: '#EEE9E0' }, g); return E('rect', { x: 1010, y: -15, width: w, height: 30, rx: 15, fill: col, stroke: INK, 'stroke-width': 3.5 }, g); };
  S3.rM = mkRow('#F7F4EF', '#DDD6CA', 3); S3.fM = new Fighter('meta', S3.rM); txt(S3.rM, 'Meta', { x: 646, y: 15, anchor: 'start', font: 'Inter', weight: 800, size: 42, fill: '#A39C91' }); bar(S3.rM, '#B9CCE8', 120);
  S3.rS = mkRow('#F7F4EF', '#DDD6CA', 3); E('circle', { cx: 560, cy: 0, r: 30, fill: '#E3DDD2' }, S3.rS); E('rect', { x: 620, y: -13, width: 190, height: 26, rx: 13, fill: '#E3DDD2' }, S3.rS); bar(S3.rS, '#D9D3C8', 170);
  S3.rG = mkRow('#E9F8F2', INK, 4.5); S3.fG = new Fighter('gpt', S3.rG); txt(S3.rG, 'ChatGPT', { x: 630, y: 15, anchor: 'start', font: 'Inter', weight: 900, size: 44, fill: INK }); S3.barG = bar(S3.rG, GP, 300);
  S3.rC = mkRow('#FFF1EA', INK, 4.5); S3.fC = new Fighter('claude', S3.rC); txt(S3.rC, 'Claude', { x: 630, y: 15, anchor: 'start', font: 'Inter', weight: 900, size: 44, fill: INK }); S3.barC = bar(S3.rC, CL, 320);
  S3.tro = E('g', null, svg); drawTrophy(S3.tro);
  // fx layer (not tilted)
  const fx = SV(document.getElementById('L3fx'));
  const words = ['¡TOMA!', '¡PAF!', '¡ZAS!', '¡PUM!', '¡PIF!', '¡PAF!', '¡BAM!', '¡CRAC!'];
  S3.bursts = SWAPS.map((t0, i) => {
    const left = i % 2 === 1;
    return [t0, makeBurst(fx, words[i], { seed: 40 + i, size: i >= 4 && i < 7 ? 0.8 : 1.0, c1: i % 3 === 1 ? '#fff' : YEL, c2: i % 3 === 1 ? YEL : '#FF6236', c3: i % 3 === 1 ? RED : '#fff' }),
      left ? 250 + (i * 37 % 60) : 1670 - (i * 53 % 60), 330 + (i * 151 % 420), left ? -12 : 12];
  });
}
const POSC = track(0, SWAPS.map((t, i) => [t, i % 2 === 0 ? 1 : 0, 26, 0.62]));
function setS3(t) {
  const on = t >= 4.48 && t < 7.52; vis(S3.L, on); if (!on) return;
  T(S3.rays, 960, 560, (Math.floor(t * 12) * 7.3) % 360, 1 + 0.03 * Math.sin(t * 9));
  const a = spring(t - 4.5, 15, 0.6);
  const lastSwap = SWAPS.filter(s => t >= s).length - 1;
  const jolt = lastSwap >= 0 ? bump(t, SWAPS[lastSwap], 9) * (lastSwap % 2 ? -1 : 1) : 0;
  S3.tilt.style.transform = `translate(0px,${f2(300 * (1 - a))}px) scale(${f2(lerp(0.45, 1, a) * 1000) / 1000}) rotateX(${f2(6 + 3 * Math.sin(t * 1.7))}deg) rotateY(${f2(7 * Math.sin((t - 4.5) * 1.3) - 2)}deg) rotateZ(${f2(14 * (1 - a) + 2.2 * jolt)}deg)`;
  S3.live.setAttribute('opacity', Math.floor(t * 4) % 2 ? 1 : 0.25);
  const pc = POSC(t), pg = 1 - pc, mid = Math.sin(Math.PI * clamp(pc));
  const rowIn = k => 520 * (1 - spring(t - 4.56 - k * 0.06, 16, 0.7));
  T(S3.rC, rowIn(0) + 70 * mid, lerp(SLOT[0], SLOT[1], pc), 2.5 * mid);
  T(S3.rG, rowIn(1) - 70 * mid, lerp(SLOT[0], SLOT[1], pg), -2.5 * mid);
  T(S3.rS, rowIn(2), SLOT[2]); T(S3.rM, rowIn(3), SLOT[3]);
  // the row that just won the swap is drawn on top
  const top = lastSwap < 0 ? S3.rC : (lastSwap % 2 === 0 ? S3.rG : S3.rC);
  if (S3.rowsG.lastChild !== top) S3.rowsG.appendChild(top);
  S3.barC.setAttribute('width', f2(lerp(330, 250, pc) + 10 * Math.sin(t * 13)));
  S3.barG.setAttribute('width', f2(lerp(330, 250, pg) + 10 * Math.sin(t * 11 + 1)));
  // fighters in the rows: attacker uppercuts, victim gets hit
  const pose = (who) => {
    let up = 0, hit = 0, fl = 0;
    SWAPS.forEach((s, i) => {
      const att = i % 2 === 0 ? 'G' : 'C';
      if (att === who) up = Math.max(up, jab(t, s - 0.04, 0.04, 0.06, 0.1));
      else { hit = Math.max(hit, bump(t, s, 10)); if (t >= s && t < s + 0.04) fl = 1; }
    });
    return { up, hit, fl };
  };
  const PC = pose('C'), PG = pose('G');
  const bobC = Math.abs(Math.sin(Math.PI * t / BT)), bobG = Math.abs(Math.sin(Math.PI * (t + 0.19) / BT));
  S3.fC.set({ x: 556, y: -6 - 6 * bobC, s: 0.5, shadow: 0, rot: -18 * PC.hit + 10 * PC.up, mood: PC.hit > 0.25 ? 'hit' : PC.up > 0.2 ? 'grit' : 'angry', flash: PC.fl, look: [0.6, pc > 0.5 ? -1 : 1],
    gF: [lerp(82, 60, PC.up), lerp(32, -120, PC.up), lerp(-8, -70, PC.up), 1 + 0.25 * PC.up], tt: t });
  S3.fG.set({ x: 556, y: -6 - 6 * bobG, s: 0.5, shadow: 0, rot: -18 * PG.hit + 10 * PG.up, mood: PG.hit > 0.25 ? 'hit' : PG.up > 0.2 ? 'grit' : 'angry', flash: PG.fl, look: [0.6, pg > 0.5 ? -1 : 1],
    gF: [lerp(82, 60, PG.up), lerp(32, -120, PG.up), lerp(-8, -70, PG.up), 1 + 0.25 * PG.up], tt: t });
  const mLook = at(t, [[4.5, [0, -1]], [5.0, [-0.6, -1]], [5.9, [0.6, -1]], [6.6, [-0.4, -1]]], [0, -1]);
  S3.fM.set({ x: 562, y: 2, s: 0.36, shadow: 0, mood: t > 6.7 ? 'sneaky' : 'neutral', look: mLook, gF: [128, 46, -10, 0.001], gB: [-124, 46, 10, 0.001], blink: (t > 5.4 && t < 5.48) ? 1 : 0 });
  // trophy at the #1 slot
  if (t < 7.125) { vis(S3.tro, true); T(S3.tro, 1468 + 3 * noise1(t * 20, 3), SLOT[0] + 40, 6 * jolt, 0.36); } else vis(S3.tro, false);
  for (const [t0, b, x, y, r] of S3.bursts) b.set(x, y, t - t0, 0.36, r);
}

// =================================================================================== S4 podium / cloud / Meta
const S4 = {};
const GO = 126; // fighter ground offset (unit)
const FLOOR = 880, TOP1 = 680, TOP2 = 770, TOP3 = 810, PX = 1290;
function zigLine(x0, y0, x1, y1) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy); if (L < 20) return '';
  const n = Math.max(3, Math.round(L / 24)), px = -dy / L, py = dx / L; let d = `M${f2(x0)},${f2(y0)}`;
  for (let i = 1; i < n; i++) { const a = (i % 2 ? 1 : -1) * 10; d += ` L${f2(x0 + dx * i / n + px * a)},${f2(y0 + dy * i / n + py * a)}`; }
  return d + ` L${f2(x1)},${f2(y1)}`;
}
const cloudTime = t => t < 10.5 ? t : t < 10.875 ? 10.5 : t - 0.375;
function buildS4() {
  const L = document.getElementById('L4'), svg = SV(L); S4.L = L;
  E('rect', { width: W, height: H, fill: 'url(#stageGlow)' }, svg);
  const cam = S4.cam = E('g', null, svg);
  S4.spots = [380, 960, 1700].map((x, k) => { const g = E('g', null, cam); E('polygon', { points: `${x - 50},-120 ${x + 50},-120 ${x + 300},${FLOOR + 20} ${x - 300},${FLOOR + 20}`, fill: 'url(#spot)', opacity: .7 }, g); return { g, x, k }; });
  E('rect', { x: -800, y: -400, width: 3500, height: 1900, fill: 'url(#dotWhite)', opacity: .05 }, cam);
  E('rect', { x: -800, y: FLOOR, width: 3500, height: 700, fill: '#150F2E' }, cam);
  E('ellipse', { cx: PX, cy: FLOOR + 40, rx: 520, ry: 60, fill: '#2B2160' }, cam);
  E('path', { d: `M-800,${FLOOR} H2700`, stroke: INK, 'stroke-width': 7 }, cam);
  // spotlight on #1
  S4.spot1 = E('polygon', { points: `${PX - 40},-120 ${PX + 40},-120 ${PX + 240},${FLOOR + 30} ${PX - 240},${FLOOR + 30}`, fill: '#FFF6D0', opacity: 0 }, cam);
  // podium
  const block = (x0, top, label, col) => {
    E('rect', { x: x0, y: top, width: 220, height: FLOOR - top + 4, fill: '#F4EFE6', stroke: INK, 'stroke-width': 7 }, cam);
    E('rect', { x: x0 + 4, y: top + 4, width: 212, height: 16, fill: '#fff' }, cam);
    txt(cam, label, { x: x0 + 110, y: top + 40 + Math.min(80, (FLOOR - top) * 0.55), size: 104, fill: col, stroke: INK, sw: 10 });
  };
  block(PX - 330, TOP2, '2', '#CDD2DA'); block(PX + 110, TOP3, '3', '#E3A06C'); block(PX - 110, TOP1, '1', GOLD);
  S4.sparkles = [0, 1, 2, 3].map(() => E('path', { d: 'M0,-22 Q3,-3 22,0 Q3,3 0,22 Q-3,3 -22,0 Q-3,-3 0,-22 Z', fill: '#FFF6C8', stroke: INK, 'stroke-width': 3 }, cam));
  // cloud: pop-outs behind, puffs, then front fx
  S4.cloud = E('g', null, cam);
  S4.pop = E('g', null, S4.cloud);
  S4.pops = [];
  const r = rng(77);
  const types = ['gC', 'gG', 'ray', 'gC', 'knot', 'gG', 'star', 'gC', 'gG', 'ray'];
  for (let ts = 9.0, i = 0; ts < 11.62; ts += 0.0625, i++) {
    const ty = types[i % types.length], g = E('g', null, S4.pop);
    if (ty === 'gC') gloveMarkup(g, CL_GLOVE, '#fff', 130);
    else if (ty === 'gG') gloveMarkup(g, GP_GLOVE, '#fff', 130);
    else if (ty === 'ray') E('path', { d: 'M-50,-11 L40,-14 A14,14 0 0 1 40,14 L-50,11 Z', fill: CL, stroke: INK, 'stroke-width': 4 }, g);
    else if (ty === 'knot') E('path', { d: rrPath(-40, -26, 90, 52, 26), fill: 'none', stroke: GP, 'stroke-width': 14 }, g);
    else E('path', { d: starPath(30, 13), fill: YEL, stroke: INK, 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
    vis(g, false);
    const arm = E('path', { fill: 'none', stroke: INK, 'stroke-width': 7, 'stroke-linejoin': 'round' }, S4.pop); S4.pop.insertBefore(arm, g);
    if (ty === 'star' || ty === 'knot' || ty === 'ray') arm.style.display = 'none';
    S4.pops.push({ arm, g, ts, a: -Math.PI * (0.1 + r() * 0.8) + (r() < 0.3 ? Math.PI * 0.95 : 0) + (r() - .5) * 0.6, dur: 0.15 + r() * 0.08 });
  }
  S4.peekC = new Fighter('claude', S4.pop); S4.peekG = new Fighter('gpt', S4.pop);
  S4.puffs = [];
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + r() * 0.3; S4.puffs.push({ a, d: 120 + r() * 50, r: 105 + r() * 45, ph: r() * 6.28 }); }
  S4.puffs.push({ a: 0, d: 0, r: 175, ph: 1 });
  const oL = E('g', null, S4.cloud), fL = E('g', null, S4.cloud), sL = E('g', { fill: 'none', stroke: INK, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: .55 }, S4.cloud);
  S4.puffEls = S4.puffs.map(p => [E('circle', { fill: INK }, oL), E('circle', { fill: '#fff' }, fL), E('path', null, sL)]);
  S4.cloudFx = E('g', null, S4.cloud);
  S4.lines = [];
  for (let i = 0; i < 6; i++) S4.lines.push(E('path', { fill: 'none', stroke: INK, 'stroke-width': 6, 'stroke-linecap': 'round' }, S4.cloudFx));
  S4.flyStars = [];
  for (let i = 0; i < 14; i++) S4.flyStars.push({ e: E('path', { d: starPath(20, 9), fill: YEL, stroke: INK, 'stroke-width': 4, 'stroke-linejoin': 'round' }, S4.cloudFx), t0: 9.05 + i * 0.1875, a: -Math.PI * (0.15 + r() * 0.7), v: 500 + r() * 300 });
  S4.dust = [];
  for (let i = 0; i < 18; i++) S4.dust.push({ e: E('circle', { fill: '#CFC6E6', stroke: INK, 'stroke-width': 4 }, cam), t0: 9.0 + i * 0.16, x: (r() - .5) * 420, side: r() < .5 ? -1 : 1 });
  // fighters
  S4.fC = new Fighter('claude', cam); S4.fG = new Fighter('gpt', cam);
  S4.tro = E('g', null, cam); drawTrophy(S4.tro);
  S4.fM = new Fighter('meta', cam);
  S4.mioC = speechBubble(cam, '¡MÍO!', { tail: -1 }); S4.mioG = speechBubble(cam, '¡MÍO!', { tail: 1 });
  S4.bursts = [
    [8.95, makeBurst(cam, '¡BAM!', { seed: 61, size: 1.05 }), PX, 470, -6],
    [9.375, makeBurst(cam, '¡PUM!', { seed: 62, size: 0.85, c1: '#fff', c2: YEL, c3: RED }), 300, 470, -12],
    [9.75, makeBurst(cam, '¡ZAS!', { seed: 63, size: 0.85 }), 1000, 430, 10],
    [10.125, makeBurst(cam, '¡CRAC!', { seed: 64, size: 0.95, c1: '#fff', c2: YEL, c3: RED }), 520, 330, -6],
  ];
  // confetti
  S4.conf = E('g', null, cam);
  const cols = [CL, GP, MB, YEL, RED, '#fff', '#B388FF'];
  S4.confetti = [];
  for (let i = 0; i < 120; i++) {
    const burst = i < 36;
    const e = r() < 0.5 ? E('rect', { x: -9, y: -5, width: 18, height: 10, rx: 2, fill: cols[i % cols.length] }, S4.conf) : E('circle', { r: 7, fill: cols[(i + 3) % cols.length] }, S4.conf);
    S4.confetti.push({ e, burst, x0: burst ? 0 : -200 + r() * 2400, y0: burst ? 0 : -60 - r() * 500, vx: burst ? (r() - .5) * 1300 : (r() - .5) * 120, vy: burst ? -500 - r() * 700 : 260 + r() * 260, spin: (r() - .5) * 1400, ph: r() * 6.28, sw: 20 + r() * 40 });
  }
  // screen-space overlays
  S4.freeze = E('rect', { width: W, height: H, fill: '#0B0820', opacity: 0 }, svg);
  S4.banner = E('g', null, svg);
  E('rect', { x: -1300, y: -88, width: 2600, height: 176, fill: RED, stroke: INK, 'stroke-width': 9 }, S4.banner);
  for (let i = -12; i < 13; i++) E('path', { d: `M${i * 100},-80 l40,0 l-30,160 l-40,0 Z`, fill: '#C8202E', opacity: .55 }, S4.banner);
  E('rect', { x: -1300, y: -66, width: 2600, height: 132, fill: 'none', stroke: YEL, 'stroke-width': 5 }, S4.banner);
  txt(S4.banner, '¡UN NUEVO RETADOR!', { y: 44, size: 124, fill: YEL, stroke: INK, sw: 16 });
  S4.title = E('g', null, svg);
  txt(S4.title, '¡META SE LO QUEDA!', { x: 12, y: 62, size: 152, fill: '#0064E0', stroke: INK, sw: 20 });
  txt(S4.title, '¡META SE LO QUEDA!', { y: 50, size: 152, fill: '#fff', stroke: INK, sw: 20 });
  S4.metaWord = E('g', null, svg);
  S4.sub = txt(svg, '', { x: 1230, y: 1034, font: 'Press Start 2P', size: 30, fill: '#fff', stroke: INK, sw: 10 });
}
// Meta keyframes: [time, x, y, hopHeight]
const MG = 64; // Meta has nothing below its loops
const MK = [[10.875, 2080, FLOOR - MG, 0], [11.0625, 1890, FLOOR - MG, 40], [11.25, 1720, FLOOR - MG, 40], [11.4375, 1520, TOP3 - MG, 90], [11.8125, 1520, TOP3 - MG, 0], [12.0, PX, TOP1 - MG, 140]];
function metaPos(t) {
  if (t <= MK[0][0]) return [MK[0][1], MK[0][2], 0];
  for (let i = 1; i < MK.length; i++) {
    const [a, xa, ya] = MK[i - 1], [b, xb, yb, hh] = MK[i];
    if (t <= b) { const u = (t - a) / (b - a); return [lerp(xa, xb, u), lerp(ya, yb, u) - hh * hop(u), u]; }
  }
  const l = MK[MK.length - 1]; return [l[1], l[2], 1];
}
function setS4(t) {
  const on = t >= 7.48; vis(S4.L, on); if (!on) return;
  // camera
  const endK = ease(seg(t, 12.2, 12.95));
  const z = lerp(1.12 + 0.04 * seg(t, 7.5, 10.5), 1.12, endK) + 0.06 * bump(t, 10.5, 5);
  const px = -60 * endK, py = 0;
  S4.cam.setAttribute('transform', `translate(960,540) scale(${f2(z * 1000) / 1000}) translate(${f2(-960 + px)},${f2(-540 + py)})`);
  for (const s of S4.spots) s.g.setAttribute('transform', `rotate(${f2(9 * Math.sin(t * 1.2 + s.k * 2))},${s.x},-120)`);
  const ct = cloudTime(t);
  // ---------------- trophy ----------------
  const TS = 0.85;
  let tx = PX, ty = TOP1, tr = 0, tsx = TS, tsy = TS, held = false;
  const tugDx = 28 * Math.sin(2 * Math.PI * (t - 8.25) / BT);
  if (t < 7.875) { const u = seg(t, 7.5, 7.875); ty = lerp(-320, TOP1, easeIn2(u)); tr = -540 * (1 - u); }
  else if (t < 8.25) { const q = squash(t, 7.875, 0.25); tsx = TS * (1 + q); tsy = TS * (1 - q); }
  else if (t < 8.8125) { tx = PX + tugDx; ty = TOP1 - 26; tr = tugDx * 0.35; tsx = TS * (1 + 0.06 * Math.abs(Math.sin(2 * Math.PI * (t - 8.25) / BT))); }
  else if (t < 9.3) { const u = seg(t, 8.8125, 9.3); ty = lerp(TOP1 - 26, TOP1, u) - 400 * hop(u); tr = 720 * u; }
  else if (t < 11.625) { const q = squash(t, 9.3, 0.2); tsx = TS * (1 + q); tsy = TS * (1 - q); }
  const [mx, my, mu] = metaPos(t);
  const lift = 60 * spring(t - 12.375, 14, 0.5) + (t > 12.375 ? 10 * Math.abs(Math.sin(Math.PI * (t - 12.375) / BT)) : 0);
  if (t >= 11.625) {
    const holdX = mx, holdY = my - 58 - lift;
    const u = ease(seg(t, 11.625, 11.8125));
    tx = lerp(PX, holdX, u); ty = lerp(TOP1, holdY, u); tr = -10 * hop(u) + (t > 12.375 ? 4 * Math.sin(t * 9) : 0); held = u >= 1;
  }
  T(S4.tro, tx, ty, tr, tsx, tsy);
  // sparkles around the resting trophy
  S4.sparkles.forEach((e, k) => {
    const ph = (t * 1.6 + k * 0.27) % 1, show = (t > 7.9 && t < 8.25) || (t > 9.35 && t < 11.6) || t > 12.4;
    if (!show) { vis(e, false); return; }
    vis(e, true); const a = k * 1.7 + 0.5; T(e, tx + Math.cos(a) * 120, ty - 120 + Math.sin(a) * 90, ph * 90, 0.2 + 0.9 * hop(ph));
  });
  S4.spot1.setAttribute('opacity', f2((t >= 7.875 ? 0.16 : 0) + 0.12 * seg(t, 12.375, 12.5)));
  // ---------------- Claude & ChatGPT before the cloud ----------------
  const sF = 1.15, gy = (top) => top - GO * sF;
  const tugB = Math.sin(2 * Math.PI * (t - 8.25) / BT);
  const showPre = t >= 7.875 && t < 8.95, showPost = t >= 12.0;
  if (showPre) {
    let xC, yC, xG, yG, rotC = 0, rotG = 0, mC = 'grit', mG = 'grit', gFC, gBC, gFG, gBG, airC = 0, airG = 0;
    if (t < 8.25) {
      const u = seg(t, 7.875, 8.12), v = seg(t, 8.12, 8.25);
      xC = lerp(lerp(-260, 960, easeOut(u)), PX - 225, v); yC = lerp(gy(FLOOR), gy(TOP2), v) - 110 * hop(v) - 14 * Math.abs(Math.sin(t * 30)) * (1 - v);
      xG = lerp(lerp(2180, 1640, easeOut(u)), PX + 225, v); yG = lerp(gy(FLOOR), gy(TOP3), v) - 110 * hop(v) - 14 * Math.abs(Math.sin(t * 30 + 1)) * (1 - v);
      rotC = 12 * (1 - v); rotG = -12 * (1 - v);
    } else if (t < 8.8125) {
      xC = PX - 225 - 10 * tugB; yC = gy(TOP2); xG = PX + 225 - 10 * tugB; yG = gy(TOP3);
      rotC = -12 - 6 * tugB; rotG = 12 - 6 * tugB; mC = 'strain'; mG = 'strain';
      const hx = (sgn, fx, fy) => [((tx + sgn * 92) - fx) / sF * (sgn < 0 ? 1 : -1), ((ty - 104) - fy) / sF];
      const [cx1, cy1] = hx(-1, xC, yC), [gx1, gy1] = hx(1, xG, yG);
      gFC = [cx1 - 16, cy1 + 12, 70, 1]; gBC = [cx1 - 40, cy1 - 14, 50, 1];
      gFG = [gx1 - 16, gy1 + 12, 70, 1]; gBG = [gx1 - 40, gy1 - 14, 50, 1];
    } else {
      const u = seg(t, 8.8125, 8.95);
      xC = lerp(PX - 225, PX - 60, easeIn2(u)); yC = gy(TOP2) - 160 * hop(u * 0.7); xG = lerp(PX + 225, PX + 60, easeIn2(u)); yG = gy(TOP3) - 160 * hop(u * 0.7);
      rotC = 20 * u; rotG = -20 * u;
      gFC = [130, 0, 0, 1.15]; gFG = [130, 0, 0, 1.15];
    }
    S4.fC.set({ x: xC, y: yC, s: sF, rot: rotC, mood: mC, gF: gFC, gB: gBC, sweat: t > 8.3 && t < 8.8 ? 1 : 0, tt: t, look: [1, -0.2] });
    S4.fG.set({ x: xG, y: yG, s: sF, rot: rotG, dir: -1, mood: mG, gF: gFG, gB: gBG, sweat: t > 8.4 && t < 8.8 ? 1 : 0, tt: t + 0.3, look: [-1, -0.2] });
  } else if (showPost) {
    // tangled cross-counter, then they notice, then they faint
    const faint = easeIn2(seg(t, 12.75, 13.0)), notice = t >= 12.1875;
    const q = notice && t < 12.85 ? spring(t - 12.1875, 22, 0.45) * (1 - seg(t, 12.75, 12.85)) : 0;
    const mood = t < 12.1875 ? 'grit' : t < 12.75 ? 'shock' : 'ko';
    const land = squash(t, 13.0, 0.18) + 0.14 * faint;
    S4.fC.set({ x: 545 - 40 * faint, y: gy(FLOOR) + 40 * faint, s: sF, rot: -100 * faint, sq: land, mood, q, look: [1, -0.5], dizzy: t > 12.75 ? 1 : 0.6, tt: t,
      gF: faint > 0 ? [lerp(125, 60, faint), lerp(-14, -90, faint), -40 * faint, 1] : [125, -14, 0, 1], gB: [-74, 48, 10, 1], sweat: notice && t < 12.75 ? 1 : 0, shadow: 1 - faint * 0.3 });
    S4.fG.set({ x: 765 + 40 * faint, y: gy(FLOOR) + 40 * faint, s: sF, rot: 100 * faint, sq: land, dir: -1, mood, q, look: notice ? [1, -0.5] : [-1, 0], dizzy: t > 12.75 ? 1 : 0.6, tt: t + 0.4,
      gF: faint > 0 ? [lerp(125, 60, faint), lerp(-14, -90, faint), -40 * faint, 1] : [125, -14, 0, 1], gB: [-74, 48, 10, 1], sweat: notice && t < 12.75 ? 1 : 0, shadow: 1 - faint * 0.3 });
  } else { S4.fC.set({ op: 0 }); S4.fG.set({ op: 0 }); }
  // speech bubbles
  const mio = (g, t0, x, y) => { if (t >= t0 && t < 8.8125) { vis(g, true); T(g, x, y + 6 * Math.sin(t * 20), 0, Math.max(0.001, spring(t - t0, 22, 0.5))); } else vis(g, false); };
  mio(S4.mioC, 8.3, PX - 380, 410); mio(S4.mioG, 8.48, PX + 330, 400);
  // ---------------- cloud ----------------
  const cOn = t >= 8.95 && t < 12.25;
  vis(S4.cloud, cOn);
  if (cOn) {
    const u = seg(t, 8.95, 9.35);
    const cx = lerp(PX, 650, easeOut(u)) + 18 * Math.sin(ct * 5), cy = lerp(500, 690, easeOut(u)) - 120 * hop(u) + 8 * Math.sin(ct * 11);
    const poof = seg(t, 12.0, 12.25);
    const cs = spring(t - 8.95, 18, 0.5) * (1 + 0.5 * easeOut(poof)) * (1 + 0.04 * Math.sin(ct * 26));
    T(S4.cloud, cx, cy, 3 * Math.sin(ct * 13), Math.max(0.001, cs));
    S4.cloud.style.opacity = (1 - poof).toFixed(3);
    S4.puffs.forEach((p, i) => {
      const wob = 1 + 0.09 * Math.sin(ct * 21 + p.ph), px2 = Math.cos(p.a) * p.d + 8 * noise1(ct * 9, i), py2 = Math.sin(p.a) * p.d * 0.62 + 8 * noise1(ct * 9, i + 20);
      const [o, f, s] = S4.puffEls[i];
      o.setAttribute('cx', f2(px2)); o.setAttribute('cy', f2(py2)); o.setAttribute('r', f2(p.r * wob + 10));
      f.setAttribute('cx', f2(px2)); f.setAttribute('cy', f2(py2)); f.setAttribute('r', f2(p.r * wob));
      if (false) { const rr = p.r * wob * 0.55, cx2 = px2 * 0.55, cy2 = py2 * 0.55, a0 = p.a + 2.2, a1 = p.a + 3.4; s.setAttribute('d', `M${f2(cx2 + Math.cos(a0) * rr)},${f2(cy2 + Math.sin(a0) * rr)} A${f2(rr)},${f2(rr)} 0 0 1 ${f2(cx2 + Math.cos(a1) * rr)},${f2(cy2 + Math.sin(a1) * rr)}`); }
    });
    for (const p of S4.pops) {
      const a = ct - p.ts;
      if (a < 0 || a > p.dur || t >= 12.0) { vis(p.g, false); p.arm.setAttribute('d', ''); continue; }
      vis(p.g, true); const e = hop(a / p.dur), R = 250 + 170 * e;
      T(p.g, Math.cos(p.a) * R, Math.sin(p.a) * R * 0.86, p.a * 180 / Math.PI, 1.15);
      p.arm.setAttribute('d', zigLine(Math.cos(p.a) * 120, Math.sin(p.a) * 100, Math.cos(p.a) * (R - 40), Math.sin(p.a) * (R - 40) * 0.86));
    }
    const peek = (f, t0, ang, kind) => {
      const a = ct - t0;
      if (a < 0 || a > 0.22 || t >= 12.0) { f.set({ op: 0 }); return; }
      const e = hop(a / 0.22), R = 150 + 130 * e;
      f.set({ x: Math.cos(ang) * R, y: Math.sin(ang) * R * 0.75, s: 0.85, rot: ang * 180 / Math.PI + 90, mood: kind, shadow: 0, gF: [82, 32, -8, 0.001], gB: [-74, 48, 10, 0.001] });
    };
    peek(S4.peekC, 9.55, -2.2, 'grit'); peek(S4.peekG, 9.95, -0.9, 'hit');
    if (ct > 10.32) peek(S4.peekC, 10.32, -1.5, 'hit');
    S4.lines.forEach((l, i) => {
      const k = Math.floor(ct * 16) + i * 3, a = hash1(k) * Math.PI * 2, r0 = 240 + 30 * hash1(k + 5);
      l.setAttribute('d', t < 12 ? `M${f2(Math.cos(a) * r0)},${f2(Math.sin(a) * r0 * 0.7)} L${f2(Math.cos(a) * (r0 + 60))},${f2(Math.sin(a) * (r0 + 60) * 0.7)}` : '');
    });
    for (const s of S4.flyStars) {
      const a = ct - s.t0;
      if (a < 0 || a > 0.5 || t >= 12.0) { vis(s.e, false); continue; }
      vis(s.e, true); T(s.e, Math.cos(s.a) * (180 + s.v * a), Math.sin(s.a) * (140 + s.v * a) + 900 * a * a, a * 600, 1 - a * 1.2);
    }
  }
  for (const d of S4.dust) {
    const a = cloudTime(t) - d.t0;
    if (a < 0 || a > 0.45 || t > 12.3) { vis(d.e, false); continue; }
    vis(d.e, true);
    const cx = lerp(PX, 650, easeOut(seg(t, 8.95, 9.35)));
    d.e.setAttribute('cx', f2(cx + d.x + d.side * 160 * a)); d.e.setAttribute('cy', f2(FLOOR - 20 - 50 * a)); d.e.setAttribute('r', f2(16 + 50 * a));
    d.e.style.opacity = (1 - a / 0.45).toFixed(2);
  }
  // poof extra puffs at 12.0 reuse dust look via cloud scale; ---------------- Meta ----------------
  if (t >= 10.875) {
    const stepLand = [11.0625, 11.25, 11.4375, 12.0].reduce((a, s) => a + squash(t, s, 0.2), 0);
    const grab = ease(seg(t, 11.56, 11.625)) * (1 - ease(seg(t, 11.625, 11.8125)));
    const raise = spring(t - 12.375, 14, 0.5);
    const mood = at(t, [[10.875, 'sneaky'], [11.625, 'smug'], [12.375, 'happy']], 'sneaky');
    const dir = t < 12.0 ? -1 : 1;
    let gF, gB, armF = false;
    if (t < 11.56) { const k = Math.sin(t * 22) * 6; gF = [100, -8 + k, -30, 1]; gB = [-96, -4 - k, 30, 1]; }
    else if (t < 11.8125 && grab > 0.001) {
      const hx = ((PX + 70) - mx) / 1.05 * dir, hy = ((TOP1 - 120) - my) / 1.05;
      gF = [lerp(100, hx, grab), lerp(-8, hy, grab), -40, 1]; gB = [-96, -4, 30, 1]; armF = grab > 0.2;
    } else {
      const hy = -80 - lift / 1.05;
      gF = [52, hy, -70, 1]; gB = [-52, hy, 70, 1];
    }
    S4.fM.set({ x: mx, y: my, s: 1.05, dir, sq: stepLand + squash(t, 12.375, 0.12), rot: t < 11.44 ? 6 * Math.sin(t * 34) : 0, mood, look: mood === 'sneaky' ? [-1, 0] : [0, 0], gF, gB, armF, tt: t,
      shadow: 1, air: 0 });
  } else S4.fM.set({ op: 0 });
  // keep the held trophy in front of Meta
  if (held && S4.cam.lastChild !== S4.conf) { /* order fixed below */ }
  if (t >= 11.625) { if (S4.tro.nextSibling !== S4.mioC) S4.cam.insertBefore(S4.tro, S4.mioC); }
  else if (S4.tro.nextSibling !== S4.fM.g) S4.cam.insertBefore(S4.tro, S4.fM.g);
  for (const [t0, b, x, y, r] of S4.bursts) b.set(x, y, cloudTime(t) - (t0 < 10.5 ? t0 : t0 - 0.375) + (t0 < 10.5 ? 0 : 0), t0 === 8.95 ? 0.4 : 0.42, r);
  // confetti
  const ca = t - 12.375;
  vis(S4.conf, ca >= 0);
  if (ca >= 0) for (const c of S4.confetti) {
    let x, y;
    if (c.burst) { x = tx + c.vx * ca * (1 - 0.35 * ca); y = ty - 200 + c.vy * ca + 900 * ca * ca; y = Math.min(y, FLOOR + 60); }
    else { x = c.x0 + c.vx * ca + c.sw * Math.sin(ca * 6 + c.ph); y = c.y0 + c.vy * ca; }
    c.e.setAttribute('transform', `translate(${f2(x)},${f2(y)}) rotate(${f2(c.spin * ca)}) scale(1,${f2(Math.cos(ca * 9 + c.ph))})`);
  }
  // overlays
  S4.freeze.setAttribute('opacity', f2(t >= 10.5 && t < 10.95 ? 0.38 * (1 - seg(t, 10.8, 10.95)) : 0));
  if (t >= 10.5 && t < 11.3) {
    vis(S4.banner, true);
    const x = 960 + 2400 * (1 - spring(t - 10.52, 15, 0.72)) - 2800 * easeIn(seg(t, 11.05, 11.3));
    T(S4.banner, x, 300, -3, 1);
  } else vis(S4.banner, false);
  if (t >= 13.125) { vis(S4.title, true); T(S4.title, 1210, 180, -3 + 4 * (1 - spring(t - 13.125, 18, 0.6)), lerp(2.6, 1, spring(t - 13.125, 20, 0.5)) + 0.02 * Math.sin((t - 13.125) * 8)); }
  else vis(S4.title, false);
  const full = 'MIENTRAS ELLOS PELEABAN...';
  S4.sub.textContent = full.slice(0, Math.round(full.length * seg(t, 13.6, 14.3))) + (t > 13.55 && Math.floor(t * 4) % 2 === 0 ? '_' : '');
}

// =================================================================================== transitions
const LT = {};
function buildLT() {
  LT.L = document.getElementById('LT'); const svg = SV(LT.L);
  LT.pelea = E('g', null, svg);
  txt(LT.pelea, '¡PELEA!', { x: 16, y: 120, size: 330, fill: INK });
  txt(LT.pelea, '¡PELEA!', { y: 104, size: 330, fill: RED, stroke: INK, sw: 24 });
  // BAM flood: same star outline as the burst, grows to fill the screen
  const r = rng(12), n = 15, pts = [];
  for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rad = (i % 2 ? 0.6 : 1) * (0.86 + r() * 0.26); pts.push(`${f2(Math.cos(a) * rad * 205 * 1.45)},${f2(Math.sin(a) * rad * 158 * 1.45)}`); }
  LT.flood = E('polygon', { points: pts.join(' '), fill: YEL, stroke: INK, 'stroke-width': 9, 'stroke-linejoin': 'round' }, svg);
  LT.iris = E('circle', { r: 10, fill: '#241B47', stroke: INK, 'stroke-width': 10 }, svg);
  LT.tro = E('g', null, svg); drawTrophy(LT.tro);
}
function setLT(t) {
  if (t >= 1.125 && t < 1.52) {
    vis(LT.pelea, true);
    let s = lerp(2.8, 1, spring(t - 1.125, 22, 0.5));
    s *= 1 + 9 * easeIn(seg(t, 1.3, 1.52));
    T(LT.pelea, 960, 520, -4, s); LT.pelea.style.opacity = (1 - seg(t, 1.42, 1.52)).toFixed(3);
  } else vis(LT.pelea, false);
  if (t >= 4.33 && t < 4.5) { vis(LT.flood, true); T(LT.flood, 960, 560, -4 + 20 * seg(t, 4.33, 4.5), 1 + 11 * easeIn2(seg(t, 4.33, 4.5))); } else vis(LT.flood, false);
  if (t >= 7.125 && t < 7.5) {
    vis(LT.iris, true); const u = easeIn(seg(t, 7.18, 7.5));
    LT.iris.setAttribute('cx', 1470); LT.iris.setAttribute('cy', 470); LT.iris.setAttribute('r', f2(5 + 2300 * u));
    vis(LT.tro, true); const v = seg(t, 7.125, 7.5);
    T(LT.tro, lerp(1468, 1290, v), lerp(SLOT[0] + 40, -300, easeIn2(v)) - 160 * hop(Math.min(1, v * 1.6)), 720 * v, lerp(0.36, 0.95, v));
  } else { vis(LT.iris, false); vis(LT.tro, false); }
}

// =================================================================================== HUD
const HD = {};
function buildHUD() {
  HD.L = document.getElementById('HUD'); const svg = SV(HD.L);
  HD.g = E('g', null, svg);
  const side = (x0, name, kind, flip) => {
    const box = E('g', { transform: `translate(${flip ? 1772 : 52},34)` }, HD.g);
    E('rect', { width: 96, height: 96, rx: 16, fill: CREAM, stroke: INK, 'stroke-width': 6 }, box);
    const lg = E('g', { transform: 'translate(48,48) scale(0.36)' }, box);
    if (kind === 'claude') drawSpark(lg); else drawKnot(lg);
    txt(HD.g, name, { x: flip ? 1752 : 168, y: 70, anchor: flip ? 'end' : 'start', font: 'Press Start 2P', size: 26, fill: '#fff', stroke: INK, sw: 9 });
    const bar = E('g', { transform: `translate(${flip ? 1112 : 168},84) skewX(${flip ? 14 : -14})` }, HD.g);
    E('rect', { width: 640, height: 44, rx: 5, fill: '#2A0F14', stroke: INK, 'stroke-width': 7 }, bar);
    const dmg = E('rect', { y: 4, height: 36, fill: RED }, bar), fill = E('rect', { y: 4, height: 36, fill: 'url(#hpFill)' }, bar);
    E('rect', { x: 6, y: 8, width: 628, height: 8, rx: 4, fill: '#fff', opacity: .3 }, bar);
    return { dmg, fill, flip };
  };
  HD.c = side(0, 'CLAUDE', 'claude', false); HD.gp = side(0, 'CHATGPT', 'gpt', true);
  E('rect', { x: 894, y: 26, width: 132, height: 108, rx: 16, fill: INK, stroke: '#fff', 'stroke-width': 4 }, HD.g);
  HD.timer = txt(HD.g, '99', { x: 962, y: 106, font: 'Press Start 2P', size: 54, fill: YEL });
  HD.ko = txt(HD.g, 'K.O.', { x: 960, y: 118, size: 104, fill: RED, stroke: INK, sw: 12 });
}
function setHUD(t) {
  const on = t >= 1.5 && t < 13.35; vis(HD.L, on); if (!on) return;
  const y = -180 * (1 - spring(t - 1.5, 14, 0.72)) - 220 * easeIn(seg(t, 13.05, 13.35));
  HD.g.setAttribute('transform', `translate(0,${f2(y)})`);
  const setBar = (b, hp, tr) => {
    const w = 632 * clamp(hp / 100), wt = 632 * clamp(tr / 100);
    if (b.flip) { b.fill.setAttribute('x', f2(636 - w)); b.dmg.setAttribute('x', f2(636 - wt)); } else { b.fill.setAttribute('x', 4); b.dmg.setAttribute('x', 4); }
    b.fill.setAttribute('width', f2(Math.max(0, w))); b.dmg.setAttribute('width', f2(Math.max(0, wt)));
  };
  setBar(HD.c, HP_C(t), TR_C(t)); setBar(HD.gp, HP_G(t), TR_G(t));
  const ko = t >= 12.75;
  vis(HD.timer, !ko); vis(HD.ko, ko && Math.floor((t - 12.75) * 6) % 2 === 0);
  if (ko) T(HD.ko, 0, 0, 0, 1);
  HD.timer.textContent = String(Math.max(0, Math.floor(99 - (Math.min(t, 10.5) - 1.5) * 7))).padStart(2, '0');
}
