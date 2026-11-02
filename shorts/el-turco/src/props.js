// Props for "El Turco": chess set, the automaton's cabinet (doors, gears, hidden seat), palace furniture.
import { THREE, toon, basic, G3, G5, GH, mesh, group, sphere, box, cyl, D2R, ctex, rnd, hash, INK } from '../../engine/engine.js';
import * as T from '../../engine/textures.js';

const M = {}; const mat = (k, f) => M[k] || (M[k] = f());

// ---------- chess ----------
export const SQ = .14;                       // square size; board is 8 x SQ wide
const IVORY = '#f3ead8', EBONY = '#2b2420';
function boardTex() {
  return ctex(1024, 1024, (x) => {
    for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) { x.fillStyle = (r + f) % 2 ? '#6b3b1f' : '#efd9ae'; x.fillRect(64 + f * 112, 64 + r * 112, 112, 112); }
    x.strokeStyle = '#3a1d0c'; x.lineWidth = 8; x.strokeRect(64, 64, 896, 896);
    x.fillStyle = '#4a2512'; x.fillRect(0, 0, 1024, 60); x.fillRect(0, 964, 1024, 60); x.fillRect(0, 0, 60, 1024); x.fillRect(964, 0, 60, 1024);
    x.strokeStyle = '#d8a640'; x.lineWidth = 6; x.strokeRect(30, 30, 964, 964);
  });
}
const PROF = {   // lathe profiles, unit height
  p: [[0, 0], [.42, 0], [.42, .08], [.3, .14], [.18, .3], [.14, .5], [.24, .56], [.14, .6], [.22, .74], [.2, .88], [.1, .98], [0, 1]],
  r: [[0, 0], [.45, 0], [.45, .08], [.34, .14], [.3, .72], [.38, .76], [.38, 1], [.26, 1], [.26, .9], [0, .9]],
  b: [[0, 0], [.42, 0], [.42, .08], [.3, .14], [.16, .5], [.28, .55], [.14, .6], [.24, .8], [.12, .96], [.06, 1], [0, 1.02]],
  q: [[0, 0], [.46, 0], [.46, .08], [.34, .14], [.16, .55], [.3, .6], [.16, .65], [.3, .9], [.2, .94], [.1, .98], [.08, 1.04], [0, 1.06]],
  k: [[0, 0], [.46, 0], [.46, .08], [.34, .14], [.17, .58], [.3, .63], [.17, .68], [.28, .9], [.08, .94], [.08, 1.0], [0, 1.0]],
};
const HGT = { p: .2, r: .23, n: .26, b: .28, q: .32, k: .34 };
function pieceGeo(type) {
  if (type === 'n') {
    const g = new THREE.Group();
    const s = new THREE.Shape(); [[-.3, .2], [.25, .2], [.28, .45], [.12, .6], [.34, .78], [.2, .98], [-.05, 1.0], [-.32, .7], [-.22, .5]].forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y));
    return { lathe: new THREE.LatheGeometry(PROF.p.slice(0, 4).map(([r, y]) => new THREE.Vector2(r, y * .5)), 20), shape: new THREE.ExtrudeGeometry(s, { depth: .3, bevelEnabled: true, bevelThickness: .04, bevelSize: .04, bevelSegments: 2 }) };
  }
  return { lathe: new THREE.LatheGeometry(PROF[type].map(([r, y]) => new THREE.Vector2(r, y)), 24) };
}
const GEO = {};
export function piece(type, white) {
  const g = new THREE.Group(); const m = mat('pc' + white, () => toon(white ? IVORY : EBONY, { g: G3, ol: .003 }));
  const geo = GEO[type] || (GEO[type] = pieceGeo(type)); const h = HGT[type];
  const l = mesh(geo.lathe, m, { parent: g }); l.scale.set(SQ * .8, h, SQ * .8);
  if (geo.shape) { const k = mesh(geo.shape, m, { parent: g }); k.scale.set(SQ * .8, h, SQ * .8); k.position.z = -.15 * SQ * .8; }
  if (type === 'k') { mesh(box(.012, .06, .012), m, { p: [0, h + .02, 0], parent: g }); mesh(box(.04, .012, .012), m, { p: [0, h + .03, 0], parent: g }); }
  g.userData.type = type; return g;
}
export const sq2pos = (f, r) => [(f - 3.5) * SQ, (3.5 - r) * SQ];   // file 0..7 (a..h), rank 0..7; white on +z
export function chessBoard(parent, p) {
  const g = group(parent, p);
  mesh(box(8 * SQ + .16, .06, 8 * SQ + .16), toon('#ffffff', { map: boardTex(), g: G3, ol: .004 }), { p: [0, .03, 0], parent: g });
  // a lively middlegame
  const setup = [['r', 0, 7, 0], ['k', 6, 7, 0], ['q', 3, 6, 0], ['b', 2, 5, 0], ['n', 5, 5, 0], ['p', 0, 6, 0], ['p', 1, 5, 0], ['p', 5, 6, 0], ['p', 6, 6, 0], ['p', 7, 5, 0], ['r', 4, 7, 0],
    ['r', 0, 0, 1], ['k', 6, 0, 1], ['q', 3, 1, 1], ['b', 2, 2, 1], ['n', 2, 3, 1], ['b', 4, 2, 1], ['p', 0, 1, 1], ['p', 1, 2, 1], ['p', 5, 1, 1], ['p', 6, 1, 1], ['p', 7, 2, 1], ['r', 5, 0, 1]];
  const pieces = setup.map(([t, f, r, w]) => { const pc = piece(t, !!w); const [x, z] = sq2pos(f, r); pc.position.set(x, .06, z); pc.userData.home = new THREE.Vector3(x, .06, z); pc.userData.sq = [f, r]; g.add(pc); return pc; });
  return { root: g, pieces, find: (f, r) => pieces.find(pc => pc.userData.sq[0] === f && pc.userData.sq[1] === r) };
}

// ---------- gears ----------
function gearShape(R, teeth, toothH = .06, hole = .08) {
  const s = new THREE.Shape(), n = teeth * 4;
  for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, rr = (i % 4 === 1 || i % 4 === 2) ? R + toothH : R; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; i ? s.lineTo(x, y) : s.moveTo(x, y); }
  const h = new THREE.Path(); h.absarc(0, 0, hole, 0, Math.PI * 2, true); s.holes.push(h);
  for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2, c = new THREE.Path(); c.absarc(Math.cos(a) * R * .55, Math.sin(a) * R * .55, R * .16, 0, Math.PI * 2, true); s.holes.push(c); }
  return s;
}
export function gear(parent, p, R, teeth, color = '#d8a640') {
  const g = group(parent, p);
  mesh(new THREE.ExtrudeGeometry(gearShape(R, teeth), { depth: .05, bevelEnabled: false, curveSegments: 4 }), mat('gear' + color, () => toon(color, { g: G3, ol: .003 })), { p: [0, 0, -.025], parent: g });
  mesh(cyl(.05, .05, .2, 10), mat('axle', () => toon('#6b6b6b', { g: G3 })), { r: [90, 0, 0], parent: g });
  return g;
}

// ---------- the cabinet ----------
// width 3.2 (x), height 1.3 on legs (top at 1.5), depth 1.6 (z -0.8..0.8). Three front doors + a drawer.
export function cabinet(parent, p) {
  const g = group(parent, p);
  const wood = mat('cabwood', () => toon('#ffffff', { map: T.wood('#6a2f17', { plank: 512 }), g: G3, ol: .006 }));
  const trim = mat('cabtrim', () => toon('#d8a640', { g: G3, ol: .004 }));
  const dark = mat('cabdark', () => toon('#1a0e08', { outline: false }));
  const W2 = 1.6, H0 = .2, H1 = 1.5, D2 = .8;
  // shell: back, sides, top, bottom (the front is the doors, so the cutaway can hide it)
  const shell = group(g);
  mesh(box(3.2, 1.3, .06), wood, { p: [0, (H0 + H1) / 2, -D2 + .03], parent: shell });
  [-1, 1].forEach(sd => mesh(box(.06, 1.3, 1.6), wood, { p: [sd * (W2 - .03), (H0 + H1) / 2, 0], parent: shell }));
  const top = mesh(box(3.3, .08, 1.7), wood, { p: [0, H1 + .04, 0], parent: g });
  mesh(box(3.2, .06, 1.6), wood, { p: [0, H0 + .03, 0], parent: shell });
  [-1, 1].forEach(sx => [-1, 1].forEach(sz => mesh(cyl(.06, .05, H0, 10), trim, { p: [sx * 1.5, H0 / 2, sz * .7], parent: g })));
  mesh(box(3.32, .05, 1.72), trim, { p: [0, H1 + .1, 0], parent: g });
  // interior: dark back, partition, gears (left two bays), the hidden seat (right bay / behind)
  mesh(box(3.08, 1.18, .02), dark, { p: [0, (H0 + H1) / 2, -D2 + .07], parent: g });
  mesh(box(.04, 1.18, 1.5), wood, { p: [.53, (H0 + H1) / 2, 0], parent: g });
  const gears = [gear(g, [-1.1, 1.0, .1], .26, 12), gear(g, [-.7, .72, .1], .18, 9, '#c9a14a'), gear(g, [-.3, 1.08, .1], .22, 11), gear(g, [-.95, .48, .1], .14, 8, '#b8862e'), gear(g, [.1, .62, .1], .2, 10, '#c9a14a'), gear(g, [.32, 1.12, .1], .12, 7)];
  const seat = group(g, [1.0, .55, -.1]);                             // the sliding seat, on a crate
  mesh(box(.7, .05, .7), mat('cush', () => toon('#7a1f1f', { g: G3 })), { p: [0, .025, 0], parent: seat });
  mesh(box(.6, .3, .6), wood, { p: [0, -.14, 0], parent: seat });
  const lever = group(g, [1.1, 1.3, -.4]);                           // lever up into the Turk's arm
  mesh(cyl(.025, .025, .5, 8), mat('lev', () => toon('#9aa1a9', { g: G3 })), { p: [0, -.25, 0], parent: lever });
  mesh(sphere(.05, 10, 8), mat('levk', () => toon('#1c1411', { g: G3 })), { p: [0, -.5, 0], parent: lever });
  // doors (hinged on their outer edge) + drawer
  const doorMat = mat('door', () => toon('#ffffff', { map: T.panels('#5e2a14'), g: G3, ol: .005 }));
  const mkDoor = (x0, w, side) => {
    const pivot = group(g, [x0, (H0 + .45 + H1) / 2, D2]);
    const d = mesh(box(w, H1 - H0 - .45, .05), doorMat, { p: [side * w / 2, 0, .025], parent: pivot });
    mesh(sphere(.035, 10, 8), trim, { p: [side * (w - .1), 0, .07], parent: pivot });
    return pivot;
  };
  const doors = [mkDoor(-W2, 1.05, 1), mkDoor(.53, 1.05, -1), mkDoor(W2, 1.05, -1)];
  const drawer = group(g, [0, H0 + .2, D2]);
  mesh(box(3.1, .38, .05), doorMat, { p: [0, 0, .025], parent: drawer });
  [-.6, .6].forEach(x => mesh(box(.25, .04, .06), trim, { p: [x, 0, .07], parent: drawer }));
  const front = [...doors, drawer];
  return {
    root: g, gears, seat, lever, doors, drawer, front, topY: H1 + .12,
    set(st) {
      const t = st.t || 0;
      gears.forEach((ge, i) => { ge.rotation.z = (i % 2 ? -1 : 1) * t * (1.2 + i * .2) * (st.spin ?? 1); });
      const o = st.open || [0, 0, 0];
      doors[0].rotation.y = -o[0] * 105 * D2R; doors[1].rotation.y = o[1] * 105 * D2R; doors[2].rotation.y = o[2] * 105 * D2R;
      drawer.position.z = D2 + (st.drawer || 0) * .7;
      front.forEach(f => { f.visible = !st.cutaway || !!st.ghost; });
      doorMat.transparent = !!st.ghost; doorMat.opacity = st.ghost ? .28 : 1; doorMat.depthWrite = !st.ghost;
      seat.position.x = 1.0 - (st.slide || 0) * .5;
      lever.rotation.x = (st.lever || 0) * .6;
    },
  };
}

// ---------- palace bits ----------
export function candle(parent, p, s = 1) {
  const g = group(parent, p); g.scale.setScalar(s);
  mesh(cyl(.05, .05, .3, 12), mat('wax', () => toon('#f6efd8', { g: G3, ol: .003 })), { p: [0, .15, 0], parent: g });
  const flame = mesh(new THREE.ConeGeometry(.035, .1, 10), mat('flame', () => basic({ color: '#ffd27a' })), { p: [0, .36, 0], parent: g, cast: false });
  mesh(sphere(.09, 10, 8), mat('halo', () => basic({ color: '#ffb84a', transparent: true, opacity: .25, depthWrite: false })), { p: [0, .36, 0], parent: g, cast: false });
  return { root: g, flame };
}
export function chandelier(parent, p, s = 1) {
  const g = group(parent, p); g.scale.setScalar(s);
  const gold = mat('gold', () => toon('#e2b33f', { g: G3, ol: .004 }));
  mesh(cyl(.02, .02, 2, 6), gold, { p: [0, 1, 0], parent: g, cast: false });
  mesh(new THREE.TorusGeometry(.8, .05, 8, 32), gold, { r: [90, 0, 0], parent: g, cast: false });
  mesh(sphere(.18, 14, 10), gold, { parent: g, cast: false });
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const c = candle(g, [Math.cos(a) * .8, .03, Math.sin(a) * .8], .9); c.root.traverse(o => { o.castShadow = false; }); mesh(sphere(.05, 8, 6), mat('crys', () => toon('#e8f4ff', { g: GH, emissive: '#6a8aa0', outline: false })), { p: [Math.cos(a + .4) * .7, -.25, Math.sin(a + .4) * .7], parent: g, cast: false }); }
  const l = new THREE.PointLight('#ffd9a0', 9, 12, 1.6); l.position.set(0, -.2, 0); g.add(l);
  return g;
}
export function column(parent, p, h = 7) {
  const g = group(parent, p);
  const marble = mat('marble', () => toon('#f2ece0', { g: G5, ol: .004 }));
  const gold = mat('gold', () => toon('#e2b33f', { g: G3, ol: .004 }));
  mesh(box(.9, .3, .9), marble, { p: [0, .15, 0], parent: g });
  mesh(cyl(.32, .36, h - .8, 20), marble, { p: [0, (h - .8) / 2 + .3, 0], parent: g });
  mesh(cyl(.45, .34, .25, 20), gold, { p: [0, h - .4, 0], parent: g });
  mesh(box(1.0, .2, 1.0), marble, { p: [0, h - .15, 0], parent: g });
  return g;
}
export function curtain(parent, p, w, h, color = '#9a1f2a') {
  const geo = new THREE.PlaneGeometry(w, h, 24, 1); const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) / w * Math.PI * 7) * .12);
  geo.computeVertexNormals();
  return mesh(geo, toon(color, { g: G5, ol: .004, side: THREE.DoubleSide }), { p, parent });
}
export function chair(parent, p, ry = 0) {
  const g = group(parent, p, [0, ry, 0]);
  const gold = mat('gold', () => toon('#e2b33f', { g: G3, ol: .004 })), red = mat('velvet', () => toon('#9a1f2a', { g: G3, ol: .004 }));
  mesh(box(1.0, .14, .9), red, { p: [0, 1.1, 0], parent: g });
  mesh(box(1.0, 1.3, .12), red, { p: [0, 1.8, -.45], parent: g });
  mesh(box(1.1, .1, .14), gold, { p: [0, 2.48, -.45], parent: g });
  [[-.45, -.4], [.45, -.4], [-.45, .4], [.45, .4]].forEach(([x, z]) => mesh(cyl(.05, .04, 1.05, 8), gold, { p: [x, .52, z], parent: g }));
  return g;
}
export function flag(parent, p, s = 1) {
  const g = group(parent, p); g.scale.setScalar(s);
  mesh(cyl(.04, .04, 4, 8), mat('fpole', () => toon('#6b4a33', { g: G3 })), { p: [0, 2, 0], parent: g });
  mesh(sphere(.09, 10, 8), mat('gold', () => toon('#e2b33f', { g: G3 })), { p: [0, 4.05, 0], parent: g });
  const t = ctex(300, 200, (x) => { ['#1f3a8a', '#ffffff', '#c0392b'].forEach((c, i) => { x.fillStyle = c; x.fillRect(i * 100, 0, 100, 200); }); });
  const geo = new THREE.PlaneGeometry(1.8, 1.2, 16, 4);
  const cloth = mesh(geo, toon('#ffffff', { map: t, side: THREE.DoubleSide, ol: .003 }), { p: [.92, 3.3, 0], parent: g });
  const base = geo.attributes.position.array.slice();
  return { root: g, wave(time) { const a = geo.attributes.position; for (let i = 0; i < a.count; i++) { const x = base[i * 3]; a.setZ(i, Math.sin(x * 3 - time * 6) * .12 * (x + .9)); } a.needsUpdate = true; geo.computeVertexNormals(); } };
}
export function painting(parent, p, w, h) {
  const t = ctex(400, 300, (x) => {
    const g2 = x.createLinearGradient(0, 0, 0, 300); g2.addColorStop(0, '#8fb8d8'); g2.addColorStop(1, '#f2d6a2'); x.fillStyle = g2; x.fillRect(0, 0, 400, 300);
    x.fillStyle = '#5f8a4a'; x.beginPath(); x.moveTo(0, 220); x.quadraticCurveTo(120, 150, 240, 210); x.quadraticCurveTo(330, 170, 400, 200); x.lineTo(400, 300); x.lineTo(0, 300); x.fill();
    x.fillStyle = '#3f6a3a'; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(40 + i * 65, 215 - (i % 2) * 12, 18, 0, 7); x.fill(); }
    x.fillStyle = '#e8d9b0'; x.fillRect(250, 150, 60, 40); x.fillStyle = '#9a4a3a'; x.beginPath(); x.moveTo(245, 150); x.lineTo(280, 125); x.lineTo(315, 150); x.fill();
  });
  const g = group(parent, p);
  mesh(box(w + .3, h + .3, .1), mat('gold', () => toon('#e2b33f', { g: G3, ol: .004 })), { parent: g });
  mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: t, outline: false }), { p: [0, 0, .06], parent: g });
  return g;
}
