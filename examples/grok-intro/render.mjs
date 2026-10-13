// render.mjs: turn grok-intro.html (window.VIDEO, window.seek(t), window.buildAudio(ctx)) into an MP4.
//   node render.mjs grok-intro.html grok-intro.mp4 [--fps 60] [--sub 6] [--workers 3] [--scale 1] [--crf 14]
//   node render.mjs grok-intro.html sheet.png --stills 0.5,2.3,6 [--scale 0.5] [--sub 1]
//   node render.mjs grok-intro.html soundtrack.wav --audio-only
// Each worker gets its own browser (its own software-GL process), renders a contiguous run of frames and
// pipes PNGs into ffmpeg; the runs are joined, then the soundtrack is rendered offline, loudness-normalised
// (two-pass, -16 LUFS, -1.5 dBTP) and muxed in.
import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { writeFileSync, rmSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); }
const { chromium } = pw;

const argv = process.argv.slice(2), pos = argv.filter((a, i) => !a.startsWith('--') && !(argv[i - 1] || '').startsWith('--'));
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const [html, out] = pos;
if (!html || !out) { console.log('usage: node render.mjs page.html out.mp4|sheet.png [--stills t1,t2] [--fps 60] [--sub 6] [--workers 3] [--scale 1] [--crf 14]'); process.exit(1); }
const stills = opt('stills'), scale = +opt('scale', stills ? 0.5 : 1), sub = opt('sub', stills ? '2' : '6');
const fps = +opt('fps', 60), workers = +opt('workers', 3), crf = opt('crf', '14');
const url = pathToFileURL(path.resolve(html)).href + `?render&scale=${scale}&sub=${sub}`;
const run = (args, quiet = false) => new Promise((res, rej) => { let err = ''; const p = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] }); p.stderr.on('data', d => { err += d; if (!quiet) process.stderr.write(d); }); p.on('close', c => c ? rej(new Error('ffmpeg ' + c + '\n' + err)) : res(err)); });

async function open() {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });
  const probe = await browser.newPage();
  await probe.goto(url);
  await probe.waitForFunction(() => window.VIDEO && typeof window.seek === 'function', null, { timeout: 120000 });
  const V = await probe.evaluate(() => window.VIDEO); await probe.close();
  const page = await browser.newPage({ viewport: { width: V.w, height: V.h }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
  page.on('pageerror', e => console.log('[page error]', e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.VIDEO && typeof window.seek === 'function', null, { timeout: 120000 });
  return { browser, page, V };
}
const shot = async (page, t) => { await page.evaluate(t => window.seek(t), t); return page.screenshot({ type: 'png' }); };

if (stills) {
  const { browser, page, V } = await open();
  const times = stills.split(',').map(Number), dir = out + '.frames';
  mkdirSync(dir, { recursive: true });
  for (let i = 0; i < times.length; i++) {
    const t0 = Date.now();
    writeFileSync(`${dir}/${String(i).padStart(3, '0')}.png`, await shot(page, times[i]));
    console.log(`t=${times[i]}  ${Date.now() - t0} ms`);
  }
  await browser.close();
  const cols = Math.min(3, times.length), rows = Math.ceil(times.length / cols);
  await run(['-v', 'error', '-y', '-framerate', '1', '-i', `${dir}/%03d.png`, '-vf', `scale=${Math.min(960, V.w)}:-1,tile=${cols}x${rows}:padding=6:color=gray`, '-frames:v', '1', out]);
  if (!opt('keep')) rmSync(dir, { recursive: true });
  console.log('stills ->', out); process.exit(0);
}

const base = out.replace(/\.(mp4|wav)$/, ''), silent = base + '_silent.mp4', audioOnly = argv.includes('--audio-only');
const t0 = Date.now(); let done = 0, N = 0;
const segs = [];
if (!audioOnly) {
await Promise.all(Array.from({ length: workers }, async (_, w) => {
  const { browser, page, V } = await open();
  N = Math.round(V.duration * fps);
  const per = Math.ceil(N / workers), a = w * per, b = Math.min(N, a + per);
  if (a >= b) { await browser.close(); return; }
  const seg = `${base}_seg${w}.mp4`; segs[w] = seg;
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-tune', 'film', '-crf', crf, '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-x264-params', 'aq-mode=3', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  const closed = new Promise(r => ff.on('close', r));
  for (let f = a; f < b; f++) {
    const buf = await shot(page, f / fps);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (++done % 20 === 0) { const s = (Date.now() - t0) / 1000; process.stdout.write(`\r${done}/${N} frames  ${s.toFixed(0)}s  eta ${(s / done * (N - done)).toFixed(0)}s   `); }
  }
  ff.stdin.end(); await closed; await browser.close();
}));
const list = base + '_segs.txt';
writeFileSync(list, segs.filter(Boolean).map(s => `file '${path.resolve(s)}'`).join('\n'));
await run(['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', silent]);
segs.filter(Boolean).forEach(s => rmSync(s)); rmSync(list);
console.log(`\nvideo -> ${silent}  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}

// soundtrack
const { browser, page, V } = await open();
const b64 = await page.evaluate(async dur => {
  const sr = 48000, ctx = new OfflineAudioContext(2, Math.ceil(sr * dur), sr);
  await window.buildAudio(ctx);
  const b = await ctx.startRendering(), L = b.getChannelData(0), R = b.getChannelData(1), f = new Float32Array(L.length * 2);
  for (let i = 0; i < L.length; i++) { f[2 * i] = L[i]; f[2 * i + 1] = R[i]; }
  const u8 = new Uint8Array(f.buffer); let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
}, V.duration);
await browser.close();
const pcm = base + '.f32'; writeFileSync(pcm, Buffer.from(b64, 'base64'));
const inArgs = ['-f', 'f32le', '-ar', '48000', '-ac', '2', '-i', pcm];
const m = await run(['-hide_banner', '-y', ...inArgs, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], true);
const j = JSON.parse(m.slice(m.lastIndexOf('{'), m.lastIndexOf('}') + 1));
const ln = `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
await run(['-v', 'error', '-y', ...inArgs, '-af', ln + ',aresample=48000', '-c:a', 'pcm_s24le', base + '.wav']);
if (audioOnly) { rmSync(pcm); console.log(`audio: measured ${j.input_i} LUFS / ${j.input_tp} dBTP -> ${base}.wav`); process.exit(0); }
await run(['-v', 'error', '-y', '-i', silent, '-i', base + '.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-shortest', out]);
rmSync(pcm);
console.log(`audio: measured ${j.input_i} LUFS / ${j.input_tp} dBTP -> -16 LUFS;  with audio -> ${out}`);
