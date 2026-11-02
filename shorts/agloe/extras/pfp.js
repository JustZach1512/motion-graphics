// node extras/pfp.js out_dir   -> pfp-otto.png and pfp-cow.png (800x800)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { execFileSync } = require('child_process');
const serve = require('../../tools/serve.js');
(async () => {
  const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
  const s = await serve(path.resolve(__dirname, '../..')); const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const who of ['otto', 'cow']) {
    await p.goto(`${s.url}/agloe/extras/pfp.html?who=${who}`); await p.waitForFunction(() => window.ready); await p.evaluate(() => window.go());
    const raw = `${out}/raw-${who}.png`; await p.screenshot({ path: raw, clip: { x: 0, y: 420, width: 1080, height: 1080 } });
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-vf', 'scale=800:800:flags=lanczos', `${out}/pfp-${who}.png`]); fs.unlinkSync(raw);
  }
  await b.close(); s.close(); console.log('done');
})().catch(e => { console.error(e); process.exit(1); });
