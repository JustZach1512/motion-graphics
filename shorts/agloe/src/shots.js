// Shot list for the 3D version. Every shot starts on a word of the narration.
import { THREE, k, seg, E, pop, clamp, lerp, hash, noise1, D2R } from './engine.js';
import * as P from './props.js';
import * as T from './textures.js';

const TL = window.TIMINGS;
const LN = id => TL.lines.find(l => l.id === id);
const Ls = id => LN(id).start, Le = id => LN(id).end;
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
function Wt(id, word, n = 0, end = false) {
  const ws = LN(id).words.filter(w => norm(w.w).startsWith(norm(word)));
  if (!ws.length) throw new Error(`"${word}" not in ${id}`);
  const w = ws[Math.min(n, ws.length - 1)]; return end ? w.end : w.start;
}
const INK = '#1c1411';
const punch = (t, t0, amt = .08, d = .35) => (t < t0 ? 0 : amt * Math.sin(clamp((t - t0) / d) * Math.PI) * (1 - clamp((t - t0) / d) * .5));
const settle = (lt, amt = .5) => amt * (1 - E.out5(clamp(lt / .5)));   // camera arrives with a little extra travel
const add = (a, b, s = 1) => a.map((v, i) => v + b[i] * s);

// ---------- 2D overlays ----------
const qmark = (x, y, s, r) => s <= 0 ? '' : `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s.toFixed(3)})"><text font-family="Alfa Slab One" font-size="170" text-anchor="middle" fill="#fff" stroke="${INK}" stroke-width="12" paint-order="stroke">?</text></g>`;
const stamp = (x, y, s, text, r, o) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s.toFixed(3)})" opacity="${o}"><rect x="-250" y="-76" width="500" height="140" rx="16" fill="none" stroke="#d6262b" stroke-width="14"/><text y="32" font-family="Alfa Slab One" font-size="96" text-anchor="middle" fill="#d6262b" letter-spacing="4">${text}</text></g>`;
const sparkle = (x, y, s, t, t0) => { if (t < t0 || t > t0 + .7) return ''; const p = (t - t0) / .7, sc = Math.sin(p * Math.PI) * s; return `<g transform="translate(${x} ${y}) rotate(${p * 90}) scale(${sc.toFixed(3)})"><path d="M0 -60 L12 -12 L60 0 L12 12 L0 60 L-12 12 L-60 0 L-12 -12Z" fill="#fffbe0" stroke="#e8b13c" stroke-width="3"/></g>`; };
function dreamFrame() {
  let s = ''; for (let i = 0; i < 12; i++) s += `<circle cx="${i * 100}" cy="-30" r="115"/><circle cx="${i * 100}" cy="1950" r="115"/>`;
  for (let i = 0; i < 21; i++) s += `<circle cx="-45" cy="${i * 100}" r="115"/><circle cx="1125" cy="${i * 100}" r="115"/>`;
  return `<defs><filter id="bd"><feGaussianBlur stdDeviation="10"/></filter></defs><g fill="#fff" opacity=".94" filter="url(#bd)">${s}</g>`;
}
function scratches(t) { const i = Math.floor(t * 12); return `<g opacity=".35">${[0, 1].map(j => hash(i * 3 + j) > .55 ? `<path d="M${(hash(i + j * 7) * 1080).toFixed(0)} 0 l6 1920" stroke="#2a1d10" stroke-width="2"/>` : '').join('')}</g>`; }

export function makeShots(W) {
  const { sets, chars, maps, talking } = W;
  const { OTTO, ERNEST, RIVAL, GROCER } = chars;
  const O = sets.office, R = sets.rival, C = sets.country, M = sets.map, $ = sets.money, TR = sets.trap, CITY = sets.city;
  // hand props
  const penO = P.pen(), penR = P.pen(), rolled = P.rolledMap(), cupO = P.teacup(), cupR = P.teacup(), phone = P.phone(), brush = P.brush();
  const miniA = P.miniMap(maps.plain, -8), miniB = P.miniMap(maps.copy, 8), grocerMap = P.miniMap(maps.agloe, 0);
  const bigCopy = new THREE.Group(); bigCopy.add(P.miniMap(maps.copy, 0)); bigCopy.scale.setScalar(1.6);
  grocerMap.scale.setScalar(1.3);
  const bulb = P.lightbulb(O.scene, [-.95, 4.95, -.9]); bulb.root.visible = false;
  // magnifier lens shows the competition's map, zoomed on Agloe
  const lensTex = maps.rival.clone(); lensTex.needsUpdate = true; lensTex.repeat.set(.16, .123); lensTex.offset.set(T.AX / 1000 - .08 + .03, 1 - T.AY / 1300 - .06);
  const mag = P.magnifier(M.scene, lensTex); mag.root.visible = false;
  // a ladder-free painter needs the store sign to start blank in the flashback
  const A = M.A;
  const ofc = { OTTO: { x: -.95, z: -.9 }, ERNEST: { x: 1.0, z: -1.1 } };
  const blinkless = {};

  // standard office pose for both partners
  const officeIdle = (t, o = {}) => {
    OTTO.set({ t, x: ofc.OTTO.x, z: ofc.OTTO.z, ry: 8, pose: 'idle', eyes: 'dot', mouth: 'smile', ...o.otto });
    ERNEST.set({ t, x: ofc.ERNEST.x, z: ofc.ERNEST.z, ry: -10, pose: 'idle', eyes: 'dot', mouth: 'smile', ...o.ernest });
  };
  const resetMap = (o = {}) => {
    M.sheet.material.map = o.rival ? maps.rival : maps.plain;
    M.dot.visible = !!o.dot; M.dot.scale.setScalar(o.dot || 1);
    M.label.visible = (o.label || 0) > 0; M.label.scale.x = Math.max(.001, o.label || 0); M.label.position.x = A.x + .15 + .8 * (o.label || 0);
    M.labelT.repeat.x = 1; M.circle.visible = (o.circle || 0) > 0; if (o.circle) M.circle.material.map = T.circleTex(o.circle);
    if (o.rival) { M.dot.visible = false; M.label.visible = false; }
    M.hand.visible = false; M.letters.visible = false; mag.root.visible = false;
  };
  const country = (o = {}) => {
    C.shop.root.visible = o.store !== false; C.shop.root.scale.setScalar(o.storeScale ?? 1); C.shop.setSign(o.sign ?? 1);
    C.car.root.visible = !!o.car; C.cows.forEach((c, i) => { c.root.visible = o.cows ? o.cows.includes(i) : true; });
  };

  const S = [];
  // 1. HOOK — the two of them, very pleased with themselves
  S.push({ at: 0, set: 'office', cast: ['OTTO', 'ERNEST'],
    pose(t) { const tp = Wt('hook1', 'pueblo'); O.pin.visible = t > tp; O.pin.scale.setScalar(pop(t, tp) * 1.4);
      officeIdle(t, { otto: { pose: 'hips', eyes: 'smug', brows: 'smug', mouth: 'smirk', look: [.15, 0] }, ernest: { poseL: 'hips', poseR: 'idle', eyes: 'smug', mouth: 'smile', look: [-.2, 0] } }); },
    cam: (t, lt) => ({ pos: [k(lt, [[0, .4], [2.6, 0]]), 4.3, k(lt, [[0, 12.5], [2.6, 10.6, E.out]])], look: [0, 2.85, -.8], fov: 31 }),
    fx: () => ({ dof: { focus: 11.5, aperture: .0012, maxblur: .006 } }) });
  // 2. ...somebody opened a shop in it
  S.push({ at: Ls('hook2'), set: 'country', cast: [], sfx: [{ t: Wt('hook2', 'tienda'), type: 'reveal' }],
    pose(t) { const tp = Wt('hook2', 'tienda'); country({ storeScale: pop(t, tp, .45), cows: [0, 1] });
      const shocked = t > tp + .1;
      C.cows[0].set({ t, eyes: shocked ? 'wide' : 'dot', chew: !shocked, yaw: shocked ? -55 : 0, pitch: shocked ? 8 : 0 });
      C.cows[1].set({ t: t + 1, eyes: shocked ? 'wide' : 'dot', chew: !shocked, yaw: shocked ? 40 : 0 }); },
    cam: (t, lt) => { const tp = Wt('hook2', 'tienda'); return { pos: [k(lt, [[0, -1], [2.8, 2.2]]), k(lt, [[0, 2.6], [2.8, 3.4]]), k(lt, [[0, 19], [2.8, 15.5, E.out]])], look: [7.2, 3.2, -6.2], fov: 28, shake: t > tp && t < tp + .35 ? 1 : 0 }; },
    fx: (t) => ({ dof: { focus: 13, aperture: .0006, maxblur: .005 }, sub: t > Wt('hook2', 'tienda') - .05 && t < Wt('hook2', 'tienda') + .5 ? 2 : 1 }) });
  // 3. New York, the thirties
  S.push({ at: Ls('ny'), set: 'city', cast: [], sfx: [{ t: Ls('ny') + .1, type: 'reveal' }],
    pose(t, lt) { CITY.carA.root.position.x = -18 + lt * 12; CITY.carA.setWheel(lt * 20); CITY.carB.root.position.x = 6 - lt * 10; CITY.carB.setWheel(lt * 17); },
    cam: (t, lt) => ({ pos: [k(lt, [[0, -26], [1.7, -22]]), k(lt, [[0, 2.2], [1.7, 3.2]]), 3.5], look: [40, k(lt, [[0, 9], [1.7, 7]]), -2], fov: 44 }),
    fx: () => ({ warm: .9, sub: 2 }),
    overlay(t, lt) { const st = clamp(lt / .25), sc = lerp(1.7, 1, E.out5(st)); return `<g opacity="${st.toFixed(2)}" transform="translate(540 430) scale(${sc.toFixed(3)})">
      <text text-anchor="middle" font-family="Rye" font-size="128" fill="#fff4dc" stroke="${INK}" stroke-width="14" paint-order="stroke">NUEVA YORK</text>
      <text y="100" text-anchor="middle" font-family="Alfa Slab One" font-size="66" fill="#ffcf5a" stroke="${INK}" stroke-width="10" paint-order="stroke" letter-spacing="8">AÑOS 30</text></g>`; } });
  // 4. they make road maps... and have a problem
  S.push({ at: Ls('maps'), set: 'office', cast: ['OTTO', 'ERNEST'], sfx: [{ t: Wt('maps', 'problema'), type: 'hit' }],
    pose(t) { const al = t > Wt('maps', 'problema'); O.pin.visible = false;
      officeIdle(t, { otto: { pose: al ? 'idle' : 'write', poseL: 'idle', poseR: al ? 'idle' : 'write', itemR: al ? null : penO, eyes: al ? 'wide' : 'dot', brows: al ? 'worried' : '', mouth: al ? 'o' : 'smile', look: al ? [.1, 0] : [.2, -.7], ry: al ? 5 : 15 },
        ernest: { poseL: 'hold', poseR: 'idle', itemL: rolled, eyes: al ? 'wide' : 'smug', brows: al ? 'worried' : '', mouth: al ? 'frown' : 'smile', look: al ? [-.1, 0] : [-.5, -.4] } });
      if (!al) { OTTO.items.R.rotation.set(.6, 0, Math.sin(t * 12) * .25); } },
    cam: (t, lt) => { const tp = Wt('maps', 'problema'); const p = punch(t, tp, 1.4); return { pos: [1.4, k(lt, [[0, 5.2], [3.4, 4.6]]), k(lt, [[0, 11], [3.4, 9.6]]) - p], look: [0, 2.7, -.4], fov: 31 }; },
    fx: () => ({ dof: { focus: 10.5, aperture: .001, maxblur: .006 } }) });
  // 5. the competition copies them... all of it
  S.push({ at: Ls('copy'), set: 'rival', cast: ['RIVAL'], sfx: [{ t: Wt('copy', 'enteros'), type: 'reveal' }],
    pose(t) { const te = Wt('copy', 'enteros'), up = t > te, h = up ? E.back(clamp((t - te) / .3)) : 0;
      RIVAL.set({ t, x: 0, z: -.6, pose: up ? 'present' : 'write', poseL: up ? 'present' : 'idle', itemR: up ? null : penR, itemL: null, eyes: up ? 'happy' : 'smug', brows: up ? '' : 'smug', mouth: up ? 'grin' : 'smirk', look: up ? [0, 0] : [.3, -.75] });
      if (!up) RIVAL.items.R.rotation.set(.6, 0, Math.sin(t * 15) * .3);
      bigCopy.visible = up; if (up) { bigCopy.position.set(lerp(.4, 1.25, h), lerp(.8, 1.75, h), .7); bigCopy.rotation.set(0, -.25, -.1); RIVAL.root.add(bigCopy); } },
    cam: (t, lt) => ({ pos: [.3, 3.7, k(lt, [[0, 10.5], [2.2, 9.2]]) - punch(t, Wt('copy', 'enteros'), 1.2)], look: [0, 3.0, -.5], fov: 30 }),
    fx: () => ({ dof: { focus: 9.8, aperture: .0012, maxblur: .006 } }) });
  // 6. "¡Gracias por el mapa, chicos!"
  S.push({ at: Ls('rival1'), set: 'rival', cast: ['RIVAL'],
    pose(t, lt) { bigCopy.visible = true; bigCopy.position.set(1.25, 1.75, .7); bigCopy.rotation.set(0, -.25, -.1); RIVAL.root.add(bigCopy);
      RIVAL.set({ t, x: 0, z: -.6, pose: 'present', poseR: lt > 1.0 ? 'wave' : 'present', eyes: lt > .9 ? 'happy' : 'smug', brows: 'raise', mouth: talking('RIVAL', t) ? 'talk' : 'grin', tilt: Math.sin(t * 3) * 4 }); },
    cam: (t, lt) => ({ pos: [.6, 3.6, 6.6 - lt * .3], look: [0, 3.25, -.6], fov: 30 }),
    fx: () => ({ dof: { focus: 7.2, aperture: .0018, maxblur: .008 } }) });
  // 7. and proving it is impossible
  S.push({ at: Ls('prove'), set: 'office', cast: ['OTTO'],
    pose(t) { bigCopy.visible = false;
      OTTO.set({ t, x: ofc.OTTO.x, z: ofc.OTTO.z, ry: 0, pose: 'shrug', itemL: miniA, itemR: miniB, eyes: 'dot', brows: 'worried', mouth: 'wavy', sweat: true, look: [.15, .1] }); },
    cam: (t, lt) => ({ pos: [-.6, 3.6, k(lt, [[0, 7.6], [1.9, 6.9]])], look: [-.9, 3.05, -.75], fov: 32 }),
    fx: () => ({ dof: { focus: 7.4, aperture: .0018, maxblur: .008 } }) });
  // 8. that the road is YOURS?
  S.push({ at: Ls('road'), set: 'country', cast: ['OTTO'], sfx: [{ t: Ls('road') + .25, type: 'pop' }, { t: Wt('road', 'que', 1) + .05, type: 'pop' }],
    pose(t) { const t2 = Wt('road', 'que', 1); country({ cows: [0] });
      OTTO.set({ t, x: 0, z: .3, ry: 10, pose: t > t2 ? 'shrug' : 'idle', poseR: t > t2 ? 'shrug' : 'point', eyes: 'dot', brows: 'raise', mouth: t > t2 ? 'wavy' : 'flat', look: t > t2 ? [0, 0] : [.5, -.6] });
      C.cows[0].set({ t, yaw: -30, pitch: Math.sin(t * 5) * 4 }); },
    cam: (t, lt) => ({ pos: [1.8, 2.1, k(lt, [[0, 7.5], [2.5, 8.6]])], look: [-.2, 2.6, -1], fov: 34 }),
    fx: () => ({ dof: { focus: 8, aperture: .0012, maxblur: .006 } }),
    overlay(t) { const t1 = Ls('road') + .25, t2 = Wt('road', 'que', 1); return qmark(220, 520, pop(t, t1) * 1.1, -12) + qmark(860, 470, pop(t, t2) * 1.3, 14); } });
  // 9. until Otto has an idea
  S.push({ at: Ls('idea'), set: 'office', cast: ['OTTO', 'ERNEST'], sfx: [{ t: Wt('idea', 'ocurre'), type: 'ding' }],
    pose(t) { const tb = Wt('idea', 'ocurre'), got = t > tb; bulb.root.visible = got; const b = pop(t, tb, .4); bulb.root.scale.setScalar(Math.max(.001, b * .62)); bulb.light.intensity = got ? 8 + Math.sin(t * 20) * 2 : 0;
      OTTO.set({ t, x: ofc.OTTO.x, z: ofc.OTTO.z, ry: 6, pose: 'idle', poseR: got ? 'point' : 'think', arms: got ? undefined : undefined, eyes: got ? 'smug' : 'dot', brows: got ? 'raise' : 'flat', mouth: got ? 'grin' : 'flat', look: got ? [.1, 0] : [.4, .6] });
      if (got) OTTO.set({ t, x: ofc.OTTO.x, z: ofc.OTTO.z, ry: 6, poseL: 'idle', poseR: 'cheer', eyes: 'smug', brows: 'raise', mouth: 'grin', look: [.1, .15] });
      ERNEST.set({ t, x: ofc.ERNEST.x, z: ofc.ERNEST.z, ry: -25, pose: 'idle', eyes: 'dot', mouth: got ? 'o' : 'smile', look: [-.9, .1], tilt: -8 }); },
    cam: (t, lt) => ({ pos: [-.4, 4.0, k(lt, [[0, 8.2], [1.9, 7.4]]) - punch(t, Wt('idea', 'ocurre'), .8)], look: [-.8, 3.55, -.75], fov: 32 }),
    fx: () => ({ dof: { focus: 8.2, aperture: .0015, maxblur: .008 } }) });
  // 10. OTTO: "¿Y si nos inventamos un pueblo?"
  S.push({ at: Ls('otto1'), set: 'office', cast: ['OTTO', 'ERNEST'],
    pose(t) { bulb.root.visible = false;
      OTTO.set({ t, x: ofc.OTTO.x, z: ofc.OTTO.z, ry: 28, pose: 'idle', poseR: 'present', eyes: 'smug', brows: 'raise', mouth: talking('OTTO', t) ? 'talk' : 'grin', look: [.5, 0] });
      ERNEST.set({ t, x: ofc.ERNEST.x, z: ofc.ERNEST.z, ry: -28, pose: 'idle', eyes: 'dot', brows: 'up', mouth: 'flat', look: [-.5, 0] }); },
    cam: (t, lt) => ({ pos: [k(lt, [[0, -2.2], [1.7, -1.6]]), 3.8, 9.0], look: [.1, 3.1, -.8], fov: 31 }),
    fx: () => ({ dof: { focus: 9.4, aperture: .0012, maxblur: .006 } }) });
  // 11. ERNEST: "¿Un pueblo... falso?"
  S.push({ at: Ls('ernest1'), set: 'office', cast: ['OTTO', 'ERNEST'],
    pose(t) { OTTO.set({ t, x: ofc.OTTO.x, z: ofc.OTTO.z, ry: 28, pose: 'idle', eyes: 'smug', mouth: 'smirk', look: [.5, 0] });
      ERNEST.set({ t, x: ofc.ERNEST.x, z: ofc.ERNEST.z, ry: -18, pose: 'idle', poseR: 'scared', eyes: 'wide', brows: 'up', mouth: talking('ERNEST', t) ? 'talk' : 'o', look: [-.2, 0], tilt: Math.sin(t * 4) * 3 }); },
    cam: (t, lt) => ({ pos: [1.6, 3.6, 6.4 - lt * .3], look: [1.0, 3.15, -.95], fov: 32 }),
    fx: () => ({ dof: { focus: 7.1, aperture: .0018, maxblur: .008 } }) });
  // 12a. at a lost crossroads (map)
  S.push({ at: Ls('cows'), set: 'map', cast: [],
    pose() { resetMap({}); },
    cam: (t, lt) => { const p = seg(lt, 0, Wt('cows', 'donde') - Ls('cows') + .2), tx = lerp(-1.7, A.x, p), tz = lerp(3.15, A.z, p); return { pos: [tx + .6, 4.6 - p * .8, tz + 3.2], look: [tx, 0, tz], fov: 36, hand: .5 }; },
    fx: (t, lt) => ({ dof: { focus: 5.4, aperture: .002, maxblur: .01 } }) });
  // 12b. where there are only cows
  S.push({ at: Wt('cows', 'donde'), set: 'country', cast: [],
    pose(t) { country({ store: false, cows: [0, 1] }); C.cows[0].root.rotation.y = -60 * D2R; C.cows[0].set({ t, yaw: -10, eyes: 'smug' }); C.cows[1].set({ t: t + 2 }); },
    cam: (t, lt) => ({ pos: [k(lt, [[0, -3.2], [1.2, -3.6]]), 2.4, -1.2], look: [-5.4, 2.0, -7.4], fov: 32 }),
    fx: () => ({ dof: { focus: 6.6, aperture: .0015, maxblur: .008 } }) });
  // 12c. they draw a town that doesn't exist
  S.push({ at: Wt('cows', 'dibujan'), set: 'map', cast: [], sfx: [{ t: Wt('cows', 'pueblo'), type: 'pop' }],
    pose(t, lt) { const tp = Wt('cows', 'pueblo'); resetMap({ dot: pop(t, tp, .3) * 1.2 || .001 }); M.dot.visible = t > tp;
      M.hand.visible = true; const ang = t * 16, r = .12 * (1 - seg(t, tp, tp + .4)), lift = seg(t, tp + .3, tp + .9);
      M.hand.position.set(A.x + Math.cos(ang) * r, .78 + lift * .8, A.z + Math.sin(ang) * r); },
    cam: (t, lt) => ({ pos: [A.x + 1.0, k(lt, [[0, 3.4], [2, 3.0]]), A.z + 2.9], look: [A.x, 0, A.z], fov: 34 }),
    fx: () => ({ dof: { focus: 4.1, aperture: .003, maxblur: .012 } }) });
  // 13. Agloe: their initials, scrambled (3D letters)
  const t1 = Wt('name', 'sus'), t2 = Wt('name', 'revueltas') - .15, t3 = t2 + .38;
  S.push({ at: Ls('name'), set: 'map', cast: [], sfx: [{ t: t1, type: 'whoosh' }, { t: t2, type: 'whoosh' }, { t: t3, type: 'stamp' }],
    pose(t, lt) { resetMap({ dot: 1, label: seg(t, t3, t3 + .25) }); M.letters.visible = true;
      const order = ['O', 'G', 'L', 'E', 'A'], target = { A: 0, G: 1, L: 2, O: 3, E: 4 };
      const fly = seg(t, t1 - .05, t1 + .4, E.out), sh = seg(t, t2, t2 + .35, E.io), fin = t > t3;
      order.forEach((ch, i) => {
        const m = M.L[ch], j = target[ch]; m.visible = lt > .05;
        const sx = (i - 2) * .34, ex = (j - 2) * .34;
        let x = lerp(A.x + (i - 2) * .12, A.x + sx, fly), y = lerp(.05, 1.2, fly), z = A.z + .3;
        if (sh > 0) { x = A.x + lerp(sx, ex, sh); y = 1.2 + Math.sin(sh * Math.PI) * (j < i ? .45 : j > i ? -.2 : 0); z = A.z + .3 + Math.sin(sh * Math.PI) * (j < i ? .35 : j > i ? -.35 : 0); }
        m.position.set(x, y, z); const s = lerp(.06, .3, fly) * (fin ? 1 + .25 * (1 - seg(t, t3, t3 + .2)) : 1); m.scale.setScalar(s);
        m.rotation.set(-.35, Math.sin(t * 2 + i) * .15 + (1 - fly) * 3, Math.sin(sh * Math.PI) * (j - i) * .15);
        m.material.color.set(fin ? '#d6262b' : '#fff4dc');
      }); },
    cam: (t, lt) => ({ pos: [A.x, 2.7, A.z + 7.4 - lt * .3], look: [A.x, 1.05, A.z], fov: 30 }),
    fx: () => ({ dof: { focus: 6.3, aperture: .002, maxblur: .01 }, sub: 2 }),
    overlay(t, lt) {
      const Aname = 'OTTO G. LINDBERG', Bname = 'ERNEST ALPERS', adv = 52, ax = 540 - Aname.length * adv / 2 + adv / 2, bx = 540 - Bname.length * adv / 2 + adv / 2;
      const typed = Math.floor(clamp(lt / .6) * (Aname.length + Bname.length)), hl = t > t1, keys = { 0: 1, 5: 1, 8: 1 }, keysB = { 0: 1, 7: 1 };
      let s = `<rect x="0" y="300" width="1080" height="260" fill="#140c05" opacity=".45"/>`;
      [...Aname].forEach((ch, i) => { if (i < typed) s += `<text x="${ax + i * adv}" y="410" text-anchor="middle" font-family="Special Elite" font-size="70" fill="${keys[i] && hl ? '#ff5a4e' : '#fff4dc'}">${ch}</text>`; });
      [...Bname].forEach((ch, i) => { if (i + Aname.length < typed) s += `<text x="${bx + i * adv}" y="510" text-anchor="middle" font-family="Special Elite" font-size="70" fill="${keysB[i] && hl ? '#ff5a4e' : '#fff4dc'}">${ch}</text>`; });
      return s;
    } });
  // 14a. it's a trap
  const tsnap = Wt('trap', 'trampa', 0, true) - .08;
  S.push({ at: Ls('trap'), set: 'trap', cast: [], sfx: [{ t: tsnap, type: 'snap' }],
    pose(t) { TR.trap.setSnap(seg(t, tsnap, tsnap + .07, E.in)); TR.trap.root.rotation.y = -62 * D2R; },
    cam: (t, lt) => ({ pos: [1.6, 4.0, k(lt, [[0, 8.6], [.8, 7.8]])], look: [.2, .7, 0], fov: 32, shake: t > tsnap && t < tsnap + .3 ? 2 : 0 }),
    fx: (t) => ({ sub: 2, dof: { focus: 10, aperture: .002, maxblur: .01 }, flash: t > tsnap + .04 && t < tsnap + .18 ? .7 * (1 - (t - tsnap - .04) / .14) : 0 }) });
  // 14b. if Agloe shows up on someone else's map, they copied
  S.push({ at: Wt('trap', 'si'), set: 'map', cast: [], sfx: [{ t: Wt('trap', 'agloe'), type: 'whoosh' }, { t: Wt('trap', 'copiado'), type: 'stamp' }],
    pose(t) { const ta = Wt('trap', 'agloe'); resetMap({ rival: true, circle: seg(t, ta, ta + .5, E.out) }); },
    cam: (t, lt) => { const tc = Wt('trap', 'copiado'); return { pos: [A.x + .9, k(lt, [[0, 3.6], [2.9, 3.0]]), A.z + 3.2], look: [A.x + .6, 0, A.z - .1], fov: 34, shake: t > tc && t < tc + .3 ? 1.5 : 0 }; },
    fx: () => ({ dof: { focus: 4.4, aperture: .002, maxblur: .01 } }),
    overlay(t) { const tc = Wt('trap', 'copiado'); const ss = pop(t, tc, .3); return ss ? stamp(540, 1120, ss * 1.0 + (1 - clamp((t - tc) / .2)) * .6, 'COPIADO', -10, clamp((t - tc) / .1).toFixed(2)) : ''; } });
  // 15. and one fine day...
  S.push({ at: Ls('oneday'), set: 'office', cast: ['OTTO', 'ERNEST'], sfx: [{ t: Ls('oneday'), type: 'riser', end: Ls('zas') }],
    pose(t, lt) { const ex = lerp(4.5, 1.0, seg(lt, 0, 1.1, E.out));
      OTTO.set({ t, x: ofc.OTTO.x, z: ofc.OTTO.z, ry: 5, pose: 'idle', poseR: 'cup', itemR: cupO, eyes: 'closed', mouth: 'flat' });
      ERNEST.set({ t, x: ex, z: ofc.ERNEST.z, ry: -40, legs: lt < 1.1 ? 'walk' : 'stand', walk: t * 10, pose: 'idle', poseR: 'cheer', itemR: rolled, eyes: 'wide', mouth: 'o', look: [-.5, 0] }); },
    cam: (t, lt) => ({ pos: [k(lt, [[0, .6], [1.4, -.2]]), 3.6, k(lt, [[0, 10.5], [1.4, 8.4, E.in]])], look: [0, 3.0, -.7], fov: 31 }),
    fx: () => ({ expo: .78, vig: .55, dof: { focus: 9.5, aperture: .0012, maxblur: .006 } }) });
  // 16a. ZAS! Agloe on the competition's map
  S.push({ at: Ls('zas'), set: 'map', cast: [], sfx: [{ t: Ls('zas'), type: 'impact' }],
    pose(t, lt) { resetMap({ rival: true }); mag.root.visible = true; const mi = E.out5(clamp(lt / .35));
      mag.root.position.set(lerp(A.x + 3.5, A.x + .55, mi), 1.2, lerp(A.z + 3, A.z + .15, mi)); mag.root.rotation.set(-70 * D2R, 0, 25 * D2R); },
    cam: (t, lt) => ({ pos: [A.x + .8, 6.6 - lt * .3, A.z + 4.4], look: [A.x + .5, .6, A.z], fov: 34, shake: lt < .3 ? 2 : 0 }),
    fx: (t, lt) => ({ sub: 2, flash: lt < .28 ? 1 - lt / .28 : 0, dof: { focus: 7.4, aperture: .0012, maxblur: .006 } }) });
  // 16b. their faces
  const tg = Wt('zas', 'competencia') + .45;
  S.push({ at: Wt('zas', 'competencia') - .05, set: 'office', cast: ['OTTO', 'ERNEST'],
    pose(t) { const g2 = t > tg; mag.root.visible = false;
      OTTO.set({ t, x: ofc.OTTO.x, z: ofc.OTTO.z, ry: 6, pose: g2 ? 'cheer' : 'scared', eyes: g2 ? 'happy' : 'wide', mouth: g2 ? 'grin' : 'jaw', brows: g2 ? '' : 'up', squash: g2 ? 1 + .1 * Math.sin(clamp((t - tg) / .3) * Math.PI) : 1 });
      ERNEST.set({ t, x: ofc.ERNEST.x, z: ofc.ERNEST.z, ry: -6, pose: g2 ? 'cheer' : 'scared', eyes: g2 ? 'happy' : 'wide', mouth: g2 ? 'grin' : 'jaw', brows: g2 ? '' : 'up' }); },
    cam: (t, lt) => ({ pos: [0, 3.7, 9.2 - lt * .4], look: [0, 3.2, -.8], fov: 31, shake: lt < .25 ? 1 : 0 }),
    fx: () => ({ dof: { focus: 9.5, aperture: .0012, maxblur: .006 } }) });
  // 17. Otto already sees himself swimming in money
  S.push({ at: Ls('rich'), set: 'money', cast: ['OTTO'], sfx: [{ t: Ls('rich') + .1, type: 'ding' }],
    pose(t) { const sw = Math.sin(t * 7);
      OTTO.set({ t, x: 0, y: -.55, z: .4, ry: 0, arms: [[new THREE.Vector3(.55, .8 + sw * .3, .3).normalize(), new THREE.Vector3(.1, .6 + sw * .5, .7).normalize()], [new THREE.Vector3(.55, .8 - sw * .3, .3).normalize(), new THREE.Vector3(.1, .6 - sw * .5, .7).normalize()]], eyes: 'dollar', mouth: 'grin', tilt: sw * 6, bob: Math.sin(t * 7) * .1 }); },
    cam: (t, lt) => ({ pos: [Math.sin(lt) * .6, 3.3, 8.6 - lt * .4], look: [0, 2.5, 0], fov: 34 }),
    fx: () => ({ bloom: .25, sub: 2 }),
    overlay: () => dreamFrame() });
  // 18. OTTO: "¡Ernest, llama a los abogados! ¡A todos!"
  S.push({ at: Ls('otto2'), set: 'office', cast: ['OTTO', 'ERNEST'], sfx: [{ t: Wt('otto2', 'llama'), type: 'ring' }],
    pose(t) { const t2 = Wt('otto2', 'a', 1);
      OTTO.set({ t, x: ofc.OTTO.x, z: ofc.OTTO.z, ry: 22, pose: 'idle', poseR: t > t2 ? 'pump' : 'point', eyes: 'dot', brows: 'angry', mouth: talking('OTTO', t) ? 'talk' : 'grin', look: [.4, 0], bob: t > t2 ? Math.abs(Math.sin(t * 12)) * .08 : 0 });
      ERNEST.set({ t, x: ofc.ERNEST.x, z: ofc.ERNEST.z, ry: -20, pose: 'idle', poseL: 'phone', itemL: phone, eyes: 'wide', brows: 'up', mouth: 'o', look: [-.4, 0], sweat: true }); },
    cam: (t, lt) => ({ pos: [k(lt, [[0, -1.8], [2.9, -1.2]]), 3.7, k(lt, [[0, 8.6], [2.9, 7.8]])], look: [-.1, 3.15, -.8], fov: 32, shake: t > Wt('otto2', 'a', 1) ? .6 : 0 }),
    fx: () => ({ dof: { focus: 8.6, aperture: .0013, maxblur: .007 } }) });
  // 19. but the competition doesn't even blink
  S.push({ at: Ls('calm'), set: 'rival', cast: ['RIVAL'], sfx: [{ t: Ls('calm') + .9, type: 'sip' }],
    pose(t, lt) { bigCopy.visible = false; R.cup.visible = false; const sip = seg(lt, .5, 1.0) - seg(lt, 1.4, 1.8);
      RIVAL.set({ t, x: 0, z: -.6, pose: 'idle', blend: ['idle', 1], poseR: sip > .5 ? 'cup' : 'hold', itemR: cupR, eyes: 'closed', brows: 'flat', mouth: 'smile', tilt: -sip * 6, nod: -sip * .1 }); },
    cam: (t, lt) => ({ pos: [-.4, 3.6, k(lt, [[0, 9.4], [1.9, 8.6]])], look: [0, 3.1, -.6], fov: 30 }),
    fx: () => ({ dof: { focus: 9.1, aperture: .0012, maxblur: .006 } }) });
  // 20. RIVAL: "No hemos copiado nada. Agloe existe. ¡Si hasta tiene tienda!"
  S.push({ at: Ls('reply'), set: 'rival', cast: ['RIVAL'],
    pose(t) { const ta = Wt('reply', 'agloe'), ts = Wt('reply', 'si'); const g3 = t > ts;
      RIVAL.set({ t, x: 0, z: -.6, pose: 'idle', poseR: g3 ? 'shrug' : t > ta ? 'point' : 'hold', poseL: g3 ? 'shrug' : 'idle', itemR: g3 || t > ta ? null : cupR, eyes: g3 ? 'happy' : 'smug', brows: 'raise', mouth: talking('RIVAL', t) ? 'talk' : 'smirk', tilt: Math.sin(t * 2.5) * 3 }); },
    cam: (t, lt) => { const ta = Wt('reply', 'agloe'), ts = Wt('reply', 'si'); return { pos: [.4, 3.55, 6.0 - punch(t, ta, .5) - punch(t, ts, .7)], look: [0, 3.25, -.6], fov: 30 }; },
    fx: () => ({ dof: { focus: 6.6, aperture: .0018, maxblur: .008 } }) });
  // 21a. and it's true — Otto and Ernest arrive
  S.push({ at: Ls('true'), set: 'country', cast: ['OTTO', 'ERNEST'],
    pose(t) { country({ car: true, cows: [0, 1, 2] }); C.car.root.position.set(-6.5, 0, 4.6); C.car.setWheel(0);
      OTTO.set({ t, x: -3.15, z: 5.6, ry: 28, pose: 'scared', eyes: 'wide', brows: 'up', mouth: 'jaw', look: [.6, .15] });
      ERNEST.set({ t, x: -1.85, z: 5.4, ry: 28, pose: 'scared', eyes: 'wide', brows: 'up', mouth: 'jaw', look: [.6, .15] });
      C.cows.forEach((c, i) => c.set({ t: t + i })); },
    cam: (t, lt) => ({ pos: [-2.0, 3.5, 15 - lt * .5], look: [-2.5, 3.0, 5.4], fov: 30 }),
    fx: () => ({ dof: { focus: 9.4, aperture: .0012, maxblur: .006 } }) });
  // 21b. where there used to be only cows
  S.push({ at: Wt('true', 'donde'), set: 'country', cast: [],
    pose(t) { country({ cows: [0, 1] }); C.cows[0].root.position.set(2.2, 0, -4.2); C.cows[0].root.rotation.y = -40 * D2R; C.cows[1].root.position.set(-.6, 0, -6.6); C.cows[1].root.rotation.y = -10 * D2R; C.cows[0].set({ t, yaw: -15 }); C.cows[1].set({ t: t + 1 }); },
    cam: (t, lt) => ({ pos: [k(lt, [[0, -2.2], [1.4, -1.2]]), 2.8, 4.5], look: [k(lt, [[0, 2.5], [1.4, 4.5]]), 2.4, -6.5], fov: 34 }),
    fx: () => ({ dof: { focus: 9, aperture: .0008, maxblur: .005 } }) });
  // 21c. the Agloe General Store
  S.push({ at: Wt('true', 'alguien'), set: 'country', cast: ['GROCER'], sfx: [{ t: Wt('true', 'tienda'), type: 'ding' }],
    pose(t) { country({ cows: [0] }); C.cows[0].set({ t });
      GROCER.set({ t, x: 6.4, y: .25, z: -3.6, ry: -10, pose: 'idle', poseR: 'wave', eyes: 'happy', mouth: 'smile' }); },
    cam: (t, lt) => ({ pos: [k(lt, [[0, 4.5], [2.4, 6.8]]), k(lt, [[0, 2.4], [2.4, 4.4]]), k(lt, [[0, 6.5], [2.4, 3.8]])], look: [7.6, k(lt, [[0, 3.0], [2.4, 4.6]]), -5.5], fov: 34 }),
    fx: () => ({ dof: { focus: 9, aperture: .001, maxblur: .006 } }),
    overlay(t) { const ts = Wt('true', 'tienda'); return sparkle(860, 560, 1.3, t, ts) + sparkle(330, 640, .9, t, ts + .15); } });
  // 22. flashback: the owner saw Agloe on Otto's map
  S.push({ at: Ls('why'), set: 'country', cast: ['GROCER'], sfx: [{ t: Ls('why'), type: 'whoosh' }],
    pose(t) { const tp = Wt('why', 'penso'), up = t > tp; country({ store: false, cows: [0] }); C.cows[0].set({ t });
      GROCER.set({ t, x: .2, z: .6, ry: -10, pose: 'hold', itemR: grocerMap, eyes: 'dot', brows: up ? 'raise' : 'flat', mouth: up ? 'smirk' : 'flat', look: up ? [0, 0] : [.1, -.8] });
      GROCER.items.R.position.x -= .45; },
    cam: (t, lt) => ({ pos: [1.4, 3.3, k(lt, [[0, 6.6], [2.8, 5.8]])], look: [0, 2.9, 0], fov: 33 }),
    fx: () => ({ sepia: .85, grain: .05, vig: .6, dof: { focus: 6.3, aperture: .0015, maxblur: .008 } }),
    overlay: (t) => scratches(t) });
  // 23. GROCER: "Si el mapa dice que esto es Agloe... pues será Agloe."
  S.push({ at: Ls('thought'), set: 'country', cast: ['GROCER'], sfx: [{ t: Ls('thought') + .3, type: 'brush' }, { t: Wt('thought', 'pues') + .2, type: 'brush' }],
    pose(t, lt) { const sign = seg(t, Ls('thought') + .3, Le('thought') - .05, E.lin); country({ sign, cows: [0] }); C.cows[0].set({ t });
      const gx = 7.6 - 2.0 + 4.0 * sign;
      GROCER.set({ t, x: gx, y: .25, z: -3.3, ry: -8, pose: 'idle', arms: [POSE_IDLE, [new THREE.Vector3(.45, .85, -.4).normalize(), new THREE.Vector3(.1, 1, -.55).normalize()]], itemR: brush, eyes: sign > .97 ? 'happy' : 'smug', brows: 'raise', mouth: talking('GROCER', t) ? 'talk' : 'smile', look: [-.2, 0] });
      GROCER.items.R.rotation.set(-.35, 0, Math.sin(t * 14) * .2); },
    cam: (t, lt) => ({ pos: [k(lt, [[0, 7.4], [3.4, 8.2]]), 4.7, k(lt, [[0, 7.8], [3.4, 7.0]])], look: [k(lt, [[0, 7.0], [3.4, 8.0]]), 3.9, -4.8], fov: 44 }),
    fx: () => ({ sepia: .85, grain: .05, vig: .6, dof: { focus: 12, aperture: .0008, maxblur: .005 } }),
    overlay: (t) => scratches(t) });
  // 24. Otto made up a town to catch a cheat...
  S.push({ at: Ls('pay1'), set: 'office', cast: ['OTTO'],
    pose(t) { O.pin.visible = true; O.pin.scale.setScalar(1.4);
      OTTO.set({ t, x: ofc.OTTO.x, z: ofc.OTTO.z, ry: 4, pose: 'down', eyes: 'dot', brows: 'worried', mouth: 'flat', look: [.1, -.8], tilt: 7, nod: .08 }); },
    cam: (t, lt) => ({ pos: [-.5, 4.2, k(lt, [[0, 9], [2.8, 7.4]])], look: [-.8, 3.0, -.7], fov: 31 }),
    fx: () => ({ expo: .8, vig: .55, sat: .9, dof: { focus: 8, aperture: .0015, maxblur: .007 } }) });
  // 25. ...and his own map made it real
  const tReal = Wt('pay2', 'real');
  S.push({ at: Ls('pay2'), set: 'map', cast: [], sfx: [{ t: Ls('pay2'), type: 'riser', end: Ls('pay2') + .9 }, { t: tReal, type: 'reveal' }],
    pose(t) { O.pin.visible = false; resetMap({ dot: 1.2, label: 1 }); },
    cam: (t, lt) => { const p = E.in(clamp(lt / .95)); return { pos: [A.x + .3 * (1 - p), lerp(3.6, .25, p), A.z + lerp(2.6, .1, p)], look: [A.x, 0, A.z], fov: 36 }; },
    fx: (t, lt) => ({ sub: 2, flash: clamp((lt - .6) / .35), flashCol: '#fff8e0', dof: { focus: 3.6, aperture: .002, maxblur: .01 } }) });
  S.push({ at: Ls('pay2') + .95, set: 'country', cast: ['GROCER'],
    pose(t) { country({ cows: [0, 1] }); C.cows.forEach((c, i) => c.set({ t: t + i }));
      GROCER.set({ t, x: 6.4, y: .25, z: -3.6, ry: -10, pose: 'idle', poseR: 'wave', eyes: 'happy', mouth: 'smile' }); },
    cam: (t, lt) => { const p = E.out5(clamp(lt / 1.6)); return { pos: [lerp(7.6, 5, p), lerp(6, 12, p), lerp(-1, 15, p)], look: [lerp(7.6, 6.5, p), lerp(4, 2.6, p), lerp(-6, -5, p)], fov: 36 }; },
    fx: (t, lt) => ({ flash: Math.max(0, 1 - lt / .35), flashCol: '#fff8e0' }),
    overlay(t) { return sparkle(560, 700, 1.6, t, tReal); } });
  // 26. the cows still can't believe it
  S.push({ at: Ls('button'), set: 'country', cast: [], sfx: [{ t: Wt('button', 'creerselo'), type: 'boing' }],
    pose(t) { country({ cows: [0, 1] }); const tt = Wt('button', 'creerselo');
      C.cows[0].root.position.set(-1.35, 0, 4.4); C.cows[0].root.rotation.y = -70 * D2R; C.cows[1].root.position.set(1.35, 0, 4.2); C.cows[1].root.rotation.y = -110 * D2R;
      C.cows[0].set({ t, eyes: 'smug', yaw: 0, pitch: -4 }); C.cows[1].set({ t: t + .7, eyes: t > tt ? 'twitch' : 'smug', yaw: 0, pitch: -4, roll: 5 }); },
    cam: (t, lt) => ({ pos: [0, 2.7, 16.6 - lt * .2], look: [0, 2.25, 6], fov: 30, hand: .4 }),
    fx: () => ({ dof: { focus: 10.6, aperture: .0018, maxblur: .009 } }) });
  // every frame starts from the same baseline, so any frame can be rendered on its own (workers render out of order)
  const cowHome = C.cows.map(c => [c.root.position.clone(), c.root.rotation.y]);
  const reset = () => {
    O.pin.visible = false; bulb.root.visible = false; mag.root.visible = false; bigCopy.visible = false; R.cup.visible = true;
    M.letters.visible = false; M.hand.visible = false;
    C.cows.forEach((c, i) => { c.root.position.copy(cowHome[i][0]); c.root.rotation.y = cowHome[i][1]; });
    C.car.root.position.set(-7, 0, 4.6);
  };
  S.forEach(s => { const p = s.pose; s.pose = (t, lt) => { reset(); p(t, lt); }; });
  return S;
}
const POSE_IDLE = [new THREE.Vector3(.18, -1, .02).normalize(), new THREE.Vector3(.08, -1, .14).normalize()];
