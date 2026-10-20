/* Nintendo Switch 2: fan-made spec ad. 30 s, 1920×1080, 120 BPM (beat 0.5 s, bar 2 s).

   t (s)  picture                                                       sound
   0.00   black                                                         -
   0.25   light flickers on: left Joy-Con 2 in the dark, blue rim        click (soft), pad, sub
   0.70   "Ese clic que ya conoces…"                                    bell, hats build
   2.00   cut: right Joy-Con 2, its light-red magnetic rail             whoosh
   4.00   wide: console body floats, Joy-Con 2 glide in                 riser 4→6, snare build, swoosh
   5.30   they hover a few cm away and creep closer                     -
   6.00   SNAP (magnetic): flash, seam flares, camera punch              click + impact + hit, drop
   6.35   "JOY-CON 2 / …ahora es magnético."                            groove: kick, clap, bass, stabs
  10.15   screen powers on: boot logo → game                            pop, bell arpeggio
  10.45   "Una pantalla más grande." + specs line                       ticks on each spec
  14.00   cut: docked, game on the TV   "MODO TELEVISOR / En la tele."   whoosh + crash
  16.00   cut: tabletop, split screen   "MODO SOBREMESA / En la mesa."   whoosh + crash
  18.00   cut: handheld                 "MODO PORTÁTIL / En tus manos."  whoosh + crash
  20.00   macro on the C button, pressed @20.50   "Pulsa C"             filtered breakdown, click
  21.60   GameChat: friends pop in 21.75 / 22.00 / 22.25 / 22.50         pops, groove back, crash
  22.95   screen off, camera dives into the black glass                 fill, swoosh
  23.60   Switch icon halves glide in, SNAP @24.00, "NINTENDO SWITCH 2"   click + hit + final chord
  25.20   "Ya disponible."                                              bell
  27.00   white: Nintendo logo + fan-made fine print                    chime
  30.00   end
*/
(async () => {
'use strict';
const THREE = window.THREE;
const W = 1920, H = 1080, DUR = 30;
const RENDER = /[?&]render\b/.test(location.search);
if (RENDER) document.body.classList.add('render');

// ── helpers (same as the explainer skills) ─────────────────────────────────────
function spring(t, w = 14, z = 0.82) {
  if (t <= 0) return 0;
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
}
const kf = keys => t => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) { const [a, va] = keys[i - 1], [b, vb, e = ease] = keys[i]; if (t <= b) return lerp(va, vb, e((t - a) / (b - a))); } return keys[keys.length - 1][1]; };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = x => (x = clamp(x), x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const rng = s => () => (s = (s + 0x6D2B79F5) | 0, s = Math.imul(s ^ (s >>> 15), 1 | s), s ^= s + Math.imul(s ^ (s >>> 7), 61 | s), ((s ^ (s >>> 14)) >>> 0) / 4294967296);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = x => Math.pow(clamp(x), 3);
const sine = x => (1 - Math.cos(Math.PI * clamp(x))) / 2;
const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const win = (t, a, b, fi = 0.3, fo = 0.3) => Math.min(smooth(a, a + fi, t), 1 - smooth(b - fo, b, t));
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const kfv = keys => { const f = [0, 1, 2].map(i => kf(keys.map(([t, v, e]) => [t, v[i], e]))); return t => V3(f[0](t), f[1](t), f[2](t)); };

// ── real proportions (cm), from Nintendo's spec sheet: 27.2 × 11.6 × 1.39, 7.9" 16:9 LCD ──
const HH = 11.6, DD = 1.39, JW = 3.9, TW = 27.2 - 2 * JW, SW = 17.5, SH = 9.84;
const BLUE = '#3cc4f2', RED = '#ff5a62', NRED = '#e60012';
const STAND_HINGE = 3.0, STAND_L = 8.2;

await Promise.all(['500 64px Montserrat', '600 64px Montserrat', '700 64px Montserrat', '800 64px Montserrat', '700 64px Poppins']
  .map(f => document.fonts.load(f)));

// ── renderer, scene, lights ────────────────────────────────────────────────────
const stage = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new THREE.RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(30, W / H, 0.5, 4000);

const dirLight = (color, x, y, z) => { const l = new THREE.DirectionalLight(color, 1); l.position.set(x, y, z); scene.add(l); return l; };
const key = dirLight(0xffffff, 26, 34, 48), top = dirLight(0xffffff, -6, 60, 8);
const rimB = dirLight(BLUE, -52, 2, -30), rimR = dirLight(RED, 52, 2, -30);
function lights({ k = 1.6, tp = 1, rb = 2.5, rr = 2.5, env = 0.4, kp = [26, 34, 48], rbp = [-52, 2, -30], rrp = [52, 2, -30] } = {}) {
  key.position.set(...kp); rimB.position.set(...rbp); rimR.position.set(...rrp); key.intensity = k; top.intensity = tp; rimB.intensity = rb; rimR.intensity = rr; scene.environmentIntensity = env;
}

// ── materials ──────────────────────────────────────────────────────────────────
const M = {
  shell: new THREE.MeshStandardMaterial({ color: 0x161618, roughness: 0.55 }),
  back: new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.62 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x060607, roughness: 0.05, envMapIntensity: 0.9 }),
  button: new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 0.27, envMapIntensity: 0.8 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x3a3a40, roughness: 0.5 }),
  slot: new THREE.MeshStandardMaterial({ color: 0x030303, roughness: 0.9 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x4a4b50, roughness: 0.3, metalness: 0.9 }),
  dock: new THREE.MeshStandardMaterial({ color: 0x131315, roughness: 0.4 }),
  blue: new THREE.MeshStandardMaterial({ color: BLUE, roughness: 0.3, emissive: BLUE, emissiveIntensity: 0.12 }),
  red: new THREE.MeshStandardMaterial({ color: RED, roughness: 0.3, emissive: RED, emissiveIntensity: 0.12 }),
};

// the console screen and the TV share one canvas texture, redrawn every frame
const SCR = document.createElement('canvas'); SCR.width = 1280; SCR.height = 720;
const sc = SCR.getContext('2d', { willReadFrequently: true });   // CPU canvas: far cheaper to upload every frame
const screenTex = new THREE.CanvasTexture(SCR); screenTex.colorSpace = THREE.SRGBColorSpace; screenTex.anisotropy = 8;
const screenMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.16, emissive: 0xffffff, emissiveMap: screenTex, emissiveIntensity: 0, envMapIntensity: 0.35 });
const tvMat = new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false });

function canvasTex(size, draw) {
  const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const INK = '#a9acb4';
const letter = ch => canvasTex(128, (x, s) => { x.fillStyle = INK; x.font = `700 ${s * 0.56}px Montserrat`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, s / 2, s / 2 + s * 0.03); });
const arrow = ang => canvasTex(128, (x, s) => { x.translate(s / 2, s / 2); x.rotate(ang); x.fillStyle = INK; x.beginPath(); x.moveTo(0, -s * 0.2); x.lineTo(s * 0.17, s * 0.1); x.lineTo(-s * 0.17, s * 0.1); x.closePath(); x.fill(); });
const homeIcon = canvasTex(128, (x, s) => { x.strokeStyle = INK; x.lineWidth = s * 0.07; x.lineJoin = 'round'; x.beginPath(); x.moveTo(s * 0.28, s * 0.52); x.lineTo(s * 0.5, s * 0.31); x.lineTo(s * 0.72, s * 0.52); x.moveTo(s * 0.35, s * 0.46); x.lineTo(s * 0.35, s * 0.7); x.lineTo(s * 0.65, s * 0.7); x.lineTo(s * 0.65, s * 0.46); x.stroke(); });
const radialTex = stops => canvasTex(256, (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); for (const [o, c] of stops) g.addColorStop(o, c); x.fillStyle = g; x.fillRect(0, 0, s, s); });

// ── geometry helpers ───────────────────────────────────────────────────────────
function rrShape(x0, y0, x1, y1, rBL, rBR, rTR, rTL) {
  const s = new THREE.Shape();
  s.moveTo(x0 + rBL, y0);
  s.lineTo(x1 - rBR, y0); if (rBR > 0) s.absarc(x1 - rBR, y0 + rBR, rBR, -Math.PI / 2, 0, false);
  s.lineTo(x1, y1 - rTR); if (rTR > 0) s.absarc(x1 - rTR, y1 - rTR, rTR, 0, Math.PI / 2, false);
  s.lineTo(x0 + rTL, y1); if (rTL > 0) s.absarc(x0 + rTL, y1 - rTL, rTL, Math.PI / 2, Math.PI, false);
  s.lineTo(x0, y0 + rBL); if (rBL > 0) s.absarc(x0 + rBL, y0 + rBL, rBL, Math.PI, Math.PI * 1.5, false);
  return s;
}
// extrude centred on z = 0 with soft bevelled edges; creased normals keep big faces flat and curves smooth
function extrude(shape, depth, bevel, segs = 40) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: depth - 2 * bevel, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: segs });
  g.translate(0, 0, -(depth - 2 * bevel) / 2);
  return THREE.toCreasedNormals(g, THREE.MathUtils.degToRad(8));
}
const lathe = (pts, segs = 48) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), segs);
const mesh = (geo, mat) => new THREE.Mesh(geo, mat);
// lathe parts are modelled around +y; this turns them to face +z (the front of the console)
function faceFront(...objs) { const inner = new THREE.Group(), g = new THREE.Group(); inner.add(...objs); inner.rotation.x = Math.PI / 2; g.add(inner); return g; }

function roundButton(r, h, tex) {
  const parts = [mesh(lathe([[r, -0.1], [r, h - 0.045], [r * 0.96, h - 0.012], [r * 0.86, h], [0.001, h]], 40), M.button)];
  if (tex) {
    const d = mesh(new THREE.CircleGeometry(r * 0.8, 32), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.45, depthWrite: false }));
    d.rotation.x = -Math.PI / 2; d.position.y = h + 0.003; parts.push(d);
  }
  return faceFront(...parts);
}
function stick(accent) {
  const dome = mesh(lathe([[1.22, -0.02], [1.2, 0.05], [1.12, 0.13], [0.98, 0.21], [0.78, 0.28], [0.6, 0.32], [0.42, 0.335]], 64), accent);
  const cap = mesh(lathe([[0.4, -0.1], [0.4, 0.58], [0.6, 0.64], [0.82, 0.7], [0.88, 0.76], [0.89, 0.84], [0.86, 0.9], [0.8, 0.925], [0.73, 0.912], [0.5, 0.878], [0.25, 0.864], [0.001, 0.86]], 64), M.rubber);
  return faceFront(dome, cap);
}

// ── Joy-Con 2 ──────────────────────────────────────────────────────────────────
// side +1 = right, -1 = left. x = 0 is the inner edge (the seam against the console).
function buildJoy(side) {
  const root = new THREE.Group(); root.matrixAutoUpdate = false;
  const b = 0.13, rIn = 0.3, rOut = 2.25, ov = 0.14;
  const [x0, x1] = side > 0 ? [-ov, JW] : [-JW, ov];
  root.add(mesh(extrude(side > 0
    ? rrShape(x0 + b, -HH / 2 + b, x1 - b, HH / 2 - b, rIn - b, rOut - b, rOut - b, rIn - b)
    : rrShape(x0 + b, -HH / 2 + b, x1 - b, HH / 2 - b, rOut - b, rIn - b, rIn - b, rOut - b), DD, b), M.shell));
  const zf = DD / 2 - 0.015;
  const add = (o, d, y, z = zf) => { o.position.set(side * d, y, z); root.add(o); return o; };  // d = distance from the inner edge
  const accent = side > 0 ? M.red : M.blue;
  const parts = { side };

  // magnetic rail in the accent colour, with SL / SR (hidden against the console when attached)
  add(mesh(new THREE.RoundedBoxGeometry(0.1, HH - 1.3, DD - 0.42, 2, 0.04), accent), -ov - 0.02, 0, 0);
  for (const y of [2.7, -2.7]) add(mesh(new THREE.RoundedBoxGeometry(0.1, 1.5, 0.42, 2, 0.04), M.button), -ov - 0.06, y, 0);
  add(mesh(new THREE.RoundedBoxGeometry(0.12, HH - 3.2, 0.3, 2, 0.05), M.button), -ov - 0.08, 0, 0);

  const bar = (w, h) => mesh(new THREE.RoundedBoxGeometry(w, h, 0.2, 2, 0.06), M.button);
  if (side > 0) {
    const plus = new THREE.Group(); plus.add(bar(0.62, 0.17), bar(0.17, 0.62)); add(plus, 0.85, HH / 2 - 0.95, zf + 0.04);
    for (const [ch, dx, dy] of [['X', 0, 1], ['A', 1, 0], ['B', 0, -1], ['Y', -1, 0]]) add(roundButton(0.42, 0.2, letter(ch)), 1.95 + dx * 1.02, 2.5 + dy * 1.02);
    parts.stick = add(stick(accent), 1.78, -1.0);
    add(roundButton(0.36, 0.14, homeIcon), 1.22, -3.3);
    add(mesh(new THREE.TorusGeometry(0.43, 0.035, 10, 48), M.metal), 1.22, -3.3, zf + 0.01);
    parts.c = add(roundButton(0.33, 0.14, letter('C')), 1.22, -4.38); parts.cZ = zf;
    parts.cGlow = add(mesh(new THREE.TorusGeometry(0.43, 0.05, 10, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false, depthWrite: false })), 1.22, -4.38, zf + 0.04);
  } else {
    add(bar(0.62, 0.17), 0.85, HH / 2 - 0.95, zf + 0.04);
    parts.stick = add(stick(accent), 2.0, 2.5);
    for (const [dx, dy, a] of [[0, 1, 0], [1, 0, Math.PI / 2], [0, -1, Math.PI], [-1, 0, -Math.PI / 2]]) add(roundButton(0.4, 0.18, arrow(a)), 1.78 - dx * 1.0, -1.0 + dy * 1.0);
    const cap = new THREE.Group(), dot = mesh(new THREE.CircleGeometry(0.19, 32), M.slot);
    dot.position.z = 0.111; cap.add(mesh(new THREE.RoundedBoxGeometry(0.62, 0.62, 0.22, 2, 0.1), M.button), dot);
    add(cap, 1.22, -3.35, zf + 0.04);
  }

  // L/R bumper around the top outer corner, ZL/ZR trigger behind it, release button on the back
  const cx = side * (JW - rOut), cy = HH / 2 - rOut, ang = a => side > 0 ? a : Math.PI - a;
  const band = (r0, r1, a0, a1) => { const s = new THREE.Shape(); s.absarc(cx, cy, r1, ang(a0), ang(a1), side < 0); s.absarc(cx, cy, r0, ang(a1), ang(a0), side > 0); s.closePath(); return s; };
  const lr = mesh(extrude(band(1.9, 2.2, 0.22, Math.PI / 2 - 0.02), 0.5, 0.06, 24), M.button); lr.position.z = 0.33; root.add(lr);
  const zt = mesh(extrude(band(1.0, 2.14, 0.3, Math.PI / 2 - 0.08), 1.1, 0.14, 24), M.shell); zt.position.z = -0.95; root.add(zt);
  const rel = mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 24), M.button); rel.rotation.x = Math.PI / 2; add(rel, 0.8, HH / 2 - 1.9, -DD / 2 - 0.03);
  return { root, parts };
}

// ── console body ───────────────────────────────────────────────────────────────
function buildTablet() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.RoundedBoxGeometry(TW, HH, DD, 4, 0.16), [M.back, M.back, M.back, M.back, M.glass, M.back]));
  const screen = mesh(new THREE.PlaneGeometry(SW, SH), screenMat); screen.position.z = DD / 2 + 0.004; g.add(screen);
  for (const s of [-1, 1]) {
    const sl = mesh(new THREE.BoxGeometry(0.04, HH - 1.5, 0.5), M.slot); sl.position.set(s * (TW / 2 + 0.005), 0, 0); g.add(sl);
    const seam = mesh(new THREE.PlaneGeometry(0.05, HH - 0.5), M.slot); seam.position.set(s * (TW / 2 - 0.11), 0, DD / 2 + 0.002); g.add(seam);
  }
  const topY = HH / 2;
  const btn = (w, x) => { const m = mesh(new THREE.RoundedBoxGeometry(w, 0.16, 0.46, 2, 0.06), M.button); m.position.set(x, topY + 0.02, -0.05); g.add(m); };
  btn(0.95, -TW / 2 + 2.3); btn(0.8, -TW / 2 + 3.9); btn(0.8, -TW / 2 + 5.0);   // power, volume
  const slot = (w, d, x, y) => { const m = mesh(new THREE.BoxGeometry(w, 0.02, d), M.slot); m.position.set(x, y, 0); g.add(m); };
  slot(2.7, 0.32, TW / 2 - 3.6, topY + 0.004);                                   // game card
  slot(0.95, 0.3, 1.4, topY + 0.004); slot(0.95, 0.3, 0, -topY - 0.004);        // USB-C top and bottom
  for (let i = 0; i < 16; i++) slot(0.12, 0.62, -3.6 + i * 0.32, topY + 0.004);  // vents
  // U-shaped stand, hinged high on the back
  const L = STAND_L, u = new THREE.Shape();
  u.moveTo(-7.8, 0); u.lineTo(-7.8, -L + 0.7); u.absarc(-7.1, -L + 0.7, 0.7, Math.PI, Math.PI * 1.5, false);
  u.lineTo(7.1, -L); u.absarc(7.1, -L + 0.7, 0.7, Math.PI * 1.5, Math.PI * 2, false); u.lineTo(7.8, 0); u.lineTo(6.5, 0);
  u.lineTo(6.5, -L + 1.8); u.absarc(6.1, -L + 1.8, 0.4, 0, -Math.PI / 2, true);
  u.lineTo(-6.1, -L + 1.4); u.absarc(-6.1, -L + 1.8, 0.4, -Math.PI / 2, -Math.PI, true); u.lineTo(-6.5, 0); u.closePath();
  const stand = new THREE.Group(); stand.position.set(0, STAND_HINGE, -DD / 2 - 0.01);
  const sm = mesh(extrude(u, 0.14, 0.03, 16), M.back); sm.position.z = -0.07; stand.add(sm); g.add(stand);
  return { g, screen, stand };
}

const joyL = buildJoy(-1), joyR = buildJoy(1), tab = buildTablet();
const consoleRoot = new THREE.Group(); consoleRoot.add(tab.g);

const dock = new THREE.Group();
dock.add(mesh(new THREE.RoundedBoxGeometry(20.8, 9.8, 5.8, 6, 1.7), M.dock));
{ const s = mesh(new THREE.BoxGeometry(19.9, 0.03, 1.7), M.slot); s.position.y = 4.9; dock.add(s); }
const tv = new THREE.Group();
tv.add(mesh(new THREE.RoundedBoxGeometry(124, 70.4, 2.4, 2, 0.6), M.back));
{ const s = mesh(new THREE.PlaneGeometry(122, 68.6), tvMat); s.position.z = 1.21; tv.add(s); }
const floorFade = canvasTex(256, (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); g.addColorStop(0, '#fff'); g.addColorStop(0.45, '#fff'); g.addColorStop(1, '#000'); x.fillStyle = g; x.fillRect(0, 0, s, s); });
floorFade.colorSpace = THREE.NoColorSpace;
const floor = mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0x0c0d10, roughness: 0.42, alphaMap: floorFade, transparent: true })); floor.rotation.x = -Math.PI / 2;
const decal = (tex, opts) => { const m = mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, ...opts })); m.rotation.x = -Math.PI / 2; return m; };
const shadow = decal(radialTex([[0, 'rgba(0,0,0,0.85)'], [0.5, 'rgba(0,0,0,0.4)'], [1, 'rgba(0,0,0,0)']]), {});
const tvGlow = decal(radialTex([[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']]), { blending: THREE.AdditiveBlending, color: 0x5d9cff, opacity: 0.3, toneMapped: false });
scene.add(consoleRoot, joyL.root, joyR.root, dock, tv, floor, shadow, tvGlow);

// ── placement ──────────────────────────────────────────────────────────────────
const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _m = new THREE.Matrix4(), _one = V3(1, 1, 1);
// Joy-Con relative to the console: gap pulls it out sideways, then optional offsets/rotations
function attachJoy(j, gap = 0, dy = 0, rx = 0, ry = 0, rz = 0) {
  consoleRoot.updateMatrix();
  _m.compose(V3(j.parts.side * (TW / 2 + gap), dy, 0), _q.setFromEuler(_e.set(rx, ry, rz)), _one);
  j.root.matrix.multiplyMatrices(consoleRoot.matrix, _m);
}
const assemble = () => { attachJoy(joyL); attachJoy(joyR); };
const freeJoy = (j, pos, rx = 0, ry = 0, rz = 0) => j.root.matrix.compose(pos, _q.setFromEuler(_e.set(rx, ry, rz)), _one);
const onJoy = (j, x, y, z) => V3(x, y, z).applyMatrix4(j.root.matrix);
const onConsole = (x, y, z) => { consoleRoot.updateMatrixWorld(true); return V3(x, y, z).applyMatrix4(consoleRoot.matrixWorld); };
function cam(pos, target, fov = 30, roll = 0) {
  camera.fov = fov; camera.updateProjectionMatrix();
  camera.position.copy(pos); camera.up.set(Math.sin(roll), Math.cos(roll), 0); camera.lookAt(target); camera.updateMatrixWorld();
}
const toScreen = v => { const p = v.clone().project(camera); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H]; };
// standing on a table: lift so the lowest edge touches y = 0, open the stand until it reaches the table too
function lowestY(th) { let m = Infinity; for (const y of [-HH / 2, HH / 2]) for (const z of [-DD / 2, DD / 2]) m = Math.min(m, y * Math.cos(th) - z * Math.sin(th)); return -m; }
function standAngle(th, py) {
  const f = ph => py + (STAND_HINGE - STAND_L * Math.cos(ph)) * Math.cos(th) - (-DD / 2 - 0.15 - STAND_L * Math.sin(ph)) * Math.sin(th);
  let a = 0, b = 1.5; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (f(m) > 0) a = m; else b = m; }
  return (a + b) / 2;
}

// ── what the screen shows ──────────────────────────────────────────────────────
const S = {};   // per-frame screen state, set by the shots: power, boot, game, split, chat, tv
const PAL = [
  { sky: ['#1d6dff', '#5fb0ff', '#cdeeff'], glow: 'rgba(255,250,220,0.8)', sun: '#fffbe6', cloud: '#ffffff', far: '#86a6ea', mid: '#46c06f', near: '#2fa45c', grass: ['#5ccf61', '#51c356', '#56c95b'], road: ['#4b4f5b', '#464a56', '#494d58'], fog: '#d4efff' },
  { sky: ['#3b2a8f', '#d65f8e', '#ffc36b'], glow: 'rgba(255,214,150,0.85)', sun: '#fff1cf', cloud: '#ffd9e6', far: '#7a58ad', mid: '#c25a83', near: '#8b4175', grass: ['#4fb86b', '#46ab62', '#4ab266'], road: ['#403b52', '#3b364c', '#3d384f'], fog: '#ffd2a0' },
];
const ridgeF = (u, p) => 1 - Math.abs(Math.sin((u * 2.1 + p) * Math.PI)) * 0.55 - Math.abs(Math.sin((u * 4.7 + p * 1.7) * Math.PI)) * 0.3;
function cloud(c, x, y, r, col) {
  c.fillStyle = col; c.beginPath();
  for (const [dx, dy, k] of [[0, 0, 1], [1.1, 0.15, 0.8], [-1.0, 0.2, 0.7], [0.4, -0.45, 0.75], [2.0, 0.3, 0.5]]) { c.moveTo(x + dx * r + k * r, y + dy * r); c.arc(x + dx * r, y + dy * r, k * r, 0, Math.PI * 2); }
  c.fill();
}
// a bright, generic racing game: parallax sky and hills, pseudo-3D road, checkpoint rings rushing past
function drawGame(c, x, y, w, h, time, v = 0) {
  const P = PAL[v];
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.translate(x, y);
  const hz = h * 0.47;
  let g = c.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, P.sky[0]); g.addColorStop(0.62, P.sky[1]); g.addColorStop(1, P.sky[2]);
  c.fillStyle = g; c.fillRect(0, 0, w, hz + 4);
  const sx = w * 0.7, sy = hz * 0.58;
  g = c.createRadialGradient(sx, sy, 0, sx, sy, h * 0.55); g.addColorStop(0, P.glow); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, hz);
  c.fillStyle = P.sun; c.beginPath(); c.arc(sx, sy, h * 0.065, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 6; i++) {
    const px = (((i * 0.27 + 0.08 - time * 0.01 * (1 + (i % 3) * 0.5)) % 1.3) + 1.3) % 1.3 * w - w * 0.15;
    cloud(c, px, hz * (0.16 + ((i * 37) % 10) / 24), h * (0.045 + (i % 3) * 0.014), P.cloud);
  }
  const layer = (base, amp, off, col, f) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, hz + h * 0.06); for (let i = 0; i <= 64; i++) { const u = i / 64; c.lineTo(u * w, base - amp * f(u + off)); } c.lineTo(w, hz + h * 0.06); c.closePath(); c.fill(); };
  layer(hz + 2, h * 0.2, time * 0.006, P.far, u => ridgeF(u, 0.3));
  layer(hz + 3, h * 0.085, time * 0.02, P.mid, u => 0.55 + 0.3 * Math.sin(u * 7.5) + 0.15 * Math.sin(u * 17 + 1));
  layer(hz + h * 0.035, h * 0.055, time * 0.045, P.near, u => 0.5 + 0.35 * Math.sin(u * 11 + 2) + 0.15 * Math.sin(u * 23));
  const rt = hz + h * 0.03, bend = Math.sin(time * 0.55) * w * 0.16;
  for (let yy = h; yy > rt; yy -= 3) {
    const dy = (yy - rt) / (h - rt), z = 1 / Math.max(dy, 0.004), half = w * 0.6 * dy, cx = w / 2 + bend * Math.pow(1 - dy, 2);
    const k = dy < 0.1 ? 2 : Math.floor(z * 1.4 + time * 16) & 1;
    c.fillStyle = P.grass[k]; c.fillRect(0, yy - 3, w, 3.5);
    c.fillStyle = ['#e8323e', '#ffffff', '#f39aa0'][k]; c.fillRect(cx - half * 1.1, yy - 3, half * 2.2, 3.5);
    c.fillStyle = P.road[k]; c.fillRect(cx - half, yy - 3, half * 2, 3.5);
    if (k === 1) { c.fillStyle = 'rgba(255,255,255,0.85)'; c.fillRect(cx - half * 0.018, yy - 3, half * 0.036, 3.5); }
  }
  g = c.createLinearGradient(0, rt - 2, 0, rt + (h - rt) * 0.3); g.addColorStop(0, P.fog); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, rt - 2, w, (h - rt) * 0.3);
  // roadside trees and checkpoint rings rushing past (far ones first)
  const items = [];
  for (let i = 0; i < 7; i++) for (const sd of [-1, 1]) items.push({ ph: (time * 0.5 + i / 7 + (sd > 0 ? 0.07 : 0)) % 1, sd, tree: true });
  for (let i = 0; i < 3; i++) items.push({ ph: (time * 0.42 + i / 3) % 1, ring: i });
  for (const it of items.sort((a, b) => a.ph - b.ph)) {
    const dy = Math.pow(it.ph, 2.4) * 1.05; if (dy < 0.015) continue;
    const half = w * 0.6 * dy, cx = w / 2 + bend * Math.pow(1 - Math.min(dy, 1), 2), ry = rt + dy * (h - rt);
    c.globalAlpha = Math.min(1, dy * 4);
    if (it.tree) {
      const tx = cx + it.sd * half * 1.55, sz = half * 0.42;
      c.fillStyle = '#7a4a2a'; c.fillRect(tx - sz * 0.09, ry - sz * 0.9, sz * 0.18, sz * 0.9);
      c.fillStyle = v ? '#2f8f5a' : '#2c9a4b'; c.beginPath(); c.arc(tx, ry - sz * 1.15, sz * 0.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = v ? '#49b277' : '#47c161'; c.beginPath(); c.arc(tx - sz * 0.14, ry - sz * 1.28, sz * 0.26, 0, Math.PI * 2); c.fill();
    } else {
      const rr = half * 0.95;
      c.globalAlpha *= 1 - smooth(0.85, 1.05, dy);
      c.globalAlpha *= 0.85; c.lineWidth = Math.max(2, rr * 0.05); c.strokeStyle = ['#ffcf3a', '#3cc4f2', '#ff5a62'][it.ring];
      c.beginPath(); c.ellipse(cx, ry - rr * 0.02, rr, rr * 0.82, 0, Math.PI * 1.02, Math.PI * 1.98); c.stroke();
    }
    c.globalAlpha = 1;
  }
  kart(c, w / 2 + bend * 0.06 + Math.sin(time * 1.3) * w * 0.03, h * 0.83, h * 0.13, v ? '#2fb7e8' : '#e8323e', Math.cos(time * 0.55) * 0.08 + Math.cos(time * 1.3) * 0.05, time);
  c.restore();
}
// the player's kart, from behind
function kart(c, x, y, s, col, tilt, time) {
  c.save(); c.translate(x, y + Math.sin(time * 23) * s * 0.012); c.rotate(tilt);
  c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.ellipse(0, s * 0.42, s * 0.95, s * 0.13, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#1c1c22'; for (const sd of [-1, 1]) { c.beginPath(); c.roundRect(sd * s * 0.62 - s * 0.19, s * 0.0, s * 0.38, s * 0.44, s * 0.08); c.fill(); }
  c.fillStyle = col; c.beginPath(); c.roundRect(-s * 0.58, -s * 0.2, s * 1.16, s * 0.48, s * 0.16); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(-s * 0.58, s * 0.14, s * 1.16, s * 0.1);
  c.fillStyle = '#ffffff'; c.fillRect(-s * 0.06, -s * 0.2, s * 0.12, s * 0.34);
  c.fillStyle = '#9aa0aa'; for (const sd of [-1, 1]) { c.beginPath(); c.arc(sd * s * 0.26, s * 0.2, s * 0.06, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#f4f4f6'; c.beginPath(); c.arc(0, -s * 0.4, s * 0.25, 0, Math.PI * 2); c.fill();
  c.fillStyle = col; c.fillRect(-s * 0.25, -s * 0.46, s * 0.5, s * 0.08);
  c.restore();
}
const AVATARS = [['#ffb03a', 21.75], ['#7a5cff', 22.0], ['#2fd0a0', 22.25], ['#ff6f91', 22.5]];
function drawChat(c, w, h, t) {
  const r = 42, y = 82;
  AVATARS.forEach(([col, t0], i) => {
    const s = spring(t - t0, 18, 0.55); if (s <= 0.001) return;
    const x = 86 + i * 108, speaking = (i === 1 && t > 22.2) || (i === 3 && t > 22.75) || (i === 0 && t > 22.0 && t < 22.45);
    c.save(); c.translate(x, y); c.scale(s, s);
    if (speaking) { c.strokeStyle = '#38d46a'; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, r + 7 + 2 * Math.sin(t * 20 + i), 0, Math.PI * 2); c.stroke(); }
    c.fillStyle = col; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#1b1b22'; c.beginPath(); c.ellipse(-12, -5, 5, 7, 0, 0, Math.PI * 2); c.ellipse(12, -5, 5, 7, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#1b1b22'; c.lineWidth = 4.5; c.lineCap = 'round'; c.beginPath(); c.arc(0, 7, 12, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
    c.restore();
  });
  const a = spring(t - 21.7, 16, 0.8);
  if (a > 0) {
    c.save(); c.globalAlpha = clamp(a); c.translate(86 + 4 * 108 - 36, y - 27);
    c.fillStyle = 'rgba(12,12,16,0.72)'; c.beginPath(); c.roundRect(0, 0, 236, 54, 27); c.fill();
    c.fillStyle = '#fff'; c.font = '700 27px Montserrat'; c.textBaseline = 'middle'; c.fillText('GameChat', 54, 28);
    c.fillStyle = '#38d46a'; c.beginPath(); c.arc(28, 27, 10, 0, Math.PI * 2); c.fill();
    c.restore();
  }
}
function drawScreen(t) {
  const c = sc, w = SCR.width, h = SCR.height;
  c.globalAlpha = 1; c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
  if (S.game) {
    c.globalAlpha = S.game;
    if (S.split) { drawGame(c, 0, 0, w / 2 - 3, h, t, 0); drawGame(c, w / 2 + 3, 0, w / 2 - 3, h, t + 3.7, 1); }
    else drawGame(c, 0, 0, w, h, t, 0);
    c.globalAlpha = 1;
  }
  if (S.boot) { c.save(); c.globalAlpha = S.boot; lockup(c, w / 2, h / 2, 92, {}); c.restore(); }
  if (S.chat) drawChat(c, w, h, t);
  screenTex.needsUpdate = true;
}

// ── 2D brand marks (drawn from simple shapes and the fonts above, not official artwork) ──
function switchIcon(c, x, y, s, o = {}) {   // x, y = top-left, s = height
  const g = 0.06 * s, hw = (0.9 * s - g) / 2, R = 0.27 * s, r = 0.05 * s, lw = 0.088 * s, dot = 0.105 * s;
  c.save(); c.fillStyle = c.strokeStyle = o.color || '#fff';
  c.save(); c.translate(o.ldx || 0, 0); c.lineWidth = lw;
  c.beginPath(); c.roundRect(x + lw / 2, y + lw / 2, hw - lw, s - lw, [R - lw / 2, r, r, R - lw / 2]); c.stroke();
  c.beginPath(); c.arc(x + hw / 2, y + 0.29 * s, dot, 0, Math.PI * 2); c.fill();
  c.restore();
  c.save(); c.translate(o.rdx || 0, 0);
  const rx = x + hw + g;
  c.beginPath(); c.roundRect(rx, y, hw, s, [r, R, R, r]); c.moveTo(rx + hw / 2 + dot, y + 0.56 * s); c.arc(rx + hw / 2, y + 0.56 * s, dot, 0, Math.PI * 2, true); c.fill('evenodd');
  c.restore(); c.restore();
}
// letters rise one by one from under a mask; p = 0..1
function riseText(c, str, x, y, font, tracking, p, size) {
  c.save(); c.font = font; c.letterSpacing = tracking + 'px';
  c.beginPath(); c.rect(x - size, y - size * 1.05, 4000, size * 1.09); c.clip();
  for (let i = 0; i < str.length; i++) {
    const e = easeOut((p - (i / str.length) * 0.55) / 0.45); if (e <= 0) continue;
    c.globalAlpha = e; c.fillText(str[i], x + c.measureText(str.slice(0, i)).width, y + (1 - e) * size);
  }
  c.restore();
}
// Nintendo Switch 2 lockup: icon, NINTENDO over SWITCH, and a big 2
function lockup(c, cx, cy, s, p) {
  const n = p.n ?? 1, sw = p.sw ?? 1, two = p.two ?? 1;
  c.save(); c.fillStyle = p.color || '#fff'; c.textBaseline = 'alphabetic';
  const fS = `700 ${0.62 * s}px Montserrat`, fN = `600 ${0.27 * s}px Montserrat`, f2 = `800 ${1.42 * s}px Montserrat`;
  c.font = fS; c.letterSpacing = `${0.02 * s}px`; const wS = c.measureText('SWITCH').width;
  c.font = fN; c.letterSpacing = '0px'; const trN = (wS - c.measureText('NINTENDO').width) / 8;
  c.font = f2; const w2 = c.measureText('2').width;
  const iconW = 0.9 * s, total = iconW + 0.28 * s + wS + 0.14 * s + w2;
  const x0 = cx - total / 2, top = cy - s / 2, tx = x0 + iconW + 0.28 * s, ix = x0 + (p.centre ?? 0) * (total - iconW) / 2;
  switchIcon(c, ix, top, s, { ...p, color: p.color });
  riseText(c, 'NINTENDO', tx, top + 0.265 * s, fN, trN, n, 0.27 * s);
  riseText(c, 'SWITCH', tx, top + s, fS, 0.02 * s, sw, 0.62 * s);
  if (two > 0) {
    const k = 0.55 + 0.45 * two, x2 = tx + wS + 0.14 * s;
    c.save(); c.globalAlpha = clamp(two * 3); c.font = f2; c.translate(x2 + w2 / 2, top + s * 0.5); c.scale(k, k);
    c.fillText('2', -w2 / 2, s * 0.5); c.restore();
  }
  c.restore();
  return { x0, total, ix };
}
function nintendoLogo(c, cx, cy, w, a = 1) {
  const h = w / 3.9, lw = h * 0.088;
  c.save(); c.globalAlpha = a; c.strokeStyle = c.fillStyle = NRED; c.lineWidth = lw;
  c.beginPath(); c.roundRect(cx - w / 2 + lw / 2, cy - h / 2 + lw / 2, w - lw, h - lw, (h - lw) / 2); c.stroke();
  let fs = h * 0.6; c.font = `700 ${fs}px Poppins`; c.letterSpacing = `${-fs * 0.02}px`;
  fs *= (w * 0.74) / c.measureText('Nintendo').width;
  c.font = `700 ${fs}px Poppins`; c.letterSpacing = `${-fs * 0.02}px`; c.textAlign = 'center';
  c.fillText('Nintendo', cx + fs * 0.01, cy + fs * 0.355);
  c.restore();
}

// ── overlay helpers (fx canvas) ────────────────────────────────────────────────
const out = document.getElementById('out').getContext('2d');
const fx = out, bgc = out;
function words(c, text, x, y, o, t0, t, t1) {
  const size = o.size, stagger = o.stagger ?? 0.07;
  c.save(); c.font = `${o.weight || 700} ${size}px Montserrat`; c.letterSpacing = `${o.tracking ?? -0.025 * size}px`;
  c.fillStyle = o.color || '#fff';
  const ws = text.split(' '), wd = ws.map(s => c.measureText(s).width), sp = size * 0.27;
  const total = wd.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
  let cx = o.align === 'left' ? x : x - total / 2;
  const out = t1 == null ? 1 : 1 - easeIn(seg(t, t1 - 0.3, t1));
  c.beginPath(); c.rect(0, y - size * 1.1, W, size * 1.42); c.clip();
  for (let i = 0; i < ws.length; i++) {
    const e = easeOut(seg(t, t0 + i * stagger, t0 + i * stagger + 0.6));
    c.globalAlpha = clamp(e * 1.4) * out;
    c.fillText(ws[i], cx, y + (1 - e) * size * 1.05 - (1 - out) * size * 0.2);
    cx += wd[i] + sp;
  }
  c.restore();
}
function kicker(c, text, x, y, align, a, size = 24) {
  if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.font = `600 ${size}px Montserrat`; c.letterSpacing = `${size * 0.26}px`;
  const w = c.measureText(text).width - size * 0.26, dw = size * 1.55;
  const x0 = (align === 'left' ? x : x - (w + dw) / 2) - (1 - a) * 18;
  c.fillStyle = BLUE; c.beginPath(); c.arc(x0 + size * 0.28, y - size * 0.36, size * 0.24, 0, Math.PI * 2); c.fill();
  c.fillStyle = RED; c.beginPath(); c.arc(x0 + size * 0.9, y - size * 0.36, size * 0.24, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#d9dbe0'; c.fillText(text, x0 + dw, y);
  c.restore();
}
function streak(c, x, y, len, thick, color, a, ang = 0) {
  if (a <= 0.003) return;
  c.save(); c.globalCompositeOperation = 'lighter'; c.translate(x, y); c.rotate(ang);
  let g = c.createLinearGradient(-len / 2, 0, len / 2, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.globalAlpha = a; c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, len / 2, thick / 2, 0, 0, Math.PI * 2); c.fill();
  g = c.createLinearGradient(-len * 0.3, 0, len * 0.3, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, len * 0.3, Math.max(1, thick * 0.1), 0, 0, Math.PI * 2); c.fill();
  c.restore();
}
function glow(c, x, y, r, color, a) {
  if (a <= 0.003) return;
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a;
  const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
}
const layerCanvas = draw => { const c = document.createElement('canvas'); c.width = W; c.height = H; draw(c.getContext('2d')); return c; };
const radial = (c, x, y, r, stops) => { const g = c.createRadialGradient(x, y, 0, x, y, r); for (const [o, col] of stops) g.addColorStop(o, col); c.fillStyle = g; c.fillRect(0, 0, W, H); };
const BG = {
  dark: layerCanvas(c => { c.fillStyle = '#020203'; c.fillRect(0, 0, W, H); radial(c, 960, 560, 1000, [[0, 'rgba(22,23,30,0.9)'], [1, 'rgba(0,0,0,0)']]); }),
  studio: layerCanvas(c => {
    c.fillStyle = '#050507'; c.fillRect(0, 0, W, H);
    radial(c, 960, 520, 1150, [[0, 'rgba(38,40,50,0.95)'], [0.45, 'rgba(17,18,24,0.7)'], [1, 'rgba(0,0,0,0)']]);
    radial(c, 240, 640, 820, [[0, 'rgba(60,196,242,0.16)'], [1, 'rgba(60,196,242,0)']]);
    radial(c, 1680, 640, 820, [[0, 'rgba(255,90,98,0.14)'], [1, 'rgba(255,90,98,0)']]);
  }),
  room: layerCanvas(c => { c.fillStyle = '#040406'; c.fillRect(0, 0, W, H); radial(c, 700, 360, 1100, [[0, 'rgba(40,64,110,0.55)'], [1, 'rgba(0,0,0,0)']]); }),
};
const LOGO = layerCanvas(() => {}).getContext('2d');
const VIG = layerCanvas(c => radial(c, 960, 540, 1150, [[0, 'rgba(0,0,0,0)'], [0.55, 'rgba(0,0,0,0.05)'], [1, 'rgba(0,0,0,0.6)']]));
const GRAIN = [0, 1, 2, 3].map(i => {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), id = x.createImageData(256, 256), r = rng(99 + i);
  for (let p = 0; p < id.data.length; p += 4) { const v = 128 + (r() + r() + r() - 1.5) * 64; id.data[p] = id.data[p + 1] = id.data[p + 2] = v; id.data[p + 3] = 255; }
  x.putImageData(id, 0, 0); return c;
});

// ── shots ──────────────────────────────────────────────────────────────────────
const flick = (t, t0) => t < t0 ? 0 : t < t0 + 0.05 ? 1 : t < t0 + 0.11 ? 0.15 : t < t0 + 0.16 ? 0.9 : t < t0 + 0.2 ? 0.35 : 0.35 + 0.65 * smooth(t0 + 0.2, t0 + 0.6, t);

function shotJoyL(t) {
  tab.g.visible = false; joyR.root.visible = false;
  const u = sine(seg(t, 0, 2.1)), on = flick(t, 0.25), sw = sine(seg(t, 0.3, 2.0));
  freeJoy(joyL, V3(), -0.12, lerp(0.38, 0.66, u), 0.07);
  const c = onJoy(joyL, -JW / 2, 0, 0);
  cam(c.clone().add(V3(lerp(-1.2, 0.6, u), lerp(1.4, 2.2, u), lerp(37, 32, u))), c.clone().add(V3(0, -1.3, 0)), 26, -0.03);
  lights({ k: 1.7 * on, tp: 0.9 * on, rb: 8 * on, rr: 0, env: 0.25 * on, kp: [lerp(-30, 40, sw), 30, 30] });
  M.blue.emissiveIntensity = 0.12 + 0.45 * on;
}
function shotJoyR(t) {
  tab.g.visible = false; joyL.root.visible = false;
  const u = sine(seg(t, 2, 4.1)), sw = sine(seg(t, 2.05, 3.9));
  freeJoy(joyR, V3(), -0.1, lerp(0.78, 0.5, u), -0.06);
  const c = onJoy(joyR, JW / 2, 0, 0);
  cam(c.clone().add(V3(lerp(0.8, -0.6, u), lerp(1.4, 2.2, u), lerp(37, 32, u))), c.clone().add(V3(0, -1.3, 0)), 26, 0.03);
  lights({ k: 1.7, tp: 0.9, rb: 0, rr: 9, env: 0.25, kp: [lerp(40, -30, sw), 30, 30], rrp: [40, 5, -60] });
  M.red.emissiveIntensity = 0.3;
}
// glide in, hover a few cm away, then the magnets win at exactly 6.00
function joyGap(t) {
  if (t < 4.1) return 60;
  if (t < 5.3) return lerp(60, 3.4, easeOut(seg(t, 4.1, 5.3)));
  if (t < 5.8) return 3.4 - 0.5 * sine(seg(t, 5.3, 5.8));
  if (t < 6.0) return 2.9 * (1 - Math.pow(seg(t, 5.8, 6.0), 2.2));
  return 0.05 * Math.exp(-(t - 6) * 18) * Math.abs(Math.sin((t - 6) * 45));
}
const camSnap = kfv([[4, [13, 9, 80]], [6, [7, 5.5, 60], sine], [10, [-7, 3.2, 53], sine]]);
const tgtSnap = kfv([[4, [0, 0, 0]], [6, [0, -0.4, 0]], [7.2, [0, -1.7, 0], sine]]);
function shotSnap(t) {
  consoleRoot.rotation.set(0.12, -0.28, 0);
  screenMat.envMapIntensity = 0.55;
  const g = joyGap(t), e = easeOut(seg(t, 4.1, 5.3)), hov = (1 - seg(t, 5.8, 6.0)) * seg(t, 5.25, 5.45);
  const wob = s => 0.07 * Math.sin(t * 9 + s) * hov;
  attachJoy(joyL, g, 2.2 * (1 - e) + wob(0), 0.25 * (1 - e) + wob(1) * 0.5, -0.7 * (1 - e) + wob(2) * 0.5, 0.3 * (1 - e));
  attachJoy(joyR, g, -2.2 * (1 - e) + wob(3), -0.2 * (1 - e) + wob(4) * 0.5, 0.7 * (1 - e) + wob(5) * 0.5, -0.3 * (1 - e));
  const k = t > 6 ? Math.exp(-(t - 6) * 7) : 0, flash = t > 6 ? Math.exp(-(t - 6) * 6) : 0;
  const punch = t > 6 ? 1.2 * Math.exp(-(t - 6) * 5) * Math.sin(Math.min((t - 6) * 18, Math.PI)) : 0;
  cam(camSnap(t).add(V3(Math.sin(t * 71) * 0.35 * k, Math.cos(t * 53) * 0.35 * k, 0)), tgtSnap(t), 30 - punch);
  lights({ k: 1.7 + 2 * flash, tp: 1, rb: 3.2 + 4 * flash, rr: 3.2 + 4 * flash, env: 0.47 + 0.6 * flash });
  M.blue.emissiveIntensity = M.red.emissiveIntensity = 0.12 + 0.8 * flash;
}
function shotScreen(t) {
  const u = sine(seg(t, 10, 14));
  consoleRoot.rotation.set(0.04, lerp(-0.1, 0.06, u), 0); assemble();
  cam(V3(lerp(1.5, -0.8, u), lerp(2.6, 2.0, u), lerp(47, 39.5, u)), V3(0, 1.7, 0), 30);
  lights({ k: 1.5, tp: 0.9, rb: 2.6, rr: 2.6, env: 0.51 });
  S.power = smooth(10.15, 10.3, t);
  S.boot = win(t, 10.2, 11.15, 0.25, 0.25);
  S.game = smooth(10.95, 11.3, t);
}
function shotTV(t) {
  const u = sine(seg(t, 14, 16.2));
  tv.visible = floor.visible = tvGlow.visible = dock.visible = shadow.visible = true;
  floor.position.set(-10, 0, -70); floor.scale.set(420, 420, 1);
  joyL.root.visible = joyR.root.visible = false;
  dock.position.set(22, 4.9, 0);
  consoleRoot.position.set(22, 1.4 + HH / 2, 0);
  tv.position.set(-34, 46, -150); tv.rotation.y = 0.22;
  tvGlow.position.set(-30, 0.05, -105); tvGlow.scale.set(220, 130, 1);
  shadow.position.set(22, 0.04, 0.5); shadow.scale.set(32, 13, 1);
  cam(V3(lerp(44, 40, u), lerp(11, 12, u), lerp(66, 60, u)), V3(lerp(-8, -10, u), 22, -60), 32);
  lights({ k: 1.1, tp: 0.7, rb: 4, rr: 1.5, env: 0.31, kp: [-30, 30, -20] });
  S.tv = 1; S.game = 1;
}
function shotTable(t) {
  const u = sine(seg(t, 16, 18.2)), th = -0.42, py = lowestY(th);
  floor.visible = shadow.visible = true;
  floor.position.set(0, 0, -40); floor.scale.set(300, 300, 1);
  consoleRoot.position.set(0, py, 0); consoleRoot.rotation.set(th, 0, 0);
  tab.stand.rotation.x = standAngle(th, py);
  shadow.position.set(0, 0.03, -2.5); shadow.scale.set(36, 15, 1);
  const bob = s => 0.25 * Math.sin(t * 3.1 + s);
  freeJoy(joyL, V3(-17, 11 + bob(0), 9), -0.55, 0.4, Math.PI / 2);
  freeJoy(joyR, V3(17, 10 + bob(1), 10), -0.55, -0.4, -Math.PI / 2);
  cam(V3(lerp(4, -2, u), lerp(16, 14.5, u), lerp(62, 56, u)), V3(0, 6.2, 0), 30);
  lights({ k: 1.5, tp: 0.25, rb: 2.4, rr: 2.4, env: 0.54, kp: [30, 25, -10] });
  S.power = 1; S.game = 1; S.split = true;
}
function shotHandheld(t) {
  const u = sine(seg(t, 18, 20.2));
  consoleRoot.position.set(0, 0, 0);
  consoleRoot.rotation.set(-0.58 + 0.02 * Math.sin(t * 2.3), -0.12 + 0.03 * Math.sin(t * 1.7), 0.04 + 0.03 * Math.sin(t * 1.3)); assemble();
  cam(V3(lerp(-3, -1, u), lerp(22, 20.5, u), lerp(41, 37, u)), V3(-4.2, -2.6, 0), 30);
  lights({ k: 1.5, tp: 0.6, rb: 2.4, rr: 2.4, env: 0.235, kp: [10, 30, -40] });
  S.power = 1; S.game = 1;
}
function shotC(t) {
  consoleRoot.rotation.set(0.05, -0.3, 0.02); assemble();
  const c = onJoy(joyR, 1.22, -4.38, DD / 2 + 0.1), u = sine(seg(t, 20, 21.7));
  cam(c.clone().add(V3(lerp(-1.6, -2.4, u), lerp(2.6, 2.2, u), lerp(14.5, 12.5, u))), c.clone().add(V3(1.9, 1.1, 0)), 26, 0.02);
  const pr = seg(t, 20.44, 20.5) - seg(t, 20.62, 20.78);
  joyR.parts.c.position.z = joyR.parts.cZ - 0.07 * pr;
  joyR.parts.cGlow.material.opacity = t > 20.5 ? 0.9 * Math.exp(-(t - 20.5) * 2.5) : 0;
  lights({ k: 1.3, tp: 0.7, rb: 1.5, rr: 4, env: 0.375 });
  M.red.emissiveIntensity = 0.12 + (t > 20.5 ? 0.6 * Math.exp(-(t - 20.5) * 3) : 0);
  S.power = 1; S.game = 1;
}
function shotChat(t) {
  consoleRoot.rotation.set(0.05, 0.16, 0); assemble();
  const u = sine(seg(t, 21.6, 23.0)), dive = easeIn(seg(t, 22.95, 23.6));
  const scr = onConsole(0, 0.4, DD / 2), n = V3(0, 0, 1).applyEuler(consoleRoot.rotation);
  const pos = V3(lerp(3.5, 4.5, u), lerp(2.6, 2.1, u), lerp(46, 40, u)).lerp(scr.clone().addScaledVector(n, 6), dive);
  cam(pos, V3(0, -1.4, 0).lerp(scr, dive), 30);
  lights({ k: 1.5, tp: 0.9, rb: 2.4, rr: 2.4, env: 0.09 + 0.4 * (1 - dive) });
  S.power = 1 - seg(t, 22.95, 23.15); S.game = 1; S.chat = true;
}
const SHOTS = [[0, shotJoyL], [2, shotJoyR], [4, shotSnap], [10, shotScreen], [14, shotTV], [16, shotTable], [18, shotHandheld], [20, shotC], [21.6, shotChat], [23.6, null]];

function resetScene() {
  consoleRoot.position.set(0, 0, 0); consoleRoot.rotation.set(0, 0, 0);
  tab.g.visible = joyL.root.visible = joyR.root.visible = true;
  tab.stand.rotation.x = 0;
  dock.visible = tv.visible = floor.visible = shadow.visible = tvGlow.visible = false;
  joyR.parts.c.position.z = joyR.parts.cZ; joyR.parts.cGlow.material.opacity = 0;
  M.blue.emissiveIntensity = M.red.emissiveIntensity = 0.12;
  screenMat.envMapIntensity = 0.12;
  Object.assign(S, { power: 0, boot: 0, game: 0, split: false, chat: false, tv: 0 });
  assemble();
}

// ── overlay timeline ───────────────────────────────────────────────────────────
function joyCenterOnScreen(side, t) {   // for the light trails during the glide-in
  const g = joyGap(t);
  return toScreen(onConsole(side * (TW / 2 + g + JW / 2), side * -2.2 * (1 - easeOut(seg(t, 4.1, 5.3))), 0));
}
function drawFx(t) {
  const c = fx;
  if (t < 23.6) c.drawImage(VIG, 0, 0);

  // intro
  words(c, 'Ese clic que ya conoces…', 960, 948, { size: 56, weight: 500, stagger: 0.09 }, 0.7, t, 3.8);
  if (t > 1.97 && t < 2.1) { c.fillStyle = `rgba(255,255,255,${0.25 * (1 - seg(t, 1.97, 2.1))})`; c.fillRect(0, 0, W, H); }

  // glide-in light trails and the magnetic snap
  if (t > 4.1 && t < 6.02) {
    for (const [side, col] of [[-1, BLUE], [1, RED]]) {
      const [x, y] = joyCenterOnScreen(side, t), [px, py] = joyCenterOnScreen(side, t - 0.05);
      const vx = x - px, vy = y - py, sp = Math.hypot(vx, vy);
      const len = Math.min(900, sp * 5), ang = Math.atan2(vy, vx);
      streak(c, x - Math.cos(ang) * len * 0.45, y - Math.sin(ang) * len * 0.45, len, 90, col, clamp(sp / 140) * 0.55, ang);
    }
  }
  if (t >= 6 && t < 7.3) {
    const a = Math.exp(-(t - 6) * 5);
    for (const [side, col] of [[-1, BLUE], [1, RED]]) {
      const [x0, y0] = toScreen(onConsole(side * TW / 2, HH / 2, DD / 2)), [x1, y1] = toScreen(onConsole(side * TW / 2, -HH / 2, DD / 2));
      const len = Math.hypot(x1 - x0, y1 - y0) * (1.1 + 0.5 * (1 - a));
      streak(c, (x0 + x1) / 2, (y0 + y1) / 2, len, 34, col, a, Math.atan2(y1 - y0, x1 - x0));
      streak(c, (x0 + x1) / 2, (y0 + y1) / 2, 1100 * (1.2 - a * 0.4), 12, col, a * 0.8, 0);
      glow(c, (x0 + x1) / 2, (y0 + y1) / 2, 260, col, a * 0.5);
    }
    c.fillStyle = `rgba(255,255,255,${0.32 * Math.exp(-(t - 6) * 12)})`; c.fillRect(0, 0, W, H);
  }
  kicker(c, 'JOY-CON 2', 960, 846, 'center', win(t, 6.3, 9.8, 0.4, 0.3));
  words(c, '…ahora es magnético.', 960, 950, { size: 88, stagger: 0.08 }, 6.45, t, 9.8);

  // bigger screen
  words(c, 'Una pantalla más grande.', 960, 196, { size: 84, stagger: 0.07 }, 10.45, t, 13.85);
  if (t > 11.1 && t < 13.9) {
    const items = ['7,9 pulgadas', '1080p', 'HDR', 'Hasta 120 Hz'];
    c.save(); c.font = '500 30px Montserrat'; c.letterSpacing = '1.5px';
    const ws = items.map(s => c.measureText(s).width), gap = 54, total = ws.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
    let x = 960 - total / 2; const out = 1 - easeIn(seg(t, 13.55, 13.85));
    items.forEach((s, i) => {
      const e = easeOut(seg(t, 11.2 + i * 0.15, 11.6 + i * 0.15));
      c.globalAlpha = e * out; c.fillStyle = '#d6d8de'; c.fillText(s, x, 262 + (1 - e) * 14);
      if (i) { c.fillStyle = i % 2 ? BLUE : RED; c.beginPath(); c.arc(x - gap / 2, 252 + (1 - e) * 14, 4, 0, Math.PI * 2); c.fill(); }
      x += ws[i] + gap;
    });
    c.restore();
  }

  // the three modes, same anchor so they read as a list
  for (const [t0, kick, line, sub] of [[14, 'MODO TELEVISOR', 'En la tele.', 'Hasta 4K'], [16, 'MODO SOBREMESA', 'En la mesa.', null], [18, 'MODO PORTÁTIL', 'En tus manos.', null]]) {
    if (t < t0 || t > t0 + 2.05) continue;
    kicker(c, kick, 150, 842, 'left', win(t, t0 + 0.05, t0 + 1.95, 0.3, 0.2));
    words(c, line, 148, 948, { size: 96, align: 'left', stagger: 0.07 }, t0 + 0.12, t, t0 + 1.97);
    if (sub) { c.save(); c.globalAlpha = win(t, t0 + 0.55, t0 + 1.95, 0.3, 0.2); c.font = '600 30px Montserrat'; c.letterSpacing = '2px'; c.fillStyle = '#d6d8de'; c.fillText(sub, 152, 1000); c.restore(); }
  }

  // C button
  if (t >= 20 && t < 21.62) {
    const a = win(t, 20.12, 21.55, 0.3, 0.25), e = easeOut(seg(t, 20.12, 20.55));
    c.save(); c.globalAlpha = a; c.font = '700 96px Montserrat'; c.letterSpacing = '-2px'; c.fillStyle = '#fff';
    c.fillText('Pulsa', 1210, 588 + (1 - e) * 30);
    const pw = c.measureText('Pulsa').width, r = 52, x = 1210 + pw + 34 + r, y = 554 + (1 - e) * 30, pop = 1 + 0.18 * Math.exp(-(t - 20.5) * 9) * (t > 20.5 ? 1 : 0);
    c.lineWidth = 7; c.strokeStyle = '#fff'; c.beginPath(); c.arc(x, y, r * pop, 0, Math.PI * 2); c.stroke();
    c.font = '700 62px Montserrat'; c.letterSpacing = '0px'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('C', x, y + 3);
    c.restore();
    kicker(c, 'NUEVO BOTÓN C', 1212, 470, 'left', a);
    if (t > 20.5) {
      const [cx, cy] = toScreen(onJoy(joyR, 1.22, -4.38, DD / 2 + 0.15)), k = t - 20.5;
      for (const d of [0, 0.12]) { const kk = k - d; if (kk < 0) continue; c.save(); c.globalAlpha = 0.7 * Math.exp(-kk * 3.5); c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, 40 + kk * 420, 0, Math.PI * 2); c.stroke(); c.restore(); }
      glow(c, cx, cy, 160, '#ffffff', 0.5 * Math.exp(-k * 4));
    }
  }
  kicker(c, 'GAMECHAT', 960, 872, 'center', win(t, 21.75, 23.0, 0.35, 0.25));
  words(c, 'Habla con tus amigos.', 960, 972, { size: 84, stagger: 0.08 }, 21.85, t, 23.0);
  if (t > 23.3 && t < 23.6) { c.fillStyle = `rgba(0,0,0,${smooth(23.3, 23.6, t)})`; c.fillRect(0, 0, W, H); }

  // Nintendo Switch 2 lockup, drawn on its own layer so the light sweep only touches the logo
  if (t >= 23.6 && t < 27) {
    const s = 150, sc2 = 1 + 0.03 * sine(seg(t, 24, 27)), slide = 1 - easeIn(seg(t, 23.62, 24.0));
    const bounce = t > 24 ? 6 * Math.exp(-(t - 24) * 14) * Math.sin((t - 24) * 40) : 0;
    const lc = LOGO; lc.clearRect(0, 0, W, H);
    lc.save(); lc.translate(960, 500); lc.scale(sc2, sc2); lc.translate(-960, -500);
    const L = lockup(lc, 960, 500, s, { ldx: -760 * slide - bounce, rdx: 760 * slide + bounce, centre: 1 - ease(seg(t, 24.2, 24.75)), n: seg(t, 24.4, 24.95), sw: seg(t, 24.48, 25.05), two: spring(t - 24.75, 16, 0.55) });
    // a slow light sweep across the finished logo
    if (t > 25.6 && t < 26.6) {
      const k = seg(t, 25.6, 26.6), sx = lerp(L.x0 - 200, L.x0 + L.total + 200, sine(k));
      lc.globalCompositeOperation = 'source-atop';
      const g = lc.createLinearGradient(sx - 120, 0, sx + 120, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(150,215,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      lc.fillStyle = g; lc.fillRect(0, 0, W, H);
    }
    lc.restore();
    c.drawImage(LOGO.canvas, 0, 0);
    if (t > 23.98) {
      const a = Math.exp(-(t - 24) * 4.5), gx = 960 + (L.ix + 0.45 * s - 960) * sc2;
      streak(c, gx, 500, 1500 * (1.25 - 0.45 * a), 10, BLUE, a, 0);
      streak(c, gx, 500, 900 * (1.2 - 0.4 * a), 6, RED, a * 0.9, 0);
      streak(c, gx, 500, s * 1.6, 26, '#ffffff', a, Math.PI / 2);
      glow(c, gx, 500, 240, '#ffffff', a * 0.35);
    }
    c.save(); c.globalAlpha = win(t, 25.2, 26.95, 0.5, 0.25); c.font = '500 34px Montserrat'; c.letterSpacing = '9px'; c.fillStyle = '#e8e9ec'; c.textAlign = 'center';
    c.fillText('YA DISPONIBLE', 960 + 4.5, 690 + (1 - easeOut(seg(t, 25.2, 25.8))) * 16); c.restore();
  }

  // made by Nintendo
  if (t >= 27) {
    c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
    const e = easeOut(seg(t, 27.04, 27.5));
    c.save(); c.translate(960, 520); c.scale(0.93 + 0.07 * e, 0.93 + 0.07 * e); c.translate(-960, -520);
    nintendoLogo(c, 960, 520, 560, clamp(e * 1.6)); c.restore();
    c.save(); c.globalAlpha = smooth(27.6, 28.2, t); c.fillStyle = '#9a9aa2'; c.font = '500 17px Montserrat'; c.letterSpacing = '0.3px'; c.textAlign = 'center';
    c.fillText('Anuncio conceptual hecho por fans. No es oficial ni está afiliado a Nintendo.', 960, 1002);
    c.fillText('Nintendo Switch 2 y Joy-Con son marcas de Nintendo.', 960, 1028); c.restore();
  }
}
function drawBg(t) {
  if (t >= 27) { bgc.fillStyle = '#fff'; bgc.fillRect(0, 0, W, H); return; }
  if (t >= 23.6 || t < 0.25) { bgc.fillStyle = '#000'; bgc.fillRect(0, 0, W, H); return; }
  bgc.drawImage(t < 4 ? BG.dark : t >= 14 && t < 16 ? BG.room : BG.studio, 0, 0);
  if (t < 4) { bgc.fillStyle = `rgba(0,0,0,${1 - flick(t, 0.25) * 0.8})`; bgc.fillRect(0, 0, W, H); }
}
function drawGrain(t) {
  if (t >= 27) return;
  const f = Math.floor(t * 30), r = rng(f + 1);
  out.save(); out.globalCompositeOperation = 'overlay'; out.globalAlpha = 0.5; out.translate(-r() * 256, -r() * 256);
  out.fillStyle = out.createPattern(GRAIN[f % 4], 'repeat'); out.fillRect(0, 0, W + 256, H + 256); out.restore();
}

function seek(t) {
  t = clamp(t, 0, DUR - 1e-4);
  resetScene();
  let shot = null; for (const [t0, fn] of SHOTS) if (t >= t0) shot = fn;
  drawBg(t);
  if (shot) {
    shot(t);
    screenMat.emissiveIntensity = S.tv ? 0 : S.power;
    tvMat.color.setScalar(S.tv);
    drawScreen(t);
    renderer.render(scene, camera);
    out.drawImage(renderer.domElement, 0, 0);
  }
  drawFx(t); drawGrain(t);
}

// ── soundtrack: synthesised music + CC0 sound effects from this repo ───────────
async function buildAudio(ctx) {
  const SR = ctx.sampleRate, R = rng(20250605), buf = {};
  await Promise.all(Object.entries(window.SFX).map(async ([k, url]) => { buf[k] = await ctx.decodeAudioData(await (await fetch(url)).arrayBuffer()); }));
  const noise = ctx.createBuffer(1, SR * 2, SR); { const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1; }
  const impulse = (sec, dec) => { const n = Math.floor(SR * sec), b = ctx.createBuffer(2, n, SR); for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (R() * 2 - 1) * Math.pow(1 - i / n, dec); } return b; };
  const G = (v = 1) => { const g = ctx.createGain(); g.gain.value = v; return g; };
  const master = G(0.9), comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.18;
  master.connect(comp).connect(ctx.destination);
  master.gain.setValueAtTime(0.9, 29.0); master.gain.linearRampToValueAtTime(0.0001, 29.98);
  const verb = ctx.createConvolver(); verb.buffer = impulse(3.2, 3.5); verb.connect(G(0.32)).connect(master);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 19000; lp.Q.value = 0.8;
  const music = G(0.62); music.connect(lp).connect(master);
  const duck = G(1); duck.connect(music);
  const sfx = G(0.85); sfx.connect(master);
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const send = (node, amt) => node.connect(G(amt)).connect(verb);
  const osc = (type, f, t0, t1) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.start(t0); o.stop(t1); return o; };
  const env = (g, t, a, peak, end) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, end); };
  function nz(t, dur, type, f, q, gain, dest) {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = G(0);
    s.buffer = noise; fl.type = type; fl.frequency.value = f; fl.Q.value = q; env(g, t, 0.0015, gain, t + dur);
    s.connect(fl).connect(g).connect(dest); s.start(t, R() * 1.4); s.stop(t + dur + 0.05); return g;
  }
  const duckAt = [];
  function kick(t, v = 1, pump = true) {
    const o = osc('sine', 150, t, t + 0.5), g = G(0);
    o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(58, t + 0.07); o.frequency.exponentialRampToValueAtTime(48, t + 0.3);
    env(g, t, 0.003, 0.72 * v, t + 0.34); o.connect(g).connect(music);
    nz(t, 0.02, 'highpass', 3000, 0.7, 0.2 * v, music);
    if (pump) duckAt.push(t);
  }
  function clap(t, v = 1) { for (const [dt, a] of [[0, 0.6], [0.011, 0.5], [0.022, 0.7]]) nz(t + dt, 0.03, 'bandpass', 1300, 1.1, a * 0.62 * v, music); send(nz(t + 0.03, 0.22, 'bandpass', 1500, 0.9, 0.42 * v, music), 0.4); }
  const hat = (t, v = 1, open = false) => nz(t, open ? 0.26 : 0.045, 'highpass', open ? 7000 : 8500, 0.8, (open ? 0.2 : 0.19) * v, music);
  const crash = (t, v = 1) => send(nz(t, 2.4, 'highpass', 4200, 0.6, 0.2 * v, music), 0.5);
  function snare(t, v = 1) { nz(t, 0.16, 'bandpass', 1900, 0.8, 0.45 * v, music); const o = osc('triangle', 185, t, t + 0.12), g = G(0); env(g, t, 0.002, 0.25 * v, t + 0.1); o.connect(g).connect(music); }
  function tom(t, f, v = 1) { const o = osc('sine', f, t, t + 0.3), g = G(0); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.25); env(g, t, 0.004, 0.5 * v, t + 0.28); o.connect(g).connect(music); }
  function bass(t, m, dur, v = 1) {
    const f = mtof(m), fl = ctx.createBiquadFilter(), g = G(0), mix = G(0.35), sg = G(0);
    fl.type = 'lowpass'; fl.Q.value = 6; fl.frequency.setValueAtTime(2400, t); fl.frequency.exponentialRampToValueAtTime(320, t + 0.16);
    const end = t + dur + 0.08;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.26 * v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.15 * v, t + Math.min(0.12, dur)); g.gain.exponentialRampToValueAtTime(0.0001, end);
    osc('sawtooth', f, t, end).connect(fl); osc('square', f * 0.5 * 1.003, t, end).connect(mix).connect(fl); fl.connect(g).connect(music);
    sg.gain.setValueAtTime(0.0001, t); sg.gain.exponentialRampToValueAtTime(0.16 * v, t + 0.006); sg.gain.setValueAtTime(0.16 * v, t + dur); sg.gain.exponentialRampToValueAtTime(0.0001, end);
    osc('sine', f * 0.5, t, end).connect(sg).connect(music);
  }
  function stab(t, notes, dur = 0.16, v = 1, bright = 5200) {
    notes.forEach((m, i) => {
      const fl = ctx.createBiquadFilter(), g = G(0), pan = ctx.createStereoPanner();
      fl.type = 'lowpass'; fl.Q.value = 2; fl.frequency.setValueAtTime(bright, t); fl.frequency.exponentialRampToValueAtTime(900, t + dur + 0.15);
      env(g, t, 0.003, 0.13 * v, t + dur + 0.25); pan.pan.value = (i / Math.max(1, notes.length - 1) - 0.5) * 0.7;
      for (const det of [-9, 9]) { const o = osc('sawtooth', mtof(m), t, t + dur + 0.3); o.detune.value = det; o.connect(fl); }
      fl.connect(g).connect(pan).connect(duck); send(g, 0.25);
    });
  }
  function pad(t0, t1, notes, c0, c1, v = 1) {
    notes.forEach((m, i) => {
      const fl = ctx.createBiquadFilter(), g = G(0), pan = ctx.createStereoPanner();
      fl.type = 'lowpass'; fl.Q.value = 0.9; fl.frequency.setValueAtTime(c0, t0); fl.frequency.exponentialRampToValueAtTime(c1, t1);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.06 * v, t0 + Math.min(0.7, (t1 - t0) / 2)); g.gain.setValueAtTime(0.06 * v, t1); g.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.9);
      pan.pan.value = (i % 2 ? 1 : -1) * 0.35;
      for (const det of [-12, 0, 12]) { const o = osc('sawtooth', mtof(m), t0, t1 + 1); o.detune.value = det + i * 3; o.connect(fl); }
      fl.connect(g).connect(pan).connect(duck); send(g, 0.45);
    });
  }
  function bell(t, m, v = 1, dur = 2.2, p = 0) {
    const f = mtof(m), car = osc('sine', f, t, t + dur), mod = osc('sine', f * 3.5, t, t + dur), mg = G(0), g = G(0), pan = ctx.createStereoPanner();
    mg.gain.setValueAtTime(f * 2.2, t); mg.gain.exponentialRampToValueAtTime(f * 0.05, t + dur * 0.6); mod.connect(mg).connect(car.frequency);
    env(g, t, 0.004, 0.16 * v, t + dur); pan.pan.value = p; car.connect(g).connect(pan).connect(music); send(g, 0.55);
    const g2 = G(0); env(g2, t, 0.003, 0.04 * v, t + dur * 0.5); osc('sine', f * 2, t, t + dur * 0.5).connect(g2).connect(pan);
  }
  function sample(name, t, gain = 1, rate = 1, p = 0) {
    const s = ctx.createBufferSource(), g = G(gain), pan = ctx.createStereoPanner();
    s.buffer = buf[name]; s.playbackRate.value = rate; pan.pan.value = p; s.connect(g).connect(pan).connect(sfx); s.start(Math.max(0, t));
  }

  const B = 0.5, S16 = B / 4;
  const CH = { A: [61, 64, 68, 71], Fm: [61, 64, 69, 71], D: [61, 64, 66, 69], Bm: [59, 62, 66, 69], E: [59, 64, 66, 68] };
  const ROOT = { A: 45, Fm: 42, D: 38, Bm: 47, E: 40 };

  // 0–4 intro: the click in the dark, a pad opening up, hats building
  sample('click', 0.25, 0.55);
  pad(0.3, 5.72, [57, 64, 68, 71, 73, 76], 700, 4200, 0.5);
  { const o = osc('sine', 55, 0.25, 5.95), g = G(0); g.gain.setValueAtTime(0.0001, 0.25); g.gain.exponentialRampToValueAtTime(0.06, 0.6); g.gain.setValueAtTime(0.06, 5.6); g.gain.exponentialRampToValueAtTime(0.0001, 5.85); o.connect(g).connect(music); }
  for (let t = 1.0; t < 4 - 1e-6; t += S16) hat(t, lerp(0.15, 0.6, (t - 1) / 3) * (Math.round(t / S16) % 2 ? 0.6 : 1));
  bell(0.75, 76, 0.5, 2.6, -0.2); bell(2.75, 80, 0.4, 2.4, 0.2);
  sample('whoosh', 1.92, 0.4);

  // 4–6 build into the snap
  sample('riser', 4.0, 0.75); sample('swoosh', 4.1, 0.5, 1, -0.3);
  for (let k = 0; k < 4; k++) kick(4 + k * B, 0.55, false);
  for (let t = 4.0; t < 5.75 - 1e-6; t += t < 5 - 1e-6 ? B / 2 : t < 5.5 - 1e-6 ? S16 : S16 / 2) snare(t, 0.2 + 0.6 * (t - 4) / 1.75);
  sample('whoosh', 5.84, 0.5, 1.1, 0.35); sample('whoosh', 5.86, 0.5, 1.0, -0.35);

  // 6.00 the snap, then the groove until 23.5
  sample('click', 6.0, 1.0); sample('click2', 6.0, 0.8, 0.85); sample('impact', 6.0, 0.9); sample('hit', 6.0 - 0.32, 0.55);
  ['A', 'Fm', 'D', 'E', 'A', 'Fm', 'D', 'Bm', 'E'].forEach((ch, bi) => {
    const t0 = 6 + bi * 2, cut = 23.5 - 1e-6;
    const quiet = t => t >= 20 && t < 21.5;   // filtered breakdown under the C button
    for (let k = 0; k < 4; k++) { const tk = t0 + k * B; if (tk < cut && !quiet(tk)) kick(tk, 1); }
    for (const k of [1, 3]) if (t0 + k * B < cut) clap(t0 + k * B, quiet(t0 + k * B) ? 0.6 : 1);
    for (let s = 0; s < 16; s++) { const ts = t0 + s * S16; if (ts < cut && ts < 23.0) hat(ts, s % 4 === 2 ? 0.9 : 0.4, s % 4 === 2); }
    for (const [s, semi] of [[0, 0], [3, 0], [6, 12], [8, 0], [10, 7], [11, 12], [14, 10]]) { const ts = t0 + s * S16; if (ts < cut) bass(ts, ROOT[ch] + semi, S16 * 1.6, quiet(ts) ? 0.6 : 1); }
    for (const s of [2, 6, 10, 13]) { const ts = t0 + s * S16; if (ts < cut) stab(ts, CH[ch], 0.14, 1); }
    pad(t0, Math.min(t0 + 1.95, 23.45), [ROOT[ch] + 12, ...CH[ch]], 1400, 2200, 0.6);
  });
  for (const t of [6, 10, 14, 16, 18, 21.5]) crash(t, t === 6 ? 1.2 : 0.8);
  for (let i = 0; i < 14; i++) { const t = 10.25 + i * B / 2, notes = t < 12 ? [73, 76, 78, 81] : [71, 76, 78, 80]; bell(t, notes[[0, 1, 2, 3, 2, 1][i % 6]], 0.22, 0.9, (i % 2 ? 0.3 : -0.3)); }
  lp.frequency.setValueAtTime(19000, 19.98); lp.frequency.exponentialRampToValueAtTime(700, 20.2); lp.frequency.setValueAtTime(700, 21.25); lp.frequency.exponentialRampToValueAtTime(19000, 21.55);
  [180, 150, 120, 100].forEach((f, i) => tom(23.0 + i * S16, f, 0.9));
  for (let t = 23.0; t < 23.5 - 1e-6; t += S16 / 2) snare(t, 0.3 + (t - 23) * 1.2);

  // sound design on the cuts
  sample('pop', 10.15, 0.4);
  [11.2, 11.35, 11.5, 11.65].forEach(t => sample('tick', t, 0.5));
  for (const t of [14, 16, 18]) { sample(t === 16 ? 'whoosh2' : 'whoosh', t - 0.08, 0.5); sample('impact', t, 0.35); }
  sample('whoosh2', 19.9, 0.4);
  sample('click', 20.5, 0.9); sample('click2', 20.5, 0.5, 1.2);
  sample('whoosh', 21.52, 0.35);
  AVATARS.forEach(([, t], i) => sample('pop', t, 0.55, 1 + i * 0.06, (i - 1.5) * 0.3));
  sample('swoosh', 22.6, 0.45);

  // 24.00 the logo snaps: click, hit and the home chord
  sample('whoosh', 23.82, 0.55, 0.9, -0.4); sample('whoosh', 23.84, 0.55, 0.95, 0.4);
  sample('click', 24.0, 1.0); sample('click2', 24.0, 0.7, 0.8); sample('impact', 24.0, 0.8); sample('hit', 24.0 - 0.32, 0.5);
  kick(24.0, 1.1, false); crash(24.0, 1.2);
  bass(24.0, 45, 2.0, 0.7);
  stab(24.0, [57, 61, 64, 68, 71, 76], 0.5, 1.2, 5200);
  pad(24.0, 26.6, [57, 64, 68, 71, 73, 76, 80], 3200, 1400, 0.9);
  bell(24.5, 81, 0.6, 2.8, 0); bell(25.25, 85, 0.35, 2.4, 0.25);

  // 27.00 Nintendo
  bell(27.0, 88, 0.7, 3.0, -0.1); bell(27.16, 93, 0.6, 3.0, 0.1); sample('triangle', 27.0, 0.25);

  duckAt.sort((a, b) => a - b).forEach(t => { duck.gain.setValueAtTime(0.38, t); duck.gain.linearRampToValueAtTime(1, t + 0.22); });
}

// ── page contract + preview player ─────────────────────────────────────────────
window.buildAudio = buildAudio;
window.VIDEO = { w: W, h: H, duration: DUR };
window.seek = seek;
seek(0);
if (RENDER) return;

const btn = document.getElementById('play'), scrub = document.getElementById('scrub'), tc = document.getElementById('tc');
let abuf, actx, src, startAt = 0, offset = 0, playing = false;
const now = () => playing ? Math.min(DUR, offset + actx.currentTime - startAt) : offset;
async function play() {
  actx ??= new AudioContext();
  if (!abuf) { btn.textContent = '…'; const off = new OfflineAudioContext(2, Math.ceil(48000 * DUR), 48000); await buildAudio(off); abuf = await off.startRendering(); }
  if (offset >= DUR - 0.05) offset = 0;
  src = actx.createBufferSource(); src.buffer = abuf; src.connect(actx.destination); src.start(0, offset);
  startAt = actx.currentTime; playing = true; btn.textContent = '❚❚';
}
function pause() { if (!playing) return; offset = now(); src.stop(); playing = false; btn.textContent = '▶'; }
btn.onclick = () => (playing ? pause() : play());
addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); btn.onclick(); } });
scrub.oninput = () => { const was = playing; pause(); offset = +scrub.value; if (was) play(); };
function fit() { const s = Math.min(innerWidth / W, (innerHeight - 56) / H); stage.style.transform = `translate(${(innerWidth - W * s) / 2}px, ${(innerHeight - 56 - H * s) / 2}px) scale(${s})`; }
addEventListener('resize', fit); fit();
let last = -1;
(function loop() {
  const t = now();
  if (playing && t >= DUR) pause();
  if (t !== last) { seek(t); last = t; scrub.value = t; tc.textContent = t.toFixed(2) + ' s'; }
  requestAnimationFrame(loop);
})();
})();
