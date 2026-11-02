// node tools/render.js build/silent.mp4 [workers=4] [fromSec] [toSec]   (workers=0: just re-encode saved frames)
// Each worker is its own headless Chromium on a local static server; frames are interleaved between workers.
// Motion blur and post effects happen inside WebGL, so one screenshot = one frame. Also writes build/cues.json.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { execFileSync } = require('child_process');
const serve = require('./serve.js');
const [out, wArg, fromArg, toArg] = process.argv.slice(2);
const WORKERS = wArg === undefined ? 4 : +wArg, FPS = 30;
const FR = path.resolve('build/frames'); fs.mkdirSync(FR, { recursive: true });
(async () => {
  const srv = await serve(path.resolve('.'));
  const open = async () => {
    const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(srv.url + '/index.html'); await p.waitForFunction(() => window.ready, null, { timeout: 120000 }); await p.evaluate(() => window.init());
    return { b, p, errs };
  };
  const first = await open();
  const T = await first.p.evaluate(() => window.DURATION);
  fs.writeFileSync('build/cues.json', JSON.stringify(await first.p.evaluate(() => window.cues()), null, 1));
  await first.b.close();
  const f0 = Math.round((+fromArg || 0) * FPS), f1 = Math.round((toArg ? +toArg : T) * FPS);
  const t0 = Date.now(); let done = 0;
  const work = async w => {
    const { b, p, errs } = await open();
    for (let i = f0 + w; i < f1; i += WORKERS) {
      await p.evaluate(t => window.seek(t), i / FPS);
      await p.screenshot({ path: `${FR}/${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
      if (++done % 60 === 0) { const el = (Date.now() - t0) / 1000; console.log(`${done}/${f1 - f0} frames, ${(el / done * 1000).toFixed(0)} ms/frame, ~${((f1 - f0 - done) * el / done / 60).toFixed(1)} min left`); }
    }
    await b.close();
    if (errs.length) throw new Error('page errors:\n' + [...new Set(errs)].join('\n'));
  };
  await Promise.all(Array.from({ length: WORKERS }, (_, w) => work(w)));
  srv.close();
  console.log(`rendered ${f1 - f0} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  const [e0, e1] = fromArg || toArg ? [f0, f1] : [0, Math.round(T * FPS)];
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-start_number', String(e0), '-i', `${FR}/%05d.jpg`, '-frames:v', String(e1 - e0),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log('wrote', out);
})().catch(e => { console.error(e); process.exit(1); });
