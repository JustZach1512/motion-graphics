// node tools/render.js build/silent.mp4 [workers=4] [fps=30] [fromSec] [toSec]   (workers=0: just re-encode the saved frames)
// Two sub-frames per frame (1/4 frame either side, kept inside the same shot) are blended for motion blur.
// Seeks the page frame by frame in several headless Chromium processes, saves JPEG frames,
// then encodes them with ffmpeg. Also writes build/cues.json (cuts + sound cues) for the mix.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { execFileSync } = require('child_process');
const [out, wArg, fpsArg, fromArg, toArg] = process.argv.slice(2);
const WORKERS = wArg === undefined ? 4 : +wArg, FPS = +(fpsArg || 30);
const FR = path.resolve('build/frames'); fs.mkdirSync(FR, { recursive: true });
async function open() {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve('index.html') + '?render');
  await p.evaluate(async () => { for (const f of ['900 96px Montserrat', '800 50px Montserrat', '40px Rye', '40px "Special Elite"', '40px "Alfa Slab One"']) await document.fonts.load(f); });
  return { b, p, errs };
}
(async () => {
  const first = await open();
  const T = await first.p.evaluate(() => window.DURATION);
  fs.writeFileSync('build/cues.json', JSON.stringify(await first.p.evaluate(() => window.cues()), null, 1));
  await first.b.close();
  const f0 = Math.round((+fromArg || 0) * FPS), f1 = Math.round((toArg ? +toArg : T) * FPS);
  const t0 = Date.now(); let done = 0;
  const work = async w => {
    const { b, p, errs } = await open();
    for (let i = f0 + w; i < f1; i += WORKERS) for (let k = 0; k < 2; k++) {
      await p.evaluate(([t, d]) => { const ts = t + d; seek(window.shotAt(ts) === window.shotAt(t) ? ts : t); }, [i / FPS, (k ? 1 : -1) / (4 * FPS)]);
      await p.screenshot({ path: `${FR}/${String(i * 2 + k).padStart(6, '0')}.jpg`, type: 'jpeg', quality: 93 });
      if (++done % 200 === 0) process.stdout.write(`${done}/${f1 - f0} frames, ${((Date.now() - t0) / done).toFixed(0)} ms/frame\n`);
    }
    await b.close();
    if (errs.length) throw new Error('page errors:\n' + [...new Set(errs)].join('\n'));
  };
  await Promise.all(Array.from({ length: WORKERS }, (_, w) => work(w)));
  console.log(`rendered ${f1 - f0} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS * 2), '-start_number', String(f0 * 2), '-i', `${FR}/%06d.jpg`, '-frames:v', String(2 * (f1 - f0)),
    '-vf', `tmix=frames=2:weights='1 1',select='eq(mod(n\\,2)\\,1)',setpts=N/(${FPS})/TB`, '-r', String(FPS), '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log('wrote', out);
})().catch(e => { console.error(e); process.exit(1); });
