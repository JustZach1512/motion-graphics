// Props for "El ejército de goma": the inflatable tank, bikes, speaker truck, radio, pump, plane, café bits.
import { THREE, toon, basic, G3, G5, GH, mesh, group, sphere, box, cyl, D2R, ctex, hash, clamp, lerp, INK } from '../../engine/engine.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const M = {}; const mat = (k, f) => M[k] || (M[k] = f());
const OLIVE = '#6b7a3a';

// ---------- the inflatable Sherman ----------
// origin at the bottom of the tracks, facing +x. set({ inflate 0..1, sag 0..1, wobble, t })
export function tank(parent, p, ry = 0) {
  const g = group(parent, p, [0, ry, 0]);
  const body = group(g);
  const rub = mat('rubber', () => toon(OLIVE, { g: GH, ol: .006, emissive: '#11140a' }));
  const dark = mat('track', () => toon('#3d4426', { g: G3, ol: .006 }));
  const star = ctex(256, 256, (x) => { x.fillStyle = OLIVE; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#f4f1e8'; x.lineWidth = 14; x.beginPath(); x.arc(128, 128, 100, 0, 7); x.stroke(); x.fillStyle = '#f4f1e8'; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 36 : 88; x.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); } x.fill(); });
  mesh(new RoundedBoxGeometry(3.4, .55, .5, 4, .22), dark, { p: [0, .3, .78], parent: body });
  mesh(new RoundedBoxGeometry(3.4, .55, .5, 4, .22), dark, { p: [0, .3, -.78], parent: body });
  for (let i = 0; i < 5; i++) [-1, 1].forEach(sd => mesh(cyl(.2, .2, .08, 14), mat('wheel', () => toon('#2e3320', { g: G3, outline: false })), { p: [-1.3 + i * .65, .28, sd * 1.04], r: [90, 0, 0], parent: body }));
  mesh(new RoundedBoxGeometry(3.3, .7, 1.95, 4, .28), rub, { p: [0, .85, 0], parent: body });
  mesh(new RoundedBoxGeometry(1.4, .5, 1.6, 4, .2), rub, { p: [.85, 1.18, 0], r: [0, 0, -14], parent: body });
  const turret = group(body, [-.25, 1.35, 0]);
  mesh(cyl(.72, .82, .62, 24), rub, { p: [0, .31, 0], parent: turret });
  mesh(sphere(.72, 24, 12), rub, { p: [0, .58, 0], s: [1, .35, 1], parent: turret });
  mesh(cyl(.11, .13, 2.2, 14), rub, { p: [1.6, .32, 0], r: [0, 0, 90], parent: turret });
  mesh(new THREE.CircleGeometry(.38, 24), toon('#ffffff', { map: star, outline: false }), { p: [-.4, .9, .985], parent: body });
  mesh(new THREE.CircleGeometry(.38, 24), toon('#ffffff', { map: star, outline: false }), { p: [-.4, .9, -.985], r: [0, 180, 0], parent: body });
  const valve = mesh(cyl(.05, .05, .14, 8), mat('valve', () => toon('#1c1411', { g: G3 })), { p: [-1.5, 1.25, .6], parent: body });
  return {
    root: g, body, turret,
    set(st) {
      const t = st.t || 0, inf = st.inflate ?? 1, sag = st.sag || 0;
      const w = (st.wobble || 0) * Math.sin(t * 14) * Math.exp(-((st.wobbleT ?? 0)) * 2);
      const sy = lerp(.06, 1, inf) * (1 - sag * .55) * (1 + w * .06), sxz = (1 + (1 - inf) * .25) * (1 + sag * .12) * (1 - w * .04);
      body.scale.set(sxz, sy, sxz);
      turret.rotation.z = sag * .35 + w * .05; turret.position.x = -.25 - sag * .2;
    },
  };
}

// ---------- bicycle (facing +x) ----------
export function bike(parent, p, color = '#2f5d8a') {
  const g = group(parent, p);
  const frame = mat('bframe' + color, () => toon(color, { g: G3, ol: .004 }));
  const blk = mat('btire', () => toon('#1c1a18', { g: G3, outline: false }));
  const wheels = [-.78, .78].map(x => { const w = group(g, [x, .58, 0]); mesh(new THREE.TorusGeometry(.55, .05, 8, 32), blk, { parent: w }); for (let i = 0; i < 6; i++) mesh(cyl(.008, .008, 1.08, 4), mat('spk', () => toon('#c9c9c9', { outline: false })), { r: [0, 0, i * 30], parent: w }); return w; });
  const tube = (a, b, r = .04) => { const m = mesh(cyl(1, 1, 1, 8), frame, { parent: g }); const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A); m.position.copy(A).addScaledVector(d, .5); m.scale.set(r, d.length(), r); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); };
  tube([-.78, .58, 0], [-.15, .62, 0]); tube([-.15, .62, 0], [.55, 1.15, 0]); tube([-.25, 1.2, 0], [.55, 1.15, 0]); tube([-.25, 1.2, 0], [-.15, .62, 0]); tube([-.25, 1.2, 0], [-.78, .58, 0]); tube([.55, 1.15, 0], [.78, .58, 0]); tube([.55, 1.15, 0], [.6, 1.45, 0]);
  tube([.6, 1.45, -.32], [.6, 1.45, .32], .035);
  mesh(new RoundedBoxGeometry(.32, .08, .18, 2, .04), mat('bseat', () => toon('#5a3a22', { g: G3 })), { p: [-.27, 1.27, 0], parent: g });
  return { root: g, grips: [new THREE.Vector3(.6, 1.45, -.3), new THREE.Vector3(.6, 1.45, .3)], seat: new THREE.Vector3(-.27, 1.3, 0), setWheel(a) { wheels.forEach(w => { w.rotation.z = -a; }); } };
}

// ---------- loudspeaker truck ----------
export function speakerTruck(parent, p, ry = 0) {
  const g = group(parent, p, [0, ry, 0]);
  const o = mat('truck', () => toon('#5f6b38', { g: G3, ol: .006 }));
  mesh(new RoundedBoxGeometry(1.6, 1.5, 2.0, 3, .15), o, { p: [1.9, 1.45, 0], parent: g });
  mesh(box(1.0, .5, 1.9), mat('glassT', () => toon('#9fc4d8', { g: G3, ol: .004 })), { p: [2.45, 1.8, 0], parent: g });
  mesh(new RoundedBoxGeometry(3.4, .9, 2.2, 3, .1), o, { p: [-.6, 1.05, 0], parent: g });
  [-1.6, .9, 2.2].forEach(x => [-1, 1].forEach(sd => mesh(cyl(.42, .42, .3, 18), mat('tireT', () => toon('#1c1a18', { g: G3, ol: .004 })), { p: [x, .42, sd * 1.05], r: [90, 0, 0], parent: g })));
  const horns = [];
  [-.6, .6].forEach(z => { const h = group(g, [-.9, 2.05, z], [0, 0, 0]); mesh(new THREE.CylinderGeometry(.55, .12, .9, 24, 1, true), mat('horn', () => toon('#c9c9b0', { g: G3, side: THREE.DoubleSide, ol: .005 })), { r: [0, 0, 90], p: [.25, 0, 0], parent: h }); mesh(box(.3, .3, .3), o, { p: [-.25, 0, 0], parent: h }); h.rotation.y = z > 0 ? -.25 : .25; horns.push(h); });
  mesh(cyl(.06, .06, .6, 8), o, { p: [-.9, 1.7, 0], parent: g });
  return { root: g, horns, set(t) { horns.forEach((h, i) => { const s = 1 + Math.max(0, Math.sin(t * 18 + i)) * .06; h.scale.set(s, s, s); }); } };
}

// ---------- field radio, pump, tent, plane, easel, newspaper, café furniture ----------
export function radio(parent, p) {
  const g = group(parent, p);
  mesh(new RoundedBoxGeometry(1.0, .7, .55, 2, .05), mat('radio', () => toon('#4f5a2e', { g: G3, ol: .005 })), { p: [0, .35, 0], parent: g });
  mesh(box(.8, .4, .02), mat('rface', () => toon('#2a2a22', { g: G3, outline: false })), { p: [0, .4, .28], parent: g });
  [-.25, 0, .25].forEach(x => mesh(cyl(.06, .06, .05, 12), mat('knob', () => toon('#c9c9b0', { g: G3 })), { p: [x, .35, .3], r: [90, 0, 0], parent: g }));
  const lamp = mesh(sphere(.04, 8, 6), mat('rled', () => basic({ color: '#ff5a3a' })), { p: [.32, .52, .3], parent: g, cast: false });
  mesh(cyl(.012, .012, 1.6, 5), mat('ant', () => toon('#2a2a2a', { outline: false })), { p: [-.4, 1.5, -.1], parent: g });
  return { root: g, lamp };
}
export function handset() { const g = new THREE.Group(); const m = mat('hset', () => toon('#2a2a22', { g: G3, ol: .003 })); mesh(box(.08, .5, .1), m, { parent: g }); mesh(sphere(.09, 10, 8), m, { p: [0, .26, .05], parent: g }); mesh(sphere(.08, 10, 8), m, { p: [0, -.26, .05], parent: g }); return g; }
export function pump(parent, p) {
  const g = group(parent, p);
  const m = mat('pump', () => toon('#8a2a2a', { g: G3, ol: .005 }));
  mesh(cyl(.16, .16, 1.0, 14), m, { p: [0, .55, 0], parent: g });
  mesh(box(.6, .06, .3), m, { p: [0, .04, 0], parent: g });
  const plunger = group(g, [0, 1.05, 0]);
  mesh(cyl(.03, .03, .7, 6), mat('rod', () => toon('#bbbbbb', { g: G3 })), { p: [0, .15, 0], parent: plunger });
  mesh(cyl(.04, .04, .7, 8), mat('hdl', () => toon('#3a2a1a', { g: G3, ol: .004 })), { p: [0, .5, 0], r: [90, 0, 0], parent: plunger });
  return { root: g, plunger, set(v) { plunger.position.y = 1.05 + v * .5; }, handle: () => plunger.localToWorld(new THREE.Vector3(0, .5, 0)) };
}
export function hose(parent, a, b) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), m = A.clone().lerp(B, .5); m.y = Math.min(A.y, B.y) - .3;
  return mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(A, m, B), 20, .04, 6), mat('hose', () => toon('#1c1a18', { outline: false })), { parent, cast: false });
}
export function tent(parent, p, ry = 0, s = 1) {
  const g = group(parent, p, [0, ry, 0]); g.scale.setScalar(s);
  const sh = new THREE.Shape(); sh.moveTo(-1.6, 0); sh.lineTo(0, 2.2); sh.lineTo(1.6, 0); sh.closePath();
  mesh(new THREE.ExtrudeGeometry(sh, { depth: 3, bevelEnabled: false }), mat('tent', () => toon('#7a8048', { g: G5, ol: .005 })), { p: [0, 0, -1.5], parent: g });
  return g;
}
export function plane(parent, p) {
  const g = group(parent, p);
  const m = mat('plane', () => toon('#8a9098', { g: G3, ol: .006 }));
  mesh(new THREE.CapsuleGeometry(.45, 4, 6, 16), m, { r: [0, 0, 90], parent: g });
  mesh(new RoundedBoxGeometry(1.4, .12, 7, 2, .05), m, { p: [.3, -.1, 0], parent: g });
  mesh(new RoundedBoxGeometry(.8, .1, 2.4, 2, .04), m, { p: [-2.2, .1, 0], parent: g });
  mesh(new RoundedBoxGeometry(.8, 1.0, .1, 2, .04), m, { p: [-2.2, .5, 0], parent: g });
  mesh(sphere(.32, 14, 10), mat('canopy', () => toon('#9fc4d8', { g: GH, ol: .004 })), { p: [.6, .45, 0], s: [1.4, .8, .9], parent: g });
  const prop = group(g, [2.5, 0, 0]);
  mesh(box(.06, 1.8, .16), mat('prop', () => toon('#2a2a2a', { g: G3, outline: false })), { parent: prop });
  mesh(sphere(.16, 10, 8), m, { p: [-.05, 0, 0], parent: g });
  return { root: g, prop };
}
export function easel(parent, p, ry = 0) {
  const g = group(parent, p, [0, ry, 0]);
  const w = mat('easel', () => toon('#a8743f', { g: G3, ol: .004 }));
  [[-.4, 0], [.4, 0]].forEach(([x]) => mesh(box(.06, 2.4, .06), w, { p: [x, 1.2, 0], r: [8, 0, x > 0 ? -8 : 8], parent: g }));
  mesh(box(.06, 2.3, .06), w, { p: [0, 1.1, -.4], r: [-20, 0, 0], parent: g });
  const art = ctex(400, 300, (x) => { x.fillStyle = '#f4efe0'; x.fillRect(0, 0, 400, 300); x.fillStyle = '#5f6b38'; x.beginPath(); x.roundRect(60, 150, 280, 90, 30); x.fill(); x.fillRect(150, 110, 120, 60); x.fillRect(260, 128, 110, 16); x.strokeStyle = '#2a2a1a'; x.lineWidth = 6; x.beginPath(); x.roundRect(60, 150, 280, 90, 30); x.stroke(); x.fillStyle = '#3d4426'; x.fillRect(50, 230, 300, 30); x.fillStyle = '#c0392b'; x.font = 'bold 30px "Alfa Slab One"'; x.fillText('¿TANQUE?', 120, 70); });
  mesh(box(1.3, 1.0, .05), toon('#ffffff', { map: art, ol: .004 }), { p: [0, 1.55, .08], r: [-8, 0, 0], parent: g });
  return g;
}
export function newspaper() {
  const g = new THREE.Group();
  const t = ctex(512, 360, (x) => { x.fillStyle = '#efe8d6'; x.fillRect(0, 0, 512, 360); x.fillStyle = '#1c1a18'; x.font = '44px "Rye"'; x.fillText('LE MATIN', 120, 52); x.fillRect(20, 66, 472, 4); for (let c = 0; c < 3; c++) for (let r = 0; r < 14; r++) x.fillRect(24 + c * 160, 90 + r * 18, 140 - (r * 13 % 40), 8); x.fillRect(196, 100, 120, 80); });
  mesh(box(1.1, .78, .02), toon('#ffffff', { map: t, side: THREE.DoubleSide, ol: .003 }), { parent: g });
  return g;
}
export function bistroTable(parent, p) {
  const g = group(parent, p);
  const cloth = ctex(256, 256, (x) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? '#c0392b' : '#f4efe8'; x.fillRect(i * 32, j * 32, 32, 32); } });
  mesh(cyl(.8, .8, .06, 28), toon('#ffffff', { map: cloth, g: G3, ol: .004 }), { p: [0, 1.5, 0], parent: g });
  mesh(cyl(.06, .06, 1.5, 8), mat('tleg', () => toon('#2a2a2a', { g: G3 })), { p: [0, .75, 0], parent: g });
  mesh(cyl(.4, .4, .05, 16), mat('tleg', () => toon('#2a2a2a', { g: G3 })), { p: [0, .03, 0], parent: g });
  [[-.3, .2], [.3, -.15]].forEach(([x, z]) => { mesh(new THREE.LatheGeometry([[0, 0], [.08, 0], [.02, .02], [.02, .16], [.1, .24], [.1, .36], [0, .36]].map(([a, b]) => new THREE.Vector2(a, b)), 14), mat('glass', () => toon('#d8ecf0', { g: GH, ol: .003, transparent: true, opacity: .8 })), { p: [x, 1.53, z], parent: g }); mesh(cyl(.085, .085, .1, 12), mat('wine', () => toon('#7a1f2a', { outline: false })), { p: [x, 1.81, z], parent: g }); });
  return g;
}
export function stool(parent, p) {
  const g = group(parent, p);
  mesh(cyl(.4, .4, .08, 18), mat('stool', () => toon('#7a4a2a', { g: G3, ol: .004 })), { p: [0, 1.15, 0], parent: g });
  [[.25, .25], [-.25, .25], [.25, -.25], [-.25, -.25]].forEach(([x, z]) => mesh(cyl(.03, .03, 1.15, 6), mat('tleg', () => toon('#2a2a2a', { g: G3 })), { p: [x * .9, .57, z * .9], parent: g }));
  return g;
}
