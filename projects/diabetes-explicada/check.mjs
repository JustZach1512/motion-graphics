// Loads the page, reports console errors/warnings and the cue count.
import { chromium } from 'playwright';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const url = pathToFileURL(path.resolve(process.argv[2] || 'diabetes.html')).href + '?render';
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('console', m => { if (m.type() !== 'log') console.log(m.type(), m.text()); });
p.on('pageerror', e => console.log('PAGEERROR', e.message));
await p.goto(url);
await p.waitForFunction(() => window.VIDEO && window.seek, null, { timeout: 10000 }).catch(e => console.log('no seek', e.message));
const info = await p.evaluate(() => { const d = VIDEO.duration; const t0 = performance.now(); for (let i = 0; i < 200; i++) seek(Math.random() * d); return { d, cues: CUES.length, msPerSeek: (performance.now() - t0) / 200 }; }).catch(e => ({ err: e.message }));
console.log(JSON.stringify(info));
await b.close();
