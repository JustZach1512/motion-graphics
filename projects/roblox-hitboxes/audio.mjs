// audio.mjs: render the page's buildAudio() soundtrack to a 16-bit WAV.
//   node audio.mjs page.html out.wav [seconds]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import path from 'node:path'; import { pathToFileURL } from 'node:url';
const [, , html, out, secs] = process.argv;
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(pathToFileURL(path.resolve(html)).href + '?render');
const dur = +(secs || await p.evaluate(() => VIDEO.duration));
const b64 = await p.evaluate(async (dur) => {
  const sr = 48000, ctx = new OfflineAudioContext(2, Math.ceil(sr * dur), sr);
  await window.buildAudio(ctx, dur);
  const r = await ctx.startRendering(), L = r.getChannelData(0), R = r.getChannelData(1);
  const i16 = new Int16Array(L.length * 2);
  for (let i = 0; i < L.length; i++) { i16[2 * i] = Math.max(-1, Math.min(1, L[i])) * 32767; i16[2 * i + 1] = Math.max(-1, Math.min(1, R[i])) * 32767; }
  const u8 = new Uint8Array(i16.buffer); let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
}, dur);
const pcm = Buffer.from(b64, 'base64'), hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVE', 8); hdr.write('fmt ', 12); hdr.writeUInt32LE(16, 16);
hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22); hdr.writeUInt32LE(48000, 24); hdr.writeUInt32LE(48000 * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34);
hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
writeFileSync(out, Buffer.concat([hdr, pcm])); console.log('audio ->', out, dur + 's');
await b.close();
