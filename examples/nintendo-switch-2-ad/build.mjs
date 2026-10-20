// Builds switch2-ad.html: one self-contained page (three.js, fonts and sounds inlined).
//   npm i && node build.mjs
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';

const b64 = p => readFileSync(new URL(p, import.meta.url)).toString('base64');

const three = (await build({
  entryPoints: [new URL('src/three-entry.js', import.meta.url).pathname],
  bundle: true, minify: true, format: 'iife', write: false, legalComments: 'none',
})).outputFiles[0].text;

const fonts = [
  ['Montserrat', '300 900', 'assets/fonts/Montserrat-VF-latin.woff2'],
  ['Poppins', '600', 'assets/fonts/Poppins-600-latin.woff2'],
  ['Poppins', '700', 'assets/fonts/Poppins-700-latin.woff2'],
  ['Poppins', '800', 'assets/fonts/Poppins-800-latin.woff2'],
].map(([family, weight, file]) =>
  `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${b64(file)}) format('woff2')}`).join('\n');

// CC0 sound effects from this repo's sound-effects skill (see skills/sound-effects/LICENSES.md).
const SFX_DIR = '../../skills/sound-effects/sfx/';
const sfx = {
  click: 'kit/click.ogg',
  click2: 'click/fs788933.ogg',
  impact: 'kit/impact.ogg',
  hit: 'impact/fs-222517-dramatic-hit.ogg',
  whoosh: 'kit/whoosh.ogg',
  whoosh2: 'whoosh/fs830856.ogg',
  swoosh: 'whoosh/fs-169867-swoosh.ogg',
  riser: 'kit/riser.ogg',
  pop: 'pop/fs-824189-pop-in-sfx.ogg',
  tick: 'kit/tick.ogg',
  triangle: 'ding/fs-349504-triangle-open-04.ogg',
};
const sfxJs = 'window.SFX={' + Object.entries(sfx)
  .map(([k, f]) => `${k}:'data:audio/ogg;base64,${b64(SFX_DIR + f)}'`).join(',') + '};';

const page = readFileSync(new URL('src/index.html', import.meta.url), 'utf8')
  .replace('/*@FONTS@*/', () => fonts)
  .replace('/*@SFX@*/', () => sfxJs)
  .replace('/*@THREE@*/', () => '/* three.js r170, MIT License, Copyright 2010-2024 three.js authors */\n' + three)
  .replace('/*@AD@*/', () => readFileSync(new URL('src/ad.js', import.meta.url), 'utf8'));
writeFileSync(new URL('switch2-ad.html', import.meta.url), page);
console.log(`switch2-ad.html  ${(page.length / 1024).toFixed(0)} KB`);
