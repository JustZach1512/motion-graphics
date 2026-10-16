// Galaxy S25 por dentro: a 72 s exploded-view product film, rendered from seek(t).
//
// BEAT SHEET (120 BPM, 1 bar = 2 s)
//  0.0  fade in, light streak sweeps across ............................ low boom, pad swell
//  1.2  phone emerges edge-on, rim lit, turns to camera ................... shimmer
//  2.4  "GALAXY S25 / Descubre lo que hay dentro." ...................... soft hit + blips
//  6.0  orbit to 3/4, 7.0 the phone explodes into 8 layers ............... riser -> impact, drums in
//  7.6  layer names tick in one by one ................................... ticks
// 10.0  01 PANTALLA: glass, AMOLED, subpixel loupe, fingerprint, selfie .. whoosh, blips
// 16.0  02 REFRIGERACION: screen lifts away, heat spreads in the vapor chamber .. whoosh, rumble
// 22.0  03 PROCESADOR: orbit to the back, SoC lights up, die card (CPU/GPU/NPU/ISP) .. long whoosh, blips
// 30.0  04 MEMORIA: RAM + UFS 4.0, data pulses ............................ blips
// 36.0  05 CAMARAS: lens stacks explode, light hits the sensor ........... clicks, shimmer
// 44.0  06 BATERIA: cell fills, coil slides in and pulses ................ rising tone, pulses
// 50.0  07 CONECTIVIDAD Y SONIDO: antenna waves, speakers, haptics, USB-C  pings, buzz
// 56.0  08 MARCO: Armor Aluminum sweep, IP68 ............................. shimmer
// 62.0  reassembly spin, 63.2 snap, 65.2 screen on ........................ riser -> snap impact
// 66.0  end card "Galaxy S25 / Inteligencia en cada capa." ............... big hit, bell ring-out
// 71.3  fade out
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const W = 1920, H = 1080, DUR = 72;
const RENDER = new URLSearchParams(location.search).has('render');
window.VIDEO = { w: W, h: H, duration: DUR };

// ---------- helpers ----------
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
const eOut = x => 1 - Math.pow(1 - clamp(x), 3);
const eOut5 = x => 1 - Math.pow(1 - clamp(x), 5);
const eIn = x => Math.pow(clamp(x), 3);
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const rng = s => () => (s = (s + 0x6D2B79F5) | 0, s = Math.imul(s ^ (s >>> 15), 1 | s), s ^= s + Math.imul(s ^ (s >>> 7), 61 | s), ((s ^ (s >>> 14)) >>> 0) / 4294967296);
const rad = d => d * Math.PI / 180;
// 0..1 envelope: rises over [a, a+fi], falls over [b-fo, b]
const env = (t, a, b, fi = .4, fo = .4) => Math.min(eOut(seg(t, a, a + fi)), 1 - eIn(seg(t, b - fo, b)));
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// ---------- story data ----------
const CHAPTERS = [
  { t0: 10, t1: 16, num: '01', name: 'PANTALLA', title: 'Dynamic AMOLED 2X',
    body: 'Cada píxel emite su propia luz: negros puros, color intenso y brillo para ver bajo el sol.',
    chips: ['6,2" FHD+', '120 Hz adaptativa', 'Hasta 2600 nits'] },
  { t0: 16, t1: 22, num: '02', name: 'REFRIGERACIÓN', title: 'Cámara de vapor',
    body: 'Un líquido se evapora sobre el procesador y el vapor reparte el calor por toda la placa de cobre.',
    chips: ['Evaporación', 'Condensación', 'Rendimiento estable'] },
  { t0: 22, t1: 30, num: '03', name: 'PROCESADOR', title: 'Snapdragon 8 Elite<br>for Galaxy',
    body: 'El cerebro del teléfono: ejecuta apps, juegos e IA directamente en el dispositivo.',
    chips: ['3 nm', 'CPU de 8 núcleos', 'GPU Adreno 830', 'NPU'] },
  { t0: 30, t1: 36, num: '04', name: 'MEMORIA', title: '12 GB de RAM',
    body: 'La RAM mantiene tus apps listas al instante; el almacenamiento UFS 4.0 guarda todo a gran velocidad.',
    chips: ['LPDDR5X', 'UFS 4.0', '128 · 256 · 512 GB'] },
  { t0: 36, t1: 44, num: '05', name: 'CÁMARAS', title: 'Triple cámara trasera',
    body: 'Las lentes enfocan la luz sobre el sensor y ProVisual Engine procesa cada imagen con IA.',
    chips: ['50 MP', '12 MP', '10 MP', 'ProVisual Engine'] },
  { t0: 44, t1: 50, num: '06', name: 'BATERÍA', title: '4000 mAh',
    body: 'Almacena la energía y se recarga por cable o sin cables, a través de la bobina trasera.',
    chips: ['Carga rápida 25 W', 'Inalámbrica 15 W', 'Wireless PowerShare'] },
  { t0: 50, t1: 56, num: '07', name: 'CONECTIVIDAD Y SONIDO', title: 'Siempre conectado',
    body: 'Las antenas integradas en el marco envían y reciben la señal; dos altavoces dan sonido estéreo.',
    chips: ['5G', 'Wi-Fi 7', 'Bluetooth 5.4', 'NFC'] },
  { t0: 56, t1: 62, num: '08', name: 'MARCO', title: 'Armor Aluminum',
    body: 'El chasis de aluminio que une cada capa y la protege del agua y el polvo.',
    chips: ['IP68', '7,2 mm', '162 g'] },
];

// ---------- renderer ----------
const stage = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0x000000, 0);
document.getElementById('gl').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.85;

const camera = new THREE.PerspectiveCamera(30, W / H, 5, 4000);
scene.add(camera);
const camLight = new THREE.DirectionalLight(0xffffff, 1.7);
camLight.position.set(-0.6, 0.8, 0.3); camera.add(camLight); camera.add(camLight.target); camLight.target.position.set(0, 0, -1);
const rimA = new THREE.DirectionalLight(0x6fb4ff, 2.2); rimA.position.set(-200, 260, -260); scene.add(rimA);
const rimB = new THREE.DirectionalLight(0xbfd8ff, 1.4); rimB.position.set(320, 80, 220); scene.add(rimB);
const rimC = new THREE.DirectionalLight(0x8f7dff, 1.0); rimC.position.set(260, -200, -200); scene.add(rimC);
scene.add(new THREE.HemisphereLight(0x9fc4ff, 0x0a0c12, 0.35));

// ---------- canvas textures ----------
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const tex = (c, srgb = true) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };

function wallpaperTex() {
  const [c, g] = canvas(720, 1500);
  const gr = g.createLinearGradient(0, 0, 720, 1500);
  gr.addColorStop(0, '#081530'); gr.addColorStop(.5, '#1b4a9c'); gr.addColorStop(1, '#a9d0ff');
  g.fillStyle = gr; g.fillRect(0, 0, 720, 1500);
  const blob = (x, y, r, col) => { const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
  blob(600, 420, 560, 'rgba(150,110,255,.55)'); blob(80, 1120, 620, 'rgba(70,220,255,.45)'); blob(620, 1380, 420, 'rgba(255,160,220,.35)');
  for (let i = 0; i < 7; i++) {
    g.beginPath(); g.moveTo(-60, 760 + i * 55); g.bezierCurveTo(240, 420 + i * 95, 460, 1260 - i * 45, 800, 820 + i * 52);
    const lg = g.createLinearGradient(0, 0, 720, 0); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(.5, `rgba(225,238,255,${.10 + .045 * i})`); lg.addColorStop(1, 'rgba(255,255,255,0)');
    g.strokeStyle = lg; g.lineWidth = 30 - i * 3.4; g.stroke();
  }
  g.fillStyle = 'rgba(255,255,255,.96)'; g.textAlign = 'center';
  g.font = '200 200px "Outfit Variable"'; g.fillText('10:08', 360, 400);
  return tex(c);
}

// board coordinates (mm, model space) -> canvas px. The PCB face is seen from the back, so x is mirrored.
const BOARD = { x0: -31, x1: 31, y0: 18, y1: 70, s: 20 };
const bpx = (x, y) => [(BOARD.x1 - x) * BOARD.s, (BOARD.y1 - y) * BOARD.s];
const CHIPS = {
  soc: { x: -6, y: 44, w: 14, h: 14 }, ram: { x: -6, y: 61.5, w: 12, h: 8.5 }, ufs: { x: -24, y: 44, w: 9, h: 12 },
  wifi: { x: 8, y: 47, w: 6, h: 6 }, sh1: { x: 7, y: 29, w: 14, h: 12 }, sh2: { x: -22, y: 26.5, w: 14, h: 10 },
  conn: { x: -6, y: 20.6, w: 10, h: 2.6 }, ear: { x: 0, y: 68.4, w: 12, h: 3 }, chipA: { x: -8, y: 28, w: 5, h: 4 }, chipB: { x: 9, y: 61, w: 5, h: 5 },
};
const CAMS = [
  { key: 'uw', x: 22, y: 56, size: 11, hole: 4.2, lensR: 3.4 },
  { key: 'w', x: 22, y: 41, size: 12.4, hole: 4.9, lensR: 4.1 },
  { key: 't', x: 22, y: 26, size: 11, hole: 4.2, lensR: 3.4 },
];
// trace routes from the SoC outward (mm). group 0 = memory, 1 = cameras, 2 = other
const ROUTES = [];
(() => {
  const S = CHIPS.soc;
  for (let i = 0; i < 9; i++) { const x = S.x - 4.8 + i * 1.2; ROUTES.push({ g: 0, p: [[x, S.y + 7], [x, CHIPS.ram.y - 4.25]] }); }
  for (let i = 0; i < 8; i++) { const y = S.y - 4.2 + i * 1.2; ROUTES.push({ g: 0, p: [[S.x - 7, y], [CHIPS.ufs.x + 4.5, y]] }); }
  for (const [ci, c] of CAMS.entries()) for (let i = 0; i < 4; i++) {
    const o = i * 0.9, y0 = S.y - 3 + ci * 3 + o * .5;
    const xe = c.x - c.size / 2;
    ROUTES.push({ g: 1, p: [[S.x + 7, y0], [S.x + 9 + o, y0], [S.x + 9 + o + Math.abs(c.y - y0) * 0, c.y + (i - 1.5) * 0.9], [xe, c.y + (i - 1.5) * 0.9]] });
  }
  for (let i = 0; i < 3; i++) ROUTES.push({ g: 2, p: [[S.x + 7, S.y + 4 + i], [CHIPS.wifi.x - 3, S.y + 4 + i]] });
  for (let i = 0; i < 4; i++) ROUTES.push({ g: 2, p: [[S.x + 2 + i, S.y - 7], [S.x + 2 + i, 37 - i], [CHIPS.sh1.x - 7, 33 - i]] });
  for (let i = 0; i < 4; i++) ROUTES.push({ g: 2, p: [[S.x - 3 - i, S.y - 7], [S.x - 3 - i, 33 + i * .2], [CHIPS.sh2.x + 7, 30 - i]] });
  for (let i = 0; i < 5; i++) ROUTES.push({ g: 2, p: [[S.x - 1 + i * 1.1, S.y - 7], [S.x - 1 + i * 1.1, 24], [CHIPS.conn.x - 2 + i, 21.9]] });
  for (let i = 0; i < 4; i++) ROUTES.push({ g: 0, p: [[CHIPS.ram.x + 6, CHIPS.ram.y - 2 + i], [CHIPS.chipB.x - 2.5, CHIPS.chipB.y - 1.5 + i]] });
})();
const routeLen = r => r.p.reduce((s, q, i) => i ? s + Math.hypot(q[0] - r.p[i - 1][0], q[1] - r.p[i - 1][1]) : 0, 0);
const MAXLEN = Math.max(...ROUTES.map(routeLen));

function pcbTextures() {
  const w = (BOARD.x1 - BOARD.x0) * BOARD.s, h = (BOARD.y1 - BOARD.y0) * BOARD.s;
  const [c, g] = canvas(w, h);
  g.fillStyle = '#0b1828'; g.fillRect(0, 0, w, h);
  const r = rng(7);
  // faint filler traces
  g.lineCap = 'round';
  for (let i = 0; i < 420; i++) {
    let x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 3; k++) { if (r() < .5) x += (r() - .5) * 220; else y += (r() - .5) * 220; g.lineTo(x, y); }
    g.strokeStyle = `rgba(120,170,220,${.06 + r() * .07})`; g.lineWidth = 2 + r() * 2; g.stroke();
  }
  // vias
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(200,170,110,${.25 + r() * .35})`; g.beginPath(); g.arc(r() * w, r() * h, 2 + r() * 2.5, 0, 7); g.fill(); }
  // main routes
  g.lineJoin = 'round';
  for (const rt of ROUTES) { g.beginPath(); rt.p.forEach((q, i) => { const [x, y] = bpx(q[0], q[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.strokeStyle = 'rgba(205,165,90,.55)'; g.lineWidth = 5; g.stroke(); }
  // pads under chips
  for (const k of ['soc', 'ram', 'ufs', 'wifi', 'chipA', 'chipB']) { const ch = CHIPS[k]; const [x, y] = bpx(ch.x + ch.w / 2 + 0.8, ch.y + ch.h / 2 + 0.8); g.strokeStyle = 'rgba(210,180,120,.35)'; g.lineWidth = 3; g.strokeRect(x, y, (ch.w + 1.6) * BOARD.s, (ch.h + 1.6) * BOARD.s); }
  // silkscreen ticks
  g.fillStyle = 'rgba(230,240,255,.35)'; g.font = '600 26px "Inter Variable"';
  [['U1', -14, 53], ['U2', -14, 66.5], ['U3', -30, 52], ['J1', -12, 23.5], ['C14', 2, 52], ['R8', 13, 52]].forEach(([s, x, y]) => { const [px, py] = bpx(x, y); g.fillText(s, px, py); });
  const visual = tex(c);

  // pulse map: R = distance along route from the SoC, G = route group
  const [c2, g2] = canvas(w / 2, h / 2);
  g2.lineCap = 'round'; g2.lineJoin = 'round';
  for (const rt of ROUTES) {
    let d = 0;
    for (let i = 1; i < rt.p.length; i++) {
      const a = rt.p[i - 1], b = rt.p[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const [ax, ay] = bpx(a[0], a[1]).map(v => v / 2), [bx, by] = bpx(b[0], b[1]).map(v => v / 2);
      const lg = g2.createLinearGradient(ax, ay, bx + 0.001, by + 0.001);
      lg.addColorStop(0, `rgb(${Math.round(d / MAXLEN * 255)},${rt.g * 40},0)`);
      lg.addColorStop(1, `rgb(${Math.round((d + L) / MAXLEN * 255)},${rt.g * 40},0)`);
      g2.strokeStyle = lg; g2.lineWidth = 3.5; g2.beginPath(); g2.moveTo(ax, ay); g2.lineTo(bx, by); g2.stroke();
      d += L;
    }
  }
  const pulse = tex(c2, false); pulse.generateMipmaps = false; pulse.minFilter = THREE.LinearFilter;
  return { visual, pulse };
}

function batteryTex() {
  const [c, g] = canvas(1040, 1400);
  g.fillStyle = '#121418'; g.fillRect(0, 0, 1040, 1400);
  g.strokeStyle = 'rgba(255,255,255,.10)'; g.lineWidth = 4; g.strokeRect(40, 40, 960, 1320);
  g.fillStyle = 'rgba(220,230,245,.42)'; g.font = '500 64px "Inter Variable"'; g.fillText('4000 mAh', 90, 170);
  g.font = '400 34px "Inter Variable"'; g.fillStyle = 'rgba(220,230,245,.26)'; g.fillText('Li-ion', 90, 230);
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(90, 300 + i * 40, 520 - i * 60, 12); }
  return tex(c);
}

const COIL = { w: 48, h: 60, cx: 3, cy: -16, coilY: 4, r: 19 };
function coilTex() {
  const s = 20, [c, g] = canvas(COIL.w * s, COIL.h * s);
  g.fillStyle = '#0c0d10'; g.fillRect(0, 0, c.width, c.height);
  const cx = c.width / 2, cy = c.height / 2 - COIL.coilY * s;
  for (let r = 5.5; r < COIL.r; r += 0.62) { g.beginPath(); g.arc(cx, cy, r * s, 0, 7); g.strokeStyle = '#c27a3d'; g.lineWidth = 0.42 * s; g.stroke(); }
  g.fillStyle = '#16181c'; g.fillRect(cx - 0.8 * s, cy, 1.6 * s, (COIL.r + 2) * s);
  for (let k = 0; k < 3; k++) { const m = (1.6 + k * 0.8) * s; g.strokeStyle = '#a8662f'; g.lineWidth = 0.35 * s; g.beginPath(); g.roundRect(m, m, c.width - 2 * m, c.height - 2 * m, 3 * s); g.stroke(); }
  return tex(c);
}

function fingerprintTex() {
  const [c, g] = canvas(256, 256);
  g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 5; g.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const r = 18 + i * 12; g.beginPath(); g.ellipse(128, 140, r * .78, r, 0, Math.PI * (1.08 + (i % 3) * .05), Math.PI * (1.92 + (i % 2) * .5)); g.stroke(); }
  return tex(c);
}

function glowTex() {
  const [c, g] = canvas(256, 256);
  const rg = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(.2, 'rgba(255,255,255,.55)'); rg.addColorStop(.5, 'rgba(255,255,255,.14)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = rg; g.fillRect(0, 0, 256, 256); return tex(c);
}
function ringTex() {
  const [c, g] = canvas(256, 256);
  const rg = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(.78, 'rgba(255,255,255,0)'); rg.addColorStop(.88, 'rgba(255,255,255,1)'); rg.addColorStop(.94, 'rgba(255,255,255,.2)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = rg; g.fillRect(0, 0, 256, 256); return tex(c);
}
function grillTex() {
  const [c, g] = canvas(256, 128);
  g.fillStyle = '#121317'; g.fillRect(0, 0, 256, 128);
  g.fillStyle = '#05060a'; for (let y = 12; y < 128; y += 14) for (let x = 12 + (y / 14 % 2) * 7; x < 256; x += 14) { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
  return tex(c);
}

// ---------- shaders ----------
const VS = `varying vec2 vUv; varying vec3 vP; void main(){ vUv = uv; vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const ADD = { blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor };
const ADD_A = { ...ADD, blendSrc: THREE.SrcAlphaFactor };
const addMat = (uniforms, fs) => new THREE.ShaderMaterial({ uniforms, vertexShader: VS, fragmentShader: fs, transparent: true, ...ADD, depthWrite: false, toneMapped: false });
const sweepMat = (dir = [0.55, 0.83], color = 0xffffff, width = 14) => addMat(
  { uPos: { value: -999 }, uW: { value: width }, uA: { value: 0 }, uDir: { value: new THREE.Vector2(...dir).normalize() }, uColor: { value: new THREE.Color(color) } },
  `uniform float uPos, uW, uA; uniform vec2 uDir; uniform vec3 uColor; varying vec3 vP;
   void main(){ float d = dot(vP.xy, uDir) - uPos; float b = exp(-d * d / (uW * uW)); gl_FragColor = vec4(uColor * b * uA, 1.0); }`);

// ---------- geometry helpers ----------
function rrPath(p, w, h, r, cx = 0, cy = 0) {
  const x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2, y1 = cy + h / 2;
  p.moveTo(x0 + r, y0); p.lineTo(x1 - r, y0); p.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false);
  p.lineTo(x1, y1 - r); p.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false);
  p.lineTo(x0 + r, y1); p.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false);
  p.lineTo(x0, y0 + r); p.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false);
  return p;
}
const rrShape = (...a) => rrPath(new THREE.Shape(), ...a);
const rrHole = (...a) => rrPath(new THREE.Path(), ...a);
const circleShape = (r, cx = 0, cy = 0) => { const s = new THREE.Shape(); s.absarc(cx, cy, r, 0, Math.PI * 2, false); return s; };
const circleHole = (r, cx = 0, cy = 0) => { const s = new THREE.Path(); s.absarc(cx, cy, r, 0, Math.PI * 2, true); return s; };
// extrude a shape centred on z=0 with total depth `dep`; the bevel grows the outline by `b`
function extrude(shape, dep, b, mat, segs = 10) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: Math.max(0.01, dep - 2 * b), bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: segs });
  geo.translate(0, 0, -Math.max(0.01, dep - 2 * b) / 2);
  return new THREE.Mesh(geo, mat);
}
function normUV(geo) {
  geo.computeBoundingBox(); const bb = geo.boundingBox, p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - bb.min.x) / (bb.max.x - bb.min.x), (p.getY(i) - bb.min.y) / (bb.max.y - bb.min.y));
  uv.needsUpdate = true; return geo;
}
const at = (m, x, y, z) => (m.position.set(x, y, z), m);
const backPlane = (w, h, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.rotation.y = Math.PI; m.position.set(x, y, z); return m; };

// ---------- phone ----------
const PW = 70.5, PH = 146.9, PR = 9.6;
const rig = new THREE.Group(); scene.add(rig);
const phone = new THREE.Group(); rig.add(phone);
const LAYERS = [];
function layer(name, z0, ze) {
  const g = new THREE.Group(); phone.add(g);
  const L = { name, g, z0, ze, mats: [], idx: LAYERS.length };
  L.mat = m => { m.userData.c0 = m.color ? m.color.clone() : null; m.userData.e0 = m.envMapIntensity ?? 1; m.userData.o0 = m.opacity; L.mats.push(m); return m; };
  L.dim = d => { for (const m of L.mats) { if (m.userData.c0) m.color.copy(m.userData.c0).multiplyScalar(d); if ('envMapIntensity' in m) m.envMapIntensity = m.userData.e0 * (0.25 + 0.75 * d); } };
  LAYERS.push(L); return L;
}
const std = (color, metalness, roughness, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra });
const phys = (o) => new THREE.MeshPhysicalMaterial(o);

let T = {}; // textures, filled in init
const FX = {}; // animated bits
const A = {};  // anchors: name -> { obj, p }

function buildPhone() {
  // --- 0 cover glass
  const LG = layer('glass', 3.25, 42);
  const glassMat = LG.mat(phys({ color: 0xdcecff, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.16, clearcoat: 1, envMapIntensity: 2.4, depthWrite: false }));
  LG.g.add(extrude(rrShape(PW - 1.2, PH - 1.2, PR - 0.6), 0.7, 0.3, glassMat, 16));
  const outline = new THREE.BufferGeometry().setFromPoints(rrShape(PW - 0.7, PH - 0.7, PR - 0.35).getPoints(24).map(p => V3(p.x, p.y, 0)));
  const lineMat = LG.mat(new THREE.LineBasicMaterial({ color: 0xd6ebff, transparent: true, opacity: 0.7 }));
  for (const z of [0.36, -0.36]) { const l = new THREE.LineLoop(outline, lineMat); l.position.z = z; LG.g.add(l); }
  FX.glassSweep = sweepMat([0.5, 0.86], 0xcfe8ff, 16);
  const gs = new THREE.Mesh(normUV(new THREE.ShapeGeometry(rrShape(PW - 1.2, PH - 1.2, PR - 0.6), 16)), FX.glassSweep); gs.position.z = 0.37; LG.g.add(gs);
  A.glass = { obj: LG.g, p: V3(-PW / 2 + 9, PH / 2 - 22, 0.36) };

  // --- 1 display
  const LD = layer('display', 2.6, 30);
  LD.g.add(extrude(rrShape(PW - 1.6, PH - 1.6, PR - 0.8), 0.6, 0.2, LD.mat(std(0x0b0c10, 0.3, 0.45))));
  FX.screenMat = new THREE.MeshBasicMaterial({ map: T.wall, toneMapped: false, color: 0x000000 });
  const scr = new THREE.Mesh(normUV(new THREE.ShapeGeometry(rrShape(PW - 2.8, PH - 2.8, PR - 1.6), 16)), FX.screenMat); scr.position.z = 0.31; LD.g.add(scr);
  const punch = new THREE.Mesh(new THREE.CircleGeometry(1.5, 32), new THREE.MeshBasicMaterial({ color: 0x000000 })); punch.position.set(0, PH / 2 - 6.5, 0.32); LD.g.add(punch);
  FX.fpMat = new THREE.MeshBasicMaterial({ map: T.fp, transparent: true, opacity: 0, ...ADD_A, depthWrite: false, toneMapped: false, color: 0xbfe3ff });
  const fp = new THREE.Mesh(new THREE.PlaneGeometry(11, 11), FX.fpMat); fp.position.set(0, -PH / 2 + 30, 0.33); LD.g.add(fp);
  LD.g.add(backPlane(PW - 6, PH - 10, LD.mat(std(0x4a3426, 0.6, 0.5)), 0, 0, -0.31));
  A.screen = { obj: LD.g, p: V3(12, 8, 0.32) };
  A.fp = { obj: LD.g, p: V3(0, -PH / 2 + 30, 0.33) };
  A.selfie = { obj: LD.g, p: V3(0, PH / 2 - 6.5, 0.33) };
  FX.LD = LD;

  // --- 2 vapor chamber
  const LV = layer('vapor', 2.1, 17);
  const VC = { w: 52, h: 88, cy: 16 };
  LV.g.add(extrude(rrShape(VC.w, VC.h, 6, 0, VC.cy), 0.4, 0.12, LV.mat(std(0xc98552, 1, 0.32))));
  FX.heat = addMat({ uA: { value: 0 }, uT: { value: 0 }, uS: { value: 0 }, uHot: { value: new THREE.Vector2((CHIPS.soc.x + VC.w / 2) / VC.w, (CHIPS.soc.y - (VC.cy - VC.h / 2)) / VC.h) }, uSize: { value: new THREE.Vector2(VC.w, VC.h) } },
    `uniform float uA, uT, uS; uniform vec2 uHot, uSize; varying vec2 vUv;
     vec3 ramp(float x){ x = clamp(x, 0., 1.); vec3 c0 = vec3(.02,.10,.32), c1 = vec3(.10,.58,1.), c2 = vec3(1.,.50,.10), c3 = vec3(1.,.93,.70);
       return x < .33 ? mix(c0, c1, x / .33) : (x < .66 ? mix(c1, c2, (x - .33) / .33) : mix(c2, c3, (x - .66) / .34)); }
     void main(){ vec2 p = (vUv - uHot) * uSize; float r = length(p);
       float R = mix(5., 58., uS); float amp = mix(1.05, .44, uS);
       float T = amp * exp(-r * r / (R * R));
       float rip = .5 + .5 * sin(r * .85 - uT * 9.);
       T *= .9 + .1 * rip * smoothstep(0., .3, uS);
       vec2 e = min(vUv, 1. - vUv) * uSize; float edge = smoothstep(0., 3., min(e.x, e.y));
       vec3 c = ramp(T) * smoothstep(.02, .18, T) * edge;
       gl_FragColor = vec4(c * uA, 1.); }`);
  const hp = new THREE.Mesh(normUV(new THREE.ShapeGeometry(rrShape(VC.w - 1, VC.h - 1, 5.5, 0, VC.cy), 12)), FX.heat); hp.position.z = 0.22; LV.g.add(hp);
  A.hot = { obj: LV.g, p: V3(CHIPS.soc.x, CHIPS.soc.y, 0.22) };
  A.vapEdge = { obj: LV.g, p: V3(18, -14, 0.22) };

  // --- 3 frame + midplate
  const LF = layer('frame', 0, 0);
  const frameMat = LF.mat(phys({ color: 0xc4d6ea, metalness: 1, roughness: 0.24, clearcoat: 0.4, clearcoatRoughness: 0.3 }));
  const b = 0.7, fs = rrShape(PW - 2 * b, PH - 2 * b, PR - b);
  fs.holes.push(rrHole(PW - 4.6 + 2 * b, PH - 4.6 + 2 * b, PR - 2.3 + b));
  const rails = extrude(fs, 5.8, b, frameMat, 20); LF.g.add(rails);
  FX.frameSweep = sweepMat([0.3, 0.95], 0xffffff, 22);
  const sweepMesh = new THREE.Mesh(rails.geometry, FX.frameSweep); LF.g.add(sweepMesh);
  LF.g.add(at(extrude(rrShape(PW - 4.4, PH - 4.4, PR - 2.2), 0.5, 0.12, LF.mat(std(0x2b3039, 0.85, 0.42))), 0, 0, 1.65));
  const antMat = LF.mat(std(0x1c2028, 0.1, 0.6));
  const ANT = [[-1, 50], [1, 50], [-1, -48], [1, -48]];
  FX.ants = [];
  ANT.forEach(([s, y], i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.0, 4.4), antMat); m.position.set(s * (PW / 2 - 1.15), y, 0); LF.g.add(m); A['ant' + i] = { obj: LF.g, p: V3(s * (PW / 2 + 0.2), y, 0) }; FX.ants.push(A['ant' + i]); });
  [[-16, 1], [18, -1]].forEach(([x, s], i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.5, 4.4), antMat); m.position.set(x, s * (PH / 2 - 1.15), 0); LF.g.add(m); A['ant' + (4 + i)] = { obj: LF.g, p: V3(x, s * (PH / 2 + 0.2), 0) }; FX.ants.push(A['ant' + (4 + i)]); });
  for (const [y, len] of [[41, 21], [16, 10]]) { const m = extrude(rrShape(0.9, len, 0.44), 2.2, 0.15, frameMat); m.position.set(PW / 2 + 0.25, y, 0); LF.g.add(m); }
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x050608 });
  const usb = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.3, 2.6), holeMat); usb.position.set(0, -PH / 2 - 0.02, 0); LF.g.add(usb);
  for (let i = 0; i < 6; i++) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.3, 12), holeMat); h.position.set(12 + i * 1.8, -PH / 2 - 0.02, 0); LF.g.add(h); }
  A.rail = { obj: LF.g, p: V3(-PW / 2 - 0.1, -10, 0) };
  A.railTop = { obj: LF.g, p: V3(-PW / 2 + 6, PH / 2 + 0.1, 0) };

  // --- 4 boards, cameras, speakers
  const LB = layer('board', -0.6, -17);
  const pcbMat = LB.mat(std(0x13283c, 0.3, 0.6));
  const bw = BOARD.x1 - BOARD.x0, bh = BOARD.y1 - BOARD.y0, bcy = (BOARD.y0 + BOARD.y1) / 2;
  LB.g.add(extrude(rrShape(bw, bh, 3, 0, bcy), 0.8, 0.1, pcbMat));
  LB.g.add(backPlane(bw - 0.2, bh - 0.2, LB.mat(std(0xffffff, 0.25, 0.55, { map: T.pcb.visual })), 0, bcy, -0.42));
  FX.pulse = addMat({ uMap: { value: T.pcb.pulse }, uT: { value: 0 }, uA: { value: 0 }, uW: { value: V3(1, 1, 1) } },
    `uniform sampler2D uMap; uniform float uT, uA; uniform vec3 uW; varying vec2 vUv;
     void main(){ vec4 s = texture2D(uMap, vUv); float grp = floor(s.g * 255. / 40. + .5);
       float w = grp < .5 ? uW.x : (grp < 1.5 ? uW.y : uW.z);
       float p = fract(s.r * 3.2 - uT * 1.1);
       float pulse = smoothstep(.78, .96, p) * (1. - smoothstep(.96, 1., p));
       vec3 col = vec3(.35, .78, 1.) * (.22 + 2.6 * pulse) * s.a * w * uA;
       gl_FragColor = vec4(col, 1.); }`);
  LB.g.add(backPlane(bw - 0.2, bh - 0.2, FX.pulse, 0, bcy, -0.44));
  const chipMat = LB.mat(std(0x16171b, 0.15, 0.32));
  const subMat = LB.mat(std(0x2a4a3a, 0.2, 0.5));
  const shieldMat = LB.mat(std(0xa7b0ba, 1, 0.3));
  const chip = (c, d, mat, r = 0.5) => { const m = extrude(rrShape(c.w, c.h, r, c.x, c.y), d, 0.1, mat); m.position.z = -0.4 - d / 2; LB.g.add(m); return m; };
  chip({ ...CHIPS.soc, w: 15, h: 15 }, 0.35, subMat, 0.6);
  FX.soc = chip({ ...CHIPS.soc, w: 12.6, h: 12.6 }, 1.25, chipMat, 0.7);
  chip(CHIPS.ram, 0.9, chipMat); chip(CHIPS.ufs, 0.95, chipMat); chip(CHIPS.wifi, 0.7, chipMat); chip(CHIPS.chipA, 0.6, chipMat); chip(CHIPS.chipB, 0.6, chipMat);
  chip(CHIPS.sh1, 0.6, shieldMat, 0.8); chip(CHIPS.sh2, 0.6, shieldMat, 0.8);
  chip(CHIPS.conn, 0.8, LB.mat(std(0x0e0f12, 0.4, 0.4))); chip(CHIPS.ear, 1.5, LB.mat(std(0x1d1f24, 0.2, 0.5)));
  A.soc = { obj: LB.g, p: V3(CHIPS.soc.x, CHIPS.soc.y, -1.7) };
  A.ram = { obj: LB.g, p: V3(CHIPS.ram.x - 3, CHIPS.ram.y, -1.35) };
  A.ufs = { obj: LB.g, p: V3(CHIPS.ufs.x, CHIPS.ufs.y - 2, -1.4) };
  // passives
  {
    const r = rng(42), N = 340, inst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), LB.mat(std(0xffffff, 0.2, 0.5)), N);
    const blocked = Object.values(CHIPS).map(c => [c.x - c.w / 2 - 0.8, c.x + c.w / 2 + 0.8, c.y - c.h / 2 - 0.8, c.y + c.h / 2 + 0.8]).concat(CAMS.map(c => [c.x - c.size / 2 - 0.6, c.x + c.size / 2 + 0.6, c.y - c.size / 2 - 0.6, c.y + c.size / 2 + 0.6]));
    const cols = [0xc9ad84, 0x1a1a1c, 0x8a9098, 0xb69b74];
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
    let n = 0, guard = 0;
    while (n < N && guard++ < 20000) {
      const x = lerp(BOARD.x0 + 1.5, BOARD.x1 - 1.5, r()), y = lerp(BOARD.y0 + 1.5, BOARD.y1 - 1.5, r());
      if (blocked.some(([a, b2, c, d]) => x > a && x < b2 && y > c && y < d)) continue;
      const big = r() < .25, w = big ? 1.6 : (r() < .5 ? 1.0 : 0.6), h = w / 2, d = big ? 0.6 : 0.35;
      q.setFromAxisAngle(V3(0, 0, 1), r() < .5 ? 0 : Math.PI / 2);
      m4.compose(V3(x, y, -0.4 - d / 2), q, V3(w, h, d)); inst.setMatrixAt(n, m4);
      inst.setColorAt(n, col.setHex(cols[Math.floor(r() * cols.length)])); n++;
    }
    inst.count = n; LB.g.add(inst);
  }
  // rear cameras
  const housingMat = LB.mat(std(0x0d0e11, 0.5, 0.35));
  const lensMat = LB.mat(phys({ color: 0x9cc4ff, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.78, clearcoat: 1, iridescence: 1, iridescenceIOR: 1.6, envMapIntensity: 2.2 }));
  const barrelMat = LB.mat(std(0x30343c, 1, 0.3));
  FX.cams = [];
  for (const c of CAMS) {
    const g = new THREE.Group(); g.position.set(c.x, c.y, -0.4); LB.g.add(g);
    const hs = rrShape(c.size, c.size, 2.2); hs.holes.push(circleHole(c.hole));
    const housing = extrude(hs, 3.2, 0.15, housingMat, 24); housing.position.z = -1.6; g.add(housing);
    const sensorMat = LB.mat(phys({ color: 0x2a1840, metalness: 0.6, roughness: 0.25, iridescence: 1, iridescenceIOR: 1.8, emissive: 0x7a5cff, emissiveIntensity: 0 }));
    const sensor = new THREE.Mesh(new THREE.PlaneGeometry(c.hole * 1.25, c.hole * 0.95), sensorMat); sensor.rotation.y = Math.PI; sensor.position.z = -0.25; g.add(sensor);
    const elems = [];
    for (let k = 0; k < 5; k++) {
      const r = c.lensR * (0.78 + k * 0.06), th = 0.35 + (k === 4 ? 0.25 : 0);
      const e = new THREE.Mesh(new THREE.CylinderGeometry(r, r, th, 40), lensMat); e.rotation.x = Math.PI / 2;
      const base = -0.9 - k * 0.55; e.position.z = base; e.userData.base = base; g.add(e); elems.push(e);
    }
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(c.hole + 0.35, c.hole + 0.35, 1.2, 40, 1, true), barrelMat); barrel.rotation.x = Math.PI / 2; barrel.position.z = -3.6; barrel.userData.base = -3.6; g.add(barrel);
    FX.cams.push({ ...c, g, elems, barrel, sensorMat });
    A['cam_' + c.key] = { obj: g, p: V3(0, 0, -3.4), lens: elems[4] };
  }
  // front camera (on the front face)
  { const m = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 3, 24), housingMat); m.rotation.x = Math.PI / 2; m.position.set(0, PH / 2 - 6.5, 1.8); LB.g.add(m); }
  // sub board, USB-C, speaker, haptic, flex
  LB.g.add(extrude(rrShape(56, 12, 2, 0, -64), 0.8, 0.1, pcbMat));
  const usbC = extrude(rrShape(9, 7, 1.4, 0, -68.6), 3.2, 0.3, LB.mat(std(0xb9c2cc, 1, 0.25))); usbC.position.z = -0.2; LB.g.add(usbC);
  const spk = extrude(rrShape(22, 10, 1.6, 17, -63.5), 2.0, 0.3, LB.mat(std(0x15161a, 0.2, 0.5))); spk.position.z = -1.4; LB.g.add(spk);
  LB.g.add(backPlane(18, 7, LB.mat(std(0xffffff, 0.1, 0.6, { map: T.grill })), 17, -63.5, -2.42));
  FX.haptic = extrude(rrShape(11, 5.5, 1.2, 0, 0), 2.0, 0.3, LB.mat(std(0x8f969f, 1, 0.3))); FX.haptic.position.set(-16, -63.5, -1.4); LB.g.add(FX.haptic);
  LB.g.add(at(new THREE.Mesh(new THREE.BoxGeometry(6, 78, 0.25), LB.mat(std(0xb5651d, 0.25, 0.42))), -27.5, -20, -0.55));
  A.spk = { obj: LB.g, p: V3(17, -63.5, -2.45) };
  A.ear = { obj: LB.g, p: V3(0, 68.4, -1.9) };
  A.haptic = { obj: LB.g, p: V3(-16, -63.5, -2.45) };
  A.usb = { obj: LB.g, p: V3(0, -72, -1.8) };
  FX.LB = LB;

  // --- 5 battery
  const LBa = layer('battery', -0.6, -26);
  LBa.g.add(extrude(rrShape(52, 70, 3, 3, -21), 4.0, 0.4, LBa.mat(std(0x15171b, 0.3, 0.55))));
  LBa.g.add(backPlane(50.4, 68.4, LBa.mat(std(0xffffff, 0.2, 0.6, { map: T.bat })), 3, -21, -2.01));
  FX.fill = addMat({ uFill: { value: 0 }, uA: { value: 0 }, uT: { value: 0 } },
    `uniform float uFill, uA, uT; varying vec2 vUv;
     void main(){ float y = vUv.y; float inside = step(y, uFill);
       float edge = exp(-pow((y - uFill) * 70., 2.)) * step(.002, uFill);
       float stripes = .86 + .14 * sin((vUv.x * 7. + y * 12. - uT * 2.5) * 3.14159);
       vec3 c = mix(vec3(.04, .30, .95), vec3(.20, .95, .88), y) * inside * .62 * stripes + vec3(.8, 1., 1.) * edge * 1.3;
       float bx = smoothstep(0., .03, vUv.x) * smoothstep(1., .97, vUv.x) * smoothstep(0., .02, y) * smoothstep(1., .98, y);
       gl_FragColor = vec4(c * bx * uA, 1.); }`);
  LBa.g.add(backPlane(48, 66, FX.fill, 3, -21, -2.03));
  A.bat = { obj: LBa.g, p: V3(-18, -2, -2.05) };

  // --- 6 wireless charging coil + NFC
  const LC = layer('coil', -2.7, -36);
  LC.g.add(extrude(rrShape(COIL.w, COIL.h, 4, COIL.cx, COIL.cy), 0.25, 0.05, LC.mat(std(0x0c0d10, 0.2, 0.6))));
  LC.g.add(backPlane(COIL.w - 0.4, COIL.h - 0.4, LC.mat(std(0xffffff, 0.7, 0.4, { map: T.coil })), COIL.cx, COIL.cy, -0.14));
  FX.coil = addMat({ uA: { value: 0 }, uT: { value: 0 }, uC: { value: new THREE.Vector2(0.5, 0.5 + COIL.coilY / COIL.h) }, uSize: { value: new THREE.Vector2(COIL.w, COIL.h) }, uR: { value: COIL.r } },
    `uniform float uA, uT, uR; uniform vec2 uC, uSize; varying vec2 vUv;
     void main(){ vec2 p = (vUv - uC) * uSize; float r = length(p) / uR; float f = fract(r - uT * .9);
       float ring = smoothstep(.72, .95, f) * (1. - smoothstep(.95, 1., f)); float m = smoothstep(1.12, .92, r) * smoothstep(.2, .32, r);
       vec3 c = vec3(.40, .82, 1.) * (ring * 1.8 + .14) * m; gl_FragColor = vec4(c * uA, 1.); }`);
  LC.g.add(backPlane(COIL.w - 0.4, COIL.h - 0.4, FX.coil, COIL.cx, COIL.cy, -0.16));
  A.coil = { obj: LC.g, p: V3(COIL.cx - 14, COIL.cy + COIL.coilY + 12, -0.16) };

  // --- 7 back glass
  const LK = layer('back', -3.2, -48);
  const bs = rrShape(PW - 1.2, PH - 1.2, PR - 0.6);
  for (const c of CAMS) bs.holes.push(circleHole(5.5, c.x, c.y));
  LK.g.add(extrude(bs, 0.8, 0.3, LK.mat(phys({ color: 0x9dbde0, metalness: 0.05, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.15, sheen: 0.4, sheenColor: 0xd8ecff })), 20));
  const ringMat = LK.mat(phys({ color: 0xc4d6ea, metalness: 1, roughness: 0.22, clearcoat: 0.5 }));
  const coverMat = LK.mat(phys({ color: 0x0a0d14, metalness: 0.2, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.55, iridescence: 0.6 }));
  for (const c of CAMS) {
    const rs = circleShape(6.3, c.x, c.y); rs.holes.push(circleHole(5.1, c.x, c.y));
    const ring = extrude(rs, 1.4, 0.2, ringMat, 40); ring.position.z = -0.75; LK.g.add(ring);
    const cov = new THREE.Mesh(new THREE.CylinderGeometry(5.1, 5.1, 0.3, 40), coverMat); cov.rotation.x = Math.PI / 2; cov.position.set(c.x, c.y, -1.1); LK.g.add(cov);
  }
  const flash = new THREE.Mesh(new THREE.CircleGeometry(1.5, 24), LK.mat(std(0xf3ead2, 0.1, 0.3, { emissive: 0x332a18 }))); flash.rotation.y = Math.PI; flash.position.set(11.5, 50, -0.42); LK.g.add(flash);

  FX.L = Object.fromEntries(LAYERS.map(L => [L.name, L]));
}

// glow sprites and wave rings
function sprite(map, color, s) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map, color, transparent: true, ...ADD_A, depthWrite: false, depthTest: false, toneMapped: false, opacity: 0 })); sp.scale.set(s, s, 1); sp.renderOrder = 10; scene.add(sp); return sp; }
const _v = V3();
const worldOf = (a, out = V3()) => out.copy(a.p).applyMatrix4(a.obj.matrixWorld);

// ---------- camera choreography ----------
// [t, az, el, dist, tx, ty, tz, sx]
const SHOTS = [
  [0.0, 0, 3, 560, 0, 0, 0, 0],
  [2.2, 0, 4, 470, 0, 0, 0, 0],
  [4.6, 0, 5, 440, 0, 0, 0, 330],
  [5.6, 0, 5, 440, 0, 0, 0, 330],
  [7.0, 58, 15, 560, 0, 0, -3, 0],
  [9.6, 66, 17, 545, 0, 0, -3, 0],
  [10.9, -24, 5, 360, 0, 0, 32, 250],
  [15.6, -17, 6, 360, 0, 0, 32, 250],
  [16.9, -16, 9, 270, 0, 16, 19, 270],
  [21.2, -10, 9, 270, 0, 16, 19, 270],
  [23.4, 196, 14, 228, -8, 44, -18, 190],
  [29.5, 189, 13, 228, -8, 44, -18, 190],
  [30.7, 186, 11, 192, -14, 52, -18, 240],
  [35.5, 191, 11, 192, -14, 52, -18, 240],
  [36.9, 146, 9, 215, 20, 41, -24, 170],
  [43.5, 140, 9, 215, 20, 41, -24, 170],
  [44.9, 192, 10, 280, 3, -18, -28, 260],
  [49.5, 186, 10, 280, 3, -18, -28, 260],
  [50.9, 148, 13, 450, 0, -2, -6, 300],
  [55.5, 140, 14, 450, 0, -2, -6, 300],
  [56.9, 128, 20, 390, 0, 0, 0, 270],
  [61.4, 100, 16, 400, 0, 0, 0, 270],
  [65.8, 340, 4, 440, 0, 0, 0, 330],
  [72.0, 348, 4, 430, 0, 0, 0, 330],
];
const camF = [1, 2, 3, 4, 5, 6, 7].map(i => kf(SHOTS.map(s => [s[0], s[i]])));

// per-layer explode amount (0 assembled .. 1 fully exploded), staggered by layer index
const explodeF = LAYERS_COUNT => Array.from({ length: LAYERS_COUNT }, (_, i) =>
  track(0, [[6.9 + Math.abs(i - 3) * 0.06, 1, 8, 0.86], [50.4, 0.5, 6, 1], [56.4, 0.32, 6, 1], [63.0, 0, 13, 1]]));
let EXP;
// extra offsets (mm) to clear the view
const liftY = track(0, [[15.7, 190, 4.5, 1], [45.0, 0, 5, 1]]);
const backY = track(0, [[21.3, -260, 4.5, 1], [61.0, 0, 5, 1]]);
const coilY = track(0, [[21.3, -230, 4.5, 1], [46.9, 0, 6, 1]]);
const marcoOut = track(0, [[55.9, 1, 4.2, 1], [61.0, 0, 5.5, 1]]);

const FOCUS = [
  { a: 10, b: 16, on: ['glass', 'display'], lo: 0.22 },
  { a: 16, b: 22, on: ['vapor'], lo: 0.25, extra: { frame: 0.45 } },
  { a: 22, b: 36, on: ['board'], lo: 0.3, extra: { frame: 0.45, battery: 0.4 } },
  { a: 36, b: 44, on: ['board'], lo: 0.3, extra: { frame: 0.4 } },
  { a: 44, b: 50, on: ['battery', 'coil'], lo: 0.3, extra: { board: 0.4, frame: 0.45 } },
  { a: 50, b: 56, on: ['frame', 'board'], lo: 0.55 },
  { a: 56, b: 62, on: ['frame'], lo: 0.3 },
];
function dimFor(name, t) {
  let d = 1;
  for (const f of FOCUS) {
    const w = env(t, f.a - 0.3, f.b + 0.3, 0.7, 0.7);
    if (w <= 0) continue;
    const target = f.on.includes(name) ? 1 : (f.extra?.[name] ?? f.lo);
    d = lerp(d, target, w);
  }
  return d;
}

// ---------- UI ----------
const ui = document.getElementById('ui'), svg = document.getElementById('lines');
const el = (tag, cls, html, parent = ui) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; parent.appendChild(e); return e; };
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; };
const show = (e, o, tx = 0, ty = 0, s = 1) => { e.style.opacity = o; e.style.visibility = o > 0.001 ? 'visible' : 'hidden'; e.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`; };
const maskWords = (text) => text.split('<br>').map(l => `<span class="mask"><span>${l}</span></span>`).join('');

let U = {};
function buildUI() {
  U.streak = el('div', 'abs', null); U.streak.id = 'streak';
  U.streakGlow = el('div', 'abs', null); U.streakGlow.id = 'streakGlow';
  U.intro = el('div', 'abs', `<div class="kicker">Galaxy S25</div><div class="hero" style="font-size:104px;margin-top:22px">${maskWords('Descubre lo que<br>hay dentro.')}</div>`);
  U.intro.style.left = '132px'; U.intro.style.top = '372px';
  U.introLines = [U.intro.querySelector('.kicker'), ...U.intro.querySelectorAll('.mask > span')];
  U.over = el('div', 'abs hero', maskWords('Diseñado capa a capa.')); U.over.style.cssText += 'left:0;width:1920px;text-align:center;top:92px;font-size:58px;font-weight:500';
  U.overLine = U.over.querySelector('.mask > span');

  U.chapters = CHAPTERS.map(c => {
    const e = el('div', 'abs chapter', `<div class="num">${c.num}<i></i>${c.name}</div><h2>${maskWords(c.title)}</h2><p>${c.body}</p><div class="chips">${c.chips.map(s => `<span class="chip">${s}</span>`).join('')}</div>`);
    return { c, e, num: e.querySelector('.num'), bar: e.querySelector('.num i'), title: [...e.querySelectorAll('h2 .mask > span')], p: e.querySelector('p'), chips: [...e.querySelectorAll('.chip')] };
  });
  // vertical centring after layout
  for (const ch of U.chapters) { ch.e.style.visibility = 'hidden'; ch.e.style.top = Math.round(540 - ch.e.offsetHeight / 2) + 'px'; }

  U.nav = el('div', 'abs', CHAPTERS.map(() => '<div class="seg"><i></i></div>').join('')); U.nav.id = 'nav';
  U.navSegs = [...U.nav.querySelectorAll('.seg i')];
  U.navLabel = el('div', 'abs', ''); U.navLabel.id = 'navLabel';

  U.end = el('div', 'abs', `<div class="kicker" style="color:#9fb0c6">Galaxy AI</div><div class="hero" style="font-size:150px;margin-top:18px">${maskWords('Galaxy S25')}</div><div class="hero" style="font-size:50px;font-weight:300;margin-top:26px;color:#d6e2f2">${maskWords('Inteligencia en cada capa.')}</div>`);
  U.end.style.left = '132px'; U.end.style.top = '360px';
  U.endLines = [U.end.querySelector('.kicker'), ...U.end.querySelectorAll('.mask > span')];

  // magnifier with a diamond subpixel layout
  U.mag = el('div', 'abs', '<canvas width="600" height="600"></canvas>'); U.mag.id = 'mag';
  { const g = U.mag.querySelector('canvas').getContext('2d'); g.fillStyle = '#04050a'; g.fillRect(0, 0, 600, 600);
    const s = 50;
    for (let y = -1; y < 13; y++) for (let x = -1; x < 13; x++) {
      const cx = x * s + (y % 2 ? s / 2 : 0), cy = y * s * 0.5 * 1.7;
      const glow = (col, X, Y, r) => { const rg = g.createRadialGradient(X, Y, 0, X, Y, r * 1.9); rg.addColorStop(0, col); rg.addColorStop(.5, col.replace(',1)', ',.35)')); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.beginPath(); g.arc(X, Y, r * 1.9, 0, 7); g.fill(); };
      glow((x + y) % 2 ? 'rgba(255,60,80,1)' : 'rgba(60,110,255,1)', cx, cy, 11);
      glow('rgba(70,255,140,1)', cx + s / 2, cy + s * 0.42, 7);
    } }
  U.magLine = svgEl('path', { fill: 'none', stroke: 'rgba(230,240,255,.75)', 'stroke-width': 1.5 });
  U.magLabel = el('div', 'abs callout', '<b>Píxeles OLED</b><small>Rojo, verde y azul con luz propia</small>');

  // die card
  U.die = el('div', 'abs', `<div class="t">Snapdragon 8 Elite for Galaxy</div><div class="grid"></div>`); U.die.id = 'die';
  const grid = U.die.querySelector('.grid');
  const blk = (x, y, w, h, b, s) => el('div', 'blk', `<b>${b}</b><small>${s}</small>`, grid).setAttribute('style', `left:${x}px;top:${y}px;width:${w}px;height:${h}px`);
  blk(0, 0, 150, 300, 'CPU', '8 núcleos<br>apps y sistema'); blk(162, 0, 218, 170, 'GPU', 'Adreno 830<br>gráficos y juegos');
  blk(162, 182, 103, 118, 'NPU', 'Galaxy AI'); blk(277, 182, 103, 118, 'ISP', 'Fotos y vídeo');
  U.dieBlocks = [...grid.querySelectorAll('.blk')];
  U.cores = [];
  for (let i = 0; i < 8; i++) { const big = i < 2, c = el('div', 'core', null, U.dieBlocks[0]); c.style.cssText = big ? `left:${10 + i * 68}px;top:104px;width:60px;height:60px` : `left:${10 + ((i - 2) % 3) * 46}px;top:${176 + Math.floor((i - 2) / 3) * 56}px;width:38px;height:46px`; U.cores.push(c); }
  U.dieLine = svgEl('path', { fill: 'none', stroke: 'rgba(230,240,255,.75)', 'stroke-width': 1.5 });
  U.dieDot = el('div', 'abs dot');

  // grain
  { const [c, g] = canvas(256, 256), r = rng(3), img = g.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (r() - .5) * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0); document.getElementById('grain').style.backgroundImage = `url(${c.toDataURL()})`; }
}

// callouts: anchor -> elbow -> label
const CALLOUTS = [
  { a: 'glass', t0: 11.0, t1: 15.4, dx: -210, dy: -60, len: 60, side: -1, title: 'Gorilla Glass Victus 2', sub: 'Protección delante y detrás' },
  { a: 'fp', t0: 12.9, t1: 15.4, dx: -250, dy: 50, len: 60, side: -1, title: 'Lector de huellas', sub: 'Integrado en la pantalla' },
  { a: 'selfie', t0: 13.6, t1: 15.4, dx: 150, dy: -60, len: 60, title: 'Cámara frontal', sub: '12 MP' },
  { a: 'hot', t0: 17.2, t1: 21.4, dx: 190, dy: -80, len: 60, title: 'Punto caliente', sub: 'Justo sobre el procesador' },
  { a: 'vapEdge', t0: 18.6, t1: 21.4, dx: 150, dy: 60, len: 60, title: 'El calor se dispersa', sub: 'y sale a través del chasis' },
  { a: 'ram', t0: 31.0, t1: 35.4, dx: 150, dy: -90, len: 60, title: 'RAM de 12 GB', sub: 'LPDDR5X' },
  { a: 'ufs', t0: 31.8, t1: 35.4, dx: 130, dy: 70, len: 60, title: 'Almacenamiento', sub: 'UFS 4.0 · hasta 512 GB' },
  { a: 'cam_uw', t0: 37.6, t1: 43.4, dx: 290, dy: -40, len: 50, title: 'Ultra gran angular', sub: '12 MP · 120°' },
  { a: 'cam_w', t0: 38.2, t1: 43.4, dx: 290, dy: 0, len: 50, title: 'Gran angular', sub: '50 MP · f/1.8 · OIS' },
  { a: 'cam_t', t0: 38.8, t1: 43.4, dx: 290, dy: 40, len: 50, title: 'Teleobjetivo', sub: '10 MP · zoom óptico 3x' },
  { a: 'bat', t0: 45.4, t1: 49.4, dx: -1, dy: -1, len: 60, title: 'Celda de iones de litio', sub: 'Carga rápida de 25 W', fixed: [1380, 300] },
  { a: 'coil', t0: 47.8, t1: 49.4, dx: -1, dy: -1, len: 60, title: 'Bobina inalámbrica', sub: 'Recibe y comparte energía', fixed: [1380, 780] },
  { a: 'ant1', t0: 51.0, t1: 55.4, dx: -1, dy: -1, len: 60, title: 'Antenas en el marco', sub: '5G · Wi-Fi 7 · Bluetooth · NFC', fixed: [1420, 190] },
  { a: 'spk', t0: 52.0, t1: 55.4, dx: -1, dy: -1, len: 60, title: 'Altavoces estéreo', sub: 'Superior e inferior', fixed: [1440, 640] },
  { a: 'haptic', t0: 52.8, t1: 55.4, dx: -1, dy: -1, len: 60, title: 'Motor háptico', sub: 'Vibración precisa', fixed: [1440, 790] },
  { a: 'usb', t0: 53.6, t1: 55.4, dx: -1, dy: -1, len: 60, title: 'USB-C', sub: 'Carga y datos', fixed: [1440, 940] },
  { a: 'rail', t0: 57.2, t1: 61.4, dx: -1, dy: -1, len: 60, title: 'Aluminio de una pieza', sub: 'Sostiene y protege cada capa', fixed: [1400, 820] },
];
// mini labels for the exploded overview
const LAYER_LABELS = [
  ['glass', 'Cristal'], ['display', 'Pantalla'], ['vapor', 'Cámara de vapor'], ['frame', 'Marco'],
  ['board', 'Placa base'], ['battery', 'Batería'], ['coil', 'Bobina'], ['back', 'Tapa trasera'],
];
function buildCallouts() {
  for (const c of CALLOUTS) {
    c.dot = el('div', 'abs dot');
    c.path = svgEl('path', { fill: 'none', stroke: 'rgba(230,240,255,.75)', 'stroke-width': 1.5 });
    c.label = el('div', 'abs callout', `<b>${c.title}</b><small>${c.sub}</small>`);
  }
  const LBL_ANCHOR = {
    glass: V3(-PW / 2 + 8, 44, 0.36), display: V3(-PW / 2 + 8, 14, 0.32), vapor: V3(-20, -16, 0.22), frame: V3(-PW / 2, -46, 0),
    board: V3(28, 64, -0.4), battery: V3(26, -8, -2), coil: V3(COIL.cx + 20, COIL.cy - 18, -0.2), back: V3(PW / 2 - 6, -52, -0.42),
  };
  U.layerLabels = LAYER_LABELS.map(([name, text], i) => {
    const L = FX.L[name], left = i < 4;
    return { L, left, row: 330 + (i % 4) * 120 + (left ? 0 : 40), a: { obj: L.g, p: LBL_ANCHOR[name] }, t0: 7.5 + i * 0.16, text,
      dot: el('div', 'abs dot'), path: svgEl('path', { fill: 'none', stroke: 'rgba(230,240,255,.6)', 'stroke-width': 1.2 }), label: el('div', 'abs callout mini', `<b>${text}</b>`) };
  });
  U.bigSprites = {
    soc: sprite(T.glow, 0x5cb8ff, 40), ram: sprite(T.glow, 0x9d8cff, 28), ufs: sprite(T.glow, 0x9d8cff, 26),
    sensor: sprite(T.glow, 0x9d8cff, 22), screen: sprite(T.glow, 0x5cb8ff, 260), snap: sprite(T.glow, 0xbfe3ff, 120),
  };
  U.waves = [];
  for (let i = 0; i < 6; i++) for (let k = 0; k < 2; k++) U.waves.push({ i, k, sp: sprite(T.ring, 0x7cc6ff, 10) });
  U.spkWaves = [0, 1, 2].map(k => ({ k, sp: sprite(T.ring, 0xb8a8ff, 10) }));
  U.earWaves = [0, 1, 2].map(k => ({ k, sp: sprite(T.ring, 0xb8a8ff, 10) }));
  // light cone into the main camera
  U.ray = new THREE.Mesh(new THREE.CylinderGeometry(9, 3.4, 60, 40, 1, true), addMat({ uA: { value: 0 } },
    `uniform float uA; varying vec2 vUv; void main(){ float a = pow(vUv.y, 1.6) * (.55 + .45 * sin(vUv.x * 6.2832 * 6.)) ; gl_FragColor = vec4(vec3(.75, .88, 1.) * a * uA * .35, 1.); }`));
  U.ray.material.side = THREE.DoubleSide; U.ray.rotation.x = Math.PI / 2; scene.add(U.ray);
}

const P = V3();
function toScreen(a) { worldOf(a, P); P.project(camera); return [(P.x * .5 + .5) * W, (-P.y * .5 + .5) * H, P.z]; }

function drawCallout(c, t, pos) {
  const v = env(t, c.t0, c.t1, 0.5, 0.35);
  if (v <= 0) { show(c.dot, 0); show(c.label, 0); c.path.setAttribute('d', ''); return; }
  const [x, y] = pos || toScreen(A[c.a]);
  let ex, ey, fx; const sd = c.side || 1;
  if (c.fixed) { [fx, ey] = c.fixed; ex = fx - c.len * sd; }
  else { ex = x + c.dx; ey = y + c.dy; fx = ex + c.len * sd; }
  const p1 = eOut(seg(t, c.t0, c.t0 + 0.45));
  const L1 = Math.hypot(ex - x, ey - y), L2 = Math.abs(fx - ex), Lt = L1 + L2;
  c.path.setAttribute('d', `M${x.toFixed(1)} ${y.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)} L${fx.toFixed(1)} ${ey.toFixed(1)}`);
  c.path.setAttribute('stroke-dasharray', `${Lt} ${Lt}`); c.path.setAttribute('stroke-dashoffset', `${Lt * (1 - p1)}`);
  c.path.style.opacity = v;
  c.dot.style.left = x + 'px'; c.dot.style.top = y + 'px'; show(c.dot, v, 0, 0, eOut5(seg(t, c.t0, c.t0 + 0.3)));
  const p2 = eOut(seg(t, c.t0 + 0.25, c.t0 + 0.75));
  if (sd > 0) { c.label.style.left = (fx + 16) + 'px'; c.label.style.right = 'auto'; }
  else { c.label.style.left = 'auto'; c.label.style.right = (W - fx + 16) + 'px'; c.label.style.textAlign = 'right'; }
  c.label.style.top = (ey - 26) + 'px';
  show(c.label, v * p2, (1 - p2) * -24 * sd, 0);
}

function revealLine(e, t, t0, t1, dist = 60) {
  const p = eOut(seg(t, t0, t0 + 0.6)), o = 1 - eIn(seg(t, t1 - 0.4, t1));
  e.style.transform = `translateY(${(1 - p) * dist - (1 - o) * 20}%)`;
  e.style.opacity = Math.min(p * 1.5, o);
}

// ---------- seek ----------
function seek(tIn) {
  const t = clamp(tIn, 0, DUR - 1e-4);

  // rig: intro turn and the reassembly snap
  rig.rotation.y = kf([[0, -1.52], [1.0, -1.52], [5.4, -0.28], [6.9, 0]])(t);
  const snap = Math.exp(-Math.pow((t - 63.25) / 0.12, 2));
  rig.scale.setScalar(1 + 0.012 * snap);

  // layers
  const ly = liftY(t), by = backY(t), cy = coilY(t);
  for (const L of LAYERS) {
    const e = EXP[L.idx](t);
    L.g.position.set(0, 0, L.z0 + e * L.ze);
    if (L.name === 'glass' || L.name === 'display') L.g.position.y = ly * (L.name === 'glass' ? 1.08 : 1);
    if (L.name === 'back') L.g.position.y = by;
    if (L.name === 'coil') L.g.position.y = cy;
    if (L.name !== 'frame') L.g.position.y += marcoOut(t) * (L.ze > 0 ? 260 : -280);
    L.dim(dimFor(L.name, t));
  }
  // camera lens explode
  const ce = track(0, [[36.9, 1, 7, 0.8], [43.3, 0, 7, 1]])(t);
  for (const cm of FX.cams) {
    cm.elems.forEach((e, k) => { e.position.z = e.userData.base - ce * (k + 1) * 3.1; });
    cm.barrel.position.z = cm.barrel.userData.base - ce * 18.5;
  }
  // haptic buzz
  const hz = env(t, 52.9, 54.2, 0.05, 0.2);
  FX.haptic.position.x = -16 + Math.sin(t * 190) * 0.35 * hz;

  // camera
  const [az, elv, dist, tx, ty, tz, sx] = camF.map(f => f(t));
  const drift = Math.sin(t * 0.35) * 1.2;
  const A_ = rad(az + drift), E_ = rad(elv);
  camera.position.set(tx + dist * Math.sin(A_) * Math.cos(E_), ty + dist * Math.sin(E_), tz + dist * Math.cos(A_) * Math.cos(E_));
  camera.lookAt(tx, ty, tz);
  camera.setViewOffset(W, H, -sx, 0, W, H);
  camera.updateProjectionMatrix();
  scene.updateMatrixWorld(true);

  // screen
  const scrOn = Math.max(eOut(seg(t, 2.6, 3.6)) * (1 - seg(t, 15.8, 16.4)), eOut(seg(t, 64.9, 65.6)));
  FX.screenMat.color.setScalar(0.04 + 0.96 * scrOn * (1 + 0.6 * Math.exp(-Math.pow((t - 65.2) / 0.18, 2))));
  FX.fpMat.opacity = env(t, 12.9, 15.4, 0.4, 0.4) * (0.55 + 0.45 * Math.sin(t * 5));
  // glass + frame sweeps
  FX.glassSweep.uniforms.uA.value = env(t, 10.6, 12.6, 0.3, 0.3) * 0.9 + env(t, 3.0, 4.6, 0.3, 0.3) * 0.5;
  FX.glassSweep.uniforms.uPos.value = t < 7 ? lerp(-110, 110, seg(t, 3.0, 4.6)) : lerp(-110, 110, seg(t, 10.6, 12.6));
  FX.frameSweep.uniforms.uA.value = env(t, 57.0, 58.8, 0.3, 0.3) * 1.2 + env(t, 1.2, 3.2, 0.3, 0.4) * 0.8;
  FX.frameSweep.uniforms.uPos.value = t < 7 ? lerp(-120, 120, seg(t, 1.2, 3.2)) : lerp(-120, 120, seg(t, 57.0, 58.8));
  // heat
  FX.heat.uniforms.uA.value = env(t, 16.7, 21.6, 0.5, 0.5);
  FX.heat.uniforms.uS.value = ease(seg(t, 17.3, 20.6));
  FX.heat.uniforms.uT.value = t;
  // traces
  FX.pulse.uniforms.uT.value = t;
  FX.pulse.uniforms.uA.value = env(t, 22.9, 36.0, 0.6, 0.5) + env(t, 36.0, 43.5, 0.3, 0.5) * 0.6;
  FX.pulse.uniforms.uW.value.set(lerp(1, 1.6, env(t, 30.5, 36, .5, .5)), 1 + env(t, 36, 43.5, .5, .5) * 1.4, lerp(1, 0.35, env(t, 30.5, 43.5, .5, .5)));
  // battery + coil
  FX.fill.uniforms.uA.value = env(t, 44.9, 49.6, 0.4, 0.4);
  FX.fill.uniforms.uFill.value = ease(seg(t, 45.2, 47.6));
  FX.fill.uniforms.uT.value = t;
  FX.coil.uniforms.uA.value = env(t, 47.6, 49.6, 0.4, 0.4);
  FX.coil.uniforms.uT.value = t;
  // camera sensors
  const light = env(t, 39.4, 43.2, 0.5, 0.4);
  FX.cams.forEach((c, i) => { c.sensorMat.emissiveIntensity = light * (i === 1 ? 1.3 : 0.6); });
  U.ray.material.uniforms.uA.value = light;
  { const c = FX.cams[1]; worldOf({ obj: c.g, p: V3(0, 0, -32) }, U.ray.position); U.ray.quaternion.copy(c.g.getWorldQuaternion(new THREE.Quaternion())); U.ray.rotateX(Math.PI / 2); }

  // sprites
  const S = U.bigSprites;
  worldOf(A.soc, S.soc.position); S.soc.material.opacity = env(t, 22.8, 29.8, 0.6, 0.6) * (0.75 + 0.25 * Math.sin(t * 4)) + env(t, 32.4, 35.5, .3, .4) * .5;
  worldOf(A.ram, S.ram.position); S.ram.material.opacity = env(t, 30.8, 35.5, 0.4, 0.4) * 0.9;
  worldOf(A.ufs, S.ufs.position); S.ufs.material.opacity = env(t, 31.6, 35.5, 0.4, 0.4) * 0.9;
  worldOf({ obj: FX.cams[1].g, p: V3(0, 0, -0.4) }, S.sensor.position); S.sensor.material.opacity = light * 0.9;
  worldOf({ obj: FX.L.display.g, p: V3(0, 0, 1) }, S.screen.position); S.screen.material.opacity = (scrOn * 0.22 * (t < 16 ? 1 : 0)) + 0.5 * Math.exp(-Math.pow((t - 65.25) / 0.25, 2));
  S.snap.position.set(0, 0, 0); S.snap.material.opacity = 0.9 * snap; S.snap.scale.setScalar(120 + 260 * seg(t, 63.1, 63.6));
  // antenna waves
  for (const w of U.waves) {
    const t0 = 50.9 + w.i * 0.18 + w.k * 0.8, p = seg(t, t0, t0 + 1.6);
    const on = t < 55.6 ? 1 : 1 - seg(t, 55.6, 56);
    worldOf(FX.ants[w.i], w.sp.position);
    w.sp.scale.setScalar(4 + 44 * eOut(p)); w.sp.material.opacity = (p > 0 && p < 1 ? (1 - p) * 0.5 : 0) * on;
    if (t > t0 + 1.6 && t < 55.6) { const pp = ((t - t0) % 1.65) / 1.6; w.sp.scale.setScalar(4 + 44 * eOut(pp)); w.sp.material.opacity = (1 - pp) * 0.5 * on; }
  }
  for (const [list, a, t0] of [[U.spkWaves, A.spk, 52.0], [U.earWaves, A.ear, 52.15]]) for (const w of list) {
    const pp = ((t - t0 - w.k * 0.33) % 1.0 + 1) % 1.0, on = env(t, t0, 55.5, 0.2, 0.3);
    worldOf(a, w.sp.position); w.sp.scale.setScalar(4 + 26 * eOut(pp)); w.sp.material.opacity = (1 - pp) * 0.6 * on * (t > t0 + w.k * 0.33 ? 1 : 0);
  }

  renderer.render(scene, camera);

  // ---------- DOM ----------
  document.getElementById('fade').style.opacity = Math.max(1 - eOut(seg(t, 0, 0.8)), eIn(seg(t, 71.2, 72)));
  document.getElementById('bgGlow').style.opacity = 0.6 * scrOn * (t < 16 ? 1 : 0) + 0.7 * eOut(seg(t, 64.9, 66)) + 0.25 * env(t, 22, 50, 1, 1);
  // streak
  { const p = seg(t, 0.2, 1.7), o = env(t, 0.2, 2.2, 0.3, 0.7);
    U.streak.style.opacity = o; U.streak.style.transform = `scaleX(${eOut(p)})`;
    U.streakGlow.style.opacity = o * 0.9; U.streakGlow.style.transform = `scaleX(${0.2 + 0.8 * eOut(p)}) scaleY(${0.4 + 0.6 * Math.sin(Math.PI * clamp(p))})`; }
  // intro
  U.introLines.forEach((e, i) => revealLine(e, t, 2.4 + i * 0.2, 5.7, i ? 110 : 60));
  revealLine(U.overLine, t, 7.25, 9.7, 110);
  // chapters
  for (const ch of U.chapters) {
    const { c } = ch, vis = t > c.t0 - 0.1 && t < c.t1;
    ch.e.style.visibility = vis ? 'visible' : 'hidden';
    if (!vis) continue;
    const t0 = c.t0 + 0.55, t1 = c.t1 - 0.15;
    revealLine(ch.num, t, t0, t1, 40);
    ch.bar.style.transform = `scaleX(${eOut(seg(t, t0 + 0.1, t0 + 0.7)) * (1 - eIn(seg(t, t1 - 0.4, t1)))})`;
    ch.title.forEach((e, i) => revealLine(e, t, t0 + 0.12 + i * 0.12, t1, 110));
    revealLine(ch.p, t, t0 + 0.4, t1, 30);
    ch.chips.forEach((e, i) => { const p = eOut5(seg(t, t0 + 0.75 + i * 0.125, t0 + 1.15 + i * 0.125)), o = 1 - eIn(seg(t, t1 - 0.4, t1)); e.style.opacity = Math.min(p, o); e.style.transform = `translateY(${(1 - p) * 14}px) scale(${0.9 + 0.1 * p})`; });
  }
  // nav
  const navOn = env(t, 10.3, 62, 0.5, 0.5);
  U.nav.style.opacity = navOn * 0.9; U.navLabel.style.opacity = navOn * 0.9;
  let cur = CHAPTERS.findIndex(c => t >= c.t0 && t < c.t1);
  U.navSegs.forEach((s, i) => { const c = CHAPTERS[i]; s.style.transform = `scaleX(${t >= c.t1 ? 1 : t < c.t0 ? 0 : seg(t, c.t0, c.t1)})`; });
  if (cur >= 0) U.navLabel.textContent = `${CHAPTERS[cur].num} · ${CHAPTERS[cur].name}`;
  // end card
  U.endLines.forEach((e, i) => revealLine(e, t, 66.2 + i * 0.25, 75, i ? 110 : 60));

  // callouts
  for (const c of CALLOUTS) drawCallout(c, t);
  // layer labels in the overview: front layers on the left, back layers on the right
  for (const l of U.layerLabels) {
    const v = env(t, l.t0, 9.9, 0.35, 0.35);
    if (v <= 0) { show(l.dot, 0); show(l.label, 0); l.path.setAttribute('d', ''); continue; }
    const [x, y] = toScreen(l.a), p = eOut(seg(t, l.t0, l.t0 + 0.35));
    const ex = l.left ? 560 : 1360, fx = l.left ? ex - 40 : ex + 40, ey = l.row;
    const mx = lerp(x, ex, p), my = lerp(y, ey, p), nx = lerp(mx, fx, seg(t, l.t0 + 0.25, l.t0 + 0.45));
    l.path.setAttribute('d', `M${x.toFixed(1)} ${y.toFixed(1)} L${mx.toFixed(1)} ${my.toFixed(1)} L${nx.toFixed(1)} ${ey}`); l.path.style.opacity = v;
    l.dot.style.left = x + 'px'; l.dot.style.top = y + 'px'; show(l.dot, v, 0, 0, 0.8);
    if (l.left) { l.label.style.left = 'auto'; l.label.style.right = (W - fx + 14) + 'px'; } else { l.label.style.left = (fx + 14) + 'px'; }
    l.label.style.top = (ey - 15) + 'px';
    show(l.label, v * eOut(seg(t, l.t0 + 0.3, l.t0 + 0.6)), (1 - p) * (l.left ? 16 : -16), 0);
  }
  // magnifier
  { const v = env(t, 11.8, 15.4, 0.5, 0.35), [x, y] = toScreen(A.screen), mx = x + 330, my = y + 60;
    U.mag.style.left = mx + 'px'; U.mag.style.top = my + 'px';
    const s = eOut5(seg(t, 12.0, 12.5));
    show(U.mag, v, 0, 0, 0.6 + 0.4 * s);
    U.mag.querySelector('canvas').style.transform = `scale(${1.1 + 0.08 * Math.sin(t * 0.8)}) translate(${(t - 12) * -4}px, 0)`;
    const L = Math.hypot(mx - 150 - x, my - y);
    U.magLine.setAttribute('d', v > 0 ? `M${x} ${y} L${mx - 130 * (0.6 + 0.4 * s)} ${my}` : ''); U.magLine.setAttribute('stroke-dasharray', `${L} ${L}`); U.magLine.setAttribute('stroke-dashoffset', `${L * (1 - eOut(seg(t, 11.8, 12.2)))}`); U.magLine.style.opacity = v;
    U.magLabel.style.left = (mx - 120) + 'px'; U.magLabel.style.top = (my + 150) + 'px'; show(U.magLabel, v * eOut(seg(t, 12.4, 12.9)), 0, 0);
  }
  // die card
  { const v = env(t, 23.6, 29.6, 0.5, 0.4), [x, y] = toScreen(A.soc), dx = 1440, dy = 330;
    U.die.style.left = dx + 'px'; U.die.style.top = dy + 'px';
    const s = eOut5(seg(t, 23.9, 24.5)); show(U.die, v, (1 - s) * 30, 0);
    const ex = dx - 2, ey = dy + 190, L = Math.hypot(ex - x, ey - y);
    U.dieLine.setAttribute('d', v > 0 ? `M${x} ${y} L${ex - 50} ${ey} L${ex} ${ey}` : ''); U.dieLine.setAttribute('stroke-dasharray', `${L + 60} ${L + 60}`); U.dieLine.setAttribute('stroke-dashoffset', `${(L + 60) * (1 - eOut(seg(t, 23.6, 24.0)))}`); U.dieLine.style.opacity = v;
    U.dieDot.style.left = x + 'px'; U.dieDot.style.top = y + 'px'; show(U.dieDot, v);
    const lit = [24.6, 25.6, 26.6, 27.6];
    U.dieBlocks.forEach((b, i) => { const on = env(t, lit[i], 29.6, 0.25, 0.4), hi = Math.exp(-Math.pow((t - lit[i] - 0.3) / 0.35, 2));
      b.style.background = `rgba(92,184,255,${0.05 + 0.16 * on + 0.25 * hi})`; b.style.borderColor = `rgba(160,210,255,${0.25 + 0.55 * on})`; });
    U.cores.forEach((c, i) => { c.style.background = `rgba(120,200,255,${0.18 + 0.6 * env(t, 24.6 + i * 0.06, 29.6, 0.15, 0.4) * (0.7 + 0.3 * Math.sin(t * 9 + i))})`; });
  }
}

// ---------- audio ----------
function buildAudio(ctx) {
  const sr = ctx.sampleRate, out = ctx.createGain(); out.gain.value = 0.55;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = 0.005; comp.release.value = 0.2;
  out.connect(comp); comp.connect(ctx.destination);
  const r = rng(99), nb = ctx.createBuffer(1, sr * 2, sr), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = r() * 2 - 1;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const env3 = (g, t, a, peak, d, sus = 0) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(1e-4, sus || 1e-4), t + a + d); };
  const noise = (t, dur, type, f0, f1, q, gain, a = 0.01, dest = out) => {
    const s = ctx.createBufferSource(); s.buffer = nb; s.loop = true; const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + a); g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t, r() * 1.5); s.stop(t + dur + 0.05);
  };
  const tone = (t, f, dur, type, gain, a = 0.005, dest = out, f2) => {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain(); env3(g, t, a, gain, dur); o.connect(g); g.connect(dest); o.start(t); o.stop(t + a + dur + 0.05);
  };
  // reverb-ish send
  const verb = ctx.createConvolver(); { const len = sr * 2.6, ib = ctx.createBuffer(2, len, sr); for (let c = 0; c < 2; c++) { const d = ib.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / len, 3.2); } verb.buffer = ib; }
  const vsend = ctx.createGain(); vsend.gain.value = 0.32; vsend.connect(verb); verb.connect(out);

  const kick = t => { tone(t, 140, 0.32, 'sine', 0.85, 0.002, out, 42); noise(t, 0.03, 'lowpass', 4000, 1500, 0.7, 0.18, 0.001); };
  const hat = (t, g = 0.08) => noise(t, 0.05, 'highpass', 8000, 9000, 0.8, g, 0.001);
  const clap = t => { for (let k = 0; k < 3; k++) noise(t + k * 0.011, 0.12, 'bandpass', 1500, 1200, 1.2, 0.22, 0.001); noise(t, 0.2, 'bandpass', 1400, 1000, 1, 0.08, 0.001, vsend); };
  const whoosh = (t, dur = 0.9, up = true, g = 0.22) => noise(t, dur, 'bandpass', up ? 300 : 3000, up ? 4000 : 250, 1.4, g, dur * 0.7);
  const impact = (t, g = 1) => { tone(t, 90, 1.2, 'sine', 0.9 * g, 0.003, out, 32); noise(t, 0.6, 'lowpass', 2500, 120, 0.8, 0.45 * g, 0.002); noise(t, 1.6, 'lowpass', 1200, 200, 0.7, 0.18 * g, 0.002, vsend); };
  const blip = (t, f = 1760, g = 0.08) => { tone(t, f, 0.12, 'sine', g, 0.002); tone(t, f * 2, 0.05, 'triangle', g * 0.3, 0.002); tone(t, f, 0.25, 'sine', g * 0.5, 0.002, vsend); };
  const tick = (t, g = 0.06) => noise(t, 0.025, 'bandpass', 5000, 4000, 4, g, 0.0008);
  const riser = (t0, t1, g = 0.18) => { noise(t0, t1 - t0, 'bandpass', 200, 6000, 2, g, (t1 - t0) * 0.95); const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(110, t0); o.frequency.exponentialRampToValueAtTime(880, t1); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(400, t0); f.frequency.exponentialRampToValueAtTime(5000, t1); const gg = ctx.createGain(); gg.gain.setValueAtTime(0, t0); gg.gain.linearRampToValueAtTime(g * 0.25, t1); gg.gain.linearRampToValueAtTime(0, t1 + 0.02); o.connect(f); f.connect(gg); gg.connect(out); o.start(t0); o.stop(t1 + 0.05); };

  // chords: Bm G D A (one per 2 bars = 4 s)
  const CH = [[47, 50, 54, 59, 62], [43, 47, 50, 55, 59], [50, 54, 57, 62, 66], [45, 49, 52, 57, 61]];
  const ROOT = [35, 31, 38, 33];
  const chordAt = t => Math.floor(Math.max(0, t - 6) / 4) % 4;
  // pad: detuned saws through a soft lowpass, one voice set per chord
  const padBus = ctx.createGain(); padBus.gain.value = 0.05; const padF = ctx.createBiquadFilter(); padF.type = 'lowpass'; padF.frequency.value = 1400; padF.Q.value = 0.5; padBus.connect(padF); padF.connect(out); padF.connect(vsend);
  padF.frequency.setValueAtTime(500, 0); padF.frequency.linearRampToValueAtTime(1600, 6); padF.frequency.setValueAtTime(1600, 62); padF.frequency.linearRampToValueAtTime(3000, 66);
  const padChord = (t0, t1, notes, g = 1) => { for (const n of notes) for (const det of [-7, 6]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(n); o.detune.value = det; const gg = ctx.createGain(); gg.gain.setValueAtTime(0, t0); gg.gain.linearRampToValueAtTime(g, t0 + 0.8); gg.gain.setValueAtTime(g, t1 - 0.5); gg.gain.linearRampToValueAtTime(0, t1 + 0.6); o.connect(gg); gg.connect(padBus); o.start(t0); o.stop(t1 + 0.7); } };
  padChord(0, 6.2, [35, 47, 54, 59], 0.9);
  for (let t = 6; t < 62; t += 4) padChord(t, t + 4, CH[chordAt(t + 0.1)]);
  padChord(62, 66, [43, 50, 55, 59, 62], 0.9);
  padChord(66, 72, [38, 50, 54, 57, 62, 64, 69], 1.0);
  // bass: 8th-note pulse following the roots
  for (let t = 10; t < 62; t += 0.25) { const n = ROOT[chordAt(t + 0.01)]; const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = mtof(n + 12); const g = ctx.createGain(); env3(g, t, 0.005, Math.abs((t * 4) % 2) < 0.1 ? 0.26 : 0.18, 0.2); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.3); }
  // drums
  for (let t = 7; t < 62; t += 0.5) kick(t);
  for (let t = 10.25; t < 62; t += 0.5) hat(t, 0.07);
  for (let t = 22; t < 62; t += 0.25) if ((t * 4) % 2 === 1) hat(t, 0.035);
  for (let t = 23; t < 62; t += 1) clap(t);
  // arp (16ths) through the middle chapters
  const arpF = ctx.createBiquadFilter(); arpF.type = 'lowpass'; arpF.frequency.value = 2600; arpF.connect(out); arpF.connect(vsend);
  for (let t = 22; t < 56; t += 0.125) { const c = CH[chordAt(t + 0.01)], i = Math.round(t * 8) % 8, n = c[[0, 2, 4, 3, 1, 3, 2, 4][i]] + 12; const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(n); const g = ctx.createGain(); env3(g, t, 0.003, 0.035, 0.13); o.connect(g); g.connect(arpF); o.start(t); o.stop(t + 0.2); }

  // effects on the story beats
  noise(0.15, 2.4, 'lowpass', 300, 80, 0.7, 0.5, 0.4); tone(0.2, 55, 2.5, 'sine', 0.5, 0.3, out, 40);
  for (let k = 0; k < 6; k++) blip(1.3 + k * 0.08, mtof(83 + [0, 3, 7, 10, 12, 15][k]), 0.03);
  impact(2.4, 0.5); blip(2.45, 1318, 0.05); blip(2.65, 1568, 0.05); blip(2.85, 1760, 0.05);
  riser(4.6, 7.0, 0.22); impact(7.0, 1.1); whoosh(6.6, 0.6, true, 0.25);
  for (let i = 0; i < 8; i++) tick(7.5 + i * 0.16, 0.09), blip(7.5 + i * 0.16, mtof(78 + [0, 2, 4, 7, 9, 12, 14, 16][i]), 0.035);
  for (const t of [9.8, 15.6, 29.6, 35.6, 43.6, 49.6, 55.6]) whoosh(t, 1.1, true, 0.2);
  whoosh(21.0, 2.4, true, 0.26); whoosh(23.0, 0.8, false, 0.14);
  for (const ch of CHAPTERS) { impact(ch.t0 + 0.55, 0.28); ch.chips.forEach((_, i) => tick(ch.t0 + 1.3 + i * 0.125, 0.07)); }
  for (const c of CALLOUTS) blip(c.t0, 1568, 0.05);
  blip(12.0, 2093, 0.05); blip(23.6, 1568, 0.05);
  noise(16.7, 4.6, 'lowpass', 200, 900, 2, 0.14, 2.5);
  [24.6, 25.6, 26.6, 27.6].forEach((t, i) => blip(t, mtof(81 + i * 2), 0.06));
  for (let k = 0; k < 5; k++) tick(36.95 + k * 0.07, 0.1);
  for (let k = 0; k < 5; k++) tick(43.3 + k * 0.05, 0.08);
  tone(39.4, 880, 1.5, 'sine', 0.05, 0.4, vsend); tone(39.4, 1320, 1.5, 'sine', 0.03, 0.4, vsend);
  { const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(330, 45.2); o.frequency.exponentialRampToValueAtTime(1320, 47.6); const g = ctx.createGain(); g.gain.setValueAtTime(0, 45.2); g.gain.linearRampToValueAtTime(0.05, 45.6); g.gain.setValueAtTime(0.05, 47.4); g.gain.linearRampToValueAtTime(0, 47.8); o.connect(g); g.connect(out); g.connect(vsend); o.start(45.2); o.stop(48); }
  blip(47.6, 1976, 0.07);
  for (let t = 47.8; t < 49.5; t += 1 / 0.9) tone(t, 220, 0.5, 'sine', 0.1, 0.05, out, 330);
  for (let i = 0; i < 6; i++) for (let t = 50.9 + i * 0.18; t < 55.4; t += 1.65) blip(t, mtof(88 - i), 0.022);
  tone(52.9, 70, 1.2, 'square', 0.03, 0.01);
  impact(63.2, 1.2); riser(61.6, 63.2, 0.2); whoosh(62.4, 1.4, true, 0.24);
  for (let k = 0; k < 4; k++) blip(65.1 + k * 0.06, mtof(86 + [0, 4, 7, 12][k]), 0.05);
  impact(66.2, 0.9);
  [62, 66, 69, 74, 78].forEach((n, i) => { tone(66.25 + i * 0.03, mtof(n), 4.5, 'sine', 0.06, 0.01, out); tone(66.25 + i * 0.03, mtof(n), 4.5, 'sine', 0.05, 0.01, vsend); tone(66.25 + i * 0.03, mtof(n) * 2.01, 2.0, 'sine', 0.012, 0.01, out); });
  out.gain.setValueAtTime(0.55, 70.2); out.gain.linearRampToValueAtTime(0.0001, 72);
}

// ---------- init ----------
async function init() {
  await Promise.all(['200 100px "Outfit Variable"', '600 100px "Outfit Variable"', '400 30px "Inter Variable"', '600 30px "Inter Variable"'].map(f => document.fonts.load(f)));
  T.wall = wallpaperTex(); T.pcb = pcbTextures(); T.bat = batteryTex(); T.coil = coilTex(); T.fp = fingerprintTex(); T.glow = glowTex(); T.ring = ringTex(); T.grill = grillTex();
  buildPhone();
  EXP = explodeF(LAYERS.length);
  buildUI();
  buildCallouts();
  renderer.compile(scene, camera);
  window.seek = seek; window.buildAudio = buildAudio;
  if (RENDER) { document.body.classList.add('render'); seek(0); return; }
  // preview: scale to fit, play/pause with audio, scrub
  const fit = () => { const s = Math.min(innerWidth / W, (innerHeight - 52) / H); stage.style.transform = `scale(${s})`; };
  addEventListener('resize', fit); fit();
  let buf, ac, src, startAt = 0, offset = 0, playing = false;
  const btn = document.getElementById('playBtn'), scrub = document.getElementById('scrub'), lab = document.getElementById('time');
  async function play() {
    ac ??= new AudioContext();
    if (!buf) { btn.textContent = '…'; const off = new OfflineAudioContext(2, Math.ceil(48000 * DUR), 48000); buildAudio(off); buf = await off.startRendering(); }
    src = ac.createBufferSource(); src.buffer = buf; src.connect(ac.destination);
    src.start(0, offset % DUR); startAt = ac.currentTime; playing = true; btn.textContent = '❚❚ Pausa';
  }
  function pause() { if (!playing) return; offset += ac.currentTime - startAt; src.stop(); playing = false; btn.textContent = '▶ Reproducir'; }
  const now = () => playing ? (offset + ac.currentTime - startAt) % DUR : offset;
  btn.onclick = () => playing ? pause() : play();
  scrub.oninput = () => { const was = playing; pause(); offset = scrub.value / 1000 * DUR; if (was) play(); };
  (function loop() { const t = now(); seek(t); scrub.value = Math.round(t / DUR * 1000); lab.textContent = t.toFixed(2) + ' s'; requestAnimationFrame(loop); })();
}
init();
