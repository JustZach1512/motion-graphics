// open the page, collect console errors, call seek at many times
import { chromium } from 'playwright';
import path from 'node:path'; import { pathToFileURL } from 'node:url';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href + '?render');
await p.evaluate(async () => { await document.fonts.ready; });
const r = await p.evaluate(() => { const bad = []; const t0 = performance.now(); for (let t = 0; t < 90; t += 0.05) { try { seek(t); } catch (e) { bad.push(t.toFixed(2) + ': ' + e.message); if (bad.length > 10) break; } } return { bad, ms: (performance.now() - t0) / 1800 }; });
console.log(JSON.stringify(r, null, 1)); console.log('page errors:', errs.slice(0, 10));
await b.close();
