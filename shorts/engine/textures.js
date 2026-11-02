// Hand-painted-looking canvas textures. Text uses canvas fillText so the page fonts are used.
import { THREE, ctex, speckle, brushStrokes, rnd, svgImage, INK } from './engine.js';

const C = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
export const tex = (c, o = {}) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (o.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...o.repeat); } return t; };

export function wood(base = '#a8693a', o = {}) {
  return ctex(512, 512, (x, w, h) => {
    const r = rnd(o.seed || 11), ph = o.plank || 64;
    for (let y = 0; y < h; y += ph) {
      const v = (r() - .5) * 26; x.fillStyle = shade(base, v); x.fillRect(0, y, w, ph);
      brushStrokes(x, w, ph, 40, ['#5a2e12', '#e0a870', '#7a4520'], Math.floor(r() * 999), [60, 200], [1, 3], 0, .05);
      x.save(); x.translate(0, y); x.restore();
      x.fillStyle = 'rgba(40,18,5,.6)'; x.fillRect(0, y, w, 3);
      const off = r() * w; x.fillRect(off, y, 3, ph); x.fillRect((off + w / 2) % w, y, 3, ph);
    }
    // grain drawn over whole thing
    for (let i = 0; i < 160; i++) { x.strokeStyle = `rgba(70,35,10,${.05 + r() * .1})`; x.lineWidth = 1 + r() * 2; const yy = r() * h; x.beginPath(); x.moveTo(0, yy); x.bezierCurveTo(w * .3, yy + (r() - .5) * 8, w * .6, yy + (r() - .5) * 8, w, yy + (r() - .5) * 4); x.stroke(); }
  }, { repeat: o.repeat || [1, 1] });
}
export function shade(hex, v) { const c = new THREE.Color(hex); c.offsetHSL(0, 0, v / 255); return '#' + c.getHexString(); }

export function wallpaper(base, stripe, o = {}) {
  return ctex(512, 512, (x, w, h) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let i = 0; i < w; i += 128) { x.fillStyle = stripe; x.fillRect(i, 0, 46, h); }
    x.fillStyle = o.motif || shade(stripe, 18);
    for (let j = 32; j < h; j += 128) for (let i = 87; i < w + 64; i += 128) {
      x.beginPath(); x.moveTo(i, j - 18); x.quadraticCurveTo(i + 14, j, i, j + 18); x.quadraticCurveTo(i - 14, j, i, j - 18); x.fill();
      x.beginPath(); x.arc(i, j + 64, 5, 0, 7); x.fill();
    }
    speckle(x, w, h, 5000, ['#000', '#fff'], 4, [1, 3]);
    brushStrokes(x, w, h, 300, ['#000', '#fff'], 5, [20, 80], [4, 10], Math.PI / 2, .2);
  }, { repeat: o.repeat || [4, 2] });
}
export function panels(base) {
  return ctex(512, 256, (x, w, h) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 2; i++) { x.strokeStyle = 'rgba(30,12,4,.7)'; x.lineWidth = 8; x.strokeRect(i * 256 + 24, 28, 208, 200); x.strokeStyle = 'rgba(255,220,170,.25)'; x.lineWidth = 3; x.strokeRect(i * 256 + 34, 38, 188, 180); }
    brushStrokes(x, w, h, 200, ['#3a1a08', '#e0a870'], 6, [40, 160], [1, 3], 0, .05);
  }, { repeat: [6, 1] });
}
export function grass(o = {}) {
  return ctex(512, 512, (x, w, h) => {
    x.fillStyle = o.base || '#6cbb45'; x.fillRect(0, 0, w, h);
    const r = rnd(o.seed || 5);
    for (let i = 0; i < 40; i++) { const g = x.createRadialGradient(r() * w, r() * h, 0, r() * w, r() * h, 60 + r() * 120); g.addColorStop(0, r() > .5 ? 'rgba(150,215,90,.35)' : 'rgba(50,130,40,.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }
    for (let i = 0; i < 7000; i++) { const px = r() * w, py = r() * h, l = 5 + r() * 12; x.strokeStyle = r() > .55 ? 'rgba(40,115,30,.5)' : 'rgba(180,235,120,.45)'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - .5) * 5, py - l); x.stroke(); }
    if (o.flowers) for (let i = 0; i < 90; i++) { x.fillStyle = ['#fff6a8', '#ffffff', '#c9a7ff', '#ff9ec2'][i % 4]; x.beginPath(); x.arc(r() * w, r() * h, 2.5 + r() * 2, 0, 7); x.fill(); }
  }, { repeat: o.repeat || [20, 20] });
}
export function dirt(o = {}) {
  return ctex(512, 512, (x, w, h) => {
    x.fillStyle = o.base || '#d8a466'; x.fillRect(0, 0, w, h);
    speckle(x, w, h, 14000, ['#9a6232', '#f5d4a0', '#b97c44'], 9, [1, 5]);
    if (o.tracks) { x.strokeStyle = 'rgba(140,90,45,.35)'; x.lineWidth = 26; [150, 362].forEach(px => { x.beginPath(); x.moveTo(px, 0); x.lineTo(px, h); x.stroke(); }); }
    for (let i = 0; i < 30; i++) { const r = rnd(i + 3); x.fillStyle = 'rgba(120,80,40,.5)'; x.beginPath(); x.ellipse(r() * w, r() * h, 3 + r() * 6, 2 + r() * 4, r() * 3, 0, 7); x.fill(); }
  }, { repeat: o.repeat || [1, 8] });
}
export function quilt(o = {}) {
  return ctex(1024, 1024, (x, w, h) => {
    const r = rnd(o.seed || 21), cols = ['#7cc35a', '#9bd16a', '#c9d977', '#5fae49', '#b7d866', '#e5cf79', '#8fca5e'];
    const n = 7;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x0 = i * w / n + (r() - .5) * 20, y0 = j * h / n + (r() - .5) * 20, c = cols[Math.floor(r() * cols.length)];
      x.fillStyle = c; x.fillRect(x0, y0, w / n + 20, h / n + 20);
      x.strokeStyle = shade(c, -25); x.lineWidth = 3; x.globalAlpha = .5;
      const dir = r() > .5; for (let k = 6; k < w / n; k += 12) { x.beginPath(); if (dir) { x.moveTo(x0 + k, y0); x.lineTo(x0 + k, y0 + h / n); } else { x.moveTo(x0, y0 + k); x.lineTo(x0 + w / n, y0 + k); } x.stroke(); }
      x.globalAlpha = 1;
    }
    x.strokeStyle = '#4e8a36'; x.lineWidth = 8; for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * w / n, 0); x.lineTo(i * w / n, h); x.stroke(); x.beginPath(); x.moveTo(0, i * h / n); x.lineTo(w, i * h / n); x.stroke(); }
    for (let i = 0; i < 60; i++) { x.fillStyle = '#3f8f33'; x.beginPath(); x.arc(r() * w, r() * h, 6 + r() * 10, 0, 7); x.fill(); }
  }, { repeat: o.repeat || [3, 3] });
}
export function brick(base, o = {}) {
  const [c, x] = C(512, 1024), w = 512, h = 1024, r = rnd(o.seed || 1);
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) for (let i = -1; i < w / 40 + 1; i++) { x.fillStyle = shade(base, (r() - .5) * 30); x.fillRect(i * 40 + (y / 16 % 2) * 20, y, 38, 14); }
  const cols = o.cols || 4, rows = o.rows || 8, ww = w / cols, wh = h / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const px = i * ww + ww * .2, py = j * wh + wh * .22, lit = r() < (o.lit ?? .3);
    x.fillStyle = '#e9dcc4'; x.fillRect(px - 8, py - 8, ww * .6 + 16, wh * .6 + 16);
    x.fillStyle = lit ? '#ffd98a' : '#5d6e8e'; x.fillRect(px, py, ww * .6, wh * .6);
    x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(px, py, ww * .6, wh * .12);
    x.strokeStyle = '#3a2a20'; x.lineWidth = 5; x.strokeRect(px, py, ww * .6, wh * .6); x.beginPath(); x.moveTo(px + ww * .3, py); x.lineTo(px + ww * .3, py + wh * .6); x.stroke();
    x.fillStyle = '#d8cbb0'; x.fillRect(px - 12, py + wh * .6 + 4, ww * .6 + 24, 10);
  }
  return tex(c);
}
export function clapboard(base) {
  return ctex(512, 512, (x, w, h) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) { x.fillStyle = 'rgba(60,28,10,.55)'; x.fillRect(0, y + 28, w, 4); x.fillStyle = 'rgba(255,230,190,.2)'; x.fillRect(0, y, w, 5); }
    brushStrokes(x, w, h, 260, ['#5a2e12', '#f2c890'], 7, [40, 180], [1, 3], 0, .03);
    speckle(x, w, h, 3000, ['#3a1a08', '#fff'], 8);
  }, { repeat: [3, 3] });
}
export function storeSign(p = 1) {
  const [c, x] = C(1024, 300);
  x.fillStyle = '#f4ead2'; x.fillRect(0, 0, 1024, 300);
  brushStrokes(x, 1024, 300, 160, ['#c9b48a', '#fff'], 3, [40, 200], [3, 8], 0, .05);
  x.strokeStyle = '#7a4a2a'; x.lineWidth = 18; x.strokeRect(9, 9, 1006, 282);
  x.save(); x.beginPath(); x.rect(0, 0, 1024 * p, 300); x.clip();
  x.textAlign = 'center'; x.fillStyle = '#b8322a'; x.font = '150px Rye'; x.fillText('AGLOE', 512, 175);
  x.fillStyle = '#2d2016'; x.font = '56px Rye'; x.fillText('GENERAL  STORE', 512, 252);
  x.restore();
  return tex(c);
}
export function textBoard(text, o = {}) {
  const [c, x] = C(o.w || 512, o.h || 128);
  x.fillStyle = o.bg || '#f2e3c0'; x.fillRect(0, 0, c.width, c.height);
  brushStrokes(x, c.width, c.height, 60, ['#c9b48a', '#fff'], 3, [30, 120], [2, 6], 0, .05);
  x.fillStyle = o.color || INK; x.font = o.font || '64px "Special Elite"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, c.width / 2, c.height / 2 + 4);
  if (o.border) { x.strokeStyle = o.border; x.lineWidth = 10; x.strokeRect(5, 5, c.width - 10, c.height - 10); }
  return tex(c);
}
export function banknote() {
  const [c, x] = C(256, 120);
  x.fillStyle = '#9fd18f'; x.fillRect(0, 0, 256, 120); x.strokeStyle = '#2f6f33'; x.lineWidth = 6; x.strokeRect(6, 6, 244, 108); x.lineWidth = 2; x.strokeRect(16, 16, 224, 88);
  x.fillStyle = '#d6efcc'; x.beginPath(); x.ellipse(128, 60, 34, 34, 0, 0, 7); x.fill(); x.stroke();
  x.fillStyle = '#2f6f33'; x.font = '44px "Alfa Slab One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('$', 128, 62); x.font = '22px "Alfa Slab One"'; x.fillText('100', 40, 30); x.fillText('100', 216, 92);
  return tex(c);
}
export function cowSpots(seed = 3) {
  return ctex(512, 256, (x, w, h) => {
    x.fillStyle = '#fbf8f2'; x.fillRect(0, 0, w, h); const r = rnd(seed); x.fillStyle = '#2b2220';
    for (let i = 0; i < 6; i++) { const cx = r() * w, cy = r() * h, rr = 30 + r() * 45; x.beginPath(); for (let a = 0; a < 6.3; a += .5) { const q = rr * (.7 + r() * .5); x.lineTo(cx + Math.cos(a) * q * 1.3, cy + Math.sin(a) * q); } x.closePath(); x.fill(); }
  });
}
export function skyline() {
  return ctex(1024, 1024, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#8ec5f5'); g.addColorStop(1, '#fbe3c0'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const r = rnd(4);
    for (let L = 0; L < 2; L++) for (let i = 0; i < 12; i++) { const bw = 70 + r() * 90, bh = 300 + r() * 500 - L * 150, bx = i * 90 - 20 + r() * 30; x.fillStyle = L ? '#7d8fb3' : '#a9b8d4'; x.fillRect(bx, h - bh, bw, bh); x.fillStyle = L ? '#ffe39a' : '#c7d2e6'; for (let yy = h - bh + 20; yy < h; yy += 36) for (let xx = bx + 10; xx < bx + bw - 14; xx += 24) if (r() > .6) x.fillRect(xx, yy, 10, 16); }
    x.fillStyle = '#6f82a8'; x.fillRect(470, 240, 80, 800); x.beginPath(); x.moveTo(490, 240); x.lineTo(510, 80); x.lineTo(530, 240); x.fill();
  });
}
export function portrait() {
  return ctex(256, 320, (x, w, h) => {
    const g = x.createRadialGradient(128, 140, 10, 128, 160, 200); g.addColorStop(0, '#5a3a5a'); g.addColorStop(1, '#2a1a2a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#7b4fb0'; x.beginPath(); x.ellipse(128, 330, 110, 110, 0, 0, 7); x.fill();
    x.fillStyle = '#f4efe8'; x.beginPath(); x.arc(128, 150, 70, 0, 7); x.fill(); x.strokeStyle = INK; x.lineWidth = 5; x.stroke();
    x.fillStyle = '#2a2230'; x.fillRect(70, 60, 116, 40); x.beginPath(); x.ellipse(128, 100, 85, 14, 0, 0, 7); x.fill();
    x.fillStyle = '#3a2a20'; x.beginPath(); x.ellipse(106, 178, 26, 9, -.2, 0, 7); x.ellipse(150, 178, 26, 9, .2, 0, 7); x.fill();
    x.fillStyle = INK; x.fillRect(96, 140, 18, 6); x.fillRect(142, 140, 18, 6);
  });
}
export function sunburst(c1 = '#ffd45a', c2 = '#ffbf2a') {
  return ctex(1024, 1024, (x, w, h) => {
    x.fillStyle = c2; x.fillRect(0, 0, w, h); x.fillStyle = c1;
    for (let i = 0; i < 24; i += 2) { const a0 = i / 24 * Math.PI * 2, a1 = (i + 1) / 24 * Math.PI * 2; x.beginPath(); x.moveTo(512, 512); x.lineTo(512 + Math.cos(a0) * 900, 512 + Math.sin(a0) * 900); x.lineTo(512 + Math.cos(a1) * 900, 512 + Math.sin(a1) * 900); x.fill(); }
    const g = x.createRadialGradient(512, 512, 0, 512, 512, 520); g.addColorStop(0, 'rgba(255,255,230,.9)'); g.addColorStop(.4, 'rgba(255,255,230,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  });
}
export function poster(lines, o = {}) {
  const [c, x] = C(400, 560);
  x.fillStyle = o.bg || '#f1e2bf'; x.fillRect(0, 0, 400, 560); brushStrokes(x, 400, 560, 80, ['#b89a66', '#fff'], 9, [30, 140], [3, 8], 0, .2);
  x.strokeStyle = o.fg || '#b8322a'; x.lineWidth = 12; x.strokeRect(14, 14, 372, 532);
  x.textAlign = 'center'; lines.forEach(([t, f, y, col]) => { x.font = f; x.fillStyle = col || o.fg || '#b8322a'; x.fillText(t, 200, y); });
  return tex(c);
}

// ---------- the road map ----------
// sheet coords 0..1000 x 0..1300, drawn at 2x. Agloe at (640, 520)
export const AX = 640, AY = 520;
let paperURL = null;
function paperDataURL() {
  if (paperURL) return paperURL;
  const [c, x] = C(1024, 1024); x.fillStyle = '#efe2c4'; x.fillRect(0, 0, 1024, 1024);
  speckle(x, 1024, 1024, 26000, ['#785a32', '#fffaeb'], 7, [1, 3]);
  const r = rnd(7); for (let i = 0; i < 40; i++) { const px = r() * 1024, py = r() * 1024, rad = 30 + r() * 140, g = x.createRadialGradient(px, py, 0, px, py, rad); g.addColorStop(0, 'rgba(160,110,50,.08)'); g.addColorStop(1, 'rgba(160,110,50,0)'); x.fillStyle = g; x.fillRect(px - rad, py - rad, rad * 2, rad * 2); }
  x.strokeStyle = 'rgba(120,90,40,.12)'; x.lineWidth = 2; [1024 / 3, 2048 / 3].forEach(px => { x.beginPath(); x.moveTo(px, 0); x.lineTo(px, 1024); x.stroke(); }); x.beginPath(); x.moveTo(0, 512); x.lineTo(1024, 512); x.stroke();
  return (paperURL = c.toDataURL());
}
export async function mapTexture(o = {}) {
  const road = (d, w = 9, c = '#d9822b') => `<path d="${d}" stroke="#7a4a20" stroke-width="${w + 4}" fill="none" stroke-linecap="round" opacity=".55"/><path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  const dirtR = d => `<path d="${d}" stroke="#8a6a44" stroke-width="5" fill="none" stroke-dasharray="14 9" stroke-linecap="round"/>`;
  const towns = [[330, 965], [470, 1036], [760, 1110], [300, 270], [140, 600], [930, 448]];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="2600" viewBox="0 0 1000 1300">
    <image href="${paperDataURL()}" x="0" y="0" width="1000" height="1300" preserveAspectRatio="none"/>
    ${o.tint ? `<rect width="1000" height="1300" fill="${o.tint}" style="mix-blend-mode:multiply"/>` : ''}
    <path d="M90 140 Q220 80 330 160 Q380 260 250 330 Q120 340 90 250Z M700 620 Q860 560 930 680 Q950 800 820 820 Q690 790 700 620Z M120 700 Q240 650 300 760 Q280 860 160 850 Q90 800 120 700Z M520 160 Q640 120 700 200 Q690 300 590 300 Q500 260 520 160Z" fill="#a9c98a" opacity=".55"/>
    <path d="M40 760 C180 720 220 860 360 880 S600 860 700 980 S880 1080 960 1060" stroke="#5f97c9" stroke-width="14" fill="none" stroke-linecap="round"/>
    <path d="M40 760 C180 720 220 860 360 880 S600 860 700 980 S880 1080 960 1060" stroke="#a9d0ef" stroke-width="5" fill="none" stroke-linecap="round"/>
    <ellipse cx="820" cy="330" rx="70" ry="38" fill="#7fb3dd" stroke="#5f97c9" stroke-width="4"/>
    ${road('M40 990 C260 950 480 1020 960 900', 15, '#c9452f')}<path d="M40 990 C260 950 480 1020 960 900" stroke="#f2c14e" stroke-width="4" fill="none" stroke-dasharray="18 12"/>
    ${road('M330 965 C350 820 470 640 640 520')}${road('M640 520 C760 500 860 470 960 440')}${road('M300 270 C380 330 520 380 640 520', 7)}
    ${dirtR('M640 520 C650 420 700 260 740 60')}${dirtR('M640 520 C560 560 300 560 40 600')}${dirtR('M330 965 C250 1080 180 1150 120 1260')}${road('M640 520 C700 640 720 860 760 1110', 7)}
    ${towns.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#2d2016"/><circle cx="${x}" cy="${y}" r="4" fill="#efe2c4"/>`).join('')}
    <g transform="translate(860 190)"><circle r="56" fill="none" stroke="#6b4a2a" stroke-width="3"/><path d="M0 -70 L12 0 L0 70 L-12 0Z M-70 0 L0 -12 L70 0 L0 12Z" fill="#6b4a2a"/></g>
    <rect x="70" y="1150" width="470" height="96" fill="#efe2c4" stroke="#6b4a2a" stroke-width="3"/>
    ${[[150, 975], [500, 690], [820, 560]].map(([x, y]) => `<path d="M${x - 22} ${y - 24} L${x + 22} ${y - 24} L${x + 22} ${y + 6} Q${x} ${y + 28} ${x - 22} ${y + 6}Z" fill="#fff" stroke="#2d2016" stroke-width="3"/>`).join('')}
    <rect x="30" y="30" width="940" height="1240" fill="none" stroke="#6b4a2a" stroke-width="4"/><rect x="44" y="44" width="912" height="1212" fill="none" stroke="#6b4a2a" stroke-width="1.5"/>
  </svg>`;
  const img = await svgImage(svg, 2000, 2600);
  const [c, x] = C(2000, 2600); x.drawImage(img, 0, 0);
  x.scale(2, 2); x.fillStyle = '#2d2016'; x.font = '26px "Special Elite"';
  [['ROSCOE', 348, 1005], ['ROCKLAND', 486, 1072], ['LIVINGSTON MANOR', 530, 1154], ['DOWNSVILLE', 240, 250], ['BEAVERKILL', 100, 578], ['WALTON', 850, 426]].forEach(([t, px, py]) => x.fillText(t, px, py));
  x.font = '20px "Alfa Slab One"'; x.textAlign = 'center'; [['17', 150, 977], ['206', 500, 692], ['30', 820, 562]].forEach(([t, px, py]) => x.fillText(t, px, py));
  x.fillStyle = '#6b4a2a'; x.font = '26px "Special Elite"'; x.fillText('N', 860, 112);
  x.fillStyle = '#2d2016'; x.font = '34px "Special Elite"'; x.fillText('NEW YORK · ROAD MAP', 305, 1196);
  x.fillStyle = '#6b4a2a'; x.font = '22px "Special Elite"'; x.fillText(`1931 · ${o.publisher || 'COUNTY SERIES'}`, 305, 1232);
  if (o.agloe) { x.fillStyle = '#2d2016'; x.beginPath(); x.arc(AX, AY, 11, 0, 7); x.fill(); x.fillStyle = '#d6262b'; x.beginPath(); x.arc(AX, AY, 5, 0, 7); x.fill(); x.fillStyle = '#2d2016'; x.textAlign = 'left'; x.font = '34px "Special Elite"'; x.fillText('AGLOE', AX + 20, AY - 18); }
  return tex(c);
}
// decals that animate on top of the map: dot, label (revealed left to right), red circle (drawn on)
export function dotTex() { const [c, x] = C(128, 128); x.fillStyle = 'rgba(214,38,43,.28)'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.fillStyle = '#2d2016'; x.beginPath(); x.arc(64, 64, 30, 0, 7); x.fill(); x.fillStyle = '#d6262b'; x.beginPath(); x.arc(64, 64, 14, 0, 7); x.fill(); return tex(c); }
export function labelTex() { const [c, x] = C(512, 128); x.fillStyle = '#2d2016'; x.font = '100px "Special Elite"'; x.textBaseline = 'middle'; x.fillText('AGLOE', 10, 70); return tex(c); }
const circCache = [];
export function circleTex(p) {
  const i = Math.round(p * 24); if (circCache[i]) return circCache[i];
  const [c, x] = C(512, 256); x.strokeStyle = '#d6262b'; x.lineWidth = 16; x.lineCap = 'round';
  x.beginPath(); x.ellipse(256, 128, 230, 105, -.08, -2.4, -2.4 + (i / 24) * Math.PI * 2.1); x.stroke();
  return (circCache[i] = tex(c));
}
