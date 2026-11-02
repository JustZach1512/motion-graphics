// The sets. Each builder returns { scene, ...named objects } ready for shots to pose.
import { THREE, toon, basic, G3, G5, GH, mesh, group, sphere, box, cyl, D2R, hash, rnd, ctex, INK } from './engine.js';
import * as T from './textures.js';
import * as P from './props.js';

function sky(top, bottom, horizonGlow) {
  return ctex(16, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(.75, bottom); g.addColorStop(1, horizonGlow || bottom); x.fillStyle = g; x.fillRect(0, 0, w, h); });
}
function sun(scene, color, intensity, pos, size = 12, target = [0, 0, 0]) {
  const l = new THREE.DirectionalLight(color, intensity); l.position.set(...pos); l.castShadow = true;
  l.shadow.mapSize.set(2048, 2048); Object.assign(l.shadow.camera, { left: -size, right: size, top: size, bottom: -size, near: .5, far: 150 }); l.shadow.bias = -.0004; l.shadow.normalBias = .02; l.shadow.radius = 3;
  l.target.position.set(...target); scene.add(l, l.target); return l;
}
const noShadow = o => { o.traverse(m => { m.castShadow = false; }); return o; };

// light shaft through a window: additive gradient quad
function beam(parent, a, b, c, d, opacity = .22) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...d], 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2)); geo.setIndex([0, 1, 2, 0, 2, 3]);
  const t = ctex(64, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(1, 'rgba(255,240,200,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const m = basic({ map: t, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  return mesh(geo, m, { parent, cast: false, receive: false });
}
function dust(parent, n, box3) {
  const pos = new Float32Array(n * 3);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const tx = ctex(32, 32, (x) => { const g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,248,220,1)'); g.addColorStop(1, 'rgba(255,248,220,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); });
  const m = new THREE.PointsMaterial({ size: .07, map: tx, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .8 }); m.userData.outlineParameters = { visible: false };
  const pts = new THREE.Points(geo, m); parent.add(pts);
  return t => { for (let i = 0; i < n; i++) { const [x0, x1, y0, y1, z0, z1] = box3; pos[i * 3] = x0 + hash(i) * (x1 - x0) + Math.sin(t * .3 + i) * .2; pos[i * 3 + 1] = y0 + ((hash(i + 7) * (y1 - y0) + t * (.05 + hash(i) * .1)) % (y1 - y0)); pos[i * 3 + 2] = z0 + hash(i + 3) * (z1 - z0); } geo.attributes.position.needsUpdate = true; };
}

// ---------- Otto's office ----------
export async function office(maps) {
  const s = new THREE.Scene(); s.background = new THREE.Color('#2c6964');
  s.add(new THREE.HemisphereLight('#fff0dc', '#5a3a20', .75));
  const key = sun(s, '#ffeccc', 1.5, [-7, 10, 9], 9, [0, 2, -1]);
  const fill = new THREE.DirectionalLight('#cfe0ff', .35); fill.position.set(8, 4, 6); s.add(fill);
  const floorT = T.wood('#8a5530', { repeat: [5, 4], plank: 48 });
  mesh(new THREE.PlaneGeometry(24, 16), toon('#ffffff', { map: floorT, outline: false }), { r: [-90, 0, 0], p: [0, 0, 2], parent: s });
  mesh(new THREE.PlaneGeometry(24, 10), toon('#ffffff', { map: T.wallpaper('#2c6964', '#357872', { repeat: [6, 2.5] }), outline: false }), { p: [0, 5, -4], parent: s });
  mesh(new THREE.PlaneGeometry(16, 10), toon('#ffffff', { map: T.wallpaper('#2c6964', '#357872', { repeat: [4, 2.5] }), outline: false }), { p: [-7, 5, 4], r: [0, 90, 0], parent: s });
  mesh(box(24, 1.5, .2), toon('#ffffff', { map: T.panels('#6e4124') }), { p: [0, .75, -3.9], parent: s });
  mesh(box(24, .18, .3), toon('#4e2c16'), { p: [0, 1.55, -3.85], parent: s });
  mesh(box(24, .3, .3), toon('#4e2c16', { outline: false }), { p: [0, 7.6, -3.85], parent: s });
  // window with the city outside
  const win = group(s, [3.6, 4.0, -3.95]);
  mesh(new THREE.PlaneGeometry(2.6, 3.2), basic({ map: T.skyline() }), { parent: win, cast: false });
  const fr = toon('#5a3418', { ol: .005 });
  [[0, 1.65, 2.9, .22], [0, -1.65, 3.2, .3], [-1.35, 0, .22, 3.5], [1.35, 0, .22, 3.5], [0, 0, .1, 3.2], [0, .2, 2.6, .1]].forEach(([x, y, w, h]) => mesh(box(w, h, .25), fr, { p: [x, y, .1], parent: win }));
  beam(s, [2.4, 5.4, -3.8], [4.9, 5.4, -3.8], [1.5, 0.02, 3.5], [-1.6, 0.02, 3.5], .16);
  const dustFn = dust(s, 70, [-1.5, 4.5, .5, 5, -3, 3]);
  // wall map and poster
  const wallMap = P.frameWithTexture(s, [-2.6, 4.1, -3.88], 2.4, 3.12, maps.plain);
  P.frameWithTexture(s, [.55, 4.6, -3.88], 1.1, 1.54, T.poster([['MAPAS', '74px "Alfa Slab One"', 150], ['DE', '50px "Alfa Slab One"', 220], ['CARRETERAS', '50px "Alfa Slab One"', 290], ['· 1931 ·', '40px "Special Elite"', 380, '#2d2016'], ['OTTO & ERNEST', '34px "Special Elite"', 470, '#2d2016']]), { frame: '#5a3418' });
  P.shelf(s, [-5.3, 0, -3.4]);
  const cab = group(s, [6.2, 0, -3.3]); mesh(box(1.4, 3.2, 1.2), toon('#6a6f78', { g: G3, ol: .005 }), { p: [0, 1.6, 0], parent: cab }); [.6, 1.6, 2.6].forEach(y => mesh(box(.5, .1, .1), toon('#c9a14a'), { p: [0, y, .62], parent: cab }));
  P.plant(s, [5.2, 0, -3.2]);
  const desk = P.draftingDesk(s, [0, 0, .9], { h: 1.55, tilt: 10, depth: 2.2 });
  desk.mapPlane.material.map = maps.plain; desk.mapPlane.material.needsUpdate = true;
  const lamp = P.hangingLamp(s, [2.7, 5.6, -.4], { cord: 3 });
  const pin = group(desk.top, [.15, .1, -.2]); mesh(cyl(.02, .02, .5, 6), toon('#888888'), { p: [0, .25, 0], parent: pin }); mesh(sphere(.13, 14, 10), toon('#d6262b', { g: G3, ol: .004 }), { p: [0, .55, 0], parent: pin }); pin.visible = false;
  return { scene: s, key, desk, wallMap, lamp, pin, update(t) { dustFn(t); } };
}

// ---------- the competition's office ----------
export async function rivalOffice(maps) {
  const s = new THREE.Scene(); s.background = new THREE.Color('#5a1e1e');
  s.add(new THREE.HemisphereLight('#ffe2c8', '#3a1a10', .7));
  sun(s, '#ffe0b8', 1.35, [-6, 9, 9], 9, [0, 2, -1]);
  const fill = new THREE.DirectionalLight('#ffd0d0', .3); fill.position.set(8, 4, 6); s.add(fill);
  mesh(new THREE.PlaneGeometry(24, 16), toon('#ffffff', { map: T.wood('#5a2c18', { repeat: [5, 4], plank: 48 }), outline: false }), { r: [-90, 0, 0], p: [0, 0, 2], parent: s });
  mesh(new THREE.PlaneGeometry(24, 10), toon('#ffffff', { map: T.wallpaper('#6e2424', '#7d2f2b', { repeat: [6, 2.5], motif: '#a0483c' }), outline: false }), { p: [0, 5, -4], parent: s });
  mesh(box(24, 1.5, .2), toon('#ffffff', { map: T.panels('#3e1a0e') }), { p: [0, .75, -3.9], parent: s });
  mesh(box(24, .18, .3), toon('#2e160c'), { p: [0, 1.55, -3.85], parent: s });
  P.frameWithTexture(s, [-2.4, 4.4, -3.88], 1.9, 2.4, T.portrait());
  P.safe(s, [4.2, 0, -3.2]);
  P.plant(s, [-5.0, 0, -3.0]);
  const copyOnWall = P.frameWithTexture(s, [1.4, 4.6, -3.88], 1.5, 1.95, maps.copy, { frame: '#2e160c' });
  const desk = group(s, [0, 0, .9]);
  const dw = toon('#ffffff', { map: T.wood('#5e2a17', { plank: 128 }) });
  mesh(box(5.6, .2, 2.0), dw, { p: [0, 1.55, 0], parent: desk });
  mesh(box(5.4, 1.45, .15), dw, { p: [0, .725, .9], parent: desk });
  [-2.6, 2.6].forEach(x => mesh(box(.3, 1.45, 1.8), dw, { p: [x, .725, 0], parent: desk }));
  const deskMap = mesh(new THREE.PlaneGeometry(1.6, 2.08), toon('#ffffff', { map: maps.plain, outline: false }), { p: [-.7, 1.66, .1], r: [-90, 0, 12], parent: desk });
  P.bankerLamp(desk, [2.0, 1.65, -.3]);
  const cup = P.teacup(); cup.position.set(1.2, 1.66, .4); desk.add(cup);
  return { scene: s, desk, deskMap, cup, copyOnWall };
}

// ---------- New York street, 1930s ----------
export async function city() {
  const s = new THREE.Scene(); s.background = sky('#6f9fd8', '#f6c9a0', '#ffe2b8'); s.fog = new THREE.Fog('#f3d2ad', 40, 160);
  s.add(new THREE.HemisphereLight('#c8dcff', '#8a6a50', .75));
  sun(s, '#ffd9a8', 1.7, [-25, 18, 12], 30, [0, 0, -6]);
  const asphalt = ctex(512, 512, (x, w, h) => { x.fillStyle = '#5a5f66'; x.fillRect(0, 0, w, h); const r = rnd(12); for (let i = 0; i < 9000; i++) { x.fillStyle = r() > .5 ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.08)'; x.fillRect(r() * w, r() * h, 2, 2); } x.fillStyle = '#e8d27a'; for (let i = 0; i < w; i += 128) x.fillRect(i, 248, 70, 16); }, { repeat: [16, 1] });
  mesh(new THREE.PlaneGeometry(400, 10), toon('#ffffff', { map: asphalt, outline: false }), { r: [-90, 0, 0], p: [0, 0, 0], parent: s });
  mesh(box(400, .3, 4), toon('#b9b4a8', { outline: false }), { p: [0, .15, -7], parent: s });
  mesh(box(400, .3, 6), toon('#b9b4a8', { outline: false }), { p: [0, .15, 8], parent: s });
  mesh(new THREE.PlaneGeometry(400, 400), toon('#9a8a74', { outline: false }), { r: [-90, 0, 0], p: [0, -.05, -100], parent: s, cast: false });
  const cols = ['#a0573f', '#8e4c38', '#b2694a', '#9a5440', '#c78a5a', '#8f6a55', '#b5806a'];
  const rows = [[-12, 0], [14, 180]];
  let x = -60; let i = 0;
  for (const [rz, rr] of rows) { x = -60;
  while (x < 120) {
    const w = 4 + hash(i) * 2.5, h = 7 + hash(i + 3) * 9 + (rz > 0 ? 3 : 0), d = 6;
    const b = group(s, [x + w / 2, 0, rz], [0, rr, 0]);
    const bt = T.brick(cols[i % cols.length], { seed: i + 1, cols: Math.round(w / 1.3), rows: Math.round(h / 1.6), lit: .25 });
    mesh(box(w, h, d), toon('#ffffff', { map: bt, ol: .004 }), { p: [0, h / 2, 0], parent: b });
    mesh(box(w + .4, .5, d + .4), toon('#6b3324', { ol: .004 }), { p: [0, h + .25, 0], parent: b });
    if (hash(i + 9) > .55) { const wt = group(b, [hash(i) * 1.5 - .7, h + .5, -1]); mesh(cyl(.9, .9, 1.7, 14), toon('#8a5a3a', { ol: .004 }), { p: [0, 1.9, 0], parent: wt }); mesh(new THREE.ConeGeometry(1.0, .8, 14), toon('#5a3a2a'), { p: [0, 3.15, 0], parent: wt }); [[-.6, -.6], [.6, -.6], [-.6, .6], [.6, .6]].forEach(([a, c]) => mesh(cyl(.06, .06, 1.1, 6), toon('#3a2a20'), { p: [a, .55, c], parent: wt })); }
    if (hash(i + 5) > .6) mesh(new THREE.PlaneGeometry(1.6, 2.2), toon('#ffffff', { map: T.poster([['ROAD', '80px "Alfa Slab One"', 170], ['MAPS', '80px "Alfa Slab One"', 260], ['5¢', '120px "Alfa Slab One"', 430, '#2d2016']], { bg: '#f1e2bf' }), outline: false }), { p: [0, 2.0, 3.02], parent: b });
    x += w + .1; i++;
  } }
  // distant skyline + art deco tower
  for (let j = 0; j < 22; j++) { const w = 5 + hash(j + 40) * 6, h = 20 + hash(j + 50) * 40; mesh(box(w, h, 6), toon('#9fb0cf', { outline: false }), { p: [130 + hash(j + 9) * 40, h / 2, -40 + j * 4], parent: s, cast: false }); }
  const deco = group(s, [150, 0, -4]);
  [[9, 50, 9], [7, 12, 7], [5, 9, 5], [3, 7, 3]].reduce((y, [w, h, d]) => { mesh(box(w, h, d), toon('#c9cfdb', { outline: false }), { p: [0, y + h / 2, 0], parent: deco, cast: false }); return y + h; }, 0);
  mesh(new THREE.ConeGeometry(1.2, 14, 8), toon('#dfe3ea', { outline: false }), { p: [0, 85, 0], parent: deco, cast: false });
  for (let j = -4; j <= 10; j++) { const lp = group(s, [j * 9, .3, -5.5]); mesh(cyl(.09, .12, 4.5, 8), toon('#2c3440', { ol: .003 }), { p: [0, 2.25, 0], parent: lp }); mesh(sphere(.3, 12, 10), toon('#fff3c0', { emissive: '#ffe9a0', ei: .6, ol: .003 }), { p: [0, 4.6, 0], parent: lp }); }
  const carA = P.car(s, [0, 0, -1.6], '#2f4f8f');
  const carB = P.car(s, [0, 0, 2], '#9b2f2f', 180);
  P.cloud(s, [-30, 45, -120], 3); P.cloud(s, [25, 50, -130], 2.6);
  return { scene: s, carA, carB };
}

// ---------- countryside crossroads ----------
export async function country() {
  const s = new THREE.Scene(); s.background = sky('#3f95e6', '#a8d8ff', '#e2f3ff'); s.fog = new THREE.Fog('#cfe6ff', 70, 260);
  s.add(new THREE.HemisphereLight('#d4ecff', '#6a8a4a', .85));
  const key = sun(s, '#fff1d6', 1.65, [22, 30, 18], 22, [2, 0, -2]);
  mesh(new THREE.PlaneGeometry(600, 600), toon('#ffffff', { map: T.grass({ repeat: [90, 90], flowers: true }), outline: false }), { r: [-90, 0, 0], parent: s, cast: false });
  const dirtT = T.dirt({ repeat: [1, 60], tracks: true });
  mesh(new THREE.PlaneGeometry(3.4, 300), toon('#ffffff', { map: dirtT, outline: false }), { r: [-90, 0, 90], p: [0, .015, 0], parent: s, cast: false });
  mesh(new THREE.PlaneGeometry(3.4, 300), toon('#ffffff', { map: T.dirt({ repeat: [1, 60], tracks: true }), outline: false }), { r: [-90, 0, 0], p: [0, .02, 0], parent: s, cast: false });
  const q = T.quilt({ repeat: [3, 2] });
  P.hill(s, [-70, -28, -120], [80, 40, 50], q); P.hill(s, [60, -34, -140], [90, 44, 50], T.quilt({ seed: 9, repeat: [3, 2] })); P.hill(s, [0, -40, -200], [140, 50, 40], T.quilt({ seed: 4, repeat: [4, 2] }));
  P.hill(s, [-150, -30, -300], [160, 70, 60], null, '#8fbfa8'); P.hill(s, [180, -30, -320], [180, 80, 60], null, '#9cc7b0');
  for (let i = 0; i < 9; i++) P.poplar(s, [-36 + i * 4.2, 0, -40 - (i % 2) * 2], 1.1);
  for (let i = 0; i < 7; i++) P.poplar(s, [18 + i * 4.5, 0, -46 - (i % 2) * 3], 1.1);
  [[-14, -12, 1.2, 0], [-22, 6, 1.4, 1], [16, 10, 1.3, 2], [26, -20, 1.5, 1], [-9, 16, 1.1, 2], [12, -26, 1.3, 0], [-30, -24, 1.6, 2]].forEach(([x, z, sc, sd]) => P.tree(s, [x, 0, z], sc, sd));
  [[-6, -3.5], [5, 4], [-8, 6]].forEach(([x, z]) => P.bush(s, [x, 0, z], 1));
  P.fence(s, [-40, 0, -2.4], [-2.4, 0, -2.4]); P.fence(s, [12, 0, -2.4], [40, 0, -2.4]);
  P.fence(s, [-40, 0, 2.4], [-2.4, 0, 2.4]); P.fence(s, [2.4, 0, 2.4], [40, 0, 2.4]);
  P.fence(s, [-2.4, 0, 2.4], [-2.4, 0, 40]); P.fence(s, [2.4, 0, 2.4], [2.4, 0, 40]);
  for (let px = -48; px <= 48; px += 12) P.pole(s, [px, 0, -3.4]);
  for (let px = -48; px < 48; px += 12) for (const dx of [-.8, .8]) P.wire(s, [px + dx, 6.75, -3.4], [px + 12 + dx, 6.75, -3.4], .7);
  const sign = P.signpost(s, [-3.2, 0, 3.4], [['ROSCOE 4 MI', 3.3, 1], ['ROCKLAND 2 MI', 2.6, -1]], -20);
  [[-60, 34, -150, 4], [10, 40, -170, 3.6], [70, 30, -140, 3.2], [-20, 26, -110, 2.4], [40, 48, -200, 4.5]].forEach(([x, y, z, sc]) => P.cloud(s, [x, y, z], sc));
  const shop = P.store(s, [7.6, 0, -7.4], 0);
  const cows = [P.cow(s, [-6, 0, -8], .9), P.cow(s, [-10, 0, -10.5], .9), P.cow(s, [5, 0, 7], .9)];
  cows[0].root.rotation.y = 20 * D2R; cows[1].root.rotation.y = -30 * D2R; cows[2].root.rotation.y = 160 * D2R;
  const carP = P.car(s, [-7, 0, 4.6], '#9b2f2f', 0);
  return { scene: s, key, shop, cows, car: carP, sign };
}

// ---------- top-down map on a desk ----------
export async function mapDesk(maps) {
  const s = new THREE.Scene(); s.background = new THREE.Color('#5a3418');
  s.add(new THREE.HemisphereLight('#fff2dc', '#4a2a14', .8));
  sun(s, '#ffefd0', 1.3, [-6, 14, 5], 10, [1, 0, -1]);
  mesh(new THREE.PlaneGeometry(40, 40), toon('#ffffff', { map: T.wood('#7a4524', { repeat: [3, 3], plank: 160 }), outline: false }), { r: [-90, 0, 0], p: [0, -.02, 0], parent: s });
  const sheet = mesh(new THREE.PlaneGeometry(10, 13), toon('#ffffff', { map: maps.plain, outline: false }), { r: [-90, 0, 0], p: [0, 0, 0], parent: s, cast: false });
  const A = { x: (T.AX / 1000 - .5) * 10, z: (T.AY / 1300 - .5) * 13 };
  const dot = mesh(new THREE.PlaneGeometry(.55, .55), basic({ map: T.dotTex(), transparent: true, depthWrite: false }), { r: [-90, 0, 0], p: [A.x, .01, A.z], parent: s, cast: false });
  const labelT = T.labelTex(); labelT.wrapS = THREE.ClampToEdgeWrapping;
  const label = mesh(new THREE.PlaneGeometry(1.6, .4), basic({ map: labelT, transparent: true, depthWrite: false }), { r: [-90, 0, 0], p: [A.x + .95, .012, A.z - .18], parent: s, cast: false });
  const circle = mesh(new THREE.PlaneGeometry(2.8, 1.4), basic({ map: T.circleTex(0), transparent: true, depthWrite: false }), { r: [-90, 0, 0], p: [A.x + .7, .014, A.z - .2], parent: s, cast: false });
  // desk clutter
  const cup = P.teacup(); cup.position.set(-6.5, 0, 3); cup.scale.setScalar(2.4); s.add(cup);
  mesh(box(5, .05, .6), toon('#e8d28a'), { p: [6.4, .03, 2], r: [0, 70, 0], parent: s });
  mesh(cyl(.08, .08, 2.6, 6), toon('#f2c14e'), { p: [-6, .08, -4], r: [0, 30, 90], parent: s });
  // pen in a stick hand
  const hand = group(s);
  const penM = P.pen(); penM.scale.setScalar(2.2); penM.rotation.set(0, 0, 25 * D2R); hand.add(penM);
  const arm = mesh(cyl(.09, .09, 1, 8), toon(INK, { outline: false }), { parent: hand });
  arm.position.set(1.9, 2.2, 1.5); arm.scale.set(1, 4.5, 1); arm.rotation.set(-35 * D2R, 0, 50 * D2R);
  mesh(sphere(.2, 12, 10), toon(INK, { outline: false }), { p: [.35, .95, .1], parent: hand });
  hand.visible = false;
  // 3D letters for the name shot
  await P.loadFont();
  const letters = group(s);
  const L = { O: P.letter('O', '#fff4dc', 1), G: P.letter('G', '#fff4dc', 1), L: P.letter('L', '#fff4dc', 1), E: P.letter('E', '#fff4dc', 1), A: P.letter('A', '#fff4dc', 1) };
  Object.values(L).forEach(m => { m.castShadow = true; letters.add(m); });
  letters.visible = false;
  return { scene: s, sheet, dot, label, labelT, circle, A, hand, letters, L };
}

// ---------- Otto's money dream ----------
export async function money() {
  const s = new THREE.Scene(); s.background = new THREE.Color('#ffc94a');
  s.add(new THREE.HemisphereLight('#fff6dc', '#c08a2a', 1.0));
  sun(s, '#fff1d6', 1.4, [5, 12, 10], 10, [0, 1, 0]);
  const burst = mesh(new THREE.PlaneGeometry(60, 60), basic({ map: T.sunburst() }), { p: [0, 6, -14], parent: s, cast: false });
  const pile = P.bills(s, 420), rain = P.bills(s, 70);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(1, 1, 1);
  const r = rnd(5);
  for (let i = 0; i < 420; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 7, h = Math.max(0, 1.9 * (1 - (d / 7) ** 2)) + r() * .3;
    e.set(-Math.PI / 2 + (r() - .5) * .9, r() * 6, (r() - .5) * .9); q.setFromEuler(e); v.set(Math.cos(a) * d * 1.4, h, Math.sin(a) * d * .8 - 1);
    m4.compose(v, q, sc); pile.setMatrixAt(i, m4);
  }
  pile.instanceMatrix.needsUpdate = true;
  return {
    scene: s, burst,
    update(t) {
      burst.rotation.z = t * .15;
      for (let i = 0; i < 70; i++) {
        const sp = 1.6 + hash(i + 7) * 1.2, y = 12 - ((hash(i + 3) * 14 + t * sp) % 14);
        e.set(t * (1 + hash(i)) + i, t * .7 + i * 2, Math.sin(t * 2 + i) * .8); q.setFromEuler(e);
        const side = hash(i + 2) > .5 ? 1 : -1; v.set(hash(i + 4) > .35 ? (hash(i) - .5) * 14 : side * (2.6 + hash(i) * 4), y, hash(i + 4) > .35 ? -1.5 - hash(i + 1) * 3 : (hash(i + 1) - .5) * 4 + 2); m4.compose(v, q, sc); rain.setMatrixAt(i, m4);
      }
      rain.instanceMatrix.needsUpdate = true;
    },
  };
}

// ---------- the mousetrap on a table ----------
export async function trapTable() {
  const s = new THREE.Scene(); s.background = new THREE.Color('#3a2414');
  s.add(new THREE.HemisphereLight('#fff0dc', '#3a2010', .8));
  sun(s, '#ffe6c0', 1.5, [-5, 9, 6], 6, [0, 0, 0]);
  mesh(new THREE.PlaneGeometry(30, 30), toon('#ffffff', { map: T.wood('#8a5530', { repeat: [3, 3], plank: 128 }), outline: false }), { r: [-90, 0, 0], parent: s });
  mesh(new THREE.PlaneGeometry(30, 14), toon('#ffffff', { map: T.wallpaper('#2c6964', '#357872', { repeat: [6, 3] }), outline: false }), { p: [0, 7, -8], parent: s });
  const trap = P.mousetrap(s, [0, 0, 0]);
  return { scene: s, trap };
}
