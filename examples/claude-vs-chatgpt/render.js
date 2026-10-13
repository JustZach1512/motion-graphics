// Renderiza la animación a MP4 (1920x1080, 30 fps) con la música sintetizada.
// Uso: node render.js  →  claude-vs-chatgpt.mp4
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { renderMusic, DUR } = require('./music.js');
const FPS = 30, out = path.join(__dirname, 'frames');
(async () => {
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out);
  const sr = 44100, d = renderMusic(sr), buf = Buffer.alloc(44 + d.length * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + d.length * 2, 4); buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sr, 24);
  buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(d.length * 2, 40);
  d.forEach((v, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  fs.writeFileSync(path.join(out, 'music.wav'), buf);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(__dirname, 'index.html') + '?render');
  for (let f = 0; f < DUR * FPS; f++) {
    const data = await page.evaluate(t => { renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', 0.92); }, f / FPS);
    fs.writeFileSync(path.join(out, `f${String(f).padStart(4, '0')}.jpg`), Buffer.from(data.split(',')[1], 'base64'));
  }
  await browser.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(out, 'f%04d.jpg'), '-i', path.join(out, 'music.wav'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-c:a', 'aac', '-b:a', '192k', '-shortest', path.join(__dirname, 'claude-vs-chatgpt.mp4')]);
  fs.rmSync(out, { recursive: true, force: true });
  console.log('OK → claude-vs-chatgpt.mp4');
})();
