// Bundles src/main.js (three.js included) and the fonts into one self-contained HTML page.
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';

const font = (family, file) => `@font-face{font-family:'${family}';font-style:normal;font-weight:100 900;font-display:block;src:url(data:font/woff2;base64,${readFileSync(file).toString('base64')}) format('woff2');}`;
const fonts = [
  font('Outfit Variable', 'node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2'),
  font('Inter Variable', 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'),
].join('\n');

const res = await build({ entryPoints: ['src/main.js'], bundle: true, format: 'iife', minify: true, write: false, target: 'es2022', legalComments: 'none' });
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const html = readFileSync('src/page.html', 'utf8').replace('/*__FONTS__*/', () => fonts).replace('/*__SCRIPT__*/', () => js);
writeFileSync('galaxy-s25-por-dentro.html', html);
console.log(`galaxy-s25-por-dentro.html  ${(html.length / 1024).toFixed(0)} KB`);
