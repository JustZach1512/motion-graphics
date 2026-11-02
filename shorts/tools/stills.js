// node tools/stills.js <story>/index.html[?lang=en] <out_dir> t1 t2 ...  -> JPEG screenshots at those times (for checking frames)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const serve = require('./serve.js');
(async () => {
  const [page, out, ...ts] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const s = await serve(path.resolve(__dirname, '..')); const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(`${s.url}/${page}`); await p.waitForFunction(() => window.ready, null, { timeout: 120000 });
  if (await p.evaluate(() => !!window.init)) await p.evaluate(() => window.init());
  for (const t of ts) { const t0 = Date.now(); await p.evaluate(t => window.seek(+t), t); await p.screenshot({ path: `${out}/${(+t).toFixed(2).padStart(6, '0')}.jpg`, type: 'jpeg', quality: 90 }); process.stdout.write(`${t}:${Date.now() - t0}ms `); }
  console.log(); const u = [...new Set(errs)].filter(e => !/GPU stall|GL_CLOSE_PATH/.test(e)); if (u.length) console.error('ERRORS:\n' + u.join('\n'));
  await b.close(); s.close();
})().catch(e => { console.error(e); process.exit(1); });
