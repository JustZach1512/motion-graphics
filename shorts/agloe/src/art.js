// Characters and props. Every function returns an SVG string.
const INK = '#1c1411';
const SW = 7; // outline width at scale 1

const DEFS = `
<filter id="b2" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2"/></filter>
<filter id="b4" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="b8" x="-15%" y="-15%" width="130%" height="130%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="b14" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
<radialGradient id="gHead" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".62" stop-color="#f6f3ee"/><stop offset="1" stop-color="#cfc7bb"/></radialGradient>
<linearGradient id="gShade" x1="0" x2="1" y1="0" y2=".3"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".30"/></linearGradient>
<linearGradient id="gShadeV" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient>
<radialGradient id="gCloud" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#f4f8ff"/><stop offset="1" stop-color="#b9cde8"/></radialGradient>
<radialGradient id="gLamp" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe7a8" stop-opacity=".75"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
<linearGradient id="gBeam" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff6d6" stop-opacity=".38"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></linearGradient>
<radialGradient id="gVig" cx="50%" cy="48%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1a0e05" stop-opacity=".55"/></radialGradient>
<radialGradient id="gShadow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000" stop-opacity=".38"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<linearGradient id="gGlass" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".4" stop-color="#cfe9ff" stop-opacity=".18"/><stop offset="1" stop-color="#7fb2d9" stop-opacity=".35"/></linearGradient>
<linearGradient id="gGold" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f7d775"/><stop offset=".5" stop-color="#d7a63a"/><stop offset="1" stop-color="#9a6a1c"/></linearGradient>
<pattern id="pBills" width="120" height="70" patternUnits="userSpaceOnUse"><rect width="120" height="70" fill="#7fbf74"/></pattern>
`;

const shadow = (x, y, rx, ry = rx * .18, o = 1) =>
  `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#gShadow)" opacity="${o}"/>`;

// ---------- character ----------
function limb(x0, y0, side, a, b, L1, L2) {
  const r = Math.PI / 180;
  const ex = x0 + side * Math.sin(a * r) * L1, ey = y0 + Math.cos(a * r) * L1;
  const a2 = a + b;
  const hx = ex + side * Math.sin(a2 * r) * L2, hy = ey + Math.cos(a2 * r) * L2;
  return { ex, ey, hx, hy, d: `M${f(x0)} ${f(y0)} Q${f(ex)} ${f(ey)} ${f(hx)} ${f(hy)}` };
}
const POSES = {
  idle: [[10, -6], [10, -6]], hips: [[38, -125], [38, -125]], point: [[10, -6], [92, 4]],
  pointL: [[92, 4], [10, -6]], shrug: [[62, 95], [62, 95]], cheer: [[155, 15], [155, 15]],
  hold: [[22, 75], [22, 75]], holdR: [[10, -6], [24, 80]], holdL: [[24, 80], [10, -6]],
  wave: [[10, -6], [140, 25]], think: [[10, -6], [22, 158]], phone: [[10, -6], [30, 150]],
  write: [[10, -6], [40, 60]], present: [[60, 20], [60, 20]], fists: [[30, 120], [30, 120]],
  armsUp: [[130, 30], [130, 30]], scared: [[120, 60], [120, 60]], cross: [[30, 110], [30, 110]],
};

function eyes(type, look, blink, side) {
  const lx = look[0] * 5, ly = look[1] * 4;
  const by = 1 - clamp(blink);
  switch (type) {
    case 'smug':
      return `<g transform="rotate(${side * -9})"><path d="M-14 0 A14 12 0 0 0 14 0 Z" fill="${INK}" transform="translate(${lx} ${ly + 1}) scale(1 ${f(by)})"/><path d="M-19 0 L19 0" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></g>`;
    case 'wide':
      return `<circle r="21" fill="#fff" stroke="${INK}" stroke-width="5" transform="scale(1 ${f(by)})"/><circle cx="${lx * 1.4}" cy="${ly * 1.4}" r="8" fill="${INK}" transform="scale(1 ${f(by)})"/>`;
    case 'happy':
      return `<path d="M-14 5 Q0 -14 14 5" stroke="${INK}" stroke-width="6.5" fill="none" stroke-linecap="round"/>`;
    case 'closed':
      return `<path d="M-14 0 Q0 9 14 0" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    case 'tiny':
      return `<circle cx="${lx}" cy="${ly}" r="6" fill="${INK}" transform="scale(1 ${f(by)})"/>`;
    case 'dollar':
      return `<text x="0" y="16" font-family="Alfa Slab One" font-size="46" text-anchor="middle" fill="#2f9e44" stroke="${INK}" stroke-width="3">$</text>`;
    default:
      return `<g transform="translate(${lx} ${ly}) scale(1 ${f(by)})"><ellipse rx="10.5" ry="13.5" fill="${INK}"/><circle cx="-3.5" cy="-5" r="3.2" fill="#fff"/></g>`;
  }
}
function brows(type) {
  const B = (x, y, a) => `<path d="M-16 0 L16 0" transform="translate(${x} ${y}) rotate(${a})" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
  switch (type) {
    case 'angry': return B(-34, -44, 18) + B(34, -44, -18);
    case 'worried': return B(-34, -48, -16) + B(34, -48, 16);
    case 'up': return B(-34, -58, -6) + B(34, -58, 6);
    case 'raise': return B(-34, -44, 4) + B(34, -60, 10);
    case 'flat': return B(-34, -42, 0) + B(34, -42, 0);
    default: return '';
  }
}
function mouth(type, t) {
  switch (type) {
    case 'smile': return `<path d="M-28 0 Q0 24 28 0" stroke="${INK}" stroke-width="6.5" fill="none" stroke-linecap="round"/>`;
    case 'smirk': return `<path d="M-26 8 Q6 16 30 -8" stroke="${INK}" stroke-width="6.5" fill="none" stroke-linecap="round"/>`;
    case 'flat': return `<path d="M-20 6 L20 6" stroke="${INK}" stroke-width="6.5" stroke-linecap="round"/>`;
    case 'frown': return `<path d="M-24 14 Q0 -6 24 14" stroke="${INK}" stroke-width="6.5" fill="none" stroke-linecap="round"/>`;
    case 'wavy': return `<path d="M-26 8 Q-13 -2 0 8 Q13 18 26 8" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    case 'open': return `<path d="M-30 -4 Q0 -10 30 -4 Q26 42 0 42 Q-26 42 -30 -4Z" fill="${INK}"/><path d="M-15 32 Q0 22 15 32 Q0 42 -15 32Z" fill="#e8737d"/>`;
    case 'o': return `<ellipse cy="10" rx="12" ry="16" fill="${INK}"/>`;
    case 'grin': return `<path d="M-40 -6 Q0 4 40 -6 Q32 40 0 40 Q-32 40 -40 -6Z" fill="#fff" stroke="${INK}" stroke-width="5.5" stroke-linejoin="round"/><path d="M-36 6 Q0 14 36 6" stroke="${INK}" stroke-width="3" fill="none"/>`;
    case 'jaw': return `<path d="M-26 -2 Q0 -8 26 -2 L24 96 Q0 108 -24 96Z" fill="${INK}"/><path d="M-16 86 Q0 74 16 86 Q0 98 -16 86Z" fill="#e8737d"/>`;
    case 'talk': {
      const o = Math.max(0, Math.sin(t * 22) * .6 + Math.sin(t * 13.7) * .5);
      return `<path d="M-26 -2 Q0 -8 26 -2 Q22 ${f(6 + o * 30)} 0 ${f(6 + o * 30)} Q-22 ${f(6 + o * 30)} -26 -2Z" fill="${INK}"/>`;
    }
    default: return '';
  }
}
function hat(type, color) {
  const st = `stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"`;
  switch (type) {
    case 'fedora':
      return `<ellipse cx="0" cy="-78" rx="122" ry="24" fill="${color}" ${st}/>
        <path d="M-64 -78 Q-70 -152 -22 -156 Q0 -140 22 -156 Q70 -152 64 -78Z" fill="${color}" ${st}/>
        <path d="M-64 -78 Q-70 -152 -22 -156 Q0 -140 22 -156 Q70 -152 64 -78Z" fill="url(#gShade)"/>
        <path d="M-65 -100 Q0 -88 65 -100 L64 -80 Q0 -70 -64 -80Z" fill="#2a1a12"/>`;
    case 'cap':
      return `<path d="M-100 -28 Q-104 -126 0 -128 Q100 -124 102 -36Z" fill="${color}" ${st}/>
        <path d="M-100 -28 Q-104 -126 0 -128 Q100 -124 102 -36Z" fill="url(#gShade)"/>
        <path d="M18 -44 Q112 -66 150 -34 Q104 -14 26 -26Z" fill="${color}" ${st}/>
        <path d="M-60 -110 Q0 -80 70 -108 M-80 -80 Q0 -50 90 -80" stroke="#00000033" stroke-width="5" fill="none"/>
        <circle cx="0" cy="-128" r="9" fill="${color}" ${st}/>`;
    case 'bowler':
      return `<ellipse cx="0" cy="-72" rx="98" ry="17" fill="${color}" ${st}/>
        <path d="M-70 -72 Q-74 -168 0 -168 Q74 -168 70 -72Z" fill="${color}" ${st}/>
        <path d="M-70 -72 Q-74 -168 0 -168 Q74 -168 70 -72Z" fill="url(#gShade)"/>
        <path d="M-70 -92 Q0 -80 70 -92 L70 -74 Q0 -64 -70 -74Z" fill="#6b1d1d"/>`;
    case 'boater':
      return `<ellipse cx="0" cy="-80" rx="130" ry="22" fill="${color}" ${st}/>
        <path d="M-66 -80 L-62 -132 L62 -132 L66 -80Z" fill="${color}" ${st}/>
        <path d="M-65 -104 L65 -104 L66 -84 L-66 -84Z" fill="#c0392b" stroke="${INK}" stroke-width="3"/>`;
    case 'straw':
      return `<ellipse cx="0" cy="-74" rx="160" ry="30" fill="${color}" ${st}/>
        <path d="M-150 -74 Q0 -40 150 -74" stroke="#a87b2a" stroke-width="4" fill="none"/>
        <path d="M-64 -74 Q-70 -150 0 -152 Q70 -150 64 -74Z" fill="${color}" ${st}/>
        <path d="M-64 -96 Q0 -84 64 -96 L64 -78 Q0 -68 -64 -78Z" fill="#3d6fb6"/>`;
    case 'top':
      return `<ellipse cx="0" cy="-80" rx="96" ry="18" fill="${color}" ${st}/>
        <path d="M-56 -80 L-60 -236 L60 -236 L56 -80Z" fill="${color}" ${st}/>
        <path d="M-56 -80 L-60 -236 L60 -236 L56 -80Z" fill="url(#gShade)"/>
        <path d="M-57 -110 L57 -110 L56 -84 L-56 -84Z" fill="#7a1f1f"/>`;
    case 'visor':
      return `<path d="M-98 -42 Q0 -64 98 -42" stroke="${INK}" stroke-width="10" fill="none"/>
        <path d="M-80 -40 Q0 -62 80 -40 L104 -4 Q0 -34 -104 -4Z" fill="#2fa36b" fill-opacity=".88" ${st}/>`;
    default: return '';
  }
}
function outfit(type, col, acc) {
  switch (type) {
    case 'vest':
      return `<path d="M-30 -302 L0 -256 L30 -302Z" fill="#fff" stroke="${INK}" stroke-width="4"/>
        <path d="M-12 -300 L0 -284 L12 -300 L12 -270 L0 -284 L-12 -270Z" fill="${acc}" stroke="${INK}" stroke-width="3.5"/>
        ${[-238, -206, -174].map(y => `<circle cx="0" cy="${y}" r="5.5" fill="#f3d27a" stroke="${INK}" stroke-width="2.5"/>`).join('')}
        <path d="M-40 -220 Q-14 -196 -2 -206" stroke="#f3d27a" stroke-width="4" fill="none"/>`;
    case 'suit':
      return `<path d="M-30 -302 L0 -240 L30 -302Z" fill="#fff" stroke="${INK}" stroke-width="4"/>
        <path d="M0 -290 L-11 -270 L0 -196 L11 -270Z" fill="${acc}" stroke="${INK}" stroke-width="3.5"/>
        <path d="M-50 -296 L-6 -226 L-26 -246 L-42 -228Z M50 -296 L6 -226 L26 -246 L42 -228Z" fill="#00000030"/>`;
    case 'overalls':
      return `<path d="M-44 -250 L44 -250 L50 -150 L-50 -150Z" fill="#4f7fc4" stroke="${INK}" stroke-width="5"/>
        <path d="M-44 -250 L-50 -300 M44 -250 L50 -300" stroke="#3b66a6" stroke-width="12"/>
        <circle cx="-30" cy="-240" r="6" fill="#f3d27a" stroke="${INK}" stroke-width="2.5"/><circle cx="30" cy="-240" r="6" fill="#f3d27a" stroke="${INK}" stroke-width="2.5"/>
        <rect x="-20" y="-228" width="40" height="30" rx="4" fill="#3b66a6" stroke="${INK}" stroke-width="3"/>`;
    case 'suspenders':
      return `<path d="M-30 -302 L0 -270 L30 -302Z" fill="#fff" stroke="${INK}" stroke-width="4"/>
        <path d="M-32 -300 L-26 -150 M32 -300 L26 -150" stroke="${acc}" stroke-width="9"/>
        <circle cx="0" cy="-236" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="0" cy="-200" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
    default: return '';
  }
}

// o: {x,y,s,flip,color,acc,outfit,hat,hatColor,eyes,brows,mouth,look:[x,y],blink,glasses,mustache,
//     pose|arms:[[a,b],[a,b]], legs:'stand'|'walk'|'sit', walk:phase, tilt, bob, itemL, itemR, t, squash}
function char(o) {
  const t = o.t || 0, s = o.s || 1;
  const col = o.color || '#5fc5a2';
  const arms = o.arms || POSES[o.pose || 'idle'];
  const look = o.look || [0, 0];
  const breathe = Math.sin(t * 2.4 + (o.seed || 0)) * 3 * (o.still ? 0 : 1);
  const bob = (o.bob || 0) + breathe;
  const sq = o.squash || 1;
  let legs;
  const hipY = -150;
  if (o.legs === 'walk') {
    const p = o.walk || 0, a1 = Math.sin(p) * 26, a2 = -a1;
    const L = (hx, a) => { const r = a * Math.PI / 180, kx = hx + Math.sin(r) * 72, ky = hipY + Math.cos(r) * 72 + 0, fx = kx + Math.sin(r * .6) * 78, fy = ky + 78 * Math.cos(r * .6);
      return `<path d="M${hx} ${hipY} Q${f(kx)} ${f(ky)} ${f(fx)} ${f(Math.min(0, fy))}" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/><ellipse cx="${f(fx + 10)}" cy="${f(Math.min(0, fy))}" rx="17" ry="9" fill="${INK}"/>`; };
    legs = L(-20, a1) + L(20, a2);
  } else if (o.legs === 'sit') {
    legs = `<path d="M-22 ${hipY} L58 ${hipY + 6} L60 0 M22 ${hipY} L94 ${hipY + 6} L96 0" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="72" cy="0" rx="17" ry="9" fill="${INK}"/><ellipse cx="108" cy="0" rx="17" ry="9" fill="${INK}"/>`;
  } else {
    const sp = o.spread || 0;
    legs = `<path d="M-22 ${hipY} Q${-28 - sp} -75 ${-30 - sp * 2} 0 M22 ${hipY} Q${28 + sp} -75 ${30 + sp * 2} 0" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/><ellipse cx="${-38 - sp * 2}" cy="0" rx="18" ry="9" fill="${INK}"/><ellipse cx="${38 + sp * 2}" cy="0" rx="18" ry="9" fill="${INK}"/>`;
  }
  const L = limb(-50, -282 + bob, -1, arms[0][0], arms[0][1], 78, 74);
  const R = limb(50, -282 + bob, 1, arms[1][0], arms[1][1], 78, 74);
  const armPath = A => `<path d="${A.d}" stroke="${INK}" stroke-width="8.5" fill="none" stroke-linecap="round"/><circle cx="${f(A.hx)}" cy="${f(A.hy)}" r="10" fill="${INK}"/>`;
  const torso = `<g transform="translate(0 ${f(bob * .5)})">
    <rect x="-58" y="-308" width="116" height="164" rx="52" fill="${col}" stroke="${INK}" stroke-width="${SW}"/>
    <rect x="-58" y="-308" width="116" height="164" rx="52" fill="url(#gShade)"/>
    ${outfit(o.outfit, col, o.acc || '#d63c3c')}</g>`;
  const headC = `translate(0 ${f(-402 + bob)}) rotate(${f(o.tilt || 0)} 0 100)`;
  const fx = look[0] * 16, fy = look[1] * 10;
  const head = `<g transform="${headC}">
    <circle r="100" fill="url(#gHead)" stroke="${INK}" stroke-width="${SW}"/>
    <g transform="translate(${f(fx)} ${f(fy)})">
      ${o.blush ? `<ellipse cx="-52" cy="30" rx="16" ry="9" fill="#ff8a8a" opacity=".45"/><ellipse cx="52" cy="30" rx="16" ry="9" fill="#ff8a8a" opacity=".45"/>` : ''}
      <g transform="translate(-34 -4)">${eyes(o.eyes, look, o.blink || 0, -1)}</g>
      <g transform="translate(34 -4)">${eyes(o.eyes, look, o.blink || 0, 1)}</g>
      ${brows(o.brows)}
      ${o.glasses ? `<circle cx="-34" cy="-4" r="27" fill="url(#gGlass)" stroke="${INK}" stroke-width="5"/><circle cx="34" cy="-4" r="27" fill="url(#gGlass)" stroke="${INK}" stroke-width="5"/><path d="M-8 -6 Q0 -12 8 -6" stroke="${INK}" stroke-width="5" fill="none"/>` : ''}
      ${o.mustache ? `<path d="M-46 30 Q-24 8 0 22 Q24 8 46 30 Q24 26 0 34 Q-24 26 -46 30Z" fill="${o.mustache}" stroke="${INK}" stroke-width="4"/>` : ''}
      <g transform="translate(0 ${o.mustache ? 46 : 40})">${mouth(o.mouth || 'smile', t)}</g>
      ${o.sweat ? `<path d="M74 -40 Q86 -18 74 -10 Q62 -18 74 -40Z" fill="#8fd3ff" stroke="${INK}" stroke-width="3"/>` : ''}
    </g>
    <g transform="translate(${f(fx * .4)} 0) rotate(${o.hatTilt || 0})">${hat(o.hat, o.hatColor || '#7a4b2a')}</g>
  </g>`;
  const body = `${legs}${armPath(L)}${torso}${head}${armPath(R)}
    ${o.itemL ? g(tr(L.hx, L.hy), o.itemL) : ''}${o.itemR ? g(tr(R.hx, R.hy), o.itemR) : ''}`;
  return `<g transform="${tr(o.x, o.y, s)}">${o.noShadow ? '' : shadow(0, 4, 95, 18)}
    <g transform="scale(${o.flip ? -1 : 1} 1) scale(${f(2 - sq)} ${f(sq)})">${body}</g></g>`;
}

// the cast
const OTTO = { color: '#e0a83a', outfit: 'vest', acc: '#d63c3c', hat: 'fedora', hatColor: '#8a5a33', glasses: true };
const ERNEST = { color: '#4fb98f', outfit: 'suspenders', acc: '#8b3a2e', hat: 'cap', hatColor: '#7c8794' };
const RIVAL = { color: '#7b4fb0', outfit: 'suit', acc: '#e8b13c', hat: 'bowler', hatColor: '#2a2230', mustache: '#3a2a20' };
const GROCER = { color: '#f2efe6', outfit: 'overalls', hat: 'straw', hatColor: '#f0cf6d', mustache: '#c8c8c8' };

// ---------- props ----------
function cloud(x, y, s = 1, o = 1) {
  const c = [[0, 0, 70], [-70, 18, 52], [72, 16, 56], [-30, -40, 55], [36, -36, 50], [-120, 34, 34], [118, 34, 36]];
  return `<g transform="${tr(x, y, s)}" opacity="${o}">${c.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#gCloud)"/>`).join('')}
    <path d="M-150 50 L150 50" stroke="#b9cde8" stroke-width="8" opacity=".0"/></g>`;
}
function tree(x, y, s = 1, kind = 'round', hue = 0) {
  const greens = ['#3f9a3a', '#4fae3f', '#68c24c', '#2f7f30'];
  if (kind === 'poplar') {
    return `<g transform="${tr(x, y, s)}">${shadow(0, 0, 60, 12)}<rect x="-8" y="-60" width="16" height="62" fill="#6b4226" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="0" cy="-230" rx="62" ry="190" fill="${greens[0]}" stroke="${INK}" stroke-width="5"/>
      <ellipse cx="-14" cy="-270" rx="34" ry="130" fill="${greens[2]}" opacity=".7"/>
      <ellipse cx="0" cy="-230" rx="62" ry="190" fill="url(#gShade)"/></g>`;
  }
  return `<g transform="${tr(x, y, s)}">${shadow(0, 0, 110, 20)}
    <path d="M-12 0 L-9 -110 L9 -110 L12 0Z" fill="#7a4a2a" stroke="${INK}" stroke-width="5"/>
    <circle cx="-55" cy="-150" r="70" fill="${greens[3]}" stroke="${INK}" stroke-width="5"/>
    <circle cx="55" cy="-150" r="72" fill="${greens[3]}" stroke="${INK}" stroke-width="5"/>
    <circle cx="0" cy="-205" r="92" fill="${greens[0]}" stroke="${INK}" stroke-width="5"/>
    <circle cx="-30" cy="-235" r="50" fill="${greens[2]}" opacity=".75"/>
    <circle cx="0" cy="-180" r="130" fill="url(#gShade)" opacity=".6"/></g>`;
}
function fence(x0, x1, y, s = 1, color = '#f4efe6') {
  let p = '';
  for (let x = x0; x <= x1; x += 110 * s) p += `<rect x="${f(x - 7 * s)}" y="${f(y - 95 * s)}" width="${f(14 * s)}" height="${f(98 * s)}" fill="${color}" stroke="${INK}" stroke-width="${f(3.5 * s)}"/>`;
  return `<rect x="${x0}" y="${f(y - 82 * s)}" width="${x1 - x0}" height="${f(12 * s)}" fill="${color}" stroke="${INK}" stroke-width="${f(3.5 * s)}"/>
    <rect x="${x0}" y="${f(y - 46 * s)}" width="${x1 - x0}" height="${f(12 * s)}" fill="${color}" stroke="${INK}" stroke-width="${f(3.5 * s)}"/>${p}`;
}

function cow(o) {
  const t = o.t || 0, chew = Math.sin(t * 9) * (o.chew === false ? 0 : 1);
  const eye = o.eyes === 'smug' ? `<path d="M-9 0 A9 8 0 0 0 9 0Z" fill="${INK}"/><path d="M-12 0 L12 0" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`
    : o.eyes === 'wide' ? `<circle r="13" fill="#fff" stroke="${INK}" stroke-width="4"/><circle r="5" fill="${INK}"/>` : `<ellipse rx="7" ry="9" fill="${INK}"/><circle cx="-2" cy="-3" r="2.2" fill="#fff"/>`;
  const leg = (x, ph) => `<g transform="rotate(${f(Math.sin(t * 6 + ph) * (o.walk ? 14 : 0))} ${x} -70)"><rect x="${x - 13}" y="-80" width="26" height="80" rx="10" fill="#fbf8f2" stroke="${INK}" stroke-width="5"/><rect x="${x - 14}" y="-16" width="28" height="18" rx="5" fill="#3b2b25" stroke="${INK}" stroke-width="4"/></g>`;
  return `<g transform="${tr(o.x, o.y, o.s || 1)} scale(${o.flip ? -1 : 1} 1)">${shadow(0, 2, 170, 24)}
    ${leg(-85, 0)}${leg(70, 1.6)}
    <path d="M-150 -150 Q-200 -110 -186 -60" stroke="${INK}" stroke-width="6" fill="none" transform="rotate(${f(Math.sin(t * 3) * 10)} -150 -150)"/>
    <rect x="-160" y="-215" width="300" height="150" rx="70" fill="#fbf8f2" stroke="${INK}" stroke-width="6"/>
    <path d="M-110 -214 Q-60 -170 -100 -120 Q-140 -100 -150 -160 Q-150 -205 -110 -214Z" fill="#2b2220"/>
    <path d="M10 -200 Q60 -190 50 -140 Q20 -110 -10 -150 Q-20 -185 10 -200Z" fill="#2b2220"/>
    <rect x="-160" y="-215" width="300" height="150" rx="70" fill="url(#gShadeV)"/>
    <ellipse cx="-30" cy="-68" rx="26" ry="14" fill="#f5a3b0" stroke="${INK}" stroke-width="4"/>
    ${leg(-50, 3.1)}${leg(105, 4.7)}
    <g transform="translate(150 -190) rotate(${f(o.headTilt || 0)})">
      <path d="M-34 -50 Q-60 -78 -70 -52 Q-56 -38 -34 -40Z M34 -50 Q60 -78 70 -52 Q56 -38 34 -40Z" fill="#fbf8f2" stroke="${INK}" stroke-width="5"/>
      <path d="M-22 -58 Q-30 -88 -14 -92 M22 -58 Q30 -88 14 -92" stroke="#efe2c0" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M-22 -58 Q-30 -88 -14 -92 M22 -58 Q30 -88 14 -92" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".6"/>
      <rect x="-48" y="-62" width="96" height="120" rx="44" fill="#fbf8f2" stroke="${INK}" stroke-width="6"/>
      <path d="M-46 -30 Q-20 -60 -6 -58 Q-14 -20 -46 -10Z" fill="#2b2220"/>
      <g transform="translate(-20 -12)">${eye}</g><g transform="translate(22 -12)">${eye}</g>
      <g transform="translate(0 ${f(chew * 2)})"><rect x="-44" y="18" width="88" height="56" rx="26" fill="#f5a3b0" stroke="${INK}" stroke-width="5"/>
      <ellipse cx="-16" cy="38" rx="7" ry="5" fill="${INK}" opacity=".7"/><ellipse cx="16" cy="38" rx="7" ry="5" fill="${INK}" opacity=".7"/>
      <path d="M-18 ${f(60 + chew * 2)} Q0 ${f(66 + chew * 3)} 18 ${f(60 - chew * 2)}" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/></g>
    </g></g>`;
}
// front-facing cow face for close-ups
function cowFace(o) {
  const t = o.t || 0, chew = Math.sin(t * 8.5);
  const eye = (side) => o.eyes === 'twitch' && side > 0
    ? `<path d="M-15 0 A15 13 0 0 0 15 0Z" fill="${INK}" transform="translate(0 ${f(Math.abs(Math.sin(t * 40)) * 2)})"/><path d="M-20 0 L20 0" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`
    : `<path d="M-15 0 A15 13 0 0 0 15 0Z" fill="${INK}"/><path d="M-20 0 L20 0" stroke="${INK}" stroke-width="6" stroke-linecap="round" transform="rotate(${side * -6})"/>`;
  return `<g transform="${tr(o.x, o.y, o.s || 1)} rotate(${f(o.tilt || 0)})">
    <path d="M-90 -120 Q-180 -170 -200 -110 Q-170 -80 -100 -90Z M90 -120 Q180 -170 200 -110 Q170 -80 100 -90Z" fill="#fbf8f2" stroke="${INK}" stroke-width="8"/>
    <path d="M-60 -150 Q-80 -230 -40 -240 M60 -150 Q80 -230 40 -240" stroke="#efe2c0" stroke-width="24" stroke-linecap="round" fill="none"/>
    <path d="M-60 -150 Q-80 -230 -40 -240 M60 -150 Q80 -230 40 -240" stroke="${INK}" stroke-width="5" fill="none" opacity=".5"/>
    <rect x="-130" y="-170" width="260" height="320" rx="120" fill="#fbf8f2" stroke="${INK}" stroke-width="9"/>
    <path d="M-128 -60 Q-90 -170 -20 -168 Q-40 -90 -128 -20Z" fill="#2b2220"/>
    <path d="M40 -168 Q110 -160 124 -100 Q80 -80 50 -120Z" fill="#2b2220"/>
    <rect x="-130" y="-170" width="260" height="320" rx="120" fill="url(#gShadeV)"/>
    <g transform="translate(-52 -40)">${eye(-1)}</g><g transform="translate(52 -40)">${eye(1)}</g>
    <g transform="translate(0 ${f(chew * 4)})"><rect x="-118" y="40" width="236" height="140" rx="66" fill="#f5a3b0" stroke="${INK}" stroke-width="8"/>
    <ellipse cx="-44" cy="88" rx="16" ry="11" fill="${INK}" opacity=".75"/><ellipse cx="44" cy="88" rx="16" ry="11" fill="${INK}" opacity=".75"/>
    <path d="M-40 ${f(146 + chew * 4)} Q0 ${f(158 + chew * 6)} 40 ${f(146 - chew * 4)}" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M30 ${f(150 - chew * 3)} l26 10" stroke="#c9b26b" stroke-width="6" stroke-linecap="round"/></g>
  </g>`;
}

function lightbulb(x, y, s, glow = 1) {
  return `<g transform="${tr(x, y, s)}"><circle r="120" fill="#ffe680" opacity="${f(.45 * glow)}" filter="url(#glow)"/>
    <path d="M-48 10 Q-70 -30 -50 -70 Q-30 -105 0 -105 Q30 -105 50 -70 Q70 -30 48 10 Q34 26 30 46 L-30 46 Q-34 26 -48 10Z" fill="#fff3a6" stroke="${INK}" stroke-width="7"/>
    <path d="M-14 40 L-10 0 L0 14 L10 0 L14 40" stroke="#e0a020" stroke-width="5" fill="none"/>
    <path d="M-34 -60 Q-30 -84 -6 -90" stroke="#fff" stroke-width="10" stroke-linecap="round" fill="none"/>
    <rect x="-30" y="46" width="60" height="34" rx="8" fill="#9aa3ad" stroke="${INK}" stroke-width="6"/>
    <path d="M-28 58 L28 58 M-28 70 L28 70" stroke="${INK}" stroke-width="3"/></g>`;
}
function banknote(x, y, r, s = 1) {
  return `<g transform="${tr(x, y, s, r)}"><rect x="-70" y="-34" width="140" height="68" rx="6" fill="#86c77a" stroke="#1f4d22" stroke-width="4"/>
    <rect x="-60" y="-25" width="120" height="50" rx="4" fill="none" stroke="#2f6f33" stroke-width="2.5"/>
    <ellipse rx="20" ry="20" fill="#cfe9c4" stroke="#2f6f33" stroke-width="2.5"/>
    <text y="10" font-family="Alfa Slab One" font-size="26" text-anchor="middle" fill="#2f6f33">$</text></g>`;
}
function phone(s = 1) { // candlestick phone, held at hand (0,0)
  return `<g transform="scale(${s})"><path d="M-6 -10 L-10 -150" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
    <ellipse cx="-10" cy="-160" rx="30" ry="22" fill="#2b2b2b" stroke="${INK}" stroke-width="5"/></g>`;
}
function teacup(s = 1) {
  return `<g transform="scale(${s})"><path d="M-30 -40 L30 -40 L22 4 Q0 12 -22 4Z" fill="#fff" stroke="${INK}" stroke-width="5"/>
    <path d="M28 -30 Q48 -28 40 -10 Q34 0 24 -4" stroke="${INK}" stroke-width="5" fill="none"/>
    <ellipse cy="-40" rx="30" ry="7" fill="#8a4b22" stroke="${INK}" stroke-width="4"/>
    <ellipse cy="8" rx="44" ry="9" fill="#fff" stroke="${INK}" stroke-width="5"/></g>`;
}
function pen(s = 1, r = -30) {
  return `<g transform="scale(${s}) rotate(${r})"><path d="M0 0 L-8 -24 L8 -24Z" fill="#c9a14a" stroke="${INK}" stroke-width="3"/>
    <rect x="-9" y="-120" width="18" height="98" rx="6" fill="#2a2a2a" stroke="${INK}" stroke-width="3"/>
    <rect x="-9" y="-60" width="18" height="8" fill="#d8b35a"/></g>`;
}
function brush(s = 1, r = -20) {
  return `<g transform="scale(${s}) rotate(${r})"><rect x="-6" y="-130" width="12" height="100" rx="5" fill="#b8763d" stroke="${INK}" stroke-width="3"/>
    <rect x="-9" y="-34" width="18" height="16" fill="#aaa" stroke="${INK}" stroke-width="3"/>
    <path d="M-9 -18 Q-10 10 0 18 Q10 10 9 -18Z" fill="#c0392b" stroke="${INK}" stroke-width="3"/></g>`;
}
function questionMark(x, y, s, r = 0) {
  return `<g transform="${tr(x, y, s, r)}"><text font-family="Alfa Slab One" font-size="150" text-anchor="middle" fill="#fff" stroke="${INK}" stroke-width="10" paint-order="stroke">?</text></g>`;
}
function stamp(x, y, s, text, r = -12, o = 1) {
  return `<g transform="${tr(x, y, s, r)}" opacity="${o}"><rect x="-230" y="-70" width="460" height="130" rx="14" fill="none" stroke="#d6262b" stroke-width="12"/>
    <text y="30" font-family="Alfa Slab One" font-size="88" text-anchor="middle" fill="#d6262b" letter-spacing="4">${text}</text></g>`;
}
function bubble(x, y, w, h, text, size = 54, tail = 'bl') {
  const tx = tail === 'bl' ? -w * .25 : w * .25;
  return `<g transform="${tr(x, y)}"><path d="M${f(tx - 26)} ${h / 2 - 6} L${f(tx - 60)} ${h / 2 + 60} L${f(tx + 30)} ${h / 2 - 6}Z" fill="#fff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2.4}" fill="#fff" stroke="${INK}" stroke-width="7"/>
    <path d="M${f(tx - 22)} ${h / 2 - 4} L${f(tx + 26)} ${h / 2 - 4}" stroke="#fff" stroke-width="10"/>
    <text y="${f(size * .35)}" font-family="Montserrat" font-weight="800" font-size="${size}" text-anchor="middle" fill="${INK}">${text}</text></g>`;
}

// 1930s car, side view, facing right. wheel = rotation in degrees. heads = svg drawn in the cabin
function car(o) {
  const wh = (cx) => `<g transform="translate(${cx} -62) rotate(${f(o.wheel || 0)})"><circle r="62" fill="#1d1d1d" stroke="${INK}" stroke-width="6"/><circle r="34" fill="#d9d2c3" stroke="${INK}" stroke-width="4"/>
    ${[0, 45, 90, 135].map(a => `<path d="M-30 0 L30 0" transform="rotate(${a})" stroke="#555" stroke-width="4"/>`).join('')}<circle r="9" fill="#555"/></g>`;
  const c = o.color || '#9b2f2f';
  return `<g transform="${tr(o.x, o.y, o.s || 1)} scale(${o.flip ? -1 : 1} 1)">${shadow(0, 2, 330, 30)}
    ${o.heads || ''}
    <path d="M-150 -170 L-130 -290 L110 -290 L150 -170Z" fill="#cfe6f5" stroke="${INK}" stroke-width="7" opacity=".55"/>
    <path d="M-150 -170 L-130 -290 L110 -290 L150 -170" fill="none" stroke="${INK}" stroke-width="9"/>
    <path d="M-10 -290 L-10 -170" stroke="${INK}" stroke-width="8"/>
    <path d="M-300 -70 L-300 -160 Q-300 -175 -280 -175 L150 -175 L210 -150 L320 -140 Q345 -136 345 -110 L345 -70Z" fill="${c}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M-300 -70 L-300 -160 Q-300 -175 -280 -175 L150 -175 L210 -150 L320 -140 Q345 -136 345 -110 L345 -70Z" fill="url(#gShadeV)"/>
    <path d="M-330 -60 Q-320 -150 -210 -140 Q-150 -130 -140 -60Z M120 -60 Q130 -150 230 -140 Q300 -130 330 -60Z" fill="#222" stroke="${INK}" stroke-width="7"/>
    ${wh(-235)}${wh(225)}
    <path d="M-140 -70 L120 -70" stroke="#222" stroke-width="16"/>
    <circle cx="330" cy="-150" r="22" fill="#fff6c8" stroke="${INK}" stroke-width="6"/>
    <rect x="-40" y="-150" width="40" height="8" rx="3" fill="#ddd"/></g>`;
}

// General store with a false front. sign: 0..1 how much of the sign text is painted
function store(o) {
  const sign = o.sign === undefined ? 1 : o.sign;
  const planks = Array.from({ length: 14 }, (_, i) => `<path d="M${-300 + i * 44} -420 L${-300 + i * 44} -10" stroke="#8a5530" stroke-width="3" opacity=".7"/>`).join('');
  const win = (x) => `<g transform="translate(${x} -250)"><rect x="-70" y="-90" width="140" height="150" fill="#ffd98a" stroke="${INK}" stroke-width="6"/>
    <rect x="-70" y="-90" width="140" height="150" fill="url(#gGlass)"/>
    <path d="M0 -90 L0 60 M-70 -15 L70 -15" stroke="${INK}" stroke-width="5"/>
    <rect x="-82" y="60" width="164" height="14" fill="#7a4a2a" stroke="${INK}" stroke-width="4"/></g>`;
  return `<g transform="${tr(o.x, o.y, o.s || 1)}">${shadow(0, 0, 420, 50)}
    <rect x="-310" y="-430" width="620" height="430" fill="#cf8d55" stroke="${INK}" stroke-width="7"/>${planks}
    <path d="M-345 -440 L-345 -600 L-120 -600 L-120 -640 L120 -640 L120 -600 L345 -600 L345 -440Z" fill="#b97845" stroke="${INK}" stroke-width="7"/>
    <rect x="-300" y="-610" width="600" height="150" rx="10" fill="#f4ead2" stroke="${INK}" stroke-width="6"/>
    <defs><clipPath id="signClip"><rect x="-300" y="-610" width="${f(600 * sign)}" height="150"/></clipPath></defs>
    <g clip-path="url(#signClip)">
      <text x="0" y="-512" font-family="Rye" font-size="92" text-anchor="middle" fill="#b8322a" letter-spacing="6">AGLOE</text>
      <text x="0" y="-472" font-family="Rye" font-size="34" text-anchor="middle" fill="#2d2016" letter-spacing="4">GENERAL STORE</text>
    </g>
    <rect x="-310" y="-430" width="620" height="430" fill="url(#gShade)" opacity=".7"/>
    ${win(-190)}${win(190)}
    <rect x="-62" y="-300" width="124" height="300" fill="#6d3b1f" stroke="${INK}" stroke-width="6"/>
    <rect x="-44" y="-280" width="88" height="110" fill="#ffd98a" stroke="${INK}" stroke-width="5"/>
    <circle cx="40" cy="-150" r="8" fill="#f3d27a" stroke="${INK}" stroke-width="3"/>
    <path d="M-370 -360 L370 -360 L400 -300 L-400 -300Z" fill="#8e5a35" stroke="${INK}" stroke-width="7"/>
    <path d="M-370 -360 L370 -360 L400 -300 L-400 -300Z" fill="url(#gShadeV)"/>
    ${[-370, -120, 120, 370].map(x => `<rect x="${x - 10}" y="-300" width="20" height="300" fill="#a86c40" stroke="${INK}" stroke-width="5"/>`).join('')}
    <rect x="-410" y="-16" width="820" height="22" fill="#9c6640" stroke="${INK}" stroke-width="5"/>
    <g transform="translate(-330 0)"><rect x="-38" y="-90" width="76" height="90" rx="12" fill="#a0632f" stroke="${INK}" stroke-width="5"/><path d="M-38 -62 L38 -62 M-38 -28 L38 -28" stroke="#4a4a4a" stroke-width="6"/></g>
    <g transform="translate(300 0)"><rect x="-50" y="-80" width="100" height="80" fill="#c99b5c" stroke="${INK}" stroke-width="5"/><path d="M-50 -80 L50 0 M50 -80 L-50 0" stroke="#8a6234" stroke-width="5"/></g>
    <g transform="translate(470 0)"><rect x="-34" y="-230" width="68" height="230" rx="12" fill="#d33a2c" stroke="${INK}" stroke-width="6"/><circle cx="0" cy="-250" r="34" fill="#fff6c8" stroke="${INK}" stroke-width="6"/><rect x="-22" y="-180" width="44" height="50" fill="#fff" stroke="${INK}" stroke-width="4"/><path d="M34 -120 Q70 -110 64 -40" stroke="${INK}" stroke-width="6" fill="none"/></g>
  </g>`;
}

function mousetrap(o) {
  const a = o.snap || 0; // 0 open, 1 snapped
  return `<g transform="${tr(o.x, o.y, o.s || 1)}">${shadow(0, 10, 330, 40)}
    <path d="M-300 0 L300 0 L260 -60 L-260 -60Z" fill="#d9a35f" stroke="${INK}" stroke-width="8"/>
    <path d="M-300 0 L300 0 L300 30 L-300 30Z" fill="#b5803f" stroke="${INK}" stroke-width="8"/>
    <path d="M-240 -30 L240 -30" stroke="#8a5d2a" stroke-width="5"/>
    <g transform="translate(150 -60)"><path d="M-70 0 L70 0 L50 -70Z" fill="#ffd34d" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><circle cx="10" cy="-20" r="9" fill="#e0a92a"/><circle cx="40" cy="-12" r="6" fill="#e0a92a"/></g>
    <g transform="rotate(${f(-105 * (1 - a))} -20 -40)"><rect x="-20" y="-50" width="270" height="16" rx="6" fill="#c9ccd1" stroke="${INK}" stroke-width="6"/><rect x="230" y="-60" width="16" height="36" rx="5" fill="#c9ccd1" stroke="${INK}" stroke-width="5"/></g>
    <circle cx="-20" cy="-40" r="20" fill="#9aa1a9" stroke="${INK}" stroke-width="6"/>
    <g transform="translate(170 -110)"><path d="M0 0 L0 -130" stroke="${INK}" stroke-width="7"/><path d="M0 -130 L110 -105 L0 -80Z" fill="#d6262b" stroke="${INK}" stroke-width="6"/>
    <text x="40" y="-98" font-family="Alfa Slab One" font-size="22" fill="#fff">AGLOE</text></g>
  </g>`;
}

function magnifier(x, y, s, content, r = -20) {
  return `<g transform="${tr(x, y, s)}"><defs><clipPath id="lensClip"><circle r="200"/></clipPath></defs>
    <g transform="rotate(${r})"><rect x="-26" y="200" width="52" height="260" rx="20" fill="#6b3a1e" stroke="${INK}" stroke-width="8"/></g>
    <g clip-path="url(#lensClip)">${content}</g>
    <circle r="200" fill="url(#gGlass)" opacity=".5"/>
    <circle r="200" fill="none" stroke="url(#gGold)" stroke-width="30"/><circle r="215" fill="none" stroke="${INK}" stroke-width="6"/><circle r="185" fill="none" stroke="${INK}" stroke-width="5"/>
    <path d="M-120 -110 Q-60 -170 20 -170" stroke="#fff" stroke-width="18" stroke-linecap="round" fill="none" opacity=".6"/></g>`;
}
