// Shot list for "El ejército de goma". Every shot starts on a word of the narration.
import { THREE, k, seg, E, pop, clamp, lerp, hash, noise1, D2R } from '../../engine/engine.js';
import * as P from './props.js';

const TL = window.TIMINGS;
export const LANG = window.LANG || 'es';
const LN = id => TL.lines.find(l => l.id === id);
const Ls = id => LN(id).start, Le = id => LN(id).end;
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
const ANCHORS = { en: {} };
export const TXT = { es: { place: ['FRANCIA', '1944'], army: ['EL EJÉRCITO', 'FANTASMA'], fx1: 'BRRRUM', fx2: '¡CLANK CLANK!', radio: '...bzzt... ¡Aquí la 6ª División! ...bzzt...' },
  en: { place: ['FRANCE', '1944'], army: ['THE GHOST', 'ARMY'], fx1: 'VROOOM', fx2: 'CLANK CLANK!', radio: '...bzzt... 6th Armored here! ...bzzt...' } }[LANG];
function Wt(id, word, n = 0, end = false) {
  if (LANG !== 'es') { const m = ANCHORS[LANG][`${id}:${word}:${n}`] ?? ANCHORS[LANG][`${id}:${word}`]; if (m === undefined) throw new Error(`no ${LANG} anchor for ${id}:${word}`); [word, n] = Array.isArray(m) ? m : [m, n]; }
  const ws = LN(id).words.filter(w => norm(w.w).startsWith(norm(word)));
  if (!ws.length) throw new Error(`"${word}" not in ${id}`);
  const w = ws[Math.min(n, ws.length - 1)]; return end ? w.end : w.start;
}
const INK = '#1c1411';
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const title = (lt, a, b, y = 430) => { const st = clamp(lt / .25), sc = lerp(1.7, 1, E.out5(st)); return `<g opacity="${st.toFixed(2)}" transform="translate(540 ${y}) scale(${sc.toFixed(3)})">
  <text text-anchor="middle" font-family="Rye" font-size="130" fill="#fff4dc" stroke="${INK}" stroke-width="14" paint-order="stroke">${a}</text>
  <text y="104" text-anchor="middle" font-family="Alfa Slab One" font-size="76" fill="#ffcf5a" stroke="${INK}" stroke-width="10" paint-order="stroke" letter-spacing="6">${b}</text></g>`; };
const comic = (x, y, s, text, r, col = '#ffcf5a') => s <= 0 ? '' : `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${r}) scale(${s.toFixed(3)})"><text text-anchor="middle" font-family="Alfa Slab One" font-size="96" fill="${col}" stroke="${INK}" stroke-width="12" paint-order="stroke">${text}</text></g>`;

export function makeShots(W) {
  const { sets, chars, talking, camera } = W;
  const { A, B, C, D, F1, F2, ART, ART2, SPY } = chars;
  const DAY = sets.day, NIGHT = sets.night, CAFE = sets.cafe;
  const TANK = DAY.carried;
  const toScreen = (v) => { const p = v.clone().project(camera); return [(p.x + 1) / 2 * 1080, (1 - p.y) / 2 * 1920]; };

  // four soldiers walking with the tank over their heads; x is the group's centre
  const carry = (t, x, z = -9, o = {}) => {
    const ty = o.ty ?? 2.8;
    TANK.root.position.set(x, ty, z); TANK.root.rotation.set(0, 0, o.tilt || 0); TANK.set({ t, inflate: 1, sag: o.sag || 0, wobble: o.wobble || 0, wobbleT: o.wobbleT || 0 });
    const walk = o.walk ?? true, ph = t * 7;
    const crew = o.crew || [[A, 1.2, 1.28], [B, 1.2, -1.28], [C, -1.2, 1.28], [D, -1.2, -1.28]];
    crew.forEach(([c, dx, dz, extra], i) => {
      c.set({ t: t + i * .3, x: x + dx, z: z + dz, ry: 90, legs: walk ? 'walk' : 'stand', walk: ph + i * 1.6, ikL: V(x + dx - .15, ty + .05, z + dz * .74), ikR: V(x + dx + .15, ty + .05, z + dz * .74), eyes: 'dot', mouth: 'smile', look: [0, .2], ...(extra || {}) });
    });
  };
  const bikeRide = (t, bx, o = {}) => {
    const [b1, b2] = DAY.bikes; const z1 = o.z1 ?? .6, z2 = o.z2 ?? -.6, ry = o.ry ?? 0;
    [[b1, F1, z1, o.f1], [b2, F2, z2, o.f2]].forEach(([b, f, z, ex], i) => {
      const x = bx + (i ? -.9 : 0);
      b.root.position.set(x, 0, z); b.root.rotation.y = ry * D2R; b.setWheel(o.moving === false ? 0 : t * 6);
      const dir = ry ? -1 : 1, grip = (g) => V(x + dir * g.x, g.y, z + g.z * dir);
      const off = ex && ex.ry === 180 ? .6 : 0;
      f.set({ t: t + i, x: x + dir * -.3, y: off ? 0 : .1, z: z + off, ry: ry ? -90 : 90, legs: o.moving === false ? 'stand' : 'walk', walk: t * 8 + i, lean: .15, ikL: grip(b.grips[0]), ikR: grip(b.grips[1]), eyes: 'happy', mouth: 'smile', ...(ex || {}) });
    });
  };
  const S = [];
  const shot = (at, set, cast, pose, cam, fx, extra = {}) => S.push({ at, set, cast, pose, cam, fx: fx || (() => ({})), ...extra });
  const SQUAD = ['A', 'B', 'C', 'D'];

  // 1. four soldiers lifted a 30-ton tank...
  shot(0, 'day', SQUAD, (t, lt) => { const x = 1 + lt * .8; carry(t, x); },
    (t, lt) => { const x = 1 + lt * .8; return { pos: [x + 6.5, 1.2, -9 + 7.5], look: [x, 3.0, -9], fov: 34 }; },
    () => ({ dof: { focus: 10, aperture: .0008, maxblur: .005 } }));
  // 2. ...with their bare hands!
  shot(Ls('hook2'), 'day', SQUAD, (t, lt) => { const x = 3.8 + lt * .8; carry(t, x, -9, { crew: [[A, 1.2, 1.28, { mouth: 'o', eyes: 'happy' }], [B, 1.2, -1.28], [C, -1.2, 1.28, { eyes: 'smug', mouth: 'smirk' }], [D, -1.2, -1.28]] }); },
    (t, lt) => { const x = 3.8 + lt * .8; return { pos: [x + 4.2, 2.4, -9 + 5.2], look: [x + .4, 3.0, -8.2], fov: 32 }; },
    () => ({ dof: { focus: 6.5, aperture: .0015, maxblur: .008 } }));
  // 3. France, 1944
  shot(Ls('place'), 'day', ['F1', 'F2'], (t, lt) => { bikeRide(t, -26 + lt * 3.2); TANK.root.position.set(0, -50, 0); },
    (t, lt) => ({ pos: [k(lt, [[0, -14], [2.4, -11]]), k(lt, [[0, 7], [2.4, 5]]), 15], look: [-8, 1.5, -4], fov: 40 }),
    () => ({ sub: 2 }), { sfx: [{ t: Ls('place') + .1, type: 'reveal' }], overlay: (t, lt) => title(lt, ...TXT.place) });
  // 4a. two Frenchmen cycling through the fields...
  const bx0 = -16, bv = 3.2, tStop = Wt('setup', 'encuentran');
  const bxAt = t => bx0 + Math.min(t - Ls('setup'), tStop - Ls('setup')) * bv;
  shot(Ls('setup'), 'day', ['F1', 'F2'], (t) => { bikeRide(t, bxAt(t), { f1: { eyes: 'happy', mouth: 'smile', look: [.4, 0] }, f2: { eyes: 'dot', mouth: 'smile', look: [-.3, 0] } }); TANK.root.position.set(0, -50, 0); },
    (t) => { const x = bxAt(t); return { pos: [x + 7.5, 2.3, .2], look: [x, 2.1, 0], fov: 34 }; },
    () => ({ sub: 2, dof: { focus: 7.2, aperture: .001, maxblur: .006 } }));
  // 4b. ...and run into four American soldiers lifting a tank
  shot(tStop, 'day', ['F1', 'F2', ...SQUAD], (t, lt) => { const x = 2.5 + lt * .7; carry(t, x);
      bikeRide(t, 1.4, { moving: false, f1: { ry: 180, legs: 'stand', lean: 0, ikL: null, ikR: null, pose: 'scared', eyes: 'wide', mouth: 'jaw', look: [0, .1] }, f2: { ry: 180, legs: 'stand', lean: 0, ikL: null, ikR: null, pose: 'idle', eyes: 'wide', mouth: 'o' } }); },
    (t, lt) => ({ pos: [k(lt, [[0, -1.5], [3.4, -.5]]), 4.6, 10.5], look: [2.8, 2.4, -7.5], fov: 36 }),
    () => ({ dof: { focus: 13, aperture: .0007, maxblur: .005 } }));
  // 5. FARMER: "¿Pero cómo es posible?"
  shot(Ls('farmer'), 'day', ['F1', 'F2'], (t) => { TANK.root.position.set(0, -50, 0);
      bikeRide(t, 1.4, { moving: false, f1: { ry: 180, legs: 'stand', ikL: null, ikR: null, pose: 'shrug', eyes: 'wide', brows: 'up', mouth: talking('FARMER', t) ? 'talk' : 'o', look: [0, .1], lean: 0 }, f2: { ry: 180, legs: 'stand', ikL: null, ikR: null, pose: 'idle', eyes: 'wide', brows: 'up', mouth: 'jaw', lean: 0 } }); },
    (t, lt) => ({ pos: [.9, 3.0, -5.4 + lt * .2], look: [.9, 2.7, 0], fov: 34 }),
    () => ({ dof: { focus: 5.6, aperture: .0015, maxblur: .008 } }));
  // 6. SOLDIER: "Bueno... es que los americanos somos muy fuertes." (one hand!)
  const solo = (t, o = {}) => {
    const x = 4.4, z = -8.6;
    TANK.root.position.set(x, o.ty ?? 2.95, z); TANK.root.rotation.set(0, 0, 0); TANK.set({ t, inflate: 1, sag: o.sag || 0, wobble: o.wobble || 0, wobbleT: o.wobbleT || 0 });
    A.set({ t, x, z: z + .1, ry: 0, pose: 'idle', poseL: 'hips', ikR: V(x + .1, (o.ty ?? 2.95) + .05, z), eyes: o.eyes || 'smug', brows: o.brows || 'raise', mouth: o.mouth || (talking('SOLDIER', t) ? 'talk' : 'smirk'), look: [0, .1], ...(o.a || {}) });
    B.set({ t, x: x + 2.1, z: z + .9, ry: -50, pose: 'behind', eyes: 'closed', mouth: 'o', look: [.8, .6] });
    C.set({ t, x: x - 2.2, z: z + .7, ry: 40, pose: 'behind', eyes: 'dot', mouth: 'wavy', look: [-.9, .4] });
  };
  shot(Ls('soldier'), 'day', ['A', 'B', 'C'], (t) => solo(t),
    (t, lt) => ({ pos: [4.6, 2.6, -1.4 - lt * .2], look: [4.4, 3.0, -8.6], fov: 32 }),
    () => ({ dof: { focus: 7.2, aperture: .0013, maxblur: .007 } }));
  // 7a. the trick? the tank was rubber (a poke makes it wobble)
  const tPoke = Wt('reveal', 'goma') - .15;
  shot(Ls('reveal'), 'day', ['A', 'B'], (t, lt) => {
      TANK.root.position.set(4.4, 0, -8.6); TANK.root.rotation.set(0, 0, 0); TANK.set({ t, inflate: 1, wobble: t > tPoke ? 1 : 0, wobbleT: Math.max(0, t - tPoke) });
      const poke = seg(t, tPoke - .35, tPoke, E.out);
      A.set({ t, x: 4.6, z: -6.7, ry: 110, pose: 'idle', ikL: V(4.75, 1.15, lerp(-6.95, -7.55, poke)), eyes: 'dot', brows: 'raise', mouth: 'o', look: [-.5, -.2] });
      B.set({ t, x: 2.5, z: -6.4, ry: 100, pose: 'hips', eyes: 'smug', mouth: 'smirk', look: [.4, 0] }); },
    (t, lt) => ({ pos: [12 - lt * .3, 2.6, -2.5], look: [4.3, 1.7, -7.4], fov: 34 }),
    () => ({ dof: { focus: 8.5, aperture: .0013, maxblur: .007 } }), { sfx: [{ t: tPoke, type: 'boing' }] });
  // 7b. it was inflatable! (pssshh)
  const tDef = Wt('reveal', 'hinchable') - .1;
  shot(Wt('reveal', 'era', 1) - .05, 'day', ['A', 'B'], (t) => {
      TANK.root.position.set(4.4, 0, -8.6); TANK.set({ t, inflate: 1, sag: seg(t, tDef, tDef + .9, E.out) * .7, wobble: 1, wobbleT: Math.max(0, t - tDef) * .8 });
      A.set({ t, x: 4.6, z: -6.7, ry: 180, pose: 'scared', eyes: 'wide', brows: 'up', mouth: 'jaw', look: [0, -.2] });
      B.set({ t, x: 6.4, z: -6.9, ry: -150, pose: 'scared', eyes: 'wide', mouth: 'o' }); },
    (t, lt) => ({ pos: [7.6, 2.4, -13.6], look: [4.9, 1.4, -7.6], fov: 34, shake: .4 }),
    () => ({ dof: { focus: 7, aperture: .0012, maxblur: .007 } }), { sfx: [{ t: tDef, type: 'whoosh' }] });
  // 8. they were the Ghost Army
  const salute = (c, x, z, ry, t, i) => c.set({ t: t + i, x, z, ry, pose: 'idle', ikR: V(x + Math.sin((ry + 25) * D2R) * .55, 3.45, z + Math.cos((ry + 25) * D2R) * .55), eyes: 'smug', mouth: 'smile', look: [0, .1] });
  shot(Ls('army'), 'day', ['A', 'B', 'C', 'D', 'ART'], (t, lt) => { TANK.root.position.set(0, -50, 0); DAY.C.cows[0].root.visible = DAY.C.cows[1].root.visible = false;
      [[A, -18, -12.2], [B, -15, -12.4], [C, -12, -12.2], [D, -9, -12.4], [ART, -6, -12.2]].forEach(([c, x, z], i) => salute(c, x, z, 0, t, i));
      DAY.camp.forEach((tk, i) => tk.set({ t: t + i, inflate: 1 })); },
    (t, lt) => ({ pos: [k(lt, [[0, -5], [4.5, -10]]), k(lt, [[0, 3.2], [4.5, 7]]), k(lt, [[0, 1.5], [4.5, 4.5]])], look: [-12, 1.8, -15.5], fov: 38 }),
    () => ({ sub: 2 }), { sfx: [{ t: Ls('army') + .2, type: 'stamp' }], overlay: (t, lt) => title(lt, ...TXT.army, 380) });
  // 9. at night they inflated tanks, trucks and cannons
  shot(Ls('inflate'), 'night', ['A', 'B'], (t, lt) => {
      const pumpV = .5 + .5 * Math.sin(t * 9); NIGHT.pump.set(pumpV);
      NIGHT.tank.set({ t, inflate: lerp(.12, 1, E.out(clamp(lt / 2.6))), wobble: .5, wobbleT: 0 });
      const h = NIGHT.pump.handle();
      A.set({ t, x: -1.9, z: -5.4, ry: 180, pose: 'idle', ikL: h.clone().add(V(-.25, 0, 0)), ikR: h.clone().add(V(.25, 0, 0)), eyes: 'closed', brows: 'worried', mouth: 'wavy', sweat: true, bob: -pumpV * .15 });
      B.set({ t, x: .5, z: -4.7, ry: -170, pose: 'hips', eyes: 'happy', mouth: 'grin', look: [-.4, 0] }); },
    (t, lt) => ({ pos: [k(lt, [[0, 1.2], [2.9, .5]]), 2.9, k(lt, [[0, -15.8], [2.9, -17.0]])], look: [-.6, 1.8, -6.4], fov: 36 }),
    () => ({ expo: 1.15, vig: .5, dof: { focus: 10.5, aperture: .001, maxblur: .006 } }));
  // 10. speakers blasting engines and tank tracks
  shot(Ls('sound'), 'night', ['C'], (t, lt) => {
      C.set({ t, x: 4.6, z: -7.6, ry: -25, pose: 'idle', poseL: 'present2', eyes: 'happy', mouth: 'grin', look: [.4, .2] }); },
    (t, lt) => ({ pos: [k(lt, [[0, 1.5], [3.9, 2.6]]), 2.2, k(lt, [[0, -1.5], [3.9, -2.4]])], look: [6, 2.2, -9.6], fov: 38 }),
    () => ({ expo: 1.15, vig: .5 }),
    { overlay(t, lt) { const h = NIGHT.truck.horns.map(o => o.localToWorld(V(.75, 0, 0))); let s = '';
        h.forEach((hp, i) => { const [x, y] = toScreen(hp); for (let r = 0; r < 3; r++) { const ph = ((t * 1.6 + r / 3 + i * .2) % 1); s += `<path d="M${(x - 70 - ph * 220).toFixed(0)} ${(y - 60 - ph * 140).toFixed(0)} q${(-40 - ph * 60).toFixed(0)} ${(60 + ph * 140).toFixed(0)} 0 ${(120 + ph * 280).toFixed(0)}" stroke="#fff4dc" stroke-width="10" fill="none" opacity="${(1 - ph).toFixed(2)}" stroke-linecap="round"/>`; } });
        const t1 = Wt('sound', 'motores'), t2 = Wt('sound', 'cadenas');
        return s + comic(330, 560, pop(t, t1) * (1 + .05 * Math.sin(t * 20)), TXT.fx1, -10) + comic(700, 760, pop(t, t2) * (1 + .05 * Math.sin(t * 24)), TXT.fx2, 8, '#ff8a4a'); } });
  // 11. fake radio traffic
  shot(Ls('radio'), 'night', ['B'], (t) => {
      NIGHT.radio.lamp.visible = Math.sin(t * 12) > 0;
      B.set({ t, x: -5.9, z: -6.5, ry: -15, legs: 'stand', pose: 'idle', poseL: 'phone', itemL: B.userHandset, eyes: 'smug', brows: 'raise', mouth: 'talk', look: [.2, -.1] }); },
    (t, lt) => ({ pos: [-4.2, 2.8, -1.4 - lt * .2], look: [-5.9, 2.3, -6.2], fov: 32 }),
    () => ({ expo: 1.15, vig: .5, dof: { focus: 5.1, aperture: .0015, maxblur: .008 } }),
    { overlay(t, lt) { const p = clamp((lt - .4) / 2.4); const txt = TXT.radio.slice(0, Math.floor(p * TXT.radio.length)); return `<g transform="translate(540 520)"><rect x="-470" y="-70" width="940" height="110" rx="24" fill="#10141f" opacity=".72"/><text text-anchor="middle" y="10" font-family="Special Elite" font-size="48" fill="#9fffb0">${txt.replace(/&/g, '&amp;')}</text></g>`; } });
  // 12. lies in the village café, in case spies were listening
  const tSpy = Wt('bars', 'espias') - .1;
  shot(Ls('bars'), 'cafe', ['A', 'C', 'SPY'], (t, lt) => {
      A.set({ t, x: -2.3, z: .4, ry: 60, legs: 'dangle', y: .0, pose: 'idle', poseR: 'present2', eyes: 'smug', brows: 'raise', mouth: 'talk', look: [.3, 0] });
      C.set({ t, x: -.1, z: .4, ry: -60, legs: 'dangle', pose: 'idle', poseL: 'present2', eyes: 'happy', mouth: Math.sin(t * 3) > 0 ? 'talk' : 'grin', look: [-.3, 0] });
      const low = seg(t, tSpy, tSpy + .35, E.out) - seg(t, Le('bars') + .1, Le('bars') + .4);
      SPY.set({ t, x: 4.4, z: -1.6, ry: -20, legs: 'dangle', pose: 'hold', itemR: CAFE.paper, eyes: 'smug', brows: 'angry', mouth: 'flat', look: [-.7, 0] });
      SPY.items.R.position.y += .6 - low * .55; SPY.items.R.position.x -= .4; },
    (t, lt) => ({ pos: [k(lt, [[0, -4.6], [4.6, -3.8]]), 3.1, k(lt, [[0, 8.0], [4.6, 7.0]])], look: [1.8, 2.5, -1.2], fov: 40 }),
    () => ({ dof: { focus: 10, aperture: .0006, maxblur: .004 } }));
  // 13a. from the air, the Germans saw a huge army...
  shot(Ls('plane'), 'day', [], (t, lt) => { TANK.root.position.set(0, -50, 0); DAY.camp.forEach((tk, i) => tk.set({ t: t + i, inflate: 1 }));
      const pl = DAY.planeObj; pl.root.position.set(-26 + lt * 18, 14, -12); pl.prop.rotation.x = t * 40; pl.root.rotation.set(.12, 0, -.08); },
    (t, lt) => ({ pos: [-6, 1.6, 6], look: [-26 + lt * 18, 14, -12], fov: 38 }),
    () => ({ sub: 2 }), { sfx: [{ t: Ls('plane'), type: 'whoosh' }] });
  // 13b. ...through the binoculars
  shot(Wt('plane', 'movian') - .3, 'day', [], (t, lt) => { TANK.root.position.set(0, -50, 0); DAY.camp.forEach((tk, i) => tk.set({ t: t + i, inflate: 1 })); DAY.planeObj.root.position.set(0, -60, 0); },
    (t, lt) => ({ pos: [-14 + lt * .8, 30, -2], look: [-14 + lt * .8, 0, -18.5], fov: 30, hand: 2 }),
    () => ({}),
    { overlay() { return `<defs><mask id="bino"><rect width="1080" height="1920" fill="#fff"/><circle cx="350" cy="900" r="330" fill="#000"/><circle cx="730" cy="900" r="330" fill="#000"/></mask></defs><rect width="1080" height="1920" fill="#0a0a0a" mask="url(#bino)"/>`; } });
  // 14. many of them were artists
  shot(Ls('artists'), 'day', ['ART', 'ART2'], (t, lt) => { TANK.root.position.set(0, -50, 0); DAY.art.set({ t, inflate: 1 });
      ART.set({ t, x: -8.6, z: 10.6, ry: 160, pose: 'idle', ikR: V(-8.7 + Math.sin(t * 6) * .25, 1.2 + Math.cos(t * 5) * .15, 9.95), itemR: ART.userBrush, eyes: 'smug', brows: 'raise', mouth: 'smile' });
      ART2.set({ t, x: -5.7, z: 11.5, ry: 200, pose: 'idle', ikR: V(-5.6 + Math.sin(t * 4) * .15, 2.1 + Math.cos(t * 3) * .1, 10.4), itemR: ART2.userBrush, eyes: 'closed', mouth: 'smile', look: [.2, 0] }); },
    (t, lt) => ({ pos: [k(lt, [[0, -.6], [4.8, -1.4]]), 2.9, k(lt, [[0, 7.4], [4.8, 6.8]])], look: [-7.4, 1.7, 10.2], fov: 36 }),
    () => ({ dof: { focus: 7.4, aperture: .0012, maxblur: .007 } }));
  // 15. they fooled the German army again and again
  shot(Ls('pay1'), 'day', ['A', 'B', 'C', 'D', 'ART', 'ART2'], (t, lt) => { TANK.root.position.set(0, -50, 0); DAY.C.cows[0].root.visible = DAY.C.cows[1].root.visible = false; DAY.camp.forEach((tk, i) => tk.set({ t: t + i, inflate: 1, wobble: .3, wobbleT: 0 }));
      [[A, -18, -12.0], [B, -15.5, -11.6], [C, -13, -12.0], [D, -10.5, -11.6], [ART, -8, -12.0], [ART2, -5.5, -11.6]].forEach(([c, x, z], i) => c.set({ t: t + i, x, z, ry: 0, pose: 'cheer', eyes: 'happy', mouth: 'grin', bob: Math.abs(Math.sin(t * 8 + i)) * .2 })); },
    (t, lt) => ({ pos: [k(lt, [[0, -9], [2.6, -11]]), k(lt, [[0, 2.6], [2.6, 4.4]]), k(lt, [[0, -.5], [2.6, 1.5]])], look: [-11.5, 2.4, -14], fov: 36 }),
    () => ({ dof: { focus: 13, aperture: .0007, maxblur: .005 } }));
  // 16. ...and the only ones who nearly caught them: two men on bikes
  const tSus = Wt('pay2', 'fueron');
  shot(Ls('pay2'), 'day', ['F1', 'F2'], (t, lt) => { TANK.root.position.set(0, -50, 0);
      const x = -2 + lt * 2.6, sus = t > tSus;
      bikeRide(t, x, { f1: { eyes: sus ? 'smug' : 'dot', brows: sus ? 'angry' : '', mouth: sus ? 'flat' : 'smile', look: sus ? [-.9, 0] : [.9, .1] }, f2: { eyes: sus ? 'smug' : 'dot', brows: sus ? 'angry' : '', mouth: 'flat', look: sus ? [-.9, 0] : [.6, 0] } }); },
    (t, lt) => { const x = -2 + lt * 2.6; return { pos: [x + 6.5, 2.4, 3.2], look: [x, 2.3, 0], fov: 34 }; },
    () => ({ dof: { focus: 7.4, aperture: .0012, maxblur: .007 } }));
  // 17. SOLDIER: "Muy fuertes. Somos muy, muy fuertes." — and the tank gives up on him
  const tSag = Le('button') - .15;
  shot(Ls('button'), 'day', ['A', 'B', 'C'], (t, lt) => {
      const sag = seg(t, tSag, tSag + .9, E.out);
      solo(t, { sag, ty: 2.95 - sag * 1.1, wobble: t > tSag ? .8 : 0, wobbleT: Math.max(0, t - tSag), eyes: t > tSag + .3 ? 'closed' : 'smug', mouth: t > tSag + .3 ? 'wavy' : undefined }); },
    (t, lt) => ({ pos: [4.6, 2.7, -2.4 + lt * .3], look: [4.4, 3.0, -8.6], fov: 32 }),
    () => ({ dof: { focus: 6.4, aperture: .0013, maxblur: .007 } }), { sfx: [{ t: tSag, type: 'whoosh' }] });

  const DIST = { 0: 1.5, 1: 1.7, 5: 1.7, 6: 1.6, 8: 1.2, 11: 1.3, 12: 1.4, 16: 1.3, 17: 1.3, 18: 1.6, 19: 1.5 };
  Object.entries(DIST).forEach(([i, f]) => {
    const sh = S[i], cam = sh.cam, fx = sh.fx;
    sh.cam = (t, lt) => { const c = cam(t, lt); return { ...c, pos: c.pos.map((v, j) => c.look[j] + (v - c.look[j]) * f) }; };
    sh.fx = (t, lt) => { const o = fx(t, lt); return o.dof ? { ...o, dof: { ...o.dof, focus: o.dof.focus * f } } : o; };
  });
  S.forEach(s => { const p = s.pose; s.pose = (t, lt) => { DAY.planeObj.root.position.set(0, -60, 0); DAY.C.cows.forEach(c => { c.root.visible = true; }); DAY.bikes.forEach(b => b.root.position.set(0, -50, 0)); p(t, lt); }; });
  return S;
}
