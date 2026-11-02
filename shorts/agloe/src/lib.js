// Math, easing, camera and texture helpers. Everything is a pure function of time,
// so any frame can be rendered on its own (the renderer seeks frame by frame).
const W = 1080, H = 1920;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  lin: t => t,
  io: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: t => 1 - Math.pow(1 - t, 3),
  out5: t => 1 - Math.pow(1 - t, 5),
  in: t => t * t * t,
  sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  back: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  el: t => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -9 * t) * Math.sin((t * 9 - 0.75) * (2 * Math.PI) / 3) + 1),
};
// 0..1 progress of t through [t0,t1] with easing
const seg = (t, t0, t1, e = E.io) => e(clamp((t - t0) / (t1 - t0)));
// keyframes [[time, value, easing?], ...]
function k(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1, e] = keys[i];
      return lerp(v0, v1, (e || E.io)((t - t0) / (t1 - t0 || 1)));
    }
  }
  return keys[keys.length - 1][1];
}
const f = n => Math.round(n * 100) / 100;
const tr = (x, y, s = 1, r = 0) => `translate(${f(x)} ${f(y)})${r ? ` rotate(${f(r)})` : ''}${s !== 1 ? ` scale(${f(s)})` : ''}`;
const g = (transform, inner, extra = '') => `<g transform="${transform}" ${extra}>${inner}</g>`;
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function noise1(t, seed = 0) {
  const i = Math.floor(t), fr = t - i, u = fr * fr * (3 - 2 * fr);
  return lerp(hash(i + seed * 97.3), hash(i + 1 + seed * 97.3), u) * 2 - 1;
}
// pop-in scale: 0 -> overshoot -> 1 starting at t0
const pop = (t, t0, d = .35) => (t < t0 ? 0 : E.back(clamp((t - t0) / d)));
const sq = (t, t0, d = .3) => { // squash/stretch landing
  const p = clamp((t - t0) / d); return 1 + Math.sin(p * Math.PI) * .12 * (1 - p);
};

// Camera. c = {x, y, z, r}: point of the world at the centre of frame, zoom, roll.
// depth < 1 moves less (far background), > 1 moves more (foreground).
function cam(c, depth = 1) {
  const z = 1 + (c.z - 1) * depth;
  const x = W / 2 + (c.x - W / 2) * depth, y = H / 2 + (c.y - H / 2) * depth;
  return `translate(${f(W / 2 + (c.sx || 0))} ${f(H / 2 + (c.sy || 0))}) rotate(${f(c.r || 0)}) scale(${f(z)}) translate(${f(-x)} ${f(-y)})`;
}
const layer = (c, depth, inner, blur = 0) =>
  `<g transform="${cam(c, depth)}"${blur ? ` filter="url(#b${blur})"` : ''}>${inner}</g>`;
// small handheld drift + optional shake
function handheld(c, t, amt = 1, shake = 0) {
  return {
    ...c,
    sx: (noise1(t * .7, 1) * 6 + noise1(t * 14, 5) * shake) * amt,
    sy: (noise1(t * .6, 2) * 6 + noise1(t * 14, 6) * shake) * amt,
    r: (c.r || 0) + noise1(t * .5, 3) * .25 * amt + noise1(t * 12, 7) * shake * .05,
  };
}

// ---- Procedural textures, painted once on a canvas and used as <image> ----
const TEX = {};
function makeTex(name, w, h, paint) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const cx = cv.getContext('2d'); paint(cx, w, h); TEX[name] = cv.toDataURL('image/png');
}
function rnd(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function buildTextures() {
  makeTex('paper', 1024, 1024, (c, w, h) => {
    c.fillStyle = '#efe2c4'; c.fillRect(0, 0, w, h);
    const r = rnd(7);
    for (let i = 0; i < 26000; i++) { const v = r(); c.fillStyle = `rgba(${v > .5 ? '120,90,50' : '255,250,235'},${r() * .07})`; c.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); }
    for (let i = 0; i < 40; i++) { const x = r() * w, y = r() * h, rad = 30 + r() * 140; const gr = c.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(160,110,50,.07)'); gr.addColorStop(1, 'rgba(160,110,50,0)'); c.fillStyle = gr; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
    c.strokeStyle = 'rgba(120,90,40,.10)'; c.lineWidth = 2; // fold lines
    [w / 3, 2 * w / 3].forEach(x => { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); });
    c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke();
  });
  makeTex('grain', 512, 512, (c, w, h) => {
    const d = c.createImageData(w, h), r = rnd(3);
    for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    c.putImageData(d, 0, 0);
  });
  makeTex('wood', 512, 512, (c, w, h) => {
    const r = rnd(11);
    for (let y = 0; y < h; y += 64) {
      const base = 120 + r() * 30; c.fillStyle = `rgb(${base + 40},${base - 10},${base - 60})`; c.fillRect(0, y, w, 64);
      for (let i = 0; i < 18; i++) { c.strokeStyle = `rgba(70,35,10,${.08 + r() * .12})`; c.lineWidth = 1 + r() * 2; c.beginPath(); const yy = y + r() * 64; c.moveTo(0, yy); c.bezierCurveTo(w * .3, yy + (r() - .5) * 10, w * .6, yy + (r() - .5) * 10, w, yy + (r() - .5) * 6); c.stroke(); }
      c.fillStyle = 'rgba(40,18,5,.55)'; c.fillRect(0, y, w, 3);
      const off = r() * w; c.fillRect(off, y, 3, 64);
    }
  });
  makeTex('grass', 512, 512, (c, w, h) => {
    c.fillStyle = '#6dbb47'; c.fillRect(0, 0, w, h); const r = rnd(5);
    for (let i = 0; i < 5000; i++) { const x = r() * w, y = r() * h, l = 6 + r() * 12; c.strokeStyle = r() > .5 ? 'rgba(40,110,30,.45)' : 'rgba(170,225,110,.4)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - .5) * 5, y - l); c.stroke(); }
  });
  makeTex('dirt', 512, 512, (c, w, h) => {
    c.fillStyle = '#d9a466'; c.fillRect(0, 0, w, h); const r = rnd(9);
    for (let i = 0; i < 9000; i++) { c.fillStyle = r() > .5 ? 'rgba(150,95,45,.25)' : 'rgba(250,215,160,.25)'; const s = 1 + r() * 4; c.fillRect(r() * w, r() * h, s, s); }
  });
}
