// Props built from primitives with toon materials and painted textures.
import { THREE, toon, basic, G3, G5, GH, mesh, group, placeBetween, unitCyl, sphere, box, cyl, D2R, clamp, svgTex, INK } from './engine.js';
import * as T from './textures.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { pending, blankTex } from './characters.js';

const M = {}; // shared materials
const mat = (key, make) => M[key] || (M[key] = make());

// ---------- nature ----------
export function tree(parent, p, s = 1, seed = 0) {
  const g = group(parent, p); g.scale.setScalar(s);
  mesh(cyl(.18, .26, 2.2, 10), mat('trunk', () => toon('#7a4a2a', { ol: .004 })), { p: [0, 1.1, 0], parent: g });
  const leaf = mat('leaf' + (seed % 3), () => toon(['#3f9a3a', '#4aa640', '#5bb24a'][seed % 3], { ol: .004 }));
  [[0, 3.1, 0, 1.45], [-.9, 2.5, .2, 1.05], [.95, 2.6, -.1, 1.1], [.2, 2.4, .9, 1.0], [-.2, 3.7, -.2, .95]].forEach(([x, y, z, r]) => mesh(sphere(r, 18, 12), leaf, { p: [x, y, z], parent: g }));
  return g;
}
export function poplar(parent, p, s = 1) {
  const g = group(parent, p); g.scale.setScalar(s);
  mesh(cyl(.12, .16, 1, 8), mat('trunk', () => toon('#7a4a2a')), { p: [0, .5, 0], parent: g });
  mesh(sphere(1, 16, 14), mat('pop', () => toon('#3e8f37', { ol: .003 })), { p: [0, 3.2, 0], s: [.9, 2.9, .9], parent: g });
  return g;
}
export function bush(parent, p, s = 1) {
  const g = group(parent, p); g.scale.setScalar(s); const m = mat('bush', () => toon('#4a9e3c'));
  [[0, .5, 0, .7], [.6, .4, .1, .5], [-.6, .4, 0, .55]].forEach(([x, y, z, r]) => mesh(sphere(r, 14, 10), m, { p: [x, y, z], parent: g }));
  return g;
}
export function cloud(parent, p, s = 1) {
  const g = group(parent, p); g.scale.setScalar(s);
  const m = mat('cloud', () => toon('#ffffff', { g: GH, outline: false, emissive: '#3a4a5a' }));
  [[0, 0, 0, 2.2], [-2.2, -.4, 0, 1.6], [2.3, -.3, 0, 1.7], [-1, 1.2, 0, 1.6], [1.2, 1.1, 0, 1.5], [-3.6, -.6, 0, 1], [3.7, -.6, 0, 1.1]].forEach(([x, y, z, r]) => mesh(sphere(r, 16, 12), m, { p: [x, y, z], parent: g, cast: false }));
  return g;
}
export function fence(parent, a, b, o = {}) {
  const g = group(parent); const m = mat('fence' + (o.color || ''), () => toon(o.color || '#f4efe6', { ol: .003 }));
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), len = A.distanceTo(B), n = Math.max(2, Math.round(len / 1.6));
  for (let i = 0; i <= n; i++) { const P = A.clone().lerp(B, i / n); mesh(box(.16, 1.3, .16), m, { p: [P.x, .65, P.z], parent: g }); }
  for (const y of [.5, 1.0]) { const r = mesh(box(len, .12, .07), m, { parent: g }); r.position.set((A.x + B.x) / 2, y, (A.z + B.z) / 2); r.rotation.y = -Math.atan2(B.z - A.z, B.x - A.x); }
  return g;
}
export function pole(parent, p, rotY = 0) {
  const g = group(parent, p, [0, rotY, 0]); const m = mat('pole', () => toon('#6b4a33', { ol: .003 }));
  mesh(cyl(.09, .12, 7, 8), m, { p: [0, 3.5, 0], parent: g });
  mesh(box(2, .14, .14), m, { p: [0, 6.6, 0], parent: g });
  [-.8, -.3, .3, .8].forEach(x => mesh(cyl(.05, .05, .18, 6), mat('ins', () => toon('#9fd0c8')), { p: [x, 6.75, 0], parent: g }));
  return g;
}
export function wire(parent, a, b, sag = .6) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), mid = A.clone().lerp(B, .5); mid.y -= sag;
  const curve = new THREE.QuadraticBezierCurve3(A, mid, B);
  return mesh(new THREE.TubeGeometry(curve, 20, .018, 4), mat('wire', () => toon(INK, { outline: false })), { parent, cast: false });
}
export function signpost(parent, p, labels, rotY = 0) {
  const g = group(parent, p, [0, rotY, 0]);
  mesh(box(.18, 4, .18), mat('post', () => toon('#8a5a33')), { p: [0, 2, 0], parent: g });
  labels.forEach(([txt, y, dir], i) => {
    const b = group(g, [dir * 1.05, y, 0]);
    const m = toon('#ffffff', { map: T.textBoard(txt, { w: 512, h: 128, font: '62px "Special Elite"' }) });
    const shape = new THREE.Shape(); shape.moveTo(-1, -.25); shape.lineTo(.8, -.25); shape.lineTo(1.05, 0); shape.lineTo(.8, .25); shape.lineTo(-1, .25); shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: .08, bevelEnabled: false });
    const uv = geo.attributes.uv; const pos = geo.attributes.position; for (let j = 0; j < uv.count; j++) uv.setXY(j, (pos.getX(j) + 1) / 2.05, (pos.getY(j) + .25) / .5);
    const ms = mesh(geo, m, { parent: b }); ms.scale.x = dir;
  });
  return g;
}
export function hill(parent, p, s, texture, color = '#ffffff') {
  return mesh(sphere(1, 48, 24), toon(color, { map: texture, outline: false }), { p, s, parent, cast: false });
}

// ---------- cow ----------
function cowFaceSVG(e) {
  const eye = (side) => e === 'smug' || e === 'twitch'
    ? `<g transform="rotate(${side * -6})"><path d="M-16 0 A16 14 0 0 0 16 0Z" fill="${INK}" transform="translate(0 ${e === 'twitch' && side > 0 ? 4 : 1})"/><path d="M-21 0 L21 0" stroke="${INK}" stroke-width="7" stroke-linecap="round"/></g>`
    : e === 'wide' ? `<circle r="22" fill="#fff" stroke="${INK}" stroke-width="5"/><circle r="9" fill="${INK}"/>` : `<ellipse rx="11" ry="14" fill="${INK}"/><circle cx="-3" cy="-5" r="3.5" fill="#fff"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="-131 -96 262 175" preserveAspectRatio="none">
    <path d="M-120 -96 Q-60 -90 -40 -40 Q-70 -10 -120 -20Z" fill="#2b2220"/>
    <g transform="translate(-40 -20)">${eye(-1)}</g><g transform="translate(40 -20)">${eye(1)}</g></svg>`;
}
const cowFaceCache = {};
export function cow(parent, p, s = 1) {
  const root = group(parent, p); root.scale.setScalar(s);
  const white = mat('cowW', () => toon('#ffffff', { map: T.cowSpots(3), g: G3, ol: .006 }));
  const plain = mat('cowP', () => toon('#fbf8f2', { g: G3, ol: .006 }));
  const pink = mat('cowPink', () => toon('#f5a3b0', { g: G3, ol: .005 }));
  const hoof = mat('hoof', () => toon('#3b2b25', { g: G3, ol: .004 }));
  const horn = mat('horn', () => toon('#f1e4c0', { g: G3, ol: .004 }));
  const body = mesh(new THREE.CapsuleGeometry(.75, 1.3, 8, 20), white, { p: [0, 1.55, 0], r: [0, 0, 90], parent: root });
  const legs = [];
  [[-.75, .4], [.75, .4], [-.75, -.4], [.75, -.4]].forEach(([x, z]) => { const lg = group(root, [x, 1.2, z]); mesh(cyl(.17, .15, 1.0, 12), plain, { p: [0, -.5, 0], parent: lg }); mesh(cyl(.17, .18, .2, 12), hoof, { p: [0, -1.05, 0], parent: lg }); legs.push(lg); });
  mesh(sphere(.32, 14, 10), pink, { p: [0, 1.0, .2], s: [1, .6, 1], parent: root });
  const tail = group(root, [-1.45, 1.9, 0]); mesh(cyl(.04, .04, 1, 6), plain, { p: [0, -.5, 0], parent: tail }); mesh(sphere(.12, 8, 8), mat('tuft', () => toon('#2b2220')), { p: [0, -1.02, 0], parent: tail });
  const neck = group(root, [1.2, 2.0, 0]);
  const head = group(neck, [.55, .2, 0]);
  mesh(sphere(.62, 32, 24), plain, { s: [.95, 1.05, .95], parent: head });
  const faceMat = basic({ map: blankTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const face = mesh(new THREE.SphereGeometry(.625, 32, 24, Math.PI / 2 - 1.309, 2.618, 35 * D2R, 100 * D2R), faceMat, { parent: head, cast: false, receive: false, s: [.95, 1.05, .95] });
  face.rotation.y = Math.PI / 2; face.renderOrder = 2;
  const muzzle = group(head, [.42, -.38, 0]);
  mesh(sphere(.42, 24, 16), pink, { s: [.75, .62, 1.05], parent: muzzle });
  [-.16, .16].forEach(z => mesh(sphere(.06, 8, 6), mat('nost', () => toon('#7a3a44', { outline: false })), { p: [.3, .02, z], parent: muzzle }));
  [-1, 1].forEach(sd => { mesh(new THREE.ConeGeometry(.09, .4, 10), horn, { p: [.05, .58, sd * .32], r: [sd * -25, 0, -10], parent: head }); mesh(sphere(.22, 12, 8), plain, { p: [-.05, .3, sd * .6], s: [.5, .3, 1], r: [sd * 20, 0, 0], parent: head }); });
  head.rotation.y = 0;
  let cur = '';
  return {
    root, head, neck,
    set(st) {
      const t = st.t || 0;
      const chew = st.chew === false ? 0 : Math.sin(t * 9);
      muzzle.position.y = -.38 + chew * .025; muzzle.scale.y = 1 + chew * .04;
      neck.rotation.set((st.roll || 0) * D2R, (st.yaw || 0) * D2R, (st.pitch || 0) * D2R);
      tail.rotation.x = Math.sin(t * 2.5) * .3;
      legs.forEach((lg, i) => { lg.rotation.z = st.walk ? Math.sin(t * 6 + i * Math.PI * (i % 3 ? 1 : 0)) * .35 : 0; });
      const e = st.eyes || 'dot';
      if (e !== cur) { const tx = cowFaceCache[e]; if (tx) { faceMat.map = tx; cur = e; } else if (!(e in cowFaceCache)) { cowFaceCache[e] = null; pending.push(svgTex(cowFaceSVG(e), 512, 512).then(t2 => { cowFaceCache[e] = t2; })); } }
      return this;
    },
  };
}

// ---------- general store ----------
const signCache = [];
export function store(parent, p, rotY = 0) {
  const g = group(parent, p, [0, rotY, 0]);
  const wall = mat('clap', () => toon('#ffffff', { map: T.clapboard('#cf8d55') }));
  const trim = mat('trim', () => toon('#8e5a35', { ol: .004 }));
  const glow = mat('win', () => toon('#ffe2a0', { emissive: '#ffcf7a', ei: 1.1, ol: .004 }));
  mesh(box(6.2, 4.4, 4.6), wall, { p: [0, 2.2, 0], parent: g });
  // gable roof behind the false front
  const roofShape = new THREE.Shape(); roofShape.moveTo(-3.3, 0); roofShape.lineTo(0, 1.6); roofShape.lineTo(3.3, 0); roofShape.closePath();
  mesh(new THREE.ExtrudeGeometry(roofShape, { depth: 4.8, bevelEnabled: false }), mat('roof', () => toon('#7a4a3a')), { p: [0, 4.4, -2.4], parent: g });
  // false front with sign
  const ff = new THREE.Shape(); ff.moveTo(-3.4, 0); ff.lineTo(3.4, 0); ff.lineTo(3.4, 1.6); ff.lineTo(1.4, 1.6); ff.lineTo(1.4, 2.1); ff.lineTo(-1.4, 2.1); ff.lineTo(-1.4, 1.6); ff.lineTo(-3.4, 1.6); ff.closePath();
  mesh(new THREE.ExtrudeGeometry(ff, { depth: .25, bevelEnabled: false }), mat('ff', () => toon('#b97845', { ol: .005 })), { p: [0, 4.2, 2.3], parent: g });
  const signMat = toon('#ffffff', { map: T.storeSign(1), ol: .004 });
  const sign = mesh(box(5.6, 1.65, .08), signMat, { p: [0, 5.15, 2.6], parent: g });
  // porch
  mesh(box(7.4, .25, 2.2), trim, { p: [0, .12, 3.4], parent: g });
  const roof = mesh(box(7.6, .18, 2.6), mat('proof', () => toon('#8e5a35')), { p: [0, 3.25, 3.55], r: [12, 0, 0], parent: g });
  [-3.5, -1.2, 1.2, 3.5].forEach(x => mesh(cyl(.1, .1, 3.1, 10), mat('post2', () => toon('#a86c40')), { p: [x, 1.7, 4.4], parent: g }));
  // windows + door
  [-1.9, 1.9].forEach(x => { mesh(box(1.5, 1.6, .1), glow, { p: [x, 2.0, 2.32], parent: g }); mesh(box(1.7, .12, .25), trim, { p: [x, 1.15, 2.4], parent: g }); mesh(box(.08, 1.6, .14), trim, { p: [x, 2.0, 2.38], parent: g }); mesh(box(1.5, .08, .14), trim, { p: [x, 2.0, 2.38], parent: g }); });
  mesh(box(1.3, 2.7, .12), mat('door', () => toon('#6d3b1f', { ol: .004 })), { p: [0, 1.6, 2.33], parent: g });
  mesh(box(.9, 1.0, .06), glow, { p: [0, 2.2, 2.4], parent: g });
  // barrels, crates, gas pump
  const barrel = mat('barrel', () => toon('#a0632f')), band = mat('band', () => toon('#4a4a4a'));
  [[-3.1, 3.2], [-2.6, 3.9]].forEach(([x, z]) => { mesh(cyl(.42, .42, 1.0, 16), barrel, { p: [x, .75, z], parent: g }); [.45, 1.05].forEach(y => mesh(cyl(.44, .44, .07, 16), band, { p: [x, y, z], parent: g })); });
  mesh(box(.9, .8, .9), mat('crate', () => toon('#c99b5c', { ol: .004 })), { p: [3.0, .65, 3.3], r: [0, 15, 0], parent: g });
  const pump = group(g, [4.6, 0, 3.6]);
  mesh(cyl(.32, .36, 2.4, 14), mat('pump', () => toon('#d33a2c', { ol: .005 })), { p: [0, 1.2, 0], parent: pump });
  mesh(sphere(.36, 16, 12), mat('globe', () => toon('#fff6c8', { emissive: '#ffe9a0', ei: .7, ol: .004 })), { p: [0, 2.7, 0], parent: pump });
  mesh(box(.42, .5, .05), mat('dial', () => toon('#ffffff', { ol: .003 })), { p: [0, 1.7, .33], parent: pump });
  let curSign = 1;
  return {
    root: g, sign,
    setSign(pr) {
      const i = Math.round(clamp(pr) * 30); if (i === curSign) return; curSign = i;
      signMat.map = signCache[i] || (signCache[i] = T.storeSign(i / 30)); signMat.needsUpdate = true;
    },
  };
}

// ---------- 1930s car (extruded side profile) ----------
export function car(parent, p, color = '#9b2f2f', rotY = 0) {
  const g = group(parent, p, [0, rotY, 0]);
  const sh = new THREE.Shape();
  sh.moveTo(-3.0, .7); sh.lineTo(-3.0, 1.55); sh.quadraticCurveTo(-3.0, 1.75, -2.8, 1.75); sh.lineTo(-1.5, 1.75); sh.lineTo(-1.3, 2.9); sh.lineTo(1.0, 2.9); sh.lineTo(1.5, 1.75);
  sh.lineTo(3.2, 1.45); sh.quadraticCurveTo(3.45, 1.4, 3.45, 1.1); sh.lineTo(3.45, .7); sh.closePath();
  const bodyM = toon(color, { g: G3, ol: .006 });
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 2.2, bevelEnabled: true, bevelThickness: .12, bevelSize: .1, bevelSegments: 3 });
  mesh(geo, bodyM, { p: [0, 0, -1.1], parent: g });
  const glass = mat('glass', () => toon('#bfe2f5', { transparent: true, opacity: .55, ol: .004 }));
  mesh(box(2.0, .9, 2.42), glass, { p: [-.15, 2.3, 0], parent: g });
  const fender = mat('fender', () => toon('#222222', { g: G3, ol: .005 }));
  [-2.1, 2.2].forEach(x => mesh(new THREE.CylinderGeometry(.85, .85, 2.6, 24, 1, false, 0, Math.PI), fender, { p: [x, .75, 0], r: [90, 0, 90], parent: g }));
  const wheels = [];
  [-2.1, 2.2].forEach(x => [-1.15, 1.15].forEach(z => { const w = group(g, [x, .65, z]); mesh(cyl(.65, .65, .32, 24), mat('tire', () => toon('#1d1d1d', { ol: .004 })), { r: [90, 0, 0], parent: w }); mesh(cyl(.36, .36, .36, 16), mat('rim', () => toon('#d9d2c3', { ol: .003 })), { r: [90, 0, 0], parent: w }); [0, 60, 120].forEach(a => mesh(box(.66, .06, .38), mat('spoke', () => toon('#555555', { outline: false })), { r: [0, 0, a], parent: w })); wheels.push(w); }));
  [-1, 1].forEach(z => mesh(sphere(.22, 12, 10), mat('lamp', () => toon('#fff6c8', { emissive: '#fff0b0', ei: .8, ol: .004 })), { p: [3.4, 1.55, z * .8], parent: g }));
  mesh(box(.15, .7, 1.8), mat('grill', () => toon('#c0c0c0', { ol: .003 })), { p: [3.5, 1.05, 0], parent: g });
  return { root: g, setWheel(a) { wheels.forEach(w => { w.rotation.z = -a; }); } };
}

// ---------- office furniture ----------
export function draftingDesk(parent, p, o = {}) {
  const g = group(parent, p, [0, o.rotY || 0, 0]);
  const wood = mat('deskwood' + (o.rival ? 'r' : ''), () => toon('#ffffff', { map: T.wood(o.rival ? '#6a3220' : '#b0703c', { repeat: [1, 1], plank: 128 }) }));
  const H = o.h || 2.3;
  const top = group(g, [0, H, 0], [o.tilt ?? 14, 0, 0]);
  mesh(box(5.2, .18, o.depth || 3.0), wood, { parent: top });
  const mapPlane = mesh(new THREE.PlaneGeometry(o.depth ? 2.9 : 3.6, o.depth ? 2.1 : 2.6), toon('#ffffff', { outline: false }), { p: [-.2, .1, .05], r: [-90, 0, 0], parent: top });
  const dz = (o.depth || 3.0) / 2 - .2;
  [[-2.4, -dz], [2.4, -dz], [-2.4, dz], [2.4, dz]].forEach(([x, z]) => mesh(box(.2, H, .2), wood, { p: [x, H / 2, z], parent: g }));
  mesh(box(5.0, .15, .15), wood, { p: [0, .5, dz], parent: g });
  // ink, ruler, pencils on the top
  mesh(cyl(.18, .22, .35, 14), mat('ink', () => toon('#2b4b8a', { g: G3 })), { p: [2.0, .27, -.5], parent: top });
  mesh(box(1.8, .03, .22), mat('ruler', () => toon('#e8d28a')), { p: [1.6, .11, .6], r: [0, 20, 0], parent: top });
  mesh(cyl(.04, .04, 1.1, 6), mat('pencil', () => toon('#f2c14e')), { p: [-2.1, .12, .8], r: [0, 0, 90], parent: top });
  return { root: g, top, mapPlane };
}
export function hangingLamp(parent, p, o = {}) {
  const g = group(parent, p);
  mesh(cyl(.02, .02, o.cord || 3, 6), mat('cord', () => toon(INK, { outline: false })), { p: [0, (o.cord || 3) / 2, 0], parent: g, cast: false });
  mesh(new THREE.LatheGeometry([new THREE.Vector2(.05, .1), new THREE.Vector2(.25, .05), new THREE.Vector2(.65, -.35), new THREE.Vector2(.72, -.5)], 24), mat('shade' + (o.color || ''), () => toon(o.color || '#2f6f6a', { side: THREE.DoubleSide, ol: .005 })), { parent: g, cast: false });
  mesh(sphere(.2, 12, 10), mat('bulb', () => toon('#fff6d6', { emissive: '#ffe9b0', ei: 2.2, outline: false })), { p: [0, -.35, 0], parent: g, cast: false });
  const light = new THREE.PointLight('#ffd9a0', o.intensity ?? 12, 14, 1.6); light.position.set(0, -.6, 0); g.add(light);
  return g;
}
export function frameWithTexture(parent, p, w, h, texture, o = {}) {
  const g = group(parent, p, o.r);
  mesh(box(w + .3, h + .3, .12), mat('gold' + (o.frame || ''), () => toon(o.frame || '#d8a640', { g: G3, ol: .005 })), { parent: g });
  mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: texture, outline: false }), { p: [0, 0, .07], parent: g });
  return g;
}
export function shelf(parent, p) {
  const g = group(parent, p); const wood = mat('shelf', () => toon('#7a4a2a', { ol: .004 }));
  [0, 1.3, 2.6].forEach(y => mesh(box(3, .12, .8), wood, { p: [0, y, 0], parent: g }));
  [-1.45, 1.45].forEach(x => mesh(box(.1, 2.8, .8), wood, { p: [x, 1.3, 0], parent: g }));
  for (let i = 0; i < 7; i++) mesh(cyl(.13, .13, .75, 12), mat('roll' + (i % 3), () => toon(['#efe2c4', '#e6d3a8', '#f4ead2'][i % 3], { ol: .003 })), { p: [-1.1 + i * .36, .2 + .13, 0], r: [90, 0, 0], parent: g });
  for (let i = 0; i < 9; i++) mesh(box(.22, .8 + (i % 3) * .12, .6), mat('book' + (i % 4), () => toon(['#8b3a2e', '#2f5d8a', '#3f7a3f', '#c08a2e'][i % 4], { ol: .003 })), { p: [-1.2 + i * .27, 1.36 + .42, 0], parent: g });
  // globe
  mesh(sphere(.42, 24, 16), mat('globe2', () => toon('#5fa0d0', { ol: .004 })), { p: [.7, 3.1, 0], parent: g });
  mesh(cyl(.08, .2, .25, 10), wood, { p: [.7, 2.75, 0], parent: g });
  return g;
}
export function bankerLamp(parent, p) {
  const g = group(parent, p);
  mesh(cyl(.25, .3, .1, 16), mat('brass', () => toon('#d8a640', { g: G3 })), { parent: g });
  mesh(cyl(.04, .04, .9, 8), mat('brass', () => toon('#d8a640', { g: G3 })), { p: [0, .45, 0], parent: g });
  mesh(new THREE.CylinderGeometry(.18, .5, .35, 20, 1, true, 0, Math.PI), mat('green', () => toon('#2f7d4a', { side: THREE.DoubleSide, ol: .004 })), { p: [0, .95, 0], r: [90, 0, 90], parent: g });
  const l = new THREE.PointLight('#ffe2a0', 5, 6, 1.6); l.position.set(0, .7, .1); g.add(l);
  return g;
}
export function safe(parent, p) {
  const g = group(parent, p);
  mesh(box(1.6, 2.0, 1.2), mat('safe', () => toon('#3d4148', { g: G3, ol: .005 })), { p: [0, 1, 0], parent: g });
  mesh(cyl(.32, .32, .1, 24), mat('dial2', () => toon('#8a9099', { g: G3 })), { p: [0, 1.2, .62], r: [90, 0, 0], parent: g });
  mesh(box(.5, .08, .1), mat('handle', () => toon('#c9a14a', { g: G3 })), { p: [0, .7, .64], parent: g });
  return g;
}
export function plant(parent, p) {
  const g = group(parent, p);
  mesh(cyl(.35, .28, .6, 16), mat('pot', () => toon('#b5603a')), { p: [0, .3, 0], parent: g });
  [[0, 1.0, 0, .45], [.3, 1.3, .1, .35], [-.3, 1.25, -.1, .38], [0, 1.55, 0, .3]].forEach(([x, y, z, r]) => mesh(sphere(r, 12, 10), mat('leaf0', () => toon('#3f9a3a')), { p: [x, y, z], parent: g }));
  return g;
}

// ---------- hand props ----------
export function pen() { const g = new THREE.Group(); mesh(cyl(.05, .05, .7, 10), mat('penb', () => toon('#2a2a2a', { g: G3, ol: .003 })), { p: [0, .3, 0], parent: g }); mesh(new THREE.ConeGeometry(.05, .14, 10), mat('nib', () => toon('#c9a14a', { g: G3 })), { p: [0, -.12, 0], r: [180, 0, 0], parent: g }); return g; }
export function teacup() { const g = new THREE.Group(); const w = mat('china', () => toon('#ffffff', { g: G3, ol: .004 })); mesh(new THREE.CylinderGeometry(.2, .14, .26, 18, 1, true), w, { p: [0, .13, 0], parent: g }); mesh(cyl(.19, .19, .02, 18), mat('tea', () => toon('#8a4b22', { outline: false })), { p: [0, .22, 0], parent: g }); mesh(new THREE.TorusGeometry(.08, .025, 6, 12), w, { p: [.22, .14, 0], parent: g }); mesh(cyl(.3, .3, .03, 20), w, { p: [0, 0, 0], parent: g }); return g; }
export function phone() { const g = new THREE.Group(); const b = mat('bake', () => toon('#2b2b2b', { g: G3, ol: .004 })); mesh(cyl(.06, .06, .9, 10), b, { p: [0, .3, 0], parent: g }); mesh(new THREE.ConeGeometry(.16, .22, 14), b, { p: [0, .82, .06], r: [-70, 0, 0], parent: g }); mesh(cyl(.22, .26, .1, 16), b, { p: [0, -.15, 0], parent: g }); return g; }
export function rolledMap() { const g = new THREE.Group(); mesh(cyl(.12, .12, 1.4, 14), mat('rollm', () => toon('#efe2c4', { g: G3, ol: .004 })), { r: [0, 0, 70], parent: g }); mesh(cyl(.125, .125, .08, 14), mat('band2', () => toon('#c9452f')), { r: [0, 0, 70], parent: g }); return g; }
export function miniMap(texture, tilt = 0) { const g = new THREE.Group(); mesh(box(.85, 1.1, .03), toon('#ffffff', { map: texture, ol: .004 }), { r: [0, 0, tilt], p: [0, .45, .05], parent: g }); return g; }
export function brush() { const g = new THREE.Group(); mesh(cyl(.035, .035, 1.6, 8), mat('bh', () => toon('#b8763d')), { p: [0, .7, 0], parent: g }); mesh(box(.22, .14, .08), mat('ferr', () => toon('#aaaaaa')), { p: [0, 1.52, 0], parent: g }); mesh(box(.22, .22, .09), mat('brist', () => toon('#c0392b')), { p: [0, 1.7, 0], parent: g }); return g; }
export function lightbulb(parent, p) {
  const g = group(parent, p);
  const glass = mat('bulbg', () => toon('#fff3a6', { emissive: '#ffe680', ei: 1.6, g: GH, ol: .006 }));
  mesh(sphere(.6, 24, 18), glass, { p: [0, .3, 0], parent: g });
  mesh(cyl(.28, .28, .45, 16), mat('base', () => toon('#9aa3ad', { g: G3, ol: .005 })), { p: [0, -.45, 0], parent: g });
  const l = new THREE.PointLight('#ffe680', 0, 8, 1.5); l.position.set(0, .3, .5); g.add(l);
  return { root: g, light: l };
}
export function magnifier(parent, lensTex) {
  const g = group(parent);
  mesh(new THREE.TorusGeometry(1, .12, 12, 48), mat('goldR', () => toon('#e2b33f', { g: G3, ol: .006 })), { parent: g });
  const lensMat = toon('#ffffff', { map: lensTex, g: GH, outline: false, emissive: '#202020' });
  const lens = mesh(new THREE.CircleGeometry(.98, 48), lensMat, { p: [0, 0, .01], parent: g, cast: false });
  mesh(new THREE.CircleGeometry(.98, 48), basic({ color: '#ffffff', transparent: true, opacity: .12 }), { p: [0, 0, .03], parent: g, cast: false });
  mesh(cyl(.13, .15, 1.6, 12), mat('handleW', () => toon('#6b3a1e', { g: G3, ol: .005 })), { p: [0, -1.85, 0], parent: g });
  return { root: g, lens, lensMat };
}
export function mousetrap(parent, p) {
  const g = group(parent, p);
  const wood = mat('trapw', () => toon('#ffffff', { map: T.wood('#d9a35f', { plank: 512 }), g: G3, ol: .006 }));
  mesh(box(4.2, .35, 1.9), wood, { p: [0, .17, 0], parent: g });
  const metal = mat('metal', () => toon('#c9ccd1', { g: G3, ol: .004 }));
  const bar = group(g, [-.3, .42, 0]);
  const frame = new THREE.Shape(); frame.moveTo(0, -.8); frame.lineTo(2.2, -.8); frame.lineTo(2.2, .8); frame.lineTo(0, .8);
  mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, -.8), new THREE.Vector3(2.1, 0, -.8), new THREE.Vector3(2.2, 0, 0), new THREE.Vector3(2.1, 0, .8), new THREE.Vector3(0, 0, .8)]), 30, .05, 6), metal, { parent: bar });
  mesh(new THREE.TorusGeometry(.18, .05, 6, 16), metal, { p: [-.3, .45, -.5], r: [0, 90, 0], parent: g });
  mesh(new THREE.TorusGeometry(.18, .05, 6, 16), metal, { p: [-.3, .45, .5], r: [0, 90, 0], parent: g });
  // cheese + flag (the bait)
  const ch = new THREE.Shape(); ch.moveTo(0, 0); ch.lineTo(1.2, 0); ch.lineTo(0, .7); ch.closePath();
  mesh(new THREE.ExtrudeGeometry(ch, { depth: .7, bevelEnabled: false }), mat('cheese', () => toon('#ffd34d', { g: G3, ol: .005 })), { p: [.9, .35, -.35], parent: g });
  mesh(cyl(.025, .025, 1.6, 6), mat('flagp', () => toon(INK)), { p: [1.3, 1.15, 0], parent: g });
  mesh(new THREE.PlaneGeometry(1.0, .55), toon('#ffffff', { map: T.textBoard('AGLOE', { w: 256, h: 128, bg: '#d6262b', color: '#fff', font: '58px "Alfa Slab One"' }), side: THREE.DoubleSide, ol: .003 }), { p: [1.82, 1.7, 0], parent: g });
  return { root: g, setSnap(a) { bar.rotation.z = (1 - a) * 165 * D2R; } };
}
let billTex = null;
export function bills(parent, n) {
  billTex = billTex || T.banknote();
  const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.1, .52), toon('#ffffff', { map: billTex, side: THREE.DoubleSide, outline: false }), n);
  im.castShadow = true; im.receiveShadow = true; parent.add(im); return im;
}
// 3D letters
let FONT = null;
export async function loadFont() { if (!FONT) FONT = await new FontLoader().loadAsync('/node_modules/three/examples/fonts/helvetiker_bold.typeface.json'); return FONT; }
export function letter(ch, color, size = 1) {
  const geo = new TextGeometry(ch, { font: FONT, size, depth: size * .35, curveSegments: 6, bevelEnabled: true, bevelThickness: size * .04, bevelSize: size * .03, bevelSegments: 2 });
  geo.computeBoundingBox(); const bb = geo.boundingBox; geo.translate(-(bb.max.x + bb.min.x) / 2, -(bb.max.y + bb.min.y) / 2, -(bb.max.z + bb.min.z) / 2);
  return new THREE.Mesh(geo, toon(color, { g: G3, ol: .006 }));
}
