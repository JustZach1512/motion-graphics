// node extras/banner.js out_dir [guides]  -> banner-es.jpg, banner-en.jpg (2560x1440); "guides" also writes previews with the safe area marked
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { execFileSync } = require('child_process');
const serve = require('../tools/serve.js');
(async () => {
  const [out, guides] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const s = await serve(path.resolve('.')); const b = await chromium.launch();
  for (const lang of ['es', 'en']) {
    const p = await b.newPage({ viewport: { width: 2560, height: 1440 } });
    await p.goto(`${s.url}/extras/banner.html?lang=${lang}`); await p.waitForFunction(() => window.ready); await p.evaluate(() => window.go());
    const png = `${out}/banner-${lang}.png`; await p.screenshot({ path: png });
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-q:v', '2', `${out}/banner-${lang}.jpg`]);
    if (guides) execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-vf', 'drawbox=x=507:y=508:w=1546:h=423:color=red@0.9:t=6,drawbox=x=0:y=508:w=2560:h=423:color=yellow@0.7:t=4,scale=1280:-1', `${out}/guide-${lang}.jpg`]);
    fs.unlinkSync(png); await p.close();
  }
  await b.close(); s.close(); console.log('done');
})().catch(e => { console.error(e); process.exit(1); });
