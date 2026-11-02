// Sets for "El ejército de goma": French countryside by day and by night (reusing Agloe's crossroads), and a village café.
import { THREE, toon, basic, G3, G5, GH, mesh, group, sphere, box, cyl, D2R, ctex, rnd, hash, INK } from '../../engine/engine.js';
import * as T from '../../engine/textures.js';
import * as EP from '../../engine/props.js';
import { country } from '../../agloe/src/sets.js';
import * as P from './props.js';

function frenchify(C) {   // no Agloe store, no New York signposts, no American car
  C.shop.root.visible = false; C.sign.visible = false; C.car.root.visible = false;
}

export async function day() {
  const C = await country(); frenchify(C); const s = C.scene;
  const carried = P.tank(s, [4, 2.8, -9]);                       // the one four soldiers lift
  const camp = [[-20, -16], [-14, -16], [-8, -16], [-20, -21], [-14, -21], [-8, -21]].map(([x, z], i) => P.tank(s, [x, 0, z], (i % 2 ? 4 : -3)));
  P.tent(s, [-26, 0, -15], 90, 1.1); P.tent(s, [-26, 0, -21], 90, 1.1); P.tent(s, [-2, 0, -21], 0, 1.0);
  const art = P.tank(s, [-9, 0, 9], 10);                          // the artists' tank
  P.easel(s, [-5.6, 0, 10.2], -30);
  const bikes = [P.bike(s, [0, 0, .6], '#2f5d8a'), P.bike(s, [0, 0, -.6], '#8a2f2f')];
  const planeObj = P.plane(s, [0, -60, 0]);
  return { scene: s, C, carried, camp, art, bikes, planeObj, update(t) {} };
}

export async function night() {
  const C = await country(); frenchify(C); const s = C.scene;
  s.children.forEach(o => { if ((o.isGroup && Math.abs(o.position.z + 3.4) < 1e-6) || o.geometry?.type === 'TubeGeometry') o.visible = false; });   // no power line in the night camp
  s.background = ctex(16, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b1230'); g.addColorStop(.75, '#22305e'); g.addColorStop(1, '#3a4a7a'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  s.fog = new THREE.Fog('#1e2a50', 30, 150);
  s.traverse(o => { if (o.isHemisphereLight) { o.intensity = .45; o.color.set('#7f8fd0'); o.groundColor.set('#141a2c'); } });
  C.key.color.set('#b0c0ff'); C.key.intensity = .8; C.key.position.set(-20, 30, 14);
  mesh(sphere(5, 24, 16), basic({ color: '#f4f1d8' }), { p: [-50, 48, -150], parent: s, cast: false });
  mesh(sphere(9, 24, 16), basic({ color: '#f4f1d8', transparent: true, opacity: .12, depthWrite: false }), { p: [-50, 48, -150], parent: s, cast: false });
  for (let i = 0; i < 120; i++) mesh(sphere(.25 + hash(i) * .3, 6, 4), basic({ color: '#ffffff' }), { p: [(hash(i + 1) - .5) * 400, 40 + hash(i + 2) * 80, -160 - hash(i + 3) * 40], parent: s, cast: false });
  const tk = P.tank(s, [0, 0, -8], 0);
  const pumpP = P.pump(s, [-1.9, 0, -6.2]);
  P.hose(s, [-1.9, .4, -6.2], [-1.2, 1.2, -7.4]);
  const flat = P.tank(s, [-6, 0, -11], 20); flat.set({ inflate: .08 });   // a deflated one waiting
  const truck = P.speakerTruck(s, [7, 0, -10], -20);
  P.tent(s, [-8, 0, -8], 30, 1.1);
  const rad = P.radio(s, [-6.2, 1.0, -5.6]);
  mesh(box(1.6, 1.0, .9), toon('#7a5a3a', { g: G3, ol: .004 }), { p: [-6.2, .5, -5.6], parent: s });
  const work = new THREE.PointLight('#ffd7a0', 3.5, 12, 1.6); work.position.set(-.6, 4.6, -9.6); s.add(work);
  const work2 = new THREE.PointLight('#ffd7a0', 2.5, 10, 1.6); work2.position.set(-3.6, 4.2, -3.6); s.add(work2);
  C.cows.forEach(c => { c.root.visible = false; });   // no cows in the night camp
  return { scene: s, C, tank: tk, pump: pumpP, truck, radio: rad, update(t) { truck.set(t); } };
}

export async function cafe() {
  const s = new THREE.Scene(); s.background = new THREE.Color('#3a2a1a');
  s.add(new THREE.HemisphereLight('#fff0dc', '#4a3020', .8));
  const key = new THREE.DirectionalLight('#fff0d8', 1.4); key.position.set(-8, 7, 6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); key.shadow.bias = -.0004; s.add(key);
  const tiles = ctex(256, 256, (x) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? '#a83a2a' : '#efe2c4'; x.fillRect(i * 64, j * 64, 64, 64); } }, { repeat: [10, 8] });
  mesh(new THREE.PlaneGeometry(24, 16), toon('#ffffff', { map: tiles, outline: false }), { r: [-90, 0, 0], p: [0, 0, 2], parent: s });
  mesh(new THREE.PlaneGeometry(24, 9), toon('#ffffff', { map: T.wallpaper('#e6d5a8', '#d9c48f', { repeat: [6, 2], motif: '#c8b070' }), outline: false }), { p: [0, 4.5, -5], parent: s });
  mesh(box(24, 1.6, .2), toon('#ffffff', { map: T.panels('#3f6b4a') }), { p: [0, .8, -4.9], parent: s });
  mesh(new THREE.PlaneGeometry(16, 9), toon('#e6d5a8', { outline: false }), { p: [-8, 4.5, 2], r: [0, 90, 0], parent: s });
  mesh(new THREE.PlaneGeometry(2.6, 3.4), basic({ color: '#e8f4ff' }), { p: [-7.95, 3.6, 0], r: [0, 90, 0], parent: s, cast: false });
  // bar with bottles and a mirror
  mesh(box(7, 1.7, 1.2), toon('#ffffff', { map: T.wood('#6a3a1a', { plank: 128 }) }), { p: [3.5, .85, -3.8], parent: s });
  mesh(box(7.2, .12, 1.4), toon('#3a2010', { g: G3 }), { p: [3.5, 1.76, -3.8], parent: s });
  mesh(box(5, 2.2, .1), toon('#cfe4ec', { g: GH, ol: .004, emissive: '#2a3a40' }), { p: [3.5, 4.4, -4.9], parent: s });
  mesh(box(5.6, .1, .5), toon('#6a3a1a'), { p: [3.5, 3.1, -4.75], parent: s });
  for (let i = 0; i < 12; i++) mesh(cyl(.09, .1, .5 + (i % 3) * .08, 10), toon(['#2f6f3a', '#7a1f2a', '#c9a14a', '#3a5a8a'][i % 4], { g: GH, ol: .003 }), { p: [1.2 + i * .42, 3.42, -4.75], parent: s });
  const sign = T.textBoard('CAFÉ DU VILLAGE', { w: 768, h: 140, font: '70px Rye', bg: '#2f4a3a', color: '#f2e3c0', border: '#c9a14a' });
  mesh(new THREE.PlaneGeometry(4.2, .76), toon('#ffffff', { map: sign, outline: false }), { p: [3.5, 6.2, -4.88], parent: s });
  P.bistroTable(s, [-1.2, 0, 0]); P.stool(s, [-2.4, 0, .3]); P.stool(s, [0, 0, .3]);
  P.bistroTable(s, [4.6, 0, -1.2]); P.stool(s, [5.8, 0, -1.0]);
  EP.hangingLamp(s, [-1.2, 5.6, 0], { cord: 3, color: '#3f6b4a', intensity: 8 });
  const paper = P.newspaper();
  return { scene: s, paper };
}
