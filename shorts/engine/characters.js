// 3D round-head characters: sphere head with a painted face decal, bean body with a painted outfit,
// stick limbs, 3D hats. set(state) poses everything as a pure function of the state.
import { THREE, toon, basic, G3, GH, INKM, mesh, group, placeBetween, unitCyl, sphere, cyl, svgTex, clamp, lerp, noise1, hash, D2R, INK } from './engine.js';

// ---------- 2D face art (units: head radius = 100; 1 unit = 0.01 rad on the sphere) ----------
function eyes(type, look, blink, side) {
  const lx = look[0] * 5, ly = -look[1] * 4, by = Math.max(.08, 1 - clamp(blink));
  switch (type) {
    case 'smug': return `<g transform="rotate(${side * -9})"><path d="M-15 0 A15 13 0 0 0 15 0 Z" fill="${INK}" transform="translate(${lx} ${ly + 1}) scale(1 ${by})"/><path d="M-20 0 L20 0" stroke="${INK}" stroke-width="6.5" stroke-linecap="round"/></g>`;
    case 'wide': return `<g transform="scale(1 ${by})"><circle r="22" fill="#fff" stroke="${INK}" stroke-width="5"/><circle cx="${lx * 1.3}" cy="${ly * 1.3}" r="8.5" fill="${INK}"/></g>`;
    case 'happy': return `<path d="M-15 5 Q0 -15 15 5" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    case 'closed': return `<path d="M-15 0 Q0 9 15 0" stroke="${INK}" stroke-width="6.5" fill="none" stroke-linecap="round"/>`;
    case 'dollar': return `<g transform="scale(1.1)"><path d="M10 -14 Q0 -20 -10 -14 Q-16 -6 -6 -1 L6 3 Q16 8 10 15 Q0 21 -11 14 M0 -24 L0 24" stroke="#2f9e44" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
    case 'twitch': return `<g transform="rotate(${side * -9})"><path d="M-15 0 A15 13 0 0 0 15 0 Z" fill="${INK}" transform="translate(0 ${1 + Math.abs(look[1]) * 3})"/><path d="M-20 0 L20 0" stroke="${INK}" stroke-width="6.5" stroke-linecap="round"/></g>`;
    default: return `<g transform="translate(${lx} ${ly}) scale(1 ${by})"><ellipse rx="11" ry="14" fill="${INK}"/><circle cx="-3.5" cy="-5.5" r="3.4" fill="#fff"/></g>`;
  }
}
function brows(type) {
  const B = (x, y, a) => `<path d="M-17 0 L17 0" transform="translate(${x} ${y}) rotate(${a})" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`;
  switch (type) {
    case 'angry': return B(-34, -42, 20) + B(34, -42, -20);
    case 'worried': return B(-34, -48, -16) + B(34, -48, 16);
    case 'up': return B(-34, -60, -6) + B(34, -60, 6);
    case 'raise': return B(-34, -42, 4) + B(34, -60, 10);
    case 'flat': return B(-34, -42, 0) + B(34, -42, 0);
    case 'smug': return B(-34, -40, 8) + B(34, -44, -4);
    default: return '';
  }
}
function mouth(type, open) {
  switch (type) {
    case 'smile': return `<path d="M-28 0 Q0 24 28 0" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    case 'smirk': return `<path d="M-26 8 Q6 16 30 -8" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    case 'flat': return `<path d="M-20 6 L20 6" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
    case 'frown': return `<path d="M-24 14 Q0 -6 24 14" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    case 'wavy': return `<path d="M-26 8 Q-13 -2 0 8 Q13 18 26 8" stroke="${INK}" stroke-width="6.5" fill="none" stroke-linecap="round"/>`;
    case 'open': return `<path d="M-30 -4 Q0 -10 30 -4 Q26 42 0 42 Q-26 42 -30 -4Z" fill="${INK}"/><path d="M-15 32 Q0 22 15 32 Q0 42 -15 32Z" fill="#e8737d"/>`;
    case 'o': return `<ellipse cy="10" rx="12" ry="16" fill="${INK}"/>`;
    case 'grin': return `<path d="M-40 -6 Q0 4 40 -6 Q32 40 0 40 Q-32 40 -40 -6Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M-36 6 Q0 14 36 6" stroke="${INK}" stroke-width="3" fill="none"/>`;
    case 'jaw': return `<path d="M-26 -2 Q0 -8 26 -2 L24 70 Q0 80 -24 70Z" fill="${INK}"/><path d="M-16 60 Q0 48 16 60 Q0 72 -16 60Z" fill="#e8737d"/>`;
    case 'talk': { const h = 4 + open * 32; return `<path d="M-26 -2 Q0 -8 26 -2 Q22 ${h} 0 ${h} Q-22 ${h} -26 -2Z" fill="${INK}"/>${open > .5 ? `<path d="M-12 ${h - 8} Q0 ${h - 16} 12 ${h - 8} Q0 ${h - 2} -12 ${h - 8}Z" fill="#e8737d"/>` : ''}`; }
    default: return '';
  }
}
function faceSVG(f) {
  const look = f.look || [0, 0];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="-131 -96 262 175" preserveAspectRatio="none">
    ${f.blush ? `<ellipse cx="-56" cy="28" rx="17" ry="9" fill="#ff8a8a" opacity=".5"/><ellipse cx="56" cy="28" rx="17" ry="9" fill="#ff8a8a" opacity=".5"/>` : ''}
    <g transform="translate(-34 -6)">${eyes(f.eyes, look, f.blink || 0, -1)}</g>
    <g transform="translate(34 -6)">${eyes(f.eyes2 || f.eyes, look, f.blink || 0, 1)}</g>
    ${brows(f.brows)}
    ${f.glasses ? `<circle cx="-34" cy="-6" r="28" fill="#cfe9ff" fill-opacity=".25" stroke="${INK}" stroke-width="5.5"/><circle cx="34" cy="-6" r="28" fill="#cfe9ff" fill-opacity=".25" stroke="${INK}" stroke-width="5.5"/><path d="M-7 -8 Q0 -14 7 -8" stroke="${INK}" stroke-width="5" fill="none"/>` : ''}
    ${f.mustache ? `<path d="M-48 30 Q-24 6 0 21 Q24 6 48 30 Q24 25 0 34 Q-24 25 -48 30Z" fill="${f.mustache}" stroke="${INK}" stroke-width="4"/>` : ''}
    <g transform="translate(0 ${f.mustache ? 46 : 40})">${mouth(f.mouth || 'smile', f.open || 0)}</g>
    ${f.sweat ? `<path d="M76 -42 Q88 -20 76 -12 Q64 -20 76 -42Z" fill="#8fd3ff" stroke="${INK}" stroke-width="3"/>` : ''}
  </svg>`;
}

const faceCache = new Map();
export const pending = [];
function texFor(key, makeSvg, w, h) {
  let e = faceCache.get(key);
  if (!e) { e = { tex: null }; faceCache.set(key, e); pending.push(svgTex(makeSvg(), w, h).then(t => { e.tex = t; })); }
  return e.tex;
}
export const blankTex = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1); blankTex.needsUpdate = true;

// ---------- outfits, painted in the body's UV space (1024 x 512, front centre at x = 512, top = neck) ----------
function plaid(c1, c2) {
  let s = '';
  for (let x = 0; x < 1024; x += 46) s += `<rect x="${x}" y="0" width="12" height="512" fill="${c2}" opacity=".35"/>`;
  for (let y = 0; y < 512; y += 46) s += `<rect x="0" y="${y}" width="1024" height="12" fill="${c2}" opacity=".3"/>`;
  for (let x = 23; x < 1024; x += 46) s += `<rect x="${x}" y="0" width="3" height="512" fill="${c1}" opacity=".5"/>`;
  return s;
}
const bowtie = (col, dots = '#fff') => `<g transform="translate(512 58)"><path d="M0 0 L-52 -30 L-52 30Z M0 0 L52 -30 L52 30Z" fill="${col}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
  ${[[-34, -10], [-30, 12], [32, -12], [36, 10], [-44, 0], [44, 2]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${dots}"/>`).join('')}<rect x="-10" y="-12" width="20" height="24" rx="5" fill="${col}" stroke="${INK}" stroke-width="6"/></g>`;
function outfitSVG(o) {
  const base = o.color;
  let s = `<rect width="1024" height="512" fill="${base}"/>`;
  if (o.outfit === 'vest') {
    s += plaid('#fff6d8', o.plaid || '#8a5a1c');
    s += `<path d="M430 0 L512 150 L594 0Z" fill="#fbf7ee" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
      ${[200, 270, 340, 410].map(y => `<circle cx="512" cy="${y}" r="11" fill="#f3d27a" stroke="${INK}" stroke-width="5"/>`).join('')}
      <path d="M512 150 L512 512" stroke="${INK}" stroke-width="6" opacity=".7"/>
      <path d="M560 290 Q610 340 650 300" stroke="#f3d27a" stroke-width="7" fill="none"/><rect x="380" y="300" width="70" height="12" rx="4" fill="${INK}" opacity=".6"/>
      ${bowtie(o.acc || '#d63c3c')}`;
  } else if (o.outfit === 'suspenders') {
    s += `<path d="M450 0 L512 90 L574 0Z" fill="#fbf7ee" stroke="${INK}" stroke-width="7"/>
      <path d="M440 0 L452 512 M584 0 L572 512" stroke="${o.acc || '#8b3a2e'}" stroke-width="26"/>
      <path d="M440 0 L452 512 M584 0 L572 512" stroke="${INK}" stroke-width="3" opacity=".4"/>
      ${[170, 250, 330].map(y => `<circle cx="512" cy="${y}" r="9" fill="#fff" stroke="${INK}" stroke-width="4"/>`).join('')}
      <rect x="0" y="430" width="1024" height="82" fill="#5b4636"/><rect x="0" y="424" width="1024" height="14" fill="#3b2a20"/>`;
  } else if (o.outfit === 'suit') {
    s += `<path d="M440 0 L512 210 L584 0Z" fill="#fbf7ee" stroke="${INK}" stroke-width="7"/>
      <path d="M512 30 L488 80 L512 300 L536 80Z" fill="${o.acc || '#e8b13c'}" stroke="${INK}" stroke-width="6"/>
      <path d="M380 0 L500 230 L440 200 L400 240Z M644 0 L524 230 L584 200 L624 240Z" fill="#00000040" stroke="${INK}" stroke-width="5"/>
      ${[300, 370].map(y => `<circle cx="540" cy="${y}" r="10" fill="#2a1d2a" stroke="${INK}" stroke-width="4"/>`).join('')}
      <path d="M600 260 L660 260" stroke="#fff" stroke-width="10"/><path d="M600 252 L620 230 L640 252" fill="#e84a5f"/>`;
  } else if (o.outfit === 'uniform') {   // Napoleon: blue coat, white waistcoat, red collar, gold buttons
    s += `<path d="M396 0 L512 0 L628 0 L600 512 L424 512Z" fill="#f6f1e6" stroke="${INK}" stroke-width="6"/>
      <path d="M396 0 L452 0 L470 512 L420 512Z M628 0 L572 0 L554 512 L604 512Z" fill="#1f2f63" stroke="${INK}" stroke-width="6"/>
      <path d="M380 0 L644 0 L620 46 L404 46Z" fill="#c0392b" stroke="${INK}" stroke-width="6"/>
      ${[110, 190, 270, 350, 430].map(y => `<circle cx="438" cy="${y}" r="11" fill="#f3d27a" stroke="${INK}" stroke-width="4"/><circle cx="586" cy="${y}" r="11" fill="#f3d27a" stroke="${INK}" stroke-width="4"/><circle cx="512" cy="${y}" r="7" fill="#d9c9a6"/>`).join('')}
      <rect x="0" y="440" width="1024" height="72" fill="#f6f1e6"/><path d="M0 440 L1024 440" stroke="${INK}" stroke-width="5"/>`;
  } else if (o.outfit === 'robe') {      // the Turk automaton: ottoman robe with gold trim and a sash
    s += `<path d="M440 0 L512 120 L584 0Z" fill="#f2e6c8" stroke="${INK}" stroke-width="6"/>
      <path d="M430 0 L512 140 L594 0" fill="none" stroke="#e2b33f" stroke-width="18"/>
      <path d="M512 140 L512 512" stroke="#e2b33f" stroke-width="16"/>
      <rect x="0" y="300" width="1024" height="54" fill="#2f7d4a" stroke="${INK}" stroke-width="5"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<circle cx="${i * 128 + 64}" cy="327" r="8" fill="#e2b33f"/>`).join('')}
      <rect x="0" y="470" width="1024" height="42" fill="#e2b33f" opacity=".9"/>`;
  } else if (o.outfit === 'coat') {      // showman: red tailcoat, white shirt, black bow tie
    s += `<path d="M440 0 L512 210 L584 0Z" fill="#fbf7ee" stroke="${INK}" stroke-width="7"/>
      <path d="M400 0 L500 240 L460 512 L380 512Z M624 0 L524 240 L564 512 L644 512Z" fill="#00000030" stroke="${INK}" stroke-width="5"/>
      ${[260, 330, 400].map(y => `<circle cx="470" cy="${y}" r="10" fill="#f3d27a" stroke="${INK}" stroke-width="4"/><circle cx="554" cy="${y}" r="10" fill="#f3d27a" stroke="${INK}" stroke-width="4"/>`).join('')}
      ${bowtie('#1c1411', '#555')}`;
  } else if (o.outfit === 'overalls') {
    s += `<rect x="0" y="220" width="1024" height="292" fill="#4f7fc4"/>
      <rect x="400" y="140" width="224" height="140" rx="14" fill="#4f7fc4" stroke="${INK}" stroke-width="7"/>
      <path d="M410 150 L380 0 M614 150 L644 0" stroke="#3b66a6" stroke-width="30"/>
      <circle cx="420" cy="165" r="12" fill="#f3d27a" stroke="${INK}" stroke-width="5"/><circle cx="604" cy="165" r="12" fill="#f3d27a" stroke="${INK}" stroke-width="5"/>
      <rect x="465" y="185" width="94" height="60" rx="8" fill="#3b66a6" stroke="${INK}" stroke-width="5"/>
      <path d="M0 220 L1024 220" stroke="${INK}" stroke-width="5"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="512" viewBox="0 0 1024 512">${s}
    <rect width="1024" height="512" fill="url(#n)" opacity=".0"/></svg>`;
}

// ---------- hats ----------
function strawTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#efcd6a'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 8) { x.strokeStyle = i % 16 ? '#d9ad45' : '#f8e08e'; x.lineWidth = 4; x.beginPath(); x.moveTo(0, i); x.lineTo(256, i + 6); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 2); return t;
}
let STRAW = null;
function makeHat(type, color, parent) {
  const g = group(parent);
  const m = toon(color, { g: G3, ol: .008 });
  const dark = toon('#2a1a12', { g: G3, ol: .004 });
  if (type === 'fedora') {
    mesh(new THREE.LatheGeometry([new THREE.Vector2(.52, 0), new THREE.Vector2(.98, .02), new THREE.Vector2(1.04, .1)], 40), toon(color, { g: G3, side: THREE.DoubleSide }), { p: [0, .42, 0], parent: g });
    mesh(new THREE.LatheGeometry([new THREE.Vector2(.56, 0), new THREE.Vector2(.52, .3), new THREE.Vector2(.42, .44), new THREE.Vector2(.2, .4), new THREE.Vector2(0, .46)], 40), m, { p: [0, .42, 0], parent: g });
    mesh(cyl(.565, .57, .1, 40), dark, { p: [0, .5, 0], parent: g });
    g.rotation.z = -6 * D2R;
  } else if (type === 'cap') {
    mesh(new THREE.SphereGeometry(.84, 40, 20, 0, Math.PI * 2, 0, Math.PI * .44), m, { p: [0, .02, -.02], s: [1, .86, 1.04], parent: g });
    mesh(new THREE.SphereGeometry(.5, 32, 12, 0, Math.PI * 2, 0, Math.PI * .5), m, { p: [0, .36, .52], s: [1.15, .12, .9], r: [14, 0, 0], parent: g });
    mesh(sphere(.07, 12, 8), m, { p: [0, .76, 0], parent: g });
  } else if (type === 'bowler') {
    mesh(new THREE.SphereGeometry(.62, 40, 20, 0, Math.PI * 2, 0, Math.PI * .5), m, { p: [0, .42, 0], s: [1, 1.05, 1], parent: g });
    mesh(new THREE.LatheGeometry([new THREE.Vector2(.6, 0), new THREE.Vector2(.82, -.01), new THREE.Vector2(.9, .07)], 40), toon(color, { g: G3, side: THREE.DoubleSide }), { p: [0, .42, 0], parent: g });
    mesh(cyl(.63, .63, .1, 40), toon('#6b1d1d', { g: G3 }), { p: [0, .47, 0], parent: g });
  } else if (type === 'straw') {
    STRAW = STRAW || strawTex();
    const sm = toon('#ffffff', { g: G3, map: STRAW, side: THREE.DoubleSide });
    mesh(cyl(1.3, 1.3, .04, 48), sm, { p: [0, .4, 0], parent: g });
    mesh(cyl(.5, .56, .4, 40), sm, { p: [0, .6, 0], parent: g });
    mesh(cyl(.565, .57, .1, 40), toon('#3d6fb6', { g: G3 }), { p: [0, .47, 0], parent: g });
    g.rotation.x = -5 * D2R;
  } else if (type === 'bicorne') {   // worn sideways, with a tricolour cockade
    const sh = new THREE.Shape(); sh.moveTo(-1.15, 0); sh.quadraticCurveTo(-1.05, .55, -.55, .62); sh.quadraticCurveTo(0, .95, .55, .62); sh.quadraticCurveTo(1.05, .55, 1.15, 0); sh.quadraticCurveTo(0, .12, -1.15, 0);
    const hm = mesh(new THREE.ExtrudeGeometry(sh, { depth: .7, bevelEnabled: true, bevelThickness: .08, bevelSize: .06, bevelSegments: 3 }), m, { p: [0, .48, -.35], parent: g });
    [['#1f3a8a', .17], ['#ffffff', .12], ['#c0392b', .07]].forEach(([c, r], i) => mesh(cyl(r, r, .03, 24), toon(c, { g: G3, outline: i === 0 }), { p: [.62, .86, .44 + i * .012], r: [90, 0, 0], parent: g }));
  } else if (type === 'turban') {
    const w = toon(color, { g: G3, ol: .007 });
    [[.0, 1.0], [.2, .92], [.38, .78]].forEach(([y, sc]) => mesh(new THREE.TorusGeometry(.66 * sc, .24, 14, 36), w, { p: [0, .3 + y, 0], r: [90, 0, 0], parent: g }));
    mesh(sphere(.5, 24, 16), w, { p: [0, .72, 0], s: [1, .8, 1], parent: g });
    mesh(sphere(.13, 14, 10), toon('#c0392b', { g: G3, emissive: '#5a0a0a' }), { p: [0, .6, .78], parent: g });
    mesh(new THREE.ConeGeometry(.06, .9, 8), toon('#ffffff', { g: G3, ol: .004 }), { p: [0, 1.05, .62], r: [-20, 0, 0], parent: g });
  } else if (type === 'top') {
    mesh(cyl(.5, .5, 1.0, 40), m, { p: [0, .95, 0], parent: g });
    mesh(cyl(.82, .82, .05, 40), m, { p: [0, .45, 0], parent: g });
    mesh(cyl(.51, .51, .14, 40), toon('#7a1f1f', { g: G3 }), { p: [0, .55, 0], parent: g });
  }
  return g;
}

// ---------- poses: elbow and hand directions for the right arm (x right, y up, z towards camera) ----------
const V = (x, y, z) => new THREE.Vector3(x, y, z).normalize();
export const POSES = {
  idle: [V(.18, -1, .02), V(.08, -1, .14)], hips: [V(1, -.45, -.25), V(-.9, -.55, .25)], point: [V(1, .06, .3), V(1, .06, .35)],
  shrug: [V(1, -.55, .1), V(.35, 1, .35)], cheer: [V(.55, 1, 0), V(.15, 1, .05)], hold: [V(.3, -1, .25), V(.02, -.05, 1)],
  wave: [V(1, .35, 0), V(.2, 1, 0)], think: [V(.35, -1, .7), V(-.55, .85, .45)], phone: [V(.55, -.55, .45), V(-.45, 1, .05)],
  write: [V(.3, -1, .35), V(-.25, -.35, 1)], present: [V(.3, -.3, 1), V(-.15, .45, 1)], scared: [V(.85, -.5, .35), V(-.35, 1, .45)],
  pump: [V(.7, -.6, .35), V(.1, 1, .3)], armsUp: [V(.7, .75, 0), V(.3, 1, 0)], cup: [V(.3, -1, .35), V(-.1, .9, .7)],
  napoleon: [V(.62, -.75, .4), V(-.95, .25, .35)], behind: [V(.3, -.9, -.45), V(-.5, -.25, -.8)], laugh: [V(.75, -.6, .3), V(-.65, -.25, .75)],
  lever: [V(.3, -.45, .9), V(-.05, .3, 1)], fan: [V(.6, -.35, .6), V(-.25, .9, .45)], sweep: [V(1, .1, .45), V(1, .05, .2)], present2: [V(1, -.1, .35), V(.6, .55, .5)],
  down: [V(.05, -1, 0), V(.02, -1, .05)], fist: [V(.6, -.6, .5), V(-.2, .7, .7)], brush: [V(.6, .9, .25), V(.25, 1, .2)], reach: [V(.4, -.4, .9), V(.1, -.2, 1)],
};
const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), tmpC = new THREE.Vector3(), tmpD = new THREE.Vector3();

export const CAST = {
  OTTO: { color: '#e0a83a', plaid: '#8a5a1c', outfit: 'vest', acc: '#d63c3c', hat: 'fedora', hatColor: '#8a5a33', glasses: true },
  ERNEST: { color: '#4fb98f', outfit: 'suspenders', acc: '#8b3a2e', hat: 'cap', hatColor: '#7c8794' },
  RIVAL: { color: '#7b4fb0', outfit: 'suit', acc: '#e8b13c', hat: 'bowler', hatColor: '#2a2230', mustache: '#3a2a20' },
  GROCER: { color: '#f2efe6', outfit: 'overalls', hat: 'straw', hatColor: '#f0cf6d', mustache: '#d0d0d0' },
  EXTRA1: { color: '#c96f4a', outfit: 'suspenders', acc: '#3b4a6b', hat: 'cap', hatColor: '#5a4a3a' },
  EXTRA2: { color: '#6f8fc9', outfit: 'suit', acc: '#c0392b', hat: 'fedora', hatColor: '#4a4a4a' },
  NAPO: { color: '#24356f', outfit: 'uniform', hat: 'bicorne', hatColor: '#1c1a22', epaulettes: true },
  OWNER: { color: '#b3312a', outfit: 'coat', hat: 'top', hatColor: '#1c1a22', mustache: '#3a2a20' },
  HIDDEN: { color: '#8a6a4a', outfit: 'suspenders', acc: '#4a3a2a', hat: 'cap', hatColor: '#6a5a4a', mustache: '#4a3020', glasses: true },
  TURK: { color: '#8e2a2a', outfit: 'robe', hat: 'turban', hatColor: '#f4ecd8', mustache: '#1c1411', headColor: '#c99a62', limbColor: '#a8743f', limbR: .075, handR: .13, arm: 1.5 },
  NOBLE1: { color: '#5a7a4a', outfit: 'coat', hat: 'bicorne', hatColor: '#2a2a2a' },
  NOBLE2: { color: '#c9a0d0', outfit: 'suit', acc: '#e8b13c', hat: 'top', hatColor: '#3a2a4a' },
  NOBLE3: { color: '#e0c060', outfit: 'vest', acc: '#2f5d8a', plaid: '#8a6a1c', hat: 'boater', hatColor: '#f0cf6d', mustache: '#6a4a2a' },
};

export function makeChar(spec, seed = 0) {
  const root = new THREE.Group();
  const body = group(root);
  const lathe = new THREE.LatheGeometry([[0, 1.1], [.22, 1.12], [.36, 1.18], [.44, 1.3], [.475, 1.46], [.47, 1.66], [.445, 1.9], [.405, 2.1], [.35, 2.26], [.25, 2.37], [.12, 2.43], [0, 2.44]].map(([x, y]) => new THREE.Vector2(x, y)), 48, Math.PI, Math.PI * 2);
  const bodyMat = toon('#ffffff', { g: G3, ol: .009 });
  pending.push(svgTex(outfitSVG(spec), 1024, 512).then(t => { bodyMat.map = t; bodyMat.needsUpdate = true; }));
  mesh(lathe, bodyMat, { parent: body });
  const headPivot = group(body, [0, 2.3, 0]);
  const head = group(headPivot, [0, .76, 0]);
  mesh(sphere(.78, 48, 32), toon(spec.headColor || '#ffffff', { g: GH, ol: .011, emissive: spec.headColor ? '#2a1a0a' : '#4a4640' }), { parent: head });
  const faceMat = basic({ map: blankTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const face = mesh(new THREE.SphereGeometry(.786, 48, 32, Math.PI / 2 - 1.309, 2.618, 35 * D2R, 100 * D2R), faceMat, { parent: head, cast: false, receive: false });
  face.renderOrder = 2;
  if (spec.hat) makeHat(spec.hat, spec.hatColor || '#7a4b2a', head);
  const limbM = toon(spec.limbColor || INK, { g: G3, outline: !!spec.limbColor, ol: .004 });
  const LR = spec.limbR || .045, HR = spec.handR || .085, AS = spec.arm || 1;   // AS: arm length scale
  if (spec.epaulettes) [-1, 1].forEach(sd => { const ep = mesh(cyl(.2, .22, .08, 20), toon('#e2b33f', { g: G3, ol: .005 }), { p: [sd * .36, 2.2, 0], r: [0, 0, sd * -28], parent: body }); for (let i = 0; i < 9; i++) mesh(cyl(.02, .02, .14, 5), toon('#e2b33f', { g: G3, outline: false }), { p: [Math.cos(i / 9 * 6.28) * .2, -.08, Math.sin(i / 9 * 6.28) * .2], parent: ep }); });
  const parts = {};
  for (const n of ['uaL', 'faL', 'uaR', 'faR', 'thL', 'shL', 'thR', 'shR']) parts[n] = mesh(unitCyl, limbM, { parent: body });
  for (const n of ['hL', 'hR']) parts[n] = mesh(sphere(HR, 16, 10), limbM, { parent: body });
  for (const n of ['fL', 'fR']) parts[n] = mesh(sphere(1, 16, 10), limbM, { parent: body, s: [.12, .075, .21] });
  const items = { L: group(body), R: group(body) };
  const shadowBlob = null;
  let faceKey = '';

  function arm(side, dirs, target) {
    const sh = tmpA.set(side * .4, 2.12, 0);
    let el, hand;
    if (target) {   // two-bone IK towards a point in body space, elbow pointing out and down
      const L1 = .62 * AS, L2 = .58 * AS, d = Math.min(target.distanceTo(sh), L1 + L2 - 1e-3), dir = target.clone().sub(sh).normalize();
      const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), hgt = Math.sqrt(Math.max(0, L1 * L1 - a * a));
      const pole = new THREE.Vector3(side, -1, -.3).normalize(); pole.sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
      el = sh.clone().addScaledVector(dir, a).addScaledVector(pole, hgt); hand = sh.clone().addScaledVector(dir, d);
    } else {
      const e = tmpB.copy(dirs[0]); e.x *= side; el = tmpC.copy(sh).addScaledVector(e, .62 * AS);
      const h = tmpD.copy(dirs[1]); h.x *= side; hand = new THREE.Vector3().copy(el).addScaledVector(h, .58 * AS);
    }
    const s = side < 0 ? 'L' : 'R';
    placeBetween(parts['ua' + s], sh, el, LR); placeBetween(parts['fa' + s], el, hand, LR * .93);
    parts['h' + s].position.copy(hand); items[s].position.copy(hand);
  }
  function leg(side, mode, ph) {
    const hip = new THREE.Vector3(side * .18, 1.2, 0);
    let knee, foot;
    if (mode === 'walk') {
      const a = Math.sin(ph + (side > 0 ? Math.PI : 0)) * .45, lift = Math.max(0, Math.cos(ph + (side > 0 ? Math.PI : 0))) * .18;
      knee = new THREE.Vector3(side * .19, .62 + lift * .5, Math.sin(a) * .5 + lift * .3); foot = new THREE.Vector3(side * .2, .05 + lift, Math.sin(a) * .9);
    } else if (mode === 'sit') {
      knee = new THREE.Vector3(side * .2, 1.2, .62); foot = new THREE.Vector3(side * .22, .08, .7);
    } else if (mode === 'dangle') {
      const a = Math.sin(ph * 1.3 + side) * .25;
      knee = new THREE.Vector3(side * .2, .62, .05 + a * .3); foot = new THREE.Vector3(side * .21, .06, .12 + a);
    } else {
      knee = new THREE.Vector3(side * .2, .62, .02); foot = new THREE.Vector3(side * .23, .06, .04);
    }
    const s = side < 0 ? 'L' : 'R';
    placeBetween(parts['th' + s], hip, knee, .05); placeBetween(parts['sh' + s], knee, foot, .048);
    parts['f' + s].position.set(foot.x, foot.y, foot.z + .08);
  }
  const mix = (a, b, p) => [a[0].clone().lerp(b[0], p).normalize(), a[1].clone().lerp(b[1], p).normalize()];

  return {
    root, head, headPivot, items, spec,
    set(s) {
      const t = s.t || 0;
      root.position.set(s.x || 0, s.y || 0, s.z || 0);
      root.rotation.set(0, (s.ry || 0) * D2R, 0);
      const sq = s.squash || 1; root.scale.set((s.s || 1) * (2 - sq), (s.s || 1) * sq, (s.s || 1) * (2 - sq));
      const breathe = s.still ? 0 : Math.sin(t * 2.3 + seed) * .025;
      body.position.y = (s.bob || 0) + breathe * .5;
      body.rotation.x = s.lean || 0;
      // arms
      const A = s.arms || [POSES[s.poseL || s.pose || 'idle'], POSES[s.poseR || s.pose || 'idle']];
      let aL = A[0], aR = A[1];
      if (s.blend) { aL = mix(POSES[s.blend[0]], aL, s.blend[1]); aR = mix(POSES[s.blend[0]], aR, s.blend[1]); }
      const ik = w => { if (!w) return null; root.updateMatrixWorld(true); return body.worldToLocal(w.clone()); };
      arm(-1, aL, ik(s.ikL)); arm(1, aR, ik(s.ikR));
      leg(-1, s.legs, s.walk || 0); leg(1, s.legs, s.walk || 0);
      // head
      const look = s.look || [0, 0];
      headPivot.rotation.set(-look[1] * .28 + (s.nod || 0), look[0] * .55, (s.tilt || 0) * D2R);
      // face
      let blink = s.blink ?? 0;
      if (s.blink === undefined && !['happy', 'closed', 'dollar'].includes(s.eyes)) {
        const ph = (t + hash(seed) * 3) % 3.4; blink = ph < .07 ? ph / .07 : ph < .14 ? 1 - (ph - .07) / .07 : 0;
        blink = Math.round(blink * 3) / 3;
      }
      let open = 0;
      if (s.mouth === 'talk') { open = Math.max(0, Math.sin(t * 21 + seed) * .55 + Math.sin(t * 13.3) * .5 + .15); open = Math.round(clamp(open) * 4) / 4; }
      const f = { eyes: s.eyes || 'dot', eyes2: s.eyes2, brows: s.brows || '', mouth: s.mouth || 'smile', open, blink, look: [Math.round(look[0] * 2) / 2, Math.round(look[1] * 2) / 2],
        glasses: spec.glasses, mustache: spec.mustache, sweat: s.sweat, blush: s.blush };
      const key = JSON.stringify(f);
      const tex = texFor(key, () => faceSVG(f), 512, 512);
      if (tex && faceMat.map !== tex) { faceMat.map = tex; }
      // items in hands
      for (const sd of ['L', 'R']) {
        const want = s['item' + sd] || null;
        if (items[sd].userData.cur !== want) { items[sd].clear(); if (want) items[sd].add(want); items[sd].userData.cur = want; }
      }
      return this;
    },
  };
}
