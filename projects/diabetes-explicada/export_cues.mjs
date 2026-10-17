// Writes the page's sound cues (window.CUES) to cues.json for mix.py.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto(pathToFileURL(path.resolve('diabetes.html')).href + '?render');
await p.waitForFunction(() => window.CUES && window.seek);
const cues = await p.evaluate(() => window.CUES.slice().sort((a, b) => a.t - b.t));
writeFileSync('cues.json', JSON.stringify(cues, null, 0));
console.log(cues.length, 'cues ->', 'cues.json');
await b.close();
