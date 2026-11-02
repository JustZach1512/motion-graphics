// Shot list for "El Turco". Every shot starts on a word of the narration.
import { THREE, k, seg, E, pop, clamp, lerp, hash, noise1, D2R } from '../../engine/engine.js';
import { POSES } from '../../engine/characters.js';
import * as P from './props.js';

const TL = window.TIMINGS;
export const LANG = window.LANG || 'es';
const LN = id => TL.lines.find(l => l.id === id);
const Ls = id => LN(id).start, Le = id => LN(id).end;
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
const ANCHORS = { en: {} };          // filled in when the English version is made
export const TXT = { es: { title: ['VIENA', '1809'], illegal: '¡ILEGAL!' }, en: { title: ['VIENNA', '1809'], illegal: 'ILLEGAL!' } }[LANG];
function Wt(id, word, n = 0, end = false) {
  if (LANG !== 'es') { const m = ANCHORS[LANG][`${id}:${word}:${n}`] ?? ANCHORS[LANG][`${id}:${word}`]; if (m === undefined) throw new Error(`no ${LANG} anchor for ${id}:${word}`); [word, n] = Array.isArray(m) ? m : [m, n]; }
  const ws = LN(id).words.filter(w => norm(w.w).startsWith(norm(word)));
  if (!ws.length) throw new Error(`"${word}" not in ${id}`);
  const w = ws[Math.min(n, ws.length - 1)]; return end ? w.end : w.start;
}
const INK = '#1c1411';
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const stamp = (x, y, s, text, r, o) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s.toFixed(3)})" opacity="${o}"><rect x="-250" y="-76" width="500" height="140" rx="16" fill="none" stroke="#d6262b" stroke-width="14"/><text y="32" font-family="Alfa Slab One" font-size="92" text-anchor="middle" fill="#d6262b" letter-spacing="3">${text}</text></g>`;

export function makeShots(W) {
  const { sets, chars, talking } = W;
  const { NAPO, TURK, OWNER, HIDDEN, NOBLE2, NOBLE3, EXTRA1, EXTRA2 } = chars;
  const H = sets.hall, O = sets.outside, G = sets.glory;
  const B = H.board, cab = H.cab;
  const bw = (f, r, y = 0) => { const [x, z] = P.sq2pos(f, r); return B.root.localToWorld(V(x, .06 + y, z)); };

  // ---------- the chess timeline: every piece's position is a pure function of t ----------
  const tSweep = Wt('sweep', 'barre') - .05;
  const moves = [
    { who: 'TURK', from: [3, 6], to: [3, 1], t0: Ls('wins') + .25, dur: .8, capture: true },
    { reset: Ls('napo') - .01 },
    { who: 'NAPO', from: [5, 1], to: [5, 2], t0: Wt('napo', 'mueve') - .1, dur: .6 },
    { who: 'TURK', from: [6, 6], to: [6, 5], t0: Wt('napo', 'contesta'), dur: .6 },
    { who: 'NAPO', from: [0, 0], to: [0, 3], t0: Ls('cheat') + .45, dur: 1.0 },
    { who: 'TURK', from: [0, 3], to: [0, 0], t0: Wt('fix', 'pieza') - .1, dur: 1.3 },
    { who: 'NAPO', from: [6, 0], to: [6, 2], t0: Ls('cheat2') + .35, dur: .8 },
  ];
  function boardAt(t) {
    const pos = new Map(), gone = new Set();
    B.pieces.forEach(pc => pos.set(pc, pc.userData.home.clone()));
    let carry = { NAPO: null, TURK: null };
    for (const m of moves) {
      if (m.reset !== undefined) { if (t >= m.reset) { B.pieces.forEach(pc => pos.set(pc, pc.userData.home.clone())); gone.clear(); } continue; }
      if (t < m.t0 - .4) continue;
      const pc = B.pieces.find(p2 => { const h = p2.userData.home, [x, z] = P.sq2pos(...m.from); const cur = pos.get(p2); return Math.abs(cur.x - x) < .01 && Math.abs(cur.z - z) < .01 && !gone.has(p2); });
      if (!pc) continue;
      const [x0, z0] = P.sq2pos(...m.from), [x1, z1] = P.sq2pos(...m.to);
      const p = clamp((t - m.t0) / m.dur), e = E.io(p);
      const cur = V(lerp(x0, x1, e), .06 + Math.sin(p * Math.PI) * .16, lerp(z0, z1, e));
      if (t >= m.t0 && m.capture && p >= 1) { const vic = B.pieces.find(p2 => p2 !== pc && Math.abs(pos.get(p2).x - x1) < .01 && Math.abs(pos.get(p2).z - z1) < .01); if (vic) { gone.add(vic); pos.set(vic, V(.85, .02, z1)); } }
      if (t >= m.t0) pos.set(pc, cur);
      carry[m.who] = { m, pc, p, cur, start: V(x0, .06, z0), end: V(x1, .06, z1) };
    }
    // the sweep: everything flies off, left to right, then lies on the floor
    if (t >= tSweep) {
      B.pieces.forEach((pc, i) => {
        const p0 = pos.get(pc), t0 = tSweep + (p0.x + .6) / 1.3 * .22; if (t < t0) return;
        const dt = t - t0, vx = 2.2 + hash(i) * 2, vy = 1.8 + hash(i + 9) * 2.4, vz = .6 + hash(i + 3) * 2.2;
        const w0 = B.root.localToWorld(p0.clone()); let y = w0.y + vy * dt - 4.9 * dt * dt;
        const tl = (vy + Math.sqrt(vy * vy + 2 * 9.8 * w0.y)) / 9.8, td = Math.min(dt, tl); y = Math.max(0, w0.y + vy * td - 4.9 * td * td);
        const wp = V(w0.x + vx * td, y, w0.z + vz * td); pos.set(pc, B.root.worldToLocal(wp)); pc.userData.spin = td * (6 + hash(i) * 8);
      });
    }
    return { pos, gone, carry };
  }
  function poseBoard(t) {
    const st = boardAt(t);
    B.pieces.forEach(pc => { pc.position.copy(st.pos.get(pc)); const sp = t >= tSweep ? (pc.userData.spin || 0) : 0; pc.rotation.set(sp * .8, sp * .3, sp); });
    return st;
  }
  // where a player's hand should be: resting, reaching for the piece, carrying it, coming back
  function hand(st, who, t, rest) {
    const c = st.carry[who]; if (!c) return rest;
    const { m } = c, up = V(0, .1, 0);
    const a = B.root.localToWorld(c.start.clone()).add(up), b = B.root.localToWorld(c.end.clone()).add(up), cur = B.root.localToWorld(c.cur.clone()).add(up);
    if (t < m.t0 - .4 || t > m.t0 + m.dur + .45) return rest;
    if (t < m.t0) return rest.clone().lerp(a, E.io(clamp((t - m.t0 + .4) / .4)));
    if (t <= m.t0 + m.dur) return cur;
    return b.clone().lerp(rest, E.io(clamp((t - m.t0 - m.dur) / .45)));
  }
  const turkRestL = () => bw(-1.2, 7.2, .1), turkRestR = () => bw(8.2, 7.2, .1);
  const napoRest = () => V(.35, 1.75, 1.05);
  // the cast in the hall
  const poseTurk = (t, st, o = {}) => {
    let ikR = hand(st, 'TURK', t, turkRestR()), ikL = turkRestL();
    if (o.ikR) ikR = o.ikR;
    const jerk = Math.round(Math.sin(t * .9) * 3) / 3;   // mechanical, stepped head turns
    TURK.set({ t, x: 0, y: 0, z: -1.3, s: 1.15, legs: 'dangle', still: true, ikL, ikR, eyes: o.eyes || 'smug', brows: o.brows || 'flat', mouth: 'flat', look: o.look || [jerk * .25, -.25], tilt: o.tilt || 0, blink: 0 });
  };
  const poseNapo = (t, st, o = {}) => {
    const reach = st && st.carry.NAPO && t > st.carry.NAPO.m.t0 - .4 && t < st.carry.NAPO.m.t0 + st.carry.NAPO.m.dur + .45;
    NAPO.set({ t, x: 0, y: 0, z: 1.8, ry: 180, legs: 'sit', lean: reach ? .22 : .08, pose: 'idle', poseL: 'napoleon', ikR: st ? hand(st, 'NAPO', t, napoRest()) : undefined, eyes: 'smug', brows: '', mouth: 'smirk', ...o });
  };
  const crowd = (t, mood = 'watch') => {
    const M = { watch: ['dot', 'smile', 'idle'], laugh: ['happy', 'grin', 'laugh'], shock: ['wide', 'o', 'scared'], clap: ['happy', 'grin', 'cheer'] }[mood];
    [[NOBLE2, -3.0, -3.2, 25], [NOBLE3, 3.1, -3.4, -25], [EXTRA1, -1.7, -4.6, 15], [EXTRA2, 1.8, -4.9, -15]].forEach(([c, x, z, ry], i) => c.set({ t: t + i, x, z, ry, pose: M[2], eyes: M[0], mouth: M[1], bob: mood === 'laugh' ? Math.abs(Math.sin(t * 9 + i)) * .06 : 0 }));
  };
  const CROWD = ['NOBLE2', 'NOBLE3', 'EXTRA1', 'EXTRA2'];
  const baseHall = (t, o = {}) => {
    cab.set({ t, open: o.open, drawer: o.drawer, cutaway: o.cutaway, ghost: o.ghost, slide: o.slide, lever: o.lever });
    H.chair.visible = !!o.chair;
    H.candleLight.intensity = 0;
  };
  const insideMan = (t, o = {}) => {
    const sx = 1.0 - (o.slide || 0) * .5;
    HIDDEN.set({ t, x: sx, y: .29, z: o.z ?? -.12, s: .3, legs: 'sit', pose: o.pose || 'idle', poseL: 'hold', itemL: H.candle.root, eyes: o.eyes || 'dot', brows: o.brows || 'worried', mouth: o.mouth || 'flat', sweat: true, look: o.look || [0, 0], tilt: o.tilt || 0, squash: o.squash || 1, ikL: o.ikL, ikR: o.ikR });
    HIDDEN.root.updateMatrixWorld(true);
    const fp = H.candle.flame.getWorldPosition(V(0, 0, 0)); H.candleLight.position.copy(fp); H.candleLight.intensity = 3.2 + noise1(t * 9, 4) * 1.2;
  };

  const S = [];
  const hallShot = (at, cast, pose, cam, fx, extra = {}) => S.push({ at, set: 'hall', cast, pose, cam, fx: fx || (() => ({})), ...extra });

  // 1. HOOK: the automaton that beat Napoleon
  hallShot(0, ['TURK'], (t) => { baseHall(t); const st = poseBoard(Ls('turk')); poseTurk(t, st, { look: [0, 0], eyes: 'smug', brows: 'smug' }); },
    (t, lt) => ({ pos: [k(lt, [[0, 1.0], [2.7, .6]]), 3.6, k(lt, [[0, 5.8], [2.7, 4.7, E.out]])], look: [0, 3.0, -1.0], fov: 30 }),
    () => ({ dof: { focus: 6, aperture: .0015, maxblur: .008 } }));
  // 2. ...and Napoleon tried to cheat
  hallShot(Ls('hook2'), ['NAPO'], (t, lt) => { baseHall(t, { chair: true }); const st = poseBoard(Ls('cheat') + 1.6);
      const sneak = V(-.35 + seg(lt, .5, 1.6) * .3, 1.78, .55 - seg(lt, .5, 1.6) * .35);
      poseNapo(t, null, { eyes: 'smug', brows: 'raise', mouth: 'smirk', look: [Math.sin(t * 5) * .7, .2], ikR: sneak, lean: .18 }); },
    (t, lt) => ({ pos: [.8, 3.4, k(lt, [[0, -3.0], [2.4, -2.5]])], look: [0, 2.75, 1.3], fov: 32 }),
    () => ({ dof: { focus: 4.3, aperture: .002, maxblur: .01 } }));
  // 3. Vienna, 1809
  S.push({ at: Ls('vienna'), set: 'outside', cast: [], sfx: [{ t: Ls('vienna') + .1, type: 'reveal' }],
    pose() {}, cam: (t, lt) => ({ pos: [k(lt, [[0, -4], [1.7, -2]]), k(lt, [[0, 2.5], [1.7, 3.5]]), k(lt, [[0, 16], [1.7, 13]])], look: [0, 7, -30], fov: 42 }),
    fx: () => ({ sub: 2 }),
    overlay(t, lt) { const st = clamp(lt / .25), sc = lerp(1.7, 1, E.out5(st)); return `<g opacity="${st.toFixed(2)}" transform="translate(540 430) scale(${sc.toFixed(3)})">
      <text text-anchor="middle" font-family="Rye" font-size="140" fill="#fff4dc" stroke="${INK}" stroke-width="14" paint-order="stroke">${TXT.title[0]}</text>
      <text y="104" text-anchor="middle" font-family="Alfa Slab One" font-size="70" fill="#ffcf5a" stroke="${INK}" stroke-width="10" paint-order="stroke" letter-spacing="8">${TXT.title[1]}</text></g>`; } });
  // 4. everyone talks about the Turk
  hallShot(Ls('turk'), ['TURK', 'OWNER', ...CROWD], (t, lt) => { baseHall(t); const st = poseBoard(Ls('turk')); poseTurk(t, st); crowd(t);
      OWNER.set({ t, x: -2.3, z: .9, ry: 35, pose: 'present2', poseL: 'idle', eyes: 'smug', mouth: 'grin' }); },
    (t, lt) => { const a = lerp(-38, 8, E.io(clamp(lt / 5.3))) * D2R, r = lerp(12, 9, E.io(clamp(lt / 5.3))); return { pos: [Math.sin(a) * r, 3.8, Math.cos(a) * r + .3], look: [0, 2.5, -.6], fov: 34 }; },
    () => ({ dof: { focus: 10, aperture: .0006, maxblur: .004 } }));
  // 5a. it plays chess...
  hallShot(Ls('wins'), ['TURK'], (t) => { baseHall(t); const st = poseBoard(t); poseTurk(t, st); },
    (t, lt) => ({ pos: [1.3, 3.0, k(lt, [[0, 2.7], [1.3, 2.3]])], look: [0, 1.75, 0], fov: 32 }),
    () => ({ dof: { focus: 3.0, aperture: .0025, maxblur: .01 } }));
  // 5b. ...and beats everyone
  hallShot(Wt('wins', 'gana') - .25, ['NOBLE3', 'NOBLE2', 'EXTRA1'], (t, lt) => { baseHall(t, { chair: true }); const st = poseBoard(t);
      NOBLE3.set({ t, x: 0, z: 1.8, ry: 180, legs: 'sit', pose: 'scared', eyes: 'wide', brows: 'up', mouth: 'jaw' });
      NOBLE2.set({ t, x: -1.6, z: 2.6, ry: 160, pose: 'cheer', eyes: 'happy', mouth: 'grin' }); EXTRA1.set({ t, x: 1.5, z: 2.7, ry: 200, pose: 'cheer', eyes: 'happy', mouth: 'grin' }); },
    (t, lt) => ({ pos: [.7, 3.4, -3.0], look: [0, 2.9, 1.9], fov: 34 }),
    () => ({ dof: { focus: 5, aperture: .0015, maxblur: .008 } }));
  // 6a. the owner opens the little doors
  const tD = Ls('doors') + .9;
  hallShot(Ls('doors'), ['OWNER', 'TURK'], (t, lt) => {
      const o = [seg(t, tD, tD + .5, E.out), seg(t, tD + .55, tD + 1.05, E.out), seg(t, tD + 1.1, tD + 1.6, E.out)];
      baseHall(t, { open: o, drawer: seg(t, tD + 1.65, tD + 2.1, E.out) }); const st = poseBoard(Ls('napo') - .02); poseTurk(t, st);
      OWNER.set({ t, x: -2.15, z: 1.1, ry: 28, pose: 'present2', poseL: 'idle', eyes: 'smug', brows: 'raise', mouth: 'smirk' }); },
    (t, lt) => ({ pos: [k(lt, [[0, -.8], [2.9, .2]]), 2.0, k(lt, [[0, 7.6], [2.9, 6.4]])], look: [-.3, 1.2, .6], fov: 34 }),
    () => ({ dof: { focus: 6.3, aperture: .0008, maxblur: .005 } }), { sfx: [{ t: tD, type: 'click' }, { t: tD + .55, type: 'click' }, { t: tD + 1.1, type: 'click' }] });
  // 6b. wheels, levers, gears. Nothing else.
  hallShot(Wt('doors', 'ruedas') - .05, ['TURK'], (t) => { baseHall(t, { open: [1, 1, 1], drawer: 1 }); poseBoard(Ls('napo') - .02); },
    (t, lt) => ({ pos: [k(lt, [[0, -.9], [2.8, -.3]]), 1.0, k(lt, [[0, 3.0], [2.8, 2.4]])], look: [-.5, .9, 0], fov: 34 }),
    () => ({ dof: { focus: 2.6, aperture: .0022, maxblur: .01 } }));
  // 7. OWNER: "¡Damas y caballeros, ni trucos ni trampas!"
  hallShot(Ls('owner'), ['OWNER', 'TURK', ...CROWD], (t) => { baseHall(t, { open: [1, 1, 1], drawer: 1 }); const st = poseBoard(Ls('napo') - .02); poseTurk(t, st); crowd(t);
      OWNER.set({ t, x: -2.15, z: 1.1, ry: 18, pose: 'present2', eyes: 'smug', brows: 'raise', mouth: talking('OWNER', t) ? 'talk' : 'grin', tilt: Math.sin(t * 3) * 3 }); },
    (t, lt) => ({ pos: [-1.2, 2.6, k(lt, [[0, 6.6], [2.7, 5.8]])], look: [-2.1, 3.0, 1.1], fov: 32 }),
    () => ({ dof: { focus: 5.2, aperture: .0013, maxblur: .007 } }));
  // 8. Napoleon sits, moves... and the Turk answers
  hallShot(Ls('napo'), ['NAPO', 'TURK', ...CROWD], (t) => { baseHall(t, { chair: true }); const st = poseBoard(t); poseTurk(t, st); poseNapo(t, st); crowd(t); },
    (t, lt) => ({ pos: [k(lt, [[0, 6.4], [2.7, 5.6]]), 3.9, k(lt, [[0, 8.4], [2.7, 7.4]])], look: [0, 2.5, .2], fov: 34 }),
    () => ({ dof: { focus: 9.5, aperture: .0008, maxblur: .005 } }));
  // 9. so Napoleon makes an illegal move
  const tIll = Wt('cheat', 'ilegal');
  hallShot(Ls('cheat'), ['NAPO'], (t) => { baseHall(t, { chair: true }); const st = poseBoard(t); poseNapo(t, st, { eyes: 'smug', brows: 'raise', mouth: 'smirk', look: [Math.round(Math.sin(t * 4)) * .5, .3] }); },
    (t, lt) => ({ pos: [.9, 3.3, -2.5], look: [-.15, 2.5, 1.1], fov: 34 }),
    () => ({ dof: { focus: 3.9, aperture: .0018, maxblur: .009 } }),
    { sfx: [{ t: tIll, type: 'stamp' }], overlay(t) { const ss = pop(t, tIll, .3); return ss ? stamp(540, 1000, ss * 1.0 + (1 - clamp((t - tIll) / .2)) * .5, TXT.illegal, -10, clamp((t - tIll) / .1).toFixed(2)) : ''; } });
  // 10a. the Turk picks up the piece... and puts it back
  hallShot(Ls('fix'), ['NAPO', 'TURK'], (t) => { baseHall(t, { chair: true }); const st = poseBoard(t); poseTurk(t, st); poseNapo(t, st, { eyes: 'wide', mouth: 'o' }); },
    (t, lt) => ({ pos: [-2.6, 3.1, k(lt, [[0, 1.6], [1.9, 1.3]])], look: [-.3, 1.95, .1], fov: 34 }),
    () => ({ dof: { focus: 2.8, aperture: .0025, maxblur: .01 } }));
  // 10b. the Turk shakes its head
  hallShot(Wt('fix', 'devuelve') + .35, ['TURK'], (t) => { baseHall(t); const st = poseBoard(t); poseTurk(t, st, { look: [Math.round(Math.sin(t * 9) * 2) / 2 * .6, 0], brows: 'angry', eyes: 'smug' }); },
    (t, lt) => ({ pos: [.5, 3.6, 3.6 - lt * .3], look: [0, 3.35, -1.3], fov: 30 }),
    () => ({ dof: { focus: 4.8, aperture: .0018, maxblur: .009 } }));
  // 11. Napoleon tries again
  hallShot(Ls('cheat2'), ['NAPO'], (t) => { baseHall(t, { chair: true }); const st = poseBoard(t); poseNapo(t, st, { eyes: 'dot', brows: 'angry', mouth: 'frown' }); },
    (t, lt) => ({ pos: [.9, 3.3, -2.5], look: [0, 2.6, 1.2], fov: 34 }),
    () => ({ dof: { focus: 3.9, aperture: .0018, maxblur: .009 } }));
  // 12a. the Turk winds up
  hallShot(Ls('sweep'), ['TURK'], (t, lt) => { baseHall(t); const st = poseBoard(t); poseTurk(t, st, { brows: 'angry', eyes: 'smug', ikR: turkRestR().lerp(V(1.3, 2.9, -.6), seg(lt, .2, 1.1, E.out)) }); },
    (t, lt) => ({ pos: [.4, 3.5, 4.2 - lt * .6], look: [.2, 3.1, -1.2], fov: 32, shake: lt > .9 ? .5 : 0 }),
    () => ({ dof: { focus: 5, aperture: .0015, maxblur: .008 } }), { sfx: [{ t: Ls('sweep'), type: 'riser', end: tSweep }] });
  // 12b. SWEEP
  hallShot(tSweep - .12, ['NAPO', 'TURK', ...CROWD], (t, lt) => { baseHall(t, { chair: true }); const st = poseBoard(t);
      const sw = seg(t, tSweep, tSweep + .25, E.out); poseTurk(t, st, { brows: 'angry', ikR: V(lerp(1.3, -1.1, sw), lerp(2.9, 1.8, Math.min(1, sw * 2)), lerp(-.6, .7, sw)) });
      poseNapo(t, null, { pose: 'scared', poseL: 'scared', eyes: 'wide', brows: 'up', mouth: 'jaw', lean: -.1 }); crowd(t, 'shock'); },
    (t, lt) => ({ pos: [6.6, 3.4, 6.2], look: [.2, 2.0, .4], fov: 36, shake: lt < .6 ? 2.5 : 0 }),
    () => ({ sub: 2, dof: { focus: 8.8, aperture: .0006, maxblur: .004 } }), { sfx: [{ t: tSweep, type: 'impact' }, { t: tSweep + .5, type: 'clatter' }] });
  // 13. NAPOLEON: "¡Ja! ¡Esta máquina tiene más genio que mis generales!"
  hallShot(Ls('napoline'), ['NAPO'], (t) => { baseHall(t, { chair: true }); const st = poseBoard(t);
      poseNapo(t, null, { pose: 'laugh', poseL: 'laugh', eyes: 'happy', mouth: talking('NAPO', t) ? 'talk' : 'grin', look: [0, .5], lean: -.12, bob: Math.abs(Math.sin(t * 8)) * .05 }); },
    (t, lt) => ({ pos: [.9, 3.3, -2.7 + lt * .2], look: [0, 2.9, 1.8], fov: 34 }),
    () => ({ dof: { focus: 4.6, aperture: .0015, maxblur: .008 } }));
  // 14. you see: the Turk was not a machine
  hallShot(Ls('reveal'), ['TURK'], (t, lt) => { baseHall(t); const st = poseBoard(t); poseTurk(t, st, { look: [0, 0], eyes: 'smug', brows: 'flat' }); },
    (t, lt) => ({ pos: [k(lt, [[0, -1.6], [1.9, -.5]]), 3.5, k(lt, [[0, 5.6], [1.9, 3.8, E.in]])], look: [0, 3.2, -1.2], fov: 30 }),
    () => ({ expo: .7, vig: .65, dof: { focus: 5.5, aperture: .0015, maxblur: .008 } }), { sfx: [{ t: Ls('reveal'), type: 'whoosh' }] });
  // 15. inside the cabinet there was a man, by candlelight
  hallShot(Ls('inside'), ['HIDDEN', 'TURK'], (t, lt) => { baseHall(t, { cutaway: true }); const st = poseBoard(t); poseTurk(t, st);
      insideMan(t, { eyes: 'dot', look: [Math.sin(t * 2) * .4, 0] }); },
    (t, lt) => ({ pos: [k(lt, [[0, 0], [5.6, .75]]), k(lt, [[0, 1.6], [5.6, 1.05]]), k(lt, [[0, 5.6], [5.6, 2.5]])], look: [k(lt, [[0, 0], [5.6, .9]]), .95, 0], fov: 34 }),
    () => ({ expo: .62, vig: .7, dof: { focus: 3.2, aperture: .0012, maxblur: .007 } }), { sfx: [{ t: Ls('inside') + .1, type: 'reveal' }] });
  // 16a. when the doors opened, he slid along his seat
  const tS = Ls('slide');
  hallShot(tS, ['HIDDEN', 'TURK'], (t, lt) => {
      const o01 = seg(t, tS + .3, tS + .8, E.out) - seg(t, tS + 2.0, tS + 2.4), o2 = seg(t, tS + 2.6, tS + 3.1, E.out), slide = seg(t, tS + 2.2, tS + 2.8, E.io);
      baseHall(t, { cutaway: true, ghost: true, open: [o01, o01, o2], slide }); const st = poseBoard(t); poseTurk(t, st);
      insideMan(t, { slide, eyes: 'wide', brows: 'worried', mouth: 'flat', look: [-.6, 0] }); },
    (t, lt) => ({ pos: [.3, 1.6, 5.4], look: [.1, .95, 0], fov: 36 }),
    () => ({ expo: .8, vig: .55, dof: { focus: 5.4, aperture: .0006, maxblur: .004 } }));
  // 16b. ...and moved the Turk's arm with a lever
  hallShot(Wt('slide', 'movia') - .1, ['HIDDEN', 'TURK'], (t, lt) => {
      const pull = .5 + .5 * Math.sin(t * 5);
      baseHall(t, { cutaway: true, slide: 0, lever: pull }); const st = poseBoard(Ls('napo') - .02);
      const knob = cab.lever.localToWorld(V(0, -.5, 0));
      insideMan(t, { eyes: 'dot', brows: 'flat', mouth: 'flat', ikR: knob, look: [0, .5] });
      poseTurk(t, st, { ikR: bw(4 + Math.sin(t * 5) * 2, 6, .2) }); },
    (t, lt) => ({ pos: [1.4, 2.7, k(lt, [[0, 7.4], [2.3, 6.6]])], look: [.4, 1.9, -.3], fov: 38 }),
    () => ({ expo: .85, vig: .55, dof: { focus: 7, aperture: .0006, maxblur: .004 } }));
  // 17. HIDDEN (muffled): "Uf... ¿Cuánto queda? Aquí dentro hace un calor..."
  hallShot(Ls('hidden'), ['HIDDEN', 'TURK'], (t) => { baseHall(t, { cutaway: true }); poseBoard(t);
      insideMan(t, { pose: 'fan', eyes: 'closed', brows: 'worried', mouth: talking('HIDDEN', t) ? 'talk' : 'wavy', tilt: Math.sin(t * 2) * 6 });
      HIDDEN.items.R.rotation.z = Math.sin(t * 14) * .5; },
    (t, lt) => ({ pos: [1.05, 1.08, k(lt, [[0, 2.5], [2.5, 2.1]])], look: [1.0, 1.05, 0], fov: 32 }),
    () => ({ expo: .62, vig: .7, dof: { focus: 2.3, aperture: .0018, maxblur: .009 } }));
  // 18. Napoleon conquered half of Europe...
  S.push({ at: Ls('pay1'), set: 'glory', cast: ['NAPO'], sfx: [{ t: Ls('pay1'), type: 'reveal' }],
    pose(t) { NAPO.set({ t, x: 0, y: 1.2, z: 0, ry: 0, pose: 'idle', poseL: 'napoleon', poseR: 'behind', eyes: 'smug', brows: 'smug', mouth: 'smirk', look: [.2, .3] }); },
    cam: (t, lt) => ({ pos: [k(lt, [[0, -1.2], [1.9, -.4]]), 1.4, k(lt, [[0, 9], [1.9, 7.6]])], look: [0, 3.7, 0], fov: 34 }),
    fx: () => ({ bloom: .22 }) });
  // 19a. ...but lost at chess
  hallShot(Ls('pay2'), ['NAPO'], (t) => { baseHall(t, { chair: true }); const st = poseBoard(t);
      poseNapo(t, null, { pose: 'down', poseL: 'down', eyes: 'dot', brows: 'worried', mouth: 'frown', look: [0, -.5], lean: .05, tilt: 8 }); NAPO.head.children.at(-1).rotation.z = .3; },
    (t, lt) => ({ pos: [.8, 3.2, -2.7], look: [0, 2.7, 1.8], fov: 34 }),
    () => ({ sat: .85, dof: { focus: 4.6, aperture: .0015, maxblur: .008 } }));
  // 19b. ...against a man stuck in a piece of furniture
  hallShot(Wt('pay2', 'senor') - .1, ['HIDDEN', 'TURK'], (t, lt) => { baseHall(t, { open: [0, 0, .32 + .05 * Math.sin(t * 6)] }); poseBoard(t);
      insideMan(t, { slide: 0, z: .35, eyes: 'dot', mouth: 'smile', pose: 'idle', poseR: 'wave', look: [-.3, 0] }); },
    (t, lt) => ({ pos: [-.3, 1.15, 3.2], look: [1.0, 1.0, .45], fov: 32 }),
    () => ({ dof: { focus: 3.0, aperture: .0018, maxblur: .009 } }));
  // 20. a very, very tight piece of furniture
  hallShot(Ls('button'), ['HIDDEN', 'TURK'], (t, lt) => { baseHall(t, { cutaway: true }); const st = poseBoard(t); poseTurk(t, st);
      insideMan(t, { eyes: 'closed', brows: 'worried', mouth: 'wavy', squash: .82, tilt: 22, pose: 'scared' }); },
    (t, lt) => { const p = E.out(clamp(lt / 2.2)); return { pos: [lerp(1.0, .4, p), lerp(1.05, 1.7, p), lerp(2.2, 6.4, p)], look: [lerp(1.0, .3, p), lerp(1.0, 1.4, p), 0], fov: 34 }; },
    () => ({ expo: .75, vig: .6 }), { sfx: [{ t: Wt('button', 'apretado'), type: 'boing' }] });

  // portrait frames: pull these shots' cameras back along their view line (and refocus)
  const DIST = { 0: 1.6, 1: 1.6, 3: 1.2, 5: 1.6, 6: 1.15, 8: 1.6, 9: 1.2, 10: 1.6, 12: 1.6, 13: 1.6, 14: 1.6, 16: 1.6, 17: 1.5, 18: 1.15, 23: 1.6, 24: 1.25 };
  Object.entries(DIST).forEach(([i, f]) => {
    const sh = S[i], cam = sh.cam, fx = sh.fx;
    sh.cam = (t, lt) => { const c = cam(t, lt); return { ...c, pos: c.pos.map((v, j) => c.look[j] + (v - c.look[j]) * f) }; };
    sh.fx = (t, lt) => { const o = fx(t, lt); return o.dof ? { ...o, dof: { ...o.dof, focus: o.dof.focus * f } } : o; };
  });
  // every frame starts from the same baseline (workers render frames out of order)
  const reset = () => { NAPO.head.children.at(-1).rotation.z = 0; HIDDEN.items.R.rotation.z = 0; };
  S.forEach(s => { const p = s.pose; s.pose = (t, lt) => { reset(); p(t, lt); }; });
  return S;
}
