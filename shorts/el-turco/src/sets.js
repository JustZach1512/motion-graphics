// Sets for "El Turco": the palace hall (cabinet, Turk, chess), Schönbrunn outside, Napoleon's glory shot.
import { THREE, toon, basic, G3, G5, GH, mesh, group, sphere, box, cyl, D2R, hash, rnd, ctex, INK } from '../../engine/engine.js';
import * as T from '../../engine/textures.js';
import * as EP from '../../engine/props.js';
import * as P from './props.js';

function sky(top, bottom) { return ctex(16, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(1, bottom); x.fillStyle = g; x.fillRect(0, 0, w, h); }); }
function sun(scene, color, intensity, pos, size, target = [0, 0, 0]) {
  const l = new THREE.DirectionalLight(color, intensity); l.position.set(...pos); l.castShadow = true;
  l.shadow.mapSize.set(2048, 2048); Object.assign(l.shadow.camera, { left: -size, right: size, top: size, bottom: -size, near: .5, far: 120 }); l.shadow.bias = -.0004; l.shadow.normalBias = .02;
  l.target.position.set(...target); scene.add(l, l.target); return l;
}
const marbleTex = () => ctex(512, 512, (x, w, h) => {
  const r = rnd(3);
  [[0, 0, '#f1ebe0'], [256, 256, '#f1ebe0'], [256, 0, '#2a2622'], [0, 256, '#2a2622']].forEach(([px, py, c]) => {
    x.fillStyle = c; x.fillRect(px, py, 256, 256);
    x.strokeStyle = c === '#2a2622' ? 'rgba(255,255,255,.12)' : 'rgba(120,100,80,.18)'; x.lineWidth = 2;
    for (let i = 0; i < 5; i++) { x.beginPath(); let yy = py + r() * 256; x.moveTo(px, yy); for (let k = 1; k <= 6; k++) x.lineTo(px + k * 43, yy += (r() - .5) * 40); x.stroke(); }
  });
  x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 3; x.strokeRect(0, 0, 256, 256); x.strokeRect(256, 256, 256, 256); x.strokeRect(256, 0, 256, 256); x.strokeRect(0, 256, 256, 256);
}, { repeat: [12, 10] });
const wallTex = () => ctex(512, 512, (x, w, h) => {
  x.fillStyle = '#efe2c4'; x.fillRect(0, 0, w, h);
  x.strokeStyle = '#d8a640'; x.lineWidth = 10; x.strokeRect(60, 50, 392, 412); x.lineWidth = 4; x.strokeRect(80, 70, 352, 372);
  x.fillStyle = '#e6d5b0'; x.fillRect(84, 74, 344, 364);
  for (let i = 0; i < 4; i++) { x.beginPath(); x.arc([84, 428][i % 2], [74, 438][i >> 1], 16, 0, 7); x.fillStyle = '#d8a640'; x.fill(); }
}, { repeat: [5, 2] });

// ---------- palace hall ----------
export async function hall() {
  const s = new THREE.Scene(); s.background = new THREE.Color('#3a2418');
  s.add(new THREE.HemisphereLight('#fff2dc', '#5a4030', .75));
  const key = sun(s, '#fff0d4', 1.5, [-9, 9, 6], 9, [0, 1.5, 0]);
  const fill = new THREE.DirectionalLight('#d8e4ff', .3); fill.position.set(8, 5, 8); s.add(fill);
  mesh(new THREE.PlaneGeometry(30, 24), toon('#ffffff', { map: marbleTex(), outline: false }), { r: [-90, 0, 0], p: [0, 0, 2], parent: s });
  mesh(new THREE.PlaneGeometry(30, 11), toon('#ffffff', { map: wallTex(), outline: false }), { p: [0, 5.5, -8], parent: s });
  mesh(new THREE.PlaneGeometry(24, 11), toon('#ffffff', { map: wallTex(), outline: false }), { p: [10, 5.5, 2], r: [0, -90, 0], parent: s });
  mesh(new THREE.PlaneGeometry(24, 11), toon('#efe2c4', { outline: false }), { p: [-10, 5.5, 2], r: [0, 90, 0], parent: s });
  mesh(new THREE.PlaneGeometry(30, 24), toon('#e8dcc0', { outline: false }), { p: [0, 10.5, 2], r: [90, 0, 0], parent: s });
  // tall windows on the left wall, with curtains
  [-5, 0, 5].forEach(z => { mesh(new THREE.PlaneGeometry(2.4, 5), basic({ color: '#dff0ff' }), { p: [-9.95, 4.5, z], r: [0, 90, 0], parent: s, cast: false });
    mesh(box(.2, 5.4, 2.8), toon('#d8a640', { g: G3 }), { p: [-10.05, 4.5, z], parent: s });
    P.curtain(s, [-9.8, 4.8, z - 1.6], 1.0, 6).rotation.y = 90 * D2R; P.curtain(s, [-9.8, 4.8, z + 1.6], 1.0, 6).rotation.y = 90 * D2R; });
  [-6.5, -2.2, 2.2, 6.5].forEach(x => P.column(s, [x, 0, -7.4], 9));
  P.painting(s, [-4.35, 5.2, -7.9], 2.6, 1.9); P.painting(s, [4.35, 5.2, -7.9], 2.6, 1.9); P.painting(s, [9.9, 5, -3], 2.4, 1.8).rotation.y = -90 * D2R;
  P.chandelier(s, [-3.6, 7.2, -2], 1.3); P.chandelier(s, [3.6, 7.2, -2], 1.3);
  mesh(new THREE.PlaneGeometry(4, 9), toon('#8e1f26', { outline: false }), { r: [-90, 0, 0], p: [0, .012, 3.5], parent: s, cast: false });   // red carpet
  // the cabinet, the board on top, the Turk's stool behind, Napoleon's chair in front
  const cab = P.cabinet(s, [0, 0, 0]);
  const board = P.chessBoard(s, [0, cab.topY - .06, .1]);
  mesh(box(1.4, 1.2, 1.0), toon('#ffffff', { map: T.wood('#5a2a14', { plank: 512 }) }), { p: [0, .6, -1.35], parent: s });
  const chair = P.chair(s, [0, 0, 1.75], 180);
  const candle = P.candle(null, [0, 0, 0], 1.1);
  const candleLight = new THREE.PointLight('#ffb35a', 0, 3.5, 1.4); s.add(candleLight);
  return { scene: s, key, cab, board, chair, candle, candleLight };
}

// ---------- Schönbrunn, outside ----------
const facadeTex = () => ctex(1024, 512, (x, w, h) => {
  x.fillStyle = '#e9c35f'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#f6efe0'; x.fillRect(0, 300, w, 12); x.fillRect(0, 150, w, 8);
  for (let row = 0; row < 3; row++) for (let i = 0; i < 8; i++) {
    const px = 30 + i * 125, py = [40, 175, 330][row], ww = 60, hh = [90, 110, 140][row];
    x.fillStyle = '#f6efe0'; x.fillRect(px - 8, py - 8, ww + 16, hh + 16);
    x.fillStyle = '#5f7f9a'; x.fillRect(px, py, ww, hh); x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(px, py, ww, hh * .2);
    x.strokeStyle = '#f6efe0'; x.lineWidth = 5; x.beginPath(); x.moveTo(px + ww / 2, py); x.lineTo(px + ww / 2, py + hh); x.moveTo(px, py + hh / 2); x.lineTo(px + ww, py + hh / 2); x.stroke();
    x.fillStyle = '#4f7a4a'; x.fillRect(px - 22, py, 12, hh); x.fillRect(px + ww + 10, py, 12, hh);
  }
}, { repeat: [5, 1] });
export async function outside() {
  const s = new THREE.Scene(); s.background = sky('#4a9ae8', '#cfe8ff'); s.fog = new THREE.Fog('#d8ecff', 60, 200);
  s.add(new THREE.HemisphereLight('#d4ecff', '#8a7a5a', .85));
  sun(s, '#fff1d6', 1.6, [20, 25, 25], 40, [0, 0, -20]);
  mesh(new THREE.PlaneGeometry(400, 400), toon('#ffffff', { map: T.grass({ repeat: [60, 60] }), outline: false }), { r: [-90, 0, 0], parent: s, cast: false });
  mesh(new THREE.PlaneGeometry(70, 26), toon('#ffffff', { map: T.dirt({ base: '#e8d2a8', repeat: [8, 3] }), outline: false }), { r: [-90, 0, 0], p: [0, .02, -10], parent: s, cast: false });
  const pal = group(s, [0, 0, -30]);
  mesh(box(60, 12, 6), toon('#ffffff', { map: facadeTex(), ol: .003 }), { p: [0, 6, 0], parent: pal });
  mesh(box(61, 2.2, 7), toon('#7f9a86', { ol: .003 }), { p: [0, 13.1, 0], parent: pal });
  mesh(box(14, 13.5, 8), toon('#ffffff', { map: facadeTex(), ol: .003 }), { p: [0, 6.75, 1.5], parent: pal });
  [-5.5, -3.3, -1.1, 1.1, 3.3, 5.5].forEach(x => { mesh(cyl(.45, .5, 11, 16), toon('#f6efe0', { ol: .003 }), { p: [x, 5.5, 5.8], parent: pal }); });
  const ped = new THREE.Shape(); ped.moveTo(-7.5, 0); ped.lineTo(7.5, 0); ped.lineTo(0, 3); ped.closePath();
  mesh(new THREE.ExtrudeGeometry(ped, { depth: 1, bevelEnabled: false }), toon('#f6efe0', { ol: .003 }), { p: [0, 13.5, 5], parent: pal });
  for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) mesh(box(3.2, 1.6, 1.6), toon('#3f7f3a', { ol: .003 }), { p: [sx * (8 + i * 4.5), .8, -8], parent: s });
  for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) mesh(new THREE.ConeGeometry(.9, 3.4, 12), toon('#2f6f32', { ol: .003 }), { p: [sx * (6 + i * 5), 1.7, -2], parent: s });
  const fountain = group(s, [0, 0, -6]);
  mesh(cyl(3, 3.2, .7, 32), toon('#e8e0d0', { ol: .004 }), { p: [0, .35, 0], parent: fountain });
  mesh(cyl(2.7, 2.7, .1, 32), toon('#7fc0e8', { emissive: '#204060' }), { p: [0, .66, 0], parent: fountain });
  mesh(cyl(.4, .6, 2.2, 16), toon('#e8e0d0', { ol: .004 }), { p: [0, 1.6, 0], parent: fountain });
  [[-30, 30, -90, 3.5], [20, 34, -100, 3], [50, 26, -80, 2.6]].forEach(([x, y, z, sc]) => EP.cloud(s, [x, y, z], sc));
  return { scene: s };
}

// ---------- Napoleon's glory ----------
export async function glory() {
  const s = new THREE.Scene(); s.background = new THREE.Color('#1f3a8a');
  s.add(new THREE.HemisphereLight('#fff6e0', '#3a3a6a', 1.0));
  sun(s, '#fff1d6', 1.5, [4, 10, 10], 8, [0, 2, 0]);
  const rays = ctex(1024, 1024, (x) => { const cols = ['#1f3a8a', '#f4f1ea', '#c0392b']; for (let i = 0; i < 36; i++) { const a0 = i / 36 * Math.PI * 2, a1 = (i + 1) / 36 * Math.PI * 2; x.fillStyle = cols[i % 3]; x.beginPath(); x.moveTo(512, 512); x.lineTo(512 + Math.cos(a0) * 900, 512 + Math.sin(a0) * 900); x.lineTo(512 + Math.cos(a1) * 900, 512 + Math.sin(a1) * 900); x.fill(); } const g = x.createRadialGradient(512, 512, 0, 512, 512, 520); g.addColorStop(0, 'rgba(255,250,220,.95)'); g.addColorStop(.35, 'rgba(255,250,220,0)'); x.fillStyle = g; x.fillRect(0, 0, 1024, 1024); });
  const burst = mesh(new THREE.PlaneGeometry(50, 50), basic({ map: rays }), { p: [0, 4, -12], parent: s, cast: false });
  mesh(cyl(1.6, 1.8, 1.2, 32), toon('#e2b33f', { g: G3, ol: .006 }), { p: [0, .6, 0], parent: s });
  mesh(cyl(1.9, 1.9, .2, 32), toon('#f2ece0', { g: G3, ol: .006 }), { p: [0, .1, 0], parent: s });
  const flags = [P.flag(s, [-3.2, 0, -1.5], 1.2), P.flag(s, [3.2, 0, -1.5], 1.2)];
  flags[1].root.scale.x = -1.2;
  return { scene: s, burst, flags, update(t) { burst.rotation.z = t * .12; flags.forEach(f => f.wave(t)); } };
}
