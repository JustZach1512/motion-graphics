// build.mjs: inline the fonts and sound effects into src.html -> delta-executor.html
//   node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const b64 = p => readFileSync(path.join(root, p)).toString('base64');

const fonts = 'skills/motion-broll/engine/fonts/';
const kit = 'skills/sound-effects/sfx/kit/';
const map = {
  GEIST: b64(fonts + 'Geist-Variable.woff2'),
  GEISTMONO: b64(fonts + 'GeistMono-Medium.woff2'),
};
for (const n of ['whoosh', 'click', 'pop', 'riser', 'impact', 'tick']) map['SFX_' + n] = b64(kit + n + '.ogg');

let html = readFileSync(path.join(here, 'src.html'), 'utf8');
html = html.replace(/\{\{(\w+)\}\}/g, (m, k) => {
  if (!(k in map)) throw new Error('unknown placeholder ' + m);
  return map[k];
});
writeFileSync(path.join(here, 'delta-executor.html'), html);
console.log('built delta-executor.html', (html.length / 1024).toFixed(0) + ' KB');
