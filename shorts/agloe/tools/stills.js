// node tools/stills.js out_dir t1 t2 ...   -> PNG stills at those times (for checking frames)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const [out, ...ts] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve('index.html') + '?render');
  await p.evaluate(async () => { for (const f of ['900 96px Montserrat', '800 50px Montserrat', '40px Rye', '40px "Special Elite"', '40px "Alfa Slab One"']) await document.fonts.load(f); });
  for (const t of ts) { const t0 = Date.now(); await p.evaluate(t => seek(t), +t); await p.screenshot({ path: `${out}/${(+t).toFixed(2).padStart(6, '0')}.png` }); process.stdout.write(`${t}:${Date.now() - t0}ms `); }
  console.log(); if (errs.length) console.error('ERRORS:\n' + [...new Set(errs)].join('\n'));
  await b.close();
})();
