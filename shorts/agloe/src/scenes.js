// Environments. Each takes a camera c and time t and returns the full frame.

// ---------- the road map (sheet coords 0..1000 x 0..1300). Agloe sits at AX,AY ----------
const AX = 640, AY = 520;
function mapSheet(o = {}) {
  const ag = o.agloe || 0, lab = o.label || 0, circ = o.circle || 0;
  const town = (x, y, name, dx = 16, dy = -14, size = 26) => `<circle cx="${x}" cy="${y}" r="9" fill="#2d2016"/><circle cx="${x}" cy="${y}" r="4" fill="#efe2c4"/>
    <text x="${x + dx}" y="${y + dy}" font-family="Special Elite" font-size="${size}" fill="#2d2016">${name}</text>`;
  const shield = (x, y, n) => `<g transform="translate(${x} ${y})"><path d="M-22 -24 L22 -24 L22 6 Q0 28 -22 6Z" fill="#fff" stroke="#2d2016" stroke-width="3"/><text y="2" font-family="Alfa Slab One" font-size="20" text-anchor="middle" fill="#2d2016">${n}</text></g>`;
  const road = (d, w = 9, c = '#d9822b') => `<path d="${d}" stroke="#7a4a20" stroke-width="${w + 4}" fill="none" stroke-linecap="round" opacity=".55"/><path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  const dirt = d => `<path d="${d}" stroke="#8a6a44" stroke-width="5" fill="none" stroke-dasharray="14 9" stroke-linecap="round"/>`;
  return `<g>
    <image href="${TEX.paper}" x="0" y="0" width="1000" height="1300" preserveAspectRatio="none"/>
    ${o.tint ? `<rect width="1000" height="1300" fill="${o.tint}" style="mix-blend-mode:multiply"/>` : ''}
    <path d="M90 140 Q220 80 330 160 Q380 260 250 330 Q120 340 90 250Z" fill="#a9c98a" opacity=".55"/>
    <path d="M700 620 Q860 560 930 680 Q950 800 820 820 Q690 790 700 620Z" fill="#a9c98a" opacity=".55"/>
    <path d="M120 700 Q240 650 300 760 Q280 860 160 850 Q90 800 120 700Z" fill="#a9c98a" opacity=".5"/>
    <path d="M520 160 Q640 120 700 200 Q690 300 590 300 Q500 260 520 160Z" fill="#a9c98a" opacity=".5"/>
    <path d="M40 760 C180 720 220 860 360 880 S600 860 700 980 S880 1080 960 1060" stroke="#5f97c9" stroke-width="14" fill="none" stroke-linecap="round"/>
    <path d="M40 760 C180 720 220 860 360 880 S600 860 700 980 S880 1080 960 1060" stroke="#a9d0ef" stroke-width="5" fill="none" stroke-linecap="round"/>
    <ellipse cx="820" cy="330" rx="70" ry="38" fill="#7fb3dd" stroke="#5f97c9" stroke-width="4"/>
    ${road('M40 990 C260 950 480 1020 960 900', 15, '#c9452f')}
    <path d="M40 990 C260 950 480 1020 960 900" stroke="#f2c14e" stroke-width="4" fill="none" stroke-dasharray="18 12"/>
    ${road('M330 965 C350 820 470 640 640 520')}
    ${road('M640 520 C760 500 860 470 960 440')}
    ${road('M300 270 C380 330 520 380 640 520', 7)}
    ${dirt('M640 520 C650 420 700 260 740 60')}
    ${dirt('M640 520 C560 560 300 560 40 600')}
    ${dirt('M330 965 C250 1080 180 1150 120 1260')}
    ${road('M640 520 C700 640 720 860 760 1110', 7)}
    ${town(330, 965, 'ROSCOE', 18, 40)}${town(470, 1036, 'ROCKLAND', 16, 36)}${town(760, 1110, 'LIVINGSTON MANOR', -230, 44, 23)}
    ${town(300, 270, 'DOWNSVILLE', -60, -20)}${town(140, 600, 'BEAVERKILL', -40, -22, 23)}${town(930, 448, 'WALTON', -80, -22)}
    ${shield(150, 975, 17)}${shield(500, 690, 206)}${shield(820, 560, 30)}
    <g transform="translate(860 190)"><circle r="56" fill="none" stroke="#6b4a2a" stroke-width="3"/><path d="M0 -70 L12 0 L0 70 L-12 0Z M-70 0 L0 -12 L70 0 L0 12Z" fill="#6b4a2a"/><text y="-78" font-family="Special Elite" font-size="26" text-anchor="middle" fill="#6b4a2a">N</text></g>
    <rect x="70" y="1150" width="470" height="96" fill="#efe2c4" stroke="#6b4a2a" stroke-width="3"/>
    <text x="305" y="1196" font-family="Special Elite" font-size="34" text-anchor="middle" fill="#2d2016">NEW YORK · ROAD MAP</text>
    <text x="305" y="1232" font-family="Special Elite" font-size="22" text-anchor="middle" fill="#6b4a2a">1931 · ${o.publisher || 'COUNTY SERIES'}</text>
    <rect x="30" y="30" width="940" height="1240" fill="none" stroke="#6b4a2a" stroke-width="4"/>
    <rect x="44" y="44" width="912" height="1212" fill="none" stroke="#6b4a2a" stroke-width="1.5"/>
    ${ag > 0 ? `<g transform="translate(${AX} ${AY}) scale(${f(ag)})"><circle r="20" fill="#d6262b" opacity=".25"/><circle r="11" fill="#2d2016"/><circle r="5" fill="#d6262b"/></g>` : ''}
    ${lab > 0 ? `<defs><clipPath id="labClip${o.id || ''}"><rect x="${AX + 16}" y="${AY - 54}" width="${f(170 * lab)}" height="60"/></clipPath></defs>
      <text x="${AX + 20}" y="${AY - 18}" font-family="Special Elite" font-size="34" fill="#2d2016" clip-path="url(#labClip${o.id || ''})">AGLOE</text>` : ''}
    ${circ > 0 ? `<ellipse cx="${AX + 70}" cy="${AY - 20}" rx="120" ry="58" fill="none" stroke="#d6262b" stroke-width="9" stroke-linecap="round" pathLength="100" stroke-dasharray="${f(circ * 100)} 100" transform="rotate(-6 ${AX + 70} ${AY - 20})"/>` : ''}
  </g>`;
}

// ---------- office ----------
function wallpaper(x, y, w, h, base, stripe) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${base}"/>`;
  for (let i = x; i < x + w; i += 90) s += `<rect x="${i}" y="${y}" width="34" height="${h}" fill="${stripe}"/><circle cx="${i + 62}" cy="${y}" r="0"/>`;
  for (let j = y + 60; j < y + h; j += 140) for (let i = x + 62; i < x + w; i += 90) s += `<path d="M${i} ${j - 12} L${i + 9} ${j} L${i} ${j + 12} L${i - 9} ${j}Z" fill="${stripe}" opacity=".8"/>`;
  return s;
}
function windowCity(x, y, w, h, t) {
  let b = '';
  for (let i = 0; i < 9; i++) { const bx = x + i * (w / 8) - 20, bh = 120 + hash(i + 3) * 260; b += `<rect x="${f(bx)}" y="${f(y + h - bh)}" width="${f(w / 8 + 10)}" height="${f(bh)}" fill="${i % 2 ? '#8fa3c4' : '#a7b8d4'}"/>`; }
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#bfe1ff"/>
    <g filter="url(#b4)">${b}<rect x="${x + w * .45}" y="${y + 40}" width="50" height="${h}" fill="#7f93b6"/><path d="M${x + w * .45 + 25} ${y - 20} L${x + w * .45 + 40} ${y + 40} L${x + w * .45 + 10} ${y + 40}Z" fill="#7f93b6"/></g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" opacity=".18"/></g>`;
}
function officeBack(c, t, o = {}) {
  const pal = o.rival ? { base: '#6e2424', stripe: '#7d2f2b', wood: '#4a2616', trim: '#2e160c' } : { base: '#2c6964', stripe: '#357872', wood: '#7a4a2a', trim: '#4e2c16' };
  const dust = Array.from({ length: 26 }, (_, i) => {
    const px = 200 + hash(i) * 700 + Math.sin(t * .4 + i) * 30, py = 500 + ((hash(i + 9) * 1200 + t * (8 + hash(i) * 14)) % 1200);
    return `<circle cx="${f(px)}" cy="${f(py)}" r="${f(1.5 + hash(i + 2) * 3)}" fill="#fff6d6" opacity="${f(.25 + .4 * hash(i + 5))}"/>`;
  }).join('');
  const wall = `${wallpaper(-700, -600, 2500, 1900, pal.base, pal.stripe)}
    <rect x="-700" y="1050" width="2500" height="260" fill="${pal.wood}"/>
    ${Array.from({ length: 12 }, (_, i) => `<rect x="${-660 + i * 210}" y="1080" width="170" height="190" rx="6" fill="none" stroke="${pal.trim}" stroke-width="6"/>`).join('')}
    <rect x="-700" y="1036" width="2500" height="22" fill="${pal.trim}"/>
    <rect x="-700" y="1300" width="2500" height="900" fill="#6b3f22"/>
    <image href="${TEX.wood}" x="-700" y="1300" width="2500" height="900" preserveAspectRatio="none" opacity=".7"/>
    ${o.rival ? `
      <g transform="translate(250 560)"><ellipse rx="150" ry="190" fill="url(#gGold)" stroke="${INK}" stroke-width="7"/><ellipse rx="120" ry="160" fill="#3b2a3a"/>
        <circle cy="-30" r="70" fill="#e9e1d4"/><path d="M-50 10 Q-25 -10 0 4 Q25 -10 50 10 Q25 6 0 14 Q-25 6 -50 10Z" fill="#3a2a20"/><path d="M-60 -70 L-60 -110 L60 -110 L60 -70Z" fill="#2a2230"/><ellipse cy="-70" rx="90" ry="14" fill="#2a2230"/><path d="M-80 160 Q0 40 80 160Z" fill="#7b4fb0"/></g>
      <g transform="translate(860 700)"><rect x="-130" y="-170" width="260" height="340" rx="16" fill="#3d4148" stroke="${INK}" stroke-width="8"/><circle r="56" fill="#8a9099" stroke="${INK}" stroke-width="7"/><path d="M0 -56 L0 56 M-56 0 L56 0" stroke="${INK}" stroke-width="5"/><circle r="16" fill="#c9a14a" stroke="${INK}" stroke-width="4"/></g>`
    : `
      <g transform="translate(70 270)"><rect x="-22" y="-22" width="${470 + 44}" height="${560 + 44}" fill="url(#gGold)" stroke="${INK}" stroke-width="7"/>
        <g transform="scale(.47 .43)">${mapSheet({ agloe: o.wallAgloe || 0, label: o.wallAgloe ? 1 : 0, id: 'w' })}</g></g>
      <g transform="translate(680 300)"><rect x="-26" y="-26" width="${360 + 52}" height="${500 + 52}" fill="#5a3418" stroke="${INK}" stroke-width="7"/>
        ${windowCity(0, 0, 360, 500, t)}<path d="M180 0 L180 500 M0 250 L360 250" stroke="#5a3418" stroke-width="16"/><rect x="-40" y="500" width="440" height="30" fill="#5a3418" stroke="${INK}" stroke-width="6"/></g>`}
  `;
  const beam = o.rival ? '' : `<path d="M680 300 L1040 300 L700 2000 L-200 2000Z" fill="url(#gBeam)" style="mix-blend-mode:screen" opacity="${o.dark ? .25 : .7}"/>${dust}`;
  return layer(c, .82, wall, 2) + layer(c, .9, beam);
}
function lamp(x, y, on = 1, green = false) {
  return `<g transform="translate(${x} ${y})"><path d="M0 -900 L0 -60" stroke="${INK}" stroke-width="6"/>
    <circle cy="40" r="260" fill="url(#gLamp)" opacity="${on}"/>
    <path d="M-110 30 Q-100 -70 0 -76 Q100 -70 110 30Z" fill="${green ? '#2f7d4a' : '#2f6f6a'}" stroke="${INK}" stroke-width="7"/>
    <path d="M-110 30 Q-100 -70 0 -76 Q100 -70 110 30Z" fill="url(#gShade)"/>
    <ellipse cy="30" rx="110" ry="16" fill="#fff1c2" stroke="${INK}" stroke-width="6"/></g>`;
}
// drafting desk across the frame; map lies on it. y = top edge of the desk
function desk(y, o = {}) {
  const top = `<path d="M-200 ${y} L1280 ${y} L1340 ${y + 190} L-260 ${y + 190}Z" fill="${o.rival ? '#5a2c18' : '#a8693a'}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
  const paper = o.noMap ? '' : `<g transform="translate(${o.mapX || 240} ${y + 14}) scale(.62 .125)">${mapSheet({ agloe: o.agloe || 0, label: o.agloe ? 1 : 0, id: 'd', tint: o.tint })}</g>`;
  return `${top}<image href="${TEX.wood}" x="-200" y="${y}" width="1480" height="190" preserveAspectRatio="none" opacity=".35"/>${paper}
    <path d="M-260 ${y + 190} L1340 ${y + 190} L1340 ${y + 290} L-260 ${y + 290}Z" fill="${o.rival ? '#41200f' : '#7f4c27'}" stroke="${INK}" stroke-width="8"/>
    <path d="M-260 ${y + 190} L1340 ${y + 190} L1340 ${y + 290} L-260 ${y + 290}Z" fill="url(#gShadeV)"/>
    ${o.rival ? `<g transform="translate(860 ${y + 30})">${lamp(0, -40, 1, true).replace('M0 -900 L0 -60', 'M0 -40 L0 -40')}</g>` : `
    <g transform="translate(900 ${y + 60})"><path d="M-40 0 L-30 -60 L30 -60 L40 0Z" fill="#2b4b8a" stroke="${INK}" stroke-width="5"/><ellipse cy="-60" rx="30" ry="8" fill="#16274a" stroke="${INK}" stroke-width="4"/></g>
    <g transform="translate(120 ${y + 70}) rotate(-8)"><rect x="-90" y="-10" width="180" height="20" fill="#e8d28a" stroke="${INK}" stroke-width="4"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${-80 + i * 20} -10 L${-80 + i * 20} 0" stroke="${INK}" stroke-width="2"/>`).join('')}</g>`}
    <rect x="-260" y="${y + 290}" width="1600" height="900" fill="#3a2010"/>`;
}

// ---------- countryside crossroads ----------
function countrySky(c, t) {
  return layer(c, .15, `<rect x="-800" y="-1200" width="2700" height="2600" fill="url(#gSky)"/>
    <circle cx="880" cy="250" r="260" fill="#fff8d0" opacity=".55" filter="url(#glow)"/>`) +
    layer(c, .25, cloud(160 + t * 6, 300, 1.1) + cloud(820 + t * 4, 520, .8) + cloud(-260 + t * 5, 640, .9) + cloud(600 + t * 7, 160, .6, .9));
}
function farHills(c) {
  return layer(c, .4, `<path d="M-900 1080 Q-500 820 -100 960 Q300 840 650 950 Q1000 820 1500 940 Q1800 900 2100 1000 L2100 1500 L-900 1500Z" fill="#8fbfa8"/>
    <path d="M-900 1080 Q-500 820 -100 960 Q300 840 650 950 Q1000 820 1500 940 Q1800 900 2100 1000 L2100 1500 L-900 1500Z" fill="#cfe8ff" opacity=".35"/>`, 4);
}
function quilt(c, t) {
  // patchwork fields on the mid hills
  const cols = ['#7cc35a', '#9bd16a', '#c9d977', '#6fb54f', '#b7d866', '#e2cf7a'];
  let p = '';
  for (let r = 0; r < 4; r++) for (let i = -6; i < 14; i++) {
    const y0 = 1060 + r * 50, h = 50, x0 = i * 170 + (r % 2) * 80, sk = (i - 3) * 14;
    p += `<path d="M${x0} ${y0} L${x0 + 170} ${y0} L${x0 + 170 + sk * .3} ${y0 + h} L${x0 + sk * .3} ${y0 + h}Z" fill="${cols[Math.floor(hash(r * 31 + i) * cols.length)]}" stroke="#5e9a43" stroke-width="2"/>`;
  }
  let poplars = '';
  for (let i = 0; i < 9; i++) poplars += tree(-500 + i * 300 + hash(i) * 80, 1090 + hash(i + 4) * 20, .33, 'poplar');
  return layer(c, .62, `<path d="M-900 1100 Q-300 1000 300 1060 Q800 1000 1500 1050 Q1900 1040 2100 1080 L2100 1300 L-900 1300Z" fill="#7cc35a"/>${p}${poplars}`, 2);
}
function poles(c) {
  let s = '';
  const P = (x, y, sc) => `<g transform="${tr(x, y, sc)}"><rect x="-7" y="-420" width="14" height="420" fill="#6b4a33" stroke="${INK}" stroke-width="4"/><rect x="-70" y="-400" width="140" height="12" fill="#6b4a33" stroke="${INK}" stroke-width="3"/>${[-55, -20, 20, 55].map(x => `<rect x="${x - 4}" y="-414" width="8" height="14" fill="#9fd0c8"/>`).join('')}</g>`;
  s += P(-160, 1330, .8) + P(300, 1330, .8) + P(760, 1330, .8) + P(1220, 1330, .8);
  s += `<path d="M-200 1010 Q70 1060 300 1010 Q530 1060 760 1010 Q990 1060 1220 1010 Q1400 1050 1600 1010" stroke="${INK}" stroke-width="2.5" fill="none" opacity=".8"/>
    <path d="M-200 1022 Q70 1072 300 1022 Q530 1072 760 1022 Q990 1072 1220 1022 Q1400 1062 1600 1022" stroke="${INK}" stroke-width="2.5" fill="none" opacity=".8"/>`;
  return layer(c, .92, s);
}
function ground(c, o) {
  const roadPath = `M-900 1300 L2000 1300 L2000 1420 L-900 1420Z`;
  const vRoad = `M470 1300 L610 1300 L1060 2600 L20 2600Z`;
  const sign = `<g transform="translate(330 1500)">${shadow(0, 0, 60, 10)}<rect x="-9" y="-260" width="18" height="260" fill="#8a5a33" stroke="${INK}" stroke-width="5"/>
    <path d="M-10 -250 L150 -250 L180 -222 L150 -194 L-10 -194Z" fill="#f2e3c0" stroke="${INK}" stroke-width="5"/><text x="70" y="-212" font-family="Special Elite" font-size="28" text-anchor="middle" fill="${INK}">ROSCOE</text>
    <path d="M10 -180 L-150 -180 L-180 -152 L-150 -124 L10 -124Z" fill="#f2e3c0" stroke="${INK}" stroke-width="5"/><text x="-80" y="-142" font-family="Special Elite" font-size="26" text-anchor="middle" fill="${INK}">ROCKLAND</text></g>`;
  return layer(c, 1, `<rect x="-900" y="1240" width="2900" height="1500" fill="#6dbb47"/>
    <image href="${TEX.grass}" x="-900" y="1240" width="2900" height="1500" preserveAspectRatio="none" opacity=".8"/>
    <path d="${roadPath}" fill="#d9a466"/><path d="${vRoad}" fill="#d9a466"/>
    <image href="${TEX.dirt}" x="-900" y="1300" width="2900" height="120" preserveAspectRatio="none" opacity=".6"/>
    <path d="M520 1330 Q530 1600 470 2600 M560 1330 Q580 1600 640 2600" stroke="#b8834d" stroke-width="10" fill="none" opacity=".5"/>
    <path d="M-900 1330 L2000 1330 M-900 1395 L2000 1395" stroke="#b8834d" stroke-width="8" opacity=".45"/>
    ${fence(-900, 380, 1300, .55)}${fence(720, 2000, 1300, .55)}
    ${o.sign === false ? '' : sign}`);
}
function country(c, t, o = {}) {
  let s = countrySky(c, t) + farHills(c) + quilt(c, t) + poles(c);
  const back = [], front = [];
  if (o.store) back.push(store({ x: 830, y: 1296, s: .56 * (o.storeScale === undefined ? 1 : o.storeScale), sign: o.sign }));
  back.push(tree(-80, 1290, .8), tree(1180, 1300, .9));
  s += layer(c, .96, back.join(''));
  s += ground(c, o);
  if (o.mid) s += layer(c, 1, o.mid);
  s += layer(c, 1.25, `<path d="M-200 2000 Q-100 1820 0 2000 Q60 1780 130 2000 Q200 1840 260 2000Z" fill="#3f8f33"/><path d="M900 2000 Q980 1800 1050 2000 Q1120 1820 1180 2000 Q1240 1860 1300 2000Z" fill="#3f8f33"/>`, 8);
  return s;
}

// ---------- New York skyline ----------
function city(c, t) {
  const far = Array.from({ length: 16 }, (_, i) => { const x = -700 + i * 160, h = 380 + hash(i + 40) * 520; return `<rect x="${x}" y="${1150 - h}" width="150" height="${h + 400}" fill="#9fb0cf"/>`; }).join('');
  const win = (x, y, w, h, lit) => { let s = ''; for (let yy = y + 30; yy < y + h - 20; yy += 46) for (let xx = x + 18; xx < x + w - 24; xx += 34) s += `<rect x="${xx}" y="${yy}" width="16" height="24" fill="${hash(xx * 3.1 + yy) > lit ? '#ffe39a' : '#4c5c7c'}"/>`; return s; };
  const mid = [[-420, 760, 230, '#7b8cb0'], [-170, 560, 220, '#6c7ea3'], [70, 880, 190, '#8091b6'], [300, 640, 230, '#6a7aa0'], [780, 720, 230, '#7586ac'], [1010, 560, 220, '#6f81a8'], [1240, 820, 220, '#7b8cb0']]
    .map(([x, y, w, col]) => `<rect x="${x}" y="${y}" width="${w}" height="${1500 - y}" fill="${col}" stroke="#3c4a66" stroke-width="5"/>${win(x, y, w, 1300 - y, .55)}`).join('');
  const deco = `<g transform="translate(640 0)"><rect x="-90" y="420" width="180" height="1100" fill="#c9cfdb" stroke="#3c4a66" stroke-width="6"/>${win(-90, 420, 180, 900, .5)}
    ${[0, 1, 2, 3].map(i => `<path d="M${-80 + i * 14} ${420 - i * 60} Q0 ${360 - i * 70} ${80 - i * 14} ${420 - i * 60}" fill="#dfe3ea" stroke="#3c4a66" stroke-width="5"/>`).join('')}
    <path d="M-20 180 L0 0 L20 180Z" fill="#dfe3ea" stroke="#3c4a66" stroke-width="5"/></g>`;
  const near = [[-500, 1120, 330, '#a0573f'], [-160, 1180, 300, '#8e4c38'], [150, 1100, 280, '#b2694a'], [440, 1200, 300, '#9a5440'], [750, 1130, 320, '#a65d43'], [1080, 1170, 330, '#8f4d39']]
    .map(([x, y, w, col]) => `<rect x="${x}" y="${y}" width="${w}" height="700" fill="${col}" stroke="${INK}" stroke-width="6"/><rect x="${x - 10}" y="${y - 24}" width="${w + 20}" height="28" fill="#6b3324" stroke="${INK}" stroke-width="5"/>${win(x, y, w, 420, .62)}`).join('');
  const carX = -500 + ((t * 420) % 2400);
  const street = `<rect x="-900" y="1700" width="2900" height="700" fill="#5a5f66"/><rect x="-900" y="1690" width="2900" height="40" fill="#9a9a96" stroke="${INK}" stroke-width="5"/>
    <path d="M-900 1880 L2000 1880" stroke="#e8d27a" stroke-width="10" stroke-dasharray="70 50"/>
    ${[-200, 300, 800, 1300].map(x => `<g transform="translate(${x} 1700)"><rect x="-8" y="-330" width="16" height="330" fill="#2c3440" stroke="${INK}" stroke-width="4"/><circle cy="-350" r="26" fill="#fff3c0" stroke="${INK}" stroke-width="5"/></g>`).join('')}
    ${car({ x: carX, y: 1860, s: .75, color: '#2f4f8f', wheel: t * 500, heads: '' })}`;
  return layer(c, .15, `<rect x="-900" y="-1000" width="2900" height="2700" fill="url(#gDawn)"/><circle cx="300" cy="700" r="220" fill="#fff0c0" opacity=".7" filter="url(#glow)"/>`) +
    layer(c, .3, cloud(100 + t * 10, 400, 1, .8) + cloud(900 + t * 8, 300, .8, .7)) +
    layer(c, .4, far + `<rect x="-900" y="300" width="2900" height="1300" fill="#f7d9b0" opacity=".35"/>`, 4) +
    layer(c, .6, mid + deco, 2) + layer(c, .85, near) + layer(c, 1, street);
}

// ---------- top-down map on the desk ----------
// world: map sheet scaled 2x at (-460,-300) => Agloe at world (820, 740)
const MAPW = { x: -460, y: -300, s: 2 };
const AGW = { x: MAPW.x + AX * MAPW.s, y: MAPW.y + AY * MAPW.s };
function mapTop(c, t, o = {}) {
  let s = layer(c, 1, `<rect x="-2000" y="-2000" width="5000" height="6000" fill="#7a4524"/>
    <image href="${TEX.wood}" x="-2000" y="-2000" width="5000" height="6000" preserveAspectRatio="none" opacity=".8"/>
    <rect x="${MAPW.x + 18}" y="${MAPW.y + 24}" width="2000" height="2600" fill="#000" opacity=".35" filter="url(#b14)"/>
    <g transform="translate(${MAPW.x} ${MAPW.y}) scale(${MAPW.s})">${mapSheet({ ...o, id: o.id || 'top' })}</g>
    ${o.extra || ''}`, o.blur || 0);
  return s;
}
// a cartoon hand + pen entering from bottom right, pen tip at world (x,y)
function penHand(c, x, y, sc = 1) {
  const hx = x + 30 * sc, hy = y + 60 * sc;
  return layer(c, 1, `<path d="M${f(hx)} ${f(hy)} Q${f(hx + 260 * sc)} ${f(hy + 160 * sc)} ${f(hx + 520 * sc)} ${f(hy + 900 * sc)}" stroke="${INK}" stroke-width="${f(26 * sc)}" fill="none" stroke-linecap="round"/>
    <g transform="translate(${f(x)} ${f(y)}) scale(${f(sc * 1.4)})">${pen(1, 28)}</g>
    <circle cx="${f(hx)}" cy="${f(hy)}" r="${f(30 * sc)}" fill="${INK}"/>`);
}

// ---------- money dream ----------
function moneyDream(c, t, o) {
  const rays = Array.from({ length: 18 }, (_, i) => `<path d="M0 0 L${f(Math.cos((i * 20) * Math.PI / 180) * 2200)} ${f(Math.sin((i * 20) * Math.PI / 180) * 2200)} L${f(Math.cos((i * 20 + 10) * Math.PI / 180) * 2200)} ${f(Math.sin((i * 20 + 10) * Math.PI / 180) * 2200)}Z" fill="#ffe08a" opacity=".55"/>`).join('');
  const rain = Array.from({ length: 34 }, (_, i) => {
    const x = hash(i) * 1300 - 110, sp = 380 + hash(i + 7) * 300, y = ((hash(i + 3) * 2400 + t * sp) % 2400) - 300;
    return banknote(x + Math.sin(t * 2 + i) * 40, y, Math.sin(t * 3 + i) * 50 + i * 30, .9 + hash(i + 1) * .5);
  }).join('');
  const pile = Array.from({ length: 70 }, (_, i) => banknote(-100 + (i % 14) * 95 + hash(i) * 40, 1580 + Math.floor(i / 14) * 70 + hash(i + 2) * 30 - Math.sin(((i % 14) / 13) * Math.PI) * 120, hash(i + 5) * 80 - 40, 1.1)).join('');
  return layer(c, .3, `<rect x="-900" y="-900" width="2900" height="3700" fill="#ffc94a"/><g transform="translate(540 900) rotate(${f(t * 12)})">${rays}</g>`) +
    layer(c, .7, rain, 2) +
    layer(c, 1, `${o.char}<path d="M-300 1640 Q540 1420 1400 1640 L1400 2400 L-300 2400Z" fill="#6fae63" stroke="#1f4d22" stroke-width="6"/>${pile}`) +
    layer(c, 1.2, Array.from({ length: 10 }, (_, i) => banknote(hash(i + 50) * 1100, ((hash(i + 60) * 2400 + t * 700) % 2400) - 300, t * 90 + i * 40, 1.6)).join(''), 4);
}
