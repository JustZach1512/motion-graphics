// The shot list. Every shot starts on a word of the narration (from build/timings.js),
// so if the voice is re-recorded the cuts follow it.
const TL = window.TIMINGS;
const LINE = id => TL.lines.find(l => l.id === id);
const Ls = id => LINE(id).start, Le = id => LINE(id).end;
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');
function Wn(id, word, n) { // start of the n-th (0-based) word starting with `word`
  const ws = LINE(id).words.filter(w => norm(w.w).startsWith(norm(word)));
  return (ws[n] || ws[ws.length - 1]).start;
}
function Wt(id, word, end = false) {
  const l = LINE(id), w = l.words.find(w => norm(w.w).startsWith(norm(word)));
  if (!w) throw new Error(`word "${word}" not in line ${id}`);
  return end ? w.end : w.start;
}
const C = (x, y, z, r = 0) => ({ x, y, z, r });
// quick ease-in to every shot so cuts feel like they land
const settle = (lt, amt = .06) => 1 + amt * (1 - E.out5(clamp(lt / .45)));
const punch = (t, t0, amt = .07, d = .35) => (t < t0 ? 0 : amt * Math.sin(clamp((t - t0) / d) * Math.PI) * (1 - clamp((t - t0) / d) * .5));
const flash = (t, t0, d = .28, col = '#fff') => (t >= t0 && t < t0 + d ? `<rect width="${W}" height="${H}" fill="${col}" opacity="${f(1 - (t - t0) / d)}"/>` : '');
const SEPIA = '<filter id="sepia" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.42 0.74 0.18 0 0.02  0.36 0.68 0.16 0 0.01  0.27 0.52 0.13 0 0  0 0 0 1 0"/></filter>';

const rolledMap = (r = -60) => `<g transform="rotate(${r})"><rect x="-16" y="-120" width="32" height="240" rx="14" fill="#efe2c4" stroke="${INK}" stroke-width="5"/><ellipse cy="-120" rx="16" ry="6" fill="#d8c8a4" stroke="${INK}" stroke-width="3"/><path d="M-16 -40 L16 -40" stroke="#c9452f" stroke-width="5"/></g>`;
const miniMap = (tint, sc = .15, r = 0) => `<g transform="rotate(${r}) scale(${sc}) translate(-500 -650)"><rect x="-10" y="-10" width="1020" height="1320" fill="${INK}"/>${mapSheet({ tint, id: 'mm' + (tint ? 1 : 0) })}</g>`;
const pin = (x, y, s) => (s <= 0 ? '' : `<g transform="${tr(x, y, s)}">${shadow(10, 4, 26, 8)}<path d="M0 0 L0 -70" stroke="#777" stroke-width="5"/><circle cy="-82" r="22" fill="#d6262b" stroke="${INK}" stroke-width="5"/><circle cx="-7" cy="-90" r="6" fill="#fff" opacity=".7"/></g>`);
function dust(t, t0, x, y, s = 1) {
  if (t < t0 || t > t0 + .9) return '';
  const p = (t - t0) / .9;
  return Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI - Math.PI; const r = 40 + E.out(p) * 220;
    return `<circle cx="${f(x + Math.cos(a) * r * s * 1.4)}" cy="${f(y + Math.sin(a) * r * .3 * s)}" r="${f((30 + 30 * p) * s)}" fill="#f3e3c4" opacity="${f(.8 * (1 - p))}"/>`; }).join('');
}
function papers(t, n = 8) {
  return Array.from({ length: n }, (_, i) => { const x = hash(i + 70) * 1000 + 40 + Math.sin(t * 2 + i) * 60, y = ((hash(i + 80) * 1600 + t * (260 + hash(i) * 200)) % 1700) + 200;
    return `<g transform="${tr(x, y, 1, Math.sin(t * 3 + i) * 40)}"><rect x="-60" y="-80" width="120" height="160" fill="#fbf7ee" stroke="${INK}" stroke-width="5"/>${[0, 1, 2, 3, 4].map(j => `<path d="M-40 ${-50 + j * 24} L40 ${-50 + j * 24}" stroke="#9a948a" stroke-width="5"/>`).join('')}<text y="-56" font-family="Alfa Slab One" font-size="20" text-anchor="middle" fill="#d6262b">DEMANDA</text></g>`; }).join('');
}
const dreamFrame = () => {
  let s = '';
  for (let i = 0; i < 12; i++) { s += `<circle cx="${i * 100}" cy="-30" r="110"/><circle cx="${i * 100}" cy="${H + 30}" r="110"/>`; }
  for (let i = 0; i < 21; i++) { s += `<circle cx="-40" cy="${i * 100}" r="110"/><circle cx="${W + 40}" cy="${i * 100}" r="110"/>`; }
  return `<g fill="#fff" opacity=".92" filter="url(#b8)">${s}</g>`;
};
const sparkle = (x, y, s, t, t0) => {
  if (t < t0 || t > t0 + .7) return '';
  const p = (t - t0) / .7, sc = Math.sin(p * Math.PI) * s;
  return `<g transform="${tr(x, y, sc, p * 90)}"><path d="M0 -60 L12 -12 L60 0 L12 12 L0 60 L-12 12 L-60 0 L-12 -12Z" fill="#fffbe0"/></g>`;
};
const grainScratches = (t) => {
  const i = Math.floor(t * 12);
  return `<g opacity=".35">${[0, 1].map(j => hash(i * 3 + j) > .55 ? `<path d="M${f(hash(i + j * 7) * W)} 0 L${f(hash(i + j * 7) * W + 6)} ${H}" stroke="#2a1d10" stroke-width="2"/>` : '').join('')}</g>
    <rect width="${W}" height="${H}" fill="#2a1a08" opacity="${f(.08 + hash(i) * .06)}"/>`;
};

const SHOTS = [
  // 1. hook: the two of them, very pleased with themselves
  { at: 0, sfx: [], draw(t, lt) {
      const c = handheld(C(540, k(lt, [[0, 1190], [2.4, 1150]]), k(lt, [[0, 1.3], [2.4, 1.42, E.out]]) * settle(lt)), t);
      const tp = Wt('hook1', 'pueblo');
      const chars = char({ ...OTTO, x: 370, y: 1660, s: 1.25, t, eyes: 'smug', mouth: 'smirk', brows: 'raise', pose: 'holdR', itemR: pen(.9, -150), look: [.3, 0], seed: 1 }) +
        char({ ...ERNEST, x: 735, y: 1675, s: 1.2, t, eyes: 'smug', mouth: 'smile', pose: 'hips', look: [-.3, 0], seed: 2 });
      return officeBack(c, t) + layer(c, 1, chars) + layer(c, 1.06, desk(1430) + pin(637, 1508, pop(t, tp) * 1.1)) + layer(c, 1.12, lamp(990, 610));
    } },
  // 2. ...and somebody opened a shop in it
  { at: Ls('hook2'), sfx: [{ t: Wt('hook2', 'tienda'), type: 'reveal' }], draw(t, lt) {
      const tp = Wt('hook2', 'tienda');
      const c = handheld(C(k(lt, [[0, 600], [2.7, 790]]), k(lt, [[0, 1190], [2.7, 1130]]), k(lt, [[0, 1.0], [2.7, 1.5, E.out]]) * settle(lt) + punch(t, tp, .05)), t, 1, t > tp && t < tp + .3 ? 6 : 0);
      const ss = pop(t, tp, .45);
      const shocked = t > tp + .15;
      const mid = cow({ x: 250, y: 1500, s: .42, t, eyes: shocked ? 'wide' : 'dot', chew: !shocked, headTilt: shocked ? -12 : 0 }) +
        cow({ x: 1010, y: 1600, s: .5, t: t + 1, flip: true, eyes: shocked ? 'wide' : 'dot', chew: !shocked }) + dust(t, tp + .1, 830, 1296, .9);
      return country(c, t, { store: ss > 0, storeScale: ss, mid });
    } },
  // 3. New York, the thirties
  { at: Ls('ny'), sfx: [{ t: Ls('ny') + .1, type: 'reveal' }], draw(t, lt) {
      const c = handheld(C(540, k(lt, [[0, 880], [1.8, 1060]]), k(lt, [[0, 1.2], [1.8, 1.08]])), t, .6);
      const st = clamp(lt / .25), sc = lerp(1.7, 1, E.out5(st));
      return city(c, t) + `<g opacity="${f(st)}" transform="${tr(540, 470, sc)}">
        <text text-anchor="middle" font-family="Rye" font-size="128" fill="#fff4dc" stroke="${INK}" stroke-width="14" paint-order="stroke">NUEVA YORK</text>
        <text y="100" text-anchor="middle" font-family="Alfa Slab One" font-size="66" fill="#ffcf5a" stroke="${INK}" stroke-width="10" paint-order="stroke" letter-spacing="8">AÑOS 30</text></g>`;
    } },
  // 4. Otto and Ernest make road maps... and have a problem
  { at: Ls('maps'), sfx: [{ t: Wt('maps', 'problema'), type: 'hit' }], draw(t, lt) {
      const tp = Wt('maps', 'problema');
      const alarm = t > tp;
      const c = handheld(C(540, 1170, k(lt, [[0, 1.12], [3.3, 1.26]]) * settle(lt) + punch(t, tp, .08)), t);
      const wr = alarm ? [[10, -6], [40, 60]] : [[10, -6], [40 + Math.sin(t * 13) * 7, 60 + Math.sin(t * 9) * 10]];
      const chars = char({ ...OTTO, x: 370, y: 1660, s: 1.25, t, arms: wr, itemR: pen(.9, -150), eyes: alarm ? 'wide' : 'dot', brows: alarm ? 'worried' : '', mouth: alarm ? 'o' : 'smile', look: alarm ? [0, 0] : [.2, .7], seed: 1 }) +
        char({ ...ERNEST, x: 740, y: 1675, s: 1.2, t, pose: 'holdL', itemL: rolledMap(-50), eyes: alarm ? 'wide' : 'smug', brows: alarm ? 'worried' : '', mouth: alarm ? 'frown' : 'smile', look: alarm ? [0, 0] : [-.5, .3], seed: 2 });
      return officeBack(c, t) + layer(c, 1, chars) + layer(c, 1.06, desk(1430)) + layer(c, 1.12, lamp(990, 610));
    } },
  // 5. the competition copies them. All of it.
  { at: Ls('copy'), sfx: [{ t: Wt('copy', 'enteros'), type: 'reveal' }], draw(t, lt) {
      const tp = Wt('copy', 'enteros');
      const up = t > tp;
      const c = handheld(C(540, 1160, k(lt, [[0, 1.3], [2, 1.4]]) * settle(lt) + punch(t, tp, .09)), t);
      const hold = up ? E.back(clamp((t - tp) / .3)) : 0;
      const rival = char({ ...RIVAL, x: 540, y: 1680, s: 1.25, t, pose: up ? 'present' : 'write', itemR: up ? '' : pen(.9, -150),
        arms: up ? [[60 + 40 * hold, 30], [60 + 40 * hold, 30]] : [[10, -6], [40 + Math.sin(t * 15) * 8, 60 + Math.sin(t * 11) * 8]],
        eyes: up ? 'happy' : 'smug', mouth: up ? 'grin' : 'smirk', look: up ? [0, 0] : [.3, .7], seed: 3 });
      const held = up ? `<g transform="${tr(540, lerp(1700, 1290, hold), .44, Math.sin(t * 5) * 2)} translate(-500 -650)"><rect x="-14" y="-14" width="1028" height="1328" fill="${INK}"/>${mapSheet({ id: 'cp', publisher: 'TOTALMENTE ORIGINAL' })}</g>` : '';
      return officeBack(c, t, { rival: true }) + layer(c, 1, rival) + layer(c, 1.06, desk(1430, { rival: true, mapX: 300 }) + held);
    } },
  // 6. and proving it is impossible
  { at: Ls('prove'), sfx: [], draw(t, lt) {
      const c = handheld(C(390, 1190, k(lt, [[0, 1.55], [1.9, 1.68]]) * settle(lt)), t);
      const o = char({ ...OTTO, x: 390, y: 1660, s: 1.25, t, pose: 'shrug', itemL: miniMap('#bcd3f0', .16, -8), itemR: miniMap(null, .16, 8), eyes: 'dot', brows: 'worried', mouth: 'wavy', sweat: true, look: [.4, 0], seed: 1 });
      return officeBack(c, t) + layer(c, 1, o) + layer(c, 1.06, desk(1460, { noMap: true }));
    } },
  // 7. what are you going to say, that the road is yours?
  { at: Ls('road'), sfx: [{ t: Ls('road') + .25, type: 'pop' }, { t: Wn('road', 'que', 1) + .05, type: 'pop' }], draw(t, lt) {
      const t2 = Wn('road', 'que', 1);
      const c = handheld(C(540, k(lt, [[0, 1280], [2.4, 1240]]), k(lt, [[0, 1.45], [2.4, 1.3]]) * settle(lt)), t);
      const ot = char({ ...OTTO, x: 540, y: 1560, s: 1.05, t, arms: t > t2 ? [[62, 95], [62, 95]] : [[10, -6], [42, 4]], eyes: 'dot', brows: 'raise', mouth: t > t2 ? 'wavy' : 'flat', look: t > t2 ? [0, 0] : [.5, .5], seed: 1 });
      const mid = cow({ x: 980, y: 1380, s: .38, t, flip: true, headTilt: Math.sin(t * 6) * 6 }) + ot +
        (pop(t, Ls('road') + .25) ? questionMark(350, 1010, pop(t, Ls('road') + .25) * 1.1, -12) : '') + (pop(t, t2) ? questionMark(740, 960, pop(t, t2) * 1.3, 14) : '');
      return country(c, t, { mid, sign: false });
    } },
  // 8. so Otto has an idea
  { at: Ls('idea'), sfx: [{ t: Wt('idea', 'ocurre'), type: 'ding' }], draw(t, lt) {
      const tb = Wt('idea', 'ocurre');
      const got = t > tb;
      const c = handheld(C(420, 1120, k(lt, [[0, 1.75], [1.8, 1.9]]) * settle(lt) + punch(t, tb, .05)), t);
      const o = char({ ...OTTO, x: 380, y: 1660, s: 1.25, t, pose: got ? 'point' : 'think', arms: got ? [[10, -6], [150, 20]] : [[10, -6], [20, 160]], eyes: got ? 'smug' : 'dot', brows: got ? 'raise' : 'flat', mouth: got ? 'grin' : 'flat', look: got ? [.2, 0] : [.5, -.6], seed: 1 });
      const e = char({ ...ERNEST, x: 790, y: 1690, s: 1.2, t, tilt: -10, eyes: 'dot', mouth: got ? 'o' : 'smile', look: [-.8, -.2], seed: 2 });
      const b = pop(t, tb, .4);
      return officeBack(c, t) + layer(c, 1, e + o + (b ? lightbulb(400, 790, b * .75, .7 + .3 * Math.sin(t * 20)) : '')) + layer(c, 1.06, desk(1430));
    } },
  // 9a. at a lost crossroads...
  { at: Ls('cows'), sfx: [], draw(t, lt) {
      const d = Wt('cows', 'donde') - Ls('cows');
      const p = seg(lt, 0, d + .2, E.io);
      const c = handheld(C(lerp(200, AGW.x, p), lerp(1630, AGW.y, p), lerp(1.5, 1.9, p)), t, .5);
      return mapTop(c, t, {});
    } },
  // 9b. ...where there are only cows
  { at: Wt('cows', 'donde'), sfx: [], draw(t, lt) {
      const c = handheld(C(560, 1300, k(lt, [[0, 1.2], [1.6, 1.32]]) * settle(lt)), t, .7);
      const mid = cow({ x: 830, y: 1460, s: .5, t: t + 2, flip: true }) + cow({ x: 330, y: 1700, s: .95, t, headTilt: 8 });
      return country(c, t, { mid });
    } },
  // 9c. they draw a town that doesn't exist
  { at: Wt('cows', 'dibujan'), sfx: [{ t: Wt('cows', 'pueblo'), type: 'pop' }], draw(t, lt) {
      const tp = Wt('cows', 'pueblo');
      const c = handheld(C(AGW.x + 40, AGW.y + 80, k(lt, [[0, 2.4], [1.6, 2.7]]) * settle(lt)), t, .4);
      const ang = t * 18, r = 14 * (1 - seg(t, tp, tp + .4));
      const lift = seg(t, tp + .3, tp + .8);
      return mapTop(c, t, { agloe: pop(t, tp, .3) * 1.2 }) + penHand(c, AGW.x + Math.cos(ang) * r, AGW.y + Math.sin(ang) * r - lift * 60, .55);
    } },
  // 10. Agloe: their initials, scrambled
  { at: Ls('name'), sfx: [{ t: Wt('name', 'sus'), type: 'whoosh' }, { t: Wt('name', 'revueltas') - .2, type: 'whoosh' }, { t: Wt('name', 'revueltas') + .18, type: 'stamp' }], draw(t, lt) {
      const c = C(AGW.x + 60, AGW.y + 40, 1.9);
      const t1 = Wt('name', 'sus'), t2 = Wt('name', 'revueltas') - .2, t3 = t2 + .38;
      const back = mapTop(c, t, { agloe: 1, label: seg(t, t3, t3 + .2), blur: 8 }) + `<rect width="${W}" height="${H}" fill="#140c05" opacity=".55"/>`;
      const A = 'OTTO G. LINDBERG', B = 'ERNEST ALPERS', adv = 52;
      const ax = 540 - A.length * adv / 2 + adv / 2, bx = 540 - B.length * adv / 2 + adv / 2;
      const typed = Math.floor(seg(lt, 0, .55, E.lin) * (A.length + B.length));
      const keys = { 0: 'O', 5: 'G', 8: 'L' }, keysB = { 0: 'E', 7: 'A' };
      let s = '';
      const hl = seg(t, t1, t1 + .25);
      [...A].forEach((ch, i) => { if (i < typed) s += `<text x="${f(ax + i * adv)}" y="700" text-anchor="middle" font-family="Special Elite" font-size="70" fill="${keys[i] && hl > 0 ? '#ff5a4e' : '#fff4dc'}">${ch}</text>`; });
      [...B].forEach((ch, i) => { if (i + A.length < typed) s += `<text x="${f(bx + i * adv)}" y="810" text-anchor="middle" font-family="Special Elite" font-size="70" fill="${keysB[i] && hl > 0 ? '#ff5a4e' : '#fff4dc'}">${ch}</text>`; });
      // flying initials: O G L E A -> A G L O E
      const L = [['O', ax + 0 * adv, 700, 0, 3], ['G', ax + 5 * adv, 700, 1, 1], ['L', ax + 8 * adv, 700, 2, 2], ['E', bx + 0 * adv, 810, 3, 4], ['A', bx + 7 * adv, 810, 4, 0]];
      const fly = seg(t, t1 + .1, t1 + .4, E.out), shuf = seg(t, t2, t2 + .35, E.io), fin = t > t3;
      if (t > t1 + .1) L.forEach(([ch, x0, y0, s1, s2], i) => {
        const sx = 540 + (s1 - 2) * 150, ex = 540 + (s2 - 2) * 150;
        let x = lerp(x0, sx, fly), y = lerp(y0 - 20, 1060, fly);
        if (shuf > 0) { x = lerp(sx, ex, shuf); y = 1060 + Math.sin(shuf * Math.PI) * (s2 < s1 ? -190 : s2 > s1 ? 150 : 0); }
        const sc = lerp(.5, 1, fly) * (fin ? 1 + .25 * (1 - seg(t, t3, t3 + .2)) : 1);
        s += `<text transform="${tr(x, y, sc, Math.sin(shuf * Math.PI) * (s2 - s1) * 6)}" text-anchor="middle" font-family="${fin ? 'Rye' : 'Alfa Slab One'}" font-size="170" fill="${fin ? '#d6262b' : '#fff4dc'}" stroke="${INK}" stroke-width="12" paint-order="stroke">${ch}</text>`;
      });
      return back + s;
    } },
  // 11a. it's a trap
  { at: Ls('trap'), sfx: [{ t: Wt('trap', 'trampa', true) - .1, type: 'snap' }], draw(t, lt) {
      const ts = Wt('trap', 'trampa', true) - .1;
      const snap = seg(t, ts, ts + .07, E.in);
      const c = handheld(C(540, 1230, k(lt, [[0, 1.05], [1.4, 1.14]]) * settle(lt) + punch(t, ts, .08)), t, 1, t > ts && t < ts + .35 ? 14 : 0);
      return layer(c, .8, `<rect x="-900" y="-900" width="2900" height="3800" fill="#6a3a1d"/><image href="${TEX.wood}" x="-900" y="-900" width="2900" height="3800" preserveAspectRatio="none" opacity=".7"/>`, 4) +
        layer(c, 1, mousetrap({ x: 560, y: 1260, s: 1.35, snap })) + flash(t, ts + .05, .15, '#fff');
    } },
  // 11b. if Agloe shows up on someone else's map, they copied
  { at: Wt('trap', 'si'), sfx: [{ t: Wt('trap', 'agloe'), type: 'whoosh' }, { t: Wt('trap', 'copiado'), type: 'stamp' }], draw(t, lt) {
      const ta = Wt('trap', 'agloe'), tc = Wt('trap', 'copiado');
      const c = handheld(C(AGW.x + 80, AGW.y + 160, k(lt, [[0, 1.5], [2, 1.75]]) * settle(lt) + punch(t, tc, .06)), t, .6, t > tc && t < tc + .3 ? 10 : 0);
      const ss = pop(t, tc, .3);
      return mapTop(c, t, { tint: '#b9d0f2', agloe: 1, label: 1, circle: seg(t, ta, ta + .5, E.out), publisher: 'LA COMPETENCIA', id: 'riv' }) +
        (ss ? stamp(540, 1420, ss * 1.25 + (1 - clamp((t - tc) / .2)) * .6, 'COPIADO', -10, clamp((t - tc) / .1)) : '');
    } },
  // 12. and one day...
  { at: Ls('oneday'), sfx: [{ t: Ls('oneday'), type: 'riser', end: Ls('zas') }], draw(t, lt) {
      const c = handheld(C(500, 1180, k(lt, [[0, 1.3], [1.1, 1.5, E.in]])), t, .5);
      const ex = lerp(1150, 790, seg(lt, 0, .9, E.out));
      const chars = char({ ...OTTO, x: 370, y: 1660, s: 1.25, t, pose: 'holdR', arms: [[10, -6], [24, 150]], itemR: teacup(.9), eyes: 'dot', mouth: 'flat', look: [.7, 0], seed: 1 }) +
        char({ ...ERNEST, x: ex, y: 1675, s: 1.2, t, legs: 'walk', walk: t * 9, pose: 'holdR', arms: [[10, -6], [100, 10]], itemR: rolledMap(-80), eyes: 'wide', mouth: 'o', look: [-.6, 0], seed: 2 });
      return officeBack(c, t, { dark: true }) + layer(c, 1, chars) + layer(c, 1.06, desk(1430)) + `<rect width="${W}" height="${H}" fill="#000" opacity=".25"/>`;
    } },
  // 13a. ZAS! Agloe on the competition's map
  { at: Ls('zas'), sfx: [{ t: Ls('zas'), type: 'impact' }], draw(t, lt) {
      const c = handheld(C(AGW.x, AGW.y + 100, 1.25 + punch(t, Ls('zas'), .12)), t, .6, lt < .3 ? 14 : 0);
      const mi = E.out5(clamp(lt / .35));
      const lens = `<g transform="scale(2.4) translate(${-AX - 60} ${-AY + 20})">${mapSheet({ tint: '#b9d0f2', agloe: 1, label: 1, id: 'lens' })}</g>`;
      return mapTop(c, t, { tint: '#b9d0f2', agloe: 1, label: 1, publisher: 'LA COMPETENCIA', id: 'riv2', blur: 2 }) +
        magnifier(lerp(1000, 560, mi), lerp(1600, 930, mi), 1.35, lens, -25) + flash(t, Ls('zas'), .3);
    } },
  // 13b. faces
  { at: Wt('zas', 'competencia') - .05, sfx: [], draw(t, lt) {
      const g2 = lt > .55;
      const c = handheld(C(560, 1180, k(lt, [[0, 1.5], [1.2, 1.62]]) * settle(lt, .1)), t, 1, lt < .25 ? 8 : 0);
      const chars = char({ ...OTTO, x: 380, y: 1660, s: 1.25, t, pose: g2 ? 'cheer' : 'scared', eyes: g2 ? 'happy' : 'wide', mouth: g2 ? 'grin' : 'jaw', brows: g2 ? '' : 'up', squash: g2 ? sq(t, Wt('zas', 'competencia') + .5) : 1, seed: 1 }) +
        char({ ...ERNEST, x: 740, y: 1675, s: 1.2, t, pose: g2 ? 'cheer' : 'scared', eyes: g2 ? 'happy' : 'wide', mouth: g2 ? 'grin' : 'jaw', brows: g2 ? '' : 'up', seed: 2 });
      return officeBack(c, t) + layer(c, 1, chars) + layer(c, 1.06, desk(1430, { tint: '#b9d0f2' }));
    } },
  // 14a. Otto already sees himself swimming in money
  { at: Ls('rich'), sfx: [{ t: Ls('rich') + .1, type: 'ding' }], draw(t, lt) {
      const c = handheld(C(540, 1150, 1.08 + lt * .03), t, .8);
      const sw = Math.sin(t * 7);
      const o = char({ ...OTTO, x: 540, y: 1760, s: 1.6, t, arms: [[140 + sw * 30, 30], [140 - sw * 30, 30]], eyes: 'dollar', mouth: 'grin', tilt: sw * 5, bob: Math.sin(t * 7) * 8, noShadow: true, seed: 1 });
      return moneyDream(c, t, { char: o }) + dreamFrame();
    } },
  // 14b. calls the lawyers
  { at: Wt('rich', 'llama'), sfx: [{ t: Wt('rich', 'llama'), type: 'ring' }], draw(t, lt) {
      const c = handheld(C(420, 1150, k(lt, [[0, 1.6], [1.4, 1.75]]) * settle(lt)), t, 1, 3);
      const o = char({ ...OTTO, x: 380, y: 1660, s: 1.25, t, arms: [[28, 152], [95 + Math.sin(t * 12) * 25, 70]], itemL: phone(.9), eyes: 'dot', brows: 'angry', mouth: 'talk', look: [.3, 0], seed: 1 });
      return officeBack(c, t) + layer(c, 1, o) + layer(c, 1.06, desk(1430)) + layer(c, 1.15, papers(t, 7), 2);
    } },
  // 15. but the competition doesn't even blink
  { at: Ls('calm'), sfx: [{ t: Ls('calm') + .9, type: 'sip' }], draw(t, lt) {
      const c = handheld(C(540, 1170, k(lt, [[0, 1.3], [1.9, 1.4]]) * settle(lt)), t, .5);
      const sip = seg(lt, .5, 1.0) - seg(lt, 1.4, 1.8);
      const r = char({ ...RIVAL, x: 540, y: 1680, s: 1.25, t, arms: [[10, -6], [lerp(25, 30, sip), lerp(80, 155, sip)]], itemR: teacup(.9), eyes: 'closed', mouth: 'smile', brows: 'flat', tilt: sip * -4, seed: 3 });
      return officeBack(c, t, { rival: true }) + layer(c, 1, r) + layer(c, 1.06, desk(1430, { rival: true, mapX: 300 }));
    } },
  // 16. "we copied nothing. Agloe exists. It even has a shop!"
  { at: Ls('reply'), sfx: [], draw(t, lt) {
      const t2 = Wt('reply', 'agloe'), t3 = Wt('reply', 'si');
      const c = handheld(C(540, 1110, 1.8 * settle(lt) + punch(t, t2, .05) + punch(t, t3, .07)), t);
      const g3 = t > t3;
      const r = char({ ...RIVAL, x: 540, y: 1680, s: 1.25, t, arms: g3 ? [[10, -6], [62, 95]] : t > t2 ? [[10, -6], [95, 6]] : [[10, -6], [24, 80]], itemR: g3 || t > t2 ? '' : teacup(.9), eyes: g3 ? 'happy' : 'smug', brows: 'raise', mouth: 'talk', seed: 3 });
      return officeBack(c, t, { rival: true }) + layer(c, 1, r) + layer(c, 1.06, desk(1430, { rival: true, mapX: 300 }));
    } },
  // 17a. and it's true
  { at: Ls('true'), sfx: [{ t: Ls('true') + .05, type: 'whoosh' }], draw(t, lt) {
      const c = handheld(C(k(lt, [[0, 420], [2.2, 640]]), 1250, k(lt, [[0, 1.12], [2.2, 1.22]]) * settle(lt)), t, .7);
      const ghost = (who, x, y, s, sd) => char({ ...who, x, y, s, t, pose: 'scared', eyes: 'wide', mouth: 'jaw', brows: 'up', look: [1, -.4], seed: sd });
      const mid = car({ x: -40, y: 1560, s: .62, color: '#9b2f2f' }) + cow({ x: 560, y: 1420, s: .36, t, flip: true }) +
        char({ ...GROCER, x: 735, y: 1296, s: .3, t, pose: 'wave', arms: [[10, -6], [140 + Math.sin(t * 9) * 25, 25]], eyes: 'happy', mouth: 'smile', seed: 4 }) +
        ghost(OTTO, 250, 2150, .95, 1) + ghost(ERNEST, 500, 2180, .92, 2);
      return country(c, t, { store: true, mid });
    } },
  // 17b. the Agloe General Store
  { at: Wt('true', 'alguien'), sfx: [{ t: Wt('true', 'tienda'), type: 'ding' }], draw(t, lt) {
      const ts = Wt('true', 'tienda');
      const c = handheld(C(830, k(lt, [[0, 1100], [2.6, 1040]]), k(lt, [[0, 1.75], [2.6, 2.2]]) * settle(lt)), t, .5);
      const mid = char({ ...GROCER, x: 735, y: 1296, s: .3, t, pose: 'wave', arms: [[10, -6], [140 + Math.sin(t * 9) * 25, 25]], eyes: 'happy', mouth: 'smile', seed: 4 }) + sparkle(1000, 820, 1.2, t, ts) + sparkle(680, 900, .8, t, ts + .15);
      return country(c, t, { store: true, mid });
    } },
  // 18a. flashback: the owner saw Agloe on Otto's map
  { at: Ls('why'), sfx: [{ t: Ls('why'), type: 'whoosh' }], draw(t, lt) {
      const tp = Wt('why', 'penso');
      const c = handheld(C(560, 1250, k(lt, [[0, 1.45], [2.7, 1.6]]) * settle(lt)), t, .6);
      const up = t > tp;
      const mid = cow({ x: 900, y: 1440, s: .42, t, flip: true }) +
        char({ ...GROCER, x: 540, y: 1560, s: 1.05, t, pose: 'hold', arms: [[24, 80], [24, 80]], eyes: up ? 'dot' : 'dot', brows: up ? 'raise' : 'flat', mouth: up ? 'smirk' : 'flat', look: up ? [0, 0] : [0, .9], seed: 4 }) +
        `<g transform="${tr(540, 1330, .2)} translate(-500 -650)"><rect x="-14" y="-14" width="1028" height="1328" fill="${INK}"/>${mapSheet({ agloe: 1, label: 1, id: 'fb' })}</g>`;
      return `<g filter="url(#sepia)">${country(c, t, { mid })}</g>` + grainScratches(t);
    } },
  // 18b. "if the map says this is Agloe... then Agloe it is"
  { at: Ls('thought'), sfx: [{ t: Ls('thought') + .25, type: 'brush' }, { t: Wt('thought', 'pues') + .2, type: 'brush' }], draw(t, lt) {
      const sign = seg(t, Ls('thought') + .2, Le('thought') - .1, E.lin);
      const c = handheld(C(830, 1080, k(lt, [[0, 1.85], [2.8, 2.0]]) * settle(lt)), t, .5);
      const gx = 600 + 330 * sign; // the brush follows the paint front, the painter stays under the sign
      const mid = char({ ...GROCER, x: gx, y: 1305, s: .55, t, arms: [[10, -6], [168 + Math.sin(t * 16) * 6, -8 + Math.sin(t * 11) * 10]], itemR: `<g transform="translate(${f(Math.sin(t * 16) * 8)} -150)">${brush(1.15, 180)}</g>`, eyes: sign > .97 ? 'happy' : 'dot', mouth: sign > .97 ? 'smile' : 'flat', look: [.3, -.9], seed: 4 });
      return `<g filter="url(#sepia)">${country(c, t, { store: true, sign, mid })}</g>` + grainScratches(t);
    } },
  // 19. Otto made up a town to catch a cheat...
  { at: Ls('pay1'), sfx: [], draw(t, lt) {
      const c = handheld(C(400, 1170, k(lt, [[0, 1.45], [2.8, 1.7]])), t, .4);
      const o = char({ ...OTTO, x: 380, y: 1660, s: 1.25, t, pose: 'idle', eyes: 'dot', brows: 'worried', mouth: 'flat', look: [.2, .8], tilt: 6, seed: 1 });
      return officeBack(c, t, { dark: true }) + layer(c, 1, o) + layer(c, 1.06, desk(1430, { agloe: 1 }) + pin(637, 1508, 1.1)) + `<rect width="${W}" height="${H}" fill="#0a1830" opacity=".18"/>`;
    } },
  // 20. ...and his own map made it real
  { at: Ls('pay2'), sfx: [{ t: Ls('pay2'), type: 'riser', end: Ls('pay2') + .85 }, { t: Wt('pay2', 'real'), type: 'reveal' }], draw(t, lt) {
      const tr0 = .8, tr1 = 1.05, tReal = Wt('pay2', 'real');
      let s = '';
      if (lt < tr1) {
        const z = lerp(1.6, 12, E.in(clamp(lt / tr1)));
        s += mapTop(C(AGW.x, AGW.y, z), t, { agloe: 1, label: 1, id: 'p2' });
      }
      if (lt > tr0) {
        const p = clamp((lt - tr0) / (tr1 - tr0));
        const c = handheld(C(lerp(830, 640, seg(lt, tr0, 2.3, E.out)), lerp(1120, 1180, seg(lt, tr0, 2.3, E.out)), lerp(3.4, 1.12, seg(lt, tr0, 2.3, E.out5))), t, .5);
        const mid = char({ ...GROCER, x: 735, y: 1296, s: .3, t, pose: 'wave', arms: [[10, -6], [140 + Math.sin(t * 9) * 25, 25]], eyes: 'happy', mouth: 'smile', seed: 4 }) +
          cow({ x: 300, y: 1480, s: .42, t }) + sparkle(830, 900, 1.6, t, tReal);
        s += `<g opacity="${f(p)}">${country(c, t, { store: true, mid })}</g>`;
      }
      return s + flash(t, tReal, .3, '#fff8e0');
    } },
  // 21. the cows still can't believe it
  { at: Ls('button'), sfx: [{ t: Wt('button', 'creerselo'), type: 'boing' }], draw(t, lt) {
      const tt = Wt('button', 'creerselo');
      const c = C(540, 1150, 1 + lt * .02);
      const bg = layer(c, .5, country(C(540, 1250, 1.3), t, {}), 8);
      return bg + `<g>${cowFace({ x: 300, y: 1060, s: 1.2, t, tilt: -4 })}${cowFace({ x: 790, y: 1100, s: 1.12, t: t + .7, tilt: 5, eyes: t > tt ? 'twitch' : '' })}</g>`;
    } },
];
SHOTS.forEach((s, i) => { s.i = i; });
const END = TL.duration + .5;
