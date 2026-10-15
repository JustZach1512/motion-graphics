// ---------- soundtrack: synthesised arcade fight music + bundled CC0 sound effects ----------
// Same timeline numbers as the visuals (see the beat sheet at the top of scenes.js).
window.buildAudio = async function (ctx) {
  const SR = ctx.sampleRate, b = n => n * BT, mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  // samples
  const S = {};
  await Promise.all(Object.entries(SFX).map(async ([k, b64]) => {
    const bin = atob(b64), u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    S[k] = await ctx.decodeAudioData(u.buffer);
  }));
  // buses
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.8, 0); out.gain.setValueAtTime(0.8, DUR - 0.25); out.gain.linearRampToValueAtTime(0, DUR);
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -12; comp.knee.value = 8; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.18;
  out.connect(comp); comp.connect(ctx.destination);
  const mus = ctx.createGain(); mus.gain.value = 0.36; mus.connect(out);
  const fx = ctx.createGain(); fx.gain.value = 0.95; fx.connect(out);
  const nb = ctx.createBuffer(1, SR * 2, SR);
  { const d = nb.getChannelData(0), r = rng(99); for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1; }
  const imp = ctx.createBuffer(2, Math.floor(SR * 1.8), SR);
  { const r = rng(5); for (let c = 0; c < 2; c++) { const d = imp.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / d.length, 2.8); } }
  const rev = ctx.createConvolver(); rev.buffer = imp;
  const revOut = ctx.createGain(); revOut.gain.value = 0.2; rev.connect(revOut); revOut.connect(out);
  const dl = ctx.createDelay(1); dl.delayTime.value = BT * 0.75;
  const fb = ctx.createGain(); fb.gain.value = 0.3;
  const dlf = ctx.createBiquadFilter(); dlf.type = 'lowpass'; dlf.frequency.value = 2800;
  const dlOut = ctx.createGain(); dlOut.gain.value = 0.2;
  dl.connect(dlf); dlf.connect(fb); fb.connect(dl); dlf.connect(dlOut); dlOut.connect(mus);
  const mkShaper = k => { const s = ctx.createWaveShaper(), c = new Float32Array(1024); for (let i = 0; i < 1024; i++) c[i] = Math.tanh(k * (i / 511.5 - 1)); s.curve = c; return s; };
  const bassBus = ctx.createGain(); bassBus.gain.value = 0.5; const bShape = mkShaper(2.5); bassBus.connect(bShape); bShape.connect(mus);
  const stabBus = ctx.createGain(); stabBus.gain.value = 0.6; const sShape = mkShaper(3); stabBus.connect(sShape); sShape.connect(mus); sShape.connect(rev);

  const noiseSrc = (t, dur) => { const s = ctx.createBufferSource(); s.buffer = nb; s.loop = true; s.start(t, (t * 0.37) % 1.5); s.stop(t + dur); return s; };
  const env = (t, v, a, d) => { const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0008, t + a + d); return g; };
  const filt = (type, f, q = 0.7) => { const x = ctx.createBiquadFilter(); x.type = type; x.frequency.value = f; x.Q.value = q; return x; };

  function kick(t, v = 1) {
    const o = ctx.createOscillator(), g = env(t, v, 0.004, 0.34);
    o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.11);
    o.connect(g); g.connect(mus); o.start(t); o.stop(t + 0.4);
    const n = noiseSrc(t, 0.03), h = filt('highpass', 2500), ng = env(t, 0.22 * v, 0.001, 0.014); n.connect(h); h.connect(ng); ng.connect(mus);
  }
  function snare(t, v = 1) {
    const n = noiseSrc(t, 0.25), bp = filt('bandpass', 2000, 0.6), g = env(t, 0.65 * v, 0.003, 0.18);
    n.connect(bp); bp.connect(g); g.connect(mus); g.connect(rev);
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.08);
    const og = env(t, 0.45 * v, 0.002, 0.09); o.connect(og); og.connect(mus); o.start(t); o.stop(t + 0.12);
  }
  function hat(t, v = 0.12, open = false) {
    const d = open ? 0.17 : 0.035, n = noiseSrc(t, d + 0.02), h = filt('highpass', 7500), g = env(t, v, 0.001, d);
    n.connect(h); h.connect(g); g.connect(mus);
  }
  function crash(t, v = 0.45) {
    v *= 0.5;
    const n = noiseSrc(t, 1.2), h = filt('highpass', 5200), g = env(t, v, 0.002, 1.0);
    n.connect(h); h.connect(g); g.connect(mus); g.connect(rev);
  }
  function bass(t, m, dur, v = 1) {
    const f = mtof(m), lp = filt('lowpass', 2600, 5);
    lp.frequency.setValueAtTime(2600, t); lp.frequency.exponentialRampToValueAtTime(360, t + dur * 0.9);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5 * v, t + 0.005); g.gain.setValueAtTime(0.5 * v, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    for (const det of [-9, 9]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det; o.connect(lp); o.start(t); o.stop(t + dur + 0.02); }
    const sub = ctx.createOscillator(); sub.frequency.value = f; const sg = ctx.createGain(); sg.gain.value = 0.7; sub.connect(sg); sg.connect(g); sub.start(t); sub.stop(t + dur + 0.02);
    lp.connect(g); g.connect(bassBus);
  }
  const pulse = (() => { const n = 48, re = new Float32Array(n), im = new Float32Array(n); for (let k = 1; k < n; k++) re[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25); return ctx.createPeriodicWave(re, im); })();
  function lead(t, m, dur, v = 0.17, vib = true) {
    const o = ctx.createOscillator(); o.setPeriodicWave(pulse); o.frequency.value = mtof(m);
    if (vib && dur > 0.25) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 6; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(22, t + dur); l.connect(lg); lg.connect(o.detune); l.start(t); l.stop(t + dur + 0.05); }
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.006); g.gain.setValueAtTime(v * 0.8, t + dur * 0.8); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    const lp = filt('lowpass', 5200);
    o.connect(lp); lp.connect(g); g.connect(mus); g.connect(dl); g.connect(rev);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function stab(t, notes, dur = 0.3, v = 0.16) {
    const lp = filt('lowpass', 5000, 3); lp.frequency.setValueAtTime(5000, t); lp.frequency.exponentialRampToValueAtTime(450, t + dur);
    const g = env(t, v, 0.004, dur);
    for (const m of notes) for (const det of [-12, 0, 12]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = det; o.connect(lp); o.start(t); o.stop(t + dur + 0.02); }
    lp.connect(g); g.connect(stabBus);
  }
  function brass(t, notes, dur, v = 0.11) {
    const lp = filt('lowpass', 500, 1.5);
    lp.frequency.setValueAtTime(500, t); lp.frequency.exponentialRampToValueAtTime(3800, t + 0.05); lp.frequency.exponentialRampToValueAtTime(2000, t + Math.max(0.06, Math.min(dur, 0.4)));
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.02); g.gain.setValueAtTime(v, t + Math.max(0.03, dur - 0.04)); g.gain.exponentialRampToValueAtTime(0.0008, t + dur + 0.14);
    for (const m of notes) for (const det of [-8, 0, 8]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = det; o.connect(lp); o.start(t); o.stop(t + dur + 0.16); }
    lp.connect(g); g.connect(mus); g.connect(rev);
  }
  function pizz(t, m, v = 0.5) {
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(m);
    const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = mtof(m); const g2 = ctx.createGain(); g2.gain.value = 0.18; o2.connect(g2);
    const lp = filt('lowpass', 2400); lp.frequency.setValueAtTime(2400, t); lp.frequency.exponentialRampToValueAtTime(300, t + 0.15);
    const g = env(t, v, 0.003, 0.15);
    o.connect(lp); g2.connect(lp); lp.connect(g); g.connect(mus); g.connect(rev);
    o.start(t); o2.start(t); o.stop(t + 0.2); o2.stop(t + 0.2);
  }
  function riser(t0, t1, v = 0.2) {
    const n = noiseSrc(t0, t1 - t0 + 0.03), bp = filt('bandpass', 400, 2);
    bp.frequency.setValueAtTime(400, t0); bp.frequency.exponentialRampToValueAtTime(9000, t1);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t1 - 0.02); g.gain.linearRampToValueAtTime(0, t1 + 0.01);
    n.connect(bp); bp.connect(g); g.connect(mus);
  }
  function scratch(t, v = 0.55) {
    for (const [dt, f0, f1, d] of [[0, 300, 1500, 0.08], [0.09, 1500, 160, 0.2]]) {
      const n = noiseSrc(t + dt, d + 0.02), bp = filt('bandpass', f0, 4);
      bp.frequency.setValueAtTime(f0, t + dt); bp.frequency.exponentialRampToValueAtTime(f1, t + dt + d);
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0 / 3, t + dt); o.frequency.exponentialRampToValueAtTime(f1 / 3, t + dt + d);
      const og = ctx.createGain(); og.gain.value = 0.5; o.connect(og); og.connect(bp);
      const g = env(t + dt, v, 0.008, d); n.connect(bp); bp.connect(g); g.connect(out);
      o.start(t + dt); o.stop(t + dt + d + 0.02);
    }
  }
  function P(t, name, v = 1, rate = 1, o = {}) {
    const buf = S[name]; if (!buf) return;
    const s = ctx.createBufferSource(); s.buffer = buf; s.playbackRate.value = rate;
    let node = s;
    if (o.lp) { const f = filt('lowpass', o.lp); node.connect(f); node = f; }
    if (o.pan) { const p = ctx.createStereoPanner(); p.pan.value = o.pan; node.connect(p); node = p; }
    const g = ctx.createGain(); g.gain.value = v; node.connect(g); g.connect(fx);
    const off = (o.offset || 0) + Math.max(0, -t) * rate, st = Math.max(0, t);
    s.start(st, off); if (o.dur) s.stop(st + o.dur);
  }

  // ===== music =====
  // bar 1 (0 - 1.5): intro stabs + snare roll + riser
  bass(0, 33, 0.34); stab(0, [45, 52, 57], 0.34); kick(0); crash(0, 0.3);
  bass(b(1), 33, 0.34); stab(b(1), [45, 52, 57], 0.34); kick(b(1));
  stab(b(2), [48, 55, 60], 0.17); kick(b(2), 0.8); stab(b(2.5), [48, 55, 60], 0.17);
  stab(b(3), [50, 57, 62], 0.3); kick(b(3), 0.9);
  for (let x = 2; x < 4; x += x < 3 ? 0.5 : 0.25) snare(b(x), 0.25 + 0.45 * (x - 2) / 2);
  riser(0.35, 1.5, 0.2);
  // bars 2-7 (1.5 - 10.5): the fight groove, A minor: Am F G E Am F|E
  const ROOTS = [[33], [29], [31], [28], [33], [29, 28]];
  const CH = { 33: [57, 60, 64], 29: [53, 57, 60], 31: [55, 59, 62], 28: [52, 56, 59] };
  const ARP = { 33: [69, 72, 76, 81], 29: [65, 69, 72, 77], 31: [67, 71, 74, 79], 28: [64, 68, 71, 76] };
  for (let k = 0; k < 6; k++) {
    const T0 = 1.5 + k * 1.5;
    kick(T0); kick(T0 + b(1.5), 0.75); kick(T0 + b(2)); if (k % 2) kick(T0 + b(3.5), 0.65);
    snare(T0 + b(1)); snare(T0 + b(3));
    for (let i = 0; i < 16; i++) hat(T0 + b(i / 4), i % 2 ? 0.05 : 0.11, i === 14);
    for (let i = 0; i < 8; i++) { const r = ROOTS[k][ROOTS[k].length > 1 && i >= 4 ? 1 : 0]; bass(T0 + b(i / 2), r + (i % 2 ? 12 : 0), b(0.5) * 0.92); }
    for (const r of ROOTS[k]) brass(T0 + (r === 28 && k === 5 ? b(2) : 0), CH[r], ROOTS[k].length > 1 ? b(2) * 0.95 : 1.42, 0.03);
  }
  crash(1.5, 0.45); crash(4.5, 0.4); crash(7.5, 0.45); crash(9.0, 0.3);
  // lead: 16th arpeggios (chat), then the melody (ranking + podium)
  const PAT = [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3];
  for (let k = 0; k < 2; k++) { const T0 = 1.5 + k * 1.5, a = ARP[ROOTS[k][0]]; for (let i = 0; i < 16; i++) lead(T0 + b(i / 4), a[PAT[i]], b(0.25) * 0.85, 0.11, false); }
  const MEL = [[74, 0, 79, 0, 77, 76, 74, 71], [76, 0, 80, 0, 83, 0, 81, 80], [81, 0, 76, 0, 72, 76, 81, 84], [77, 76, 77, 81, 80, 0, 83, 0]];
  MEL.forEach((bar, j) => { const T0 = 1.5 + (j + 2) * 1.5; for (let i = 0; i < 8; i++) { const m = bar[i]; if (!m) continue; let len = 1; while (i + len < 8 && bar[i + len] === 0) len++; lead(T0 + b(i / 2), m, b(len / 2) * 0.92, 0.15); } });
  // fills
  for (let t = 4.125; t < 4.31; t += b(0.25)) snare(t, 0.5); stab(4.3125, [45, 52, 57], 0.3, 0.2);
  for (let t = 6.75; t < 7.49; t += b(0.25)) snare(t, 0.25 + 0.4 * (t - 6.75) / 0.75);
  stab(7.125, [52, 56, 59], 0.25, 0.16);
  for (let t = 9.75; t < 10.49; t += b(0.25)) snare(t, 0.3 + 0.5 * (t - 9.75) / 0.75);
  riser(9.0, 10.5, 0.16);
  // 10.5: record scratch, the music stops; Meta sneaks in on pizzicato
  scratch(10.5);
  [[10.875, 45], [11.0625, 48], [11.25, 52], [11.4375, 51], [11.625, 50]].forEach(([t, m]) => { pizz(t, m, 0.6); pizz(t, m + 12, 0.16); });
  [10.96875, 11.15625, 11.34375, 11.53125].forEach(t => pizz(t, 69, 0.12));
  // 12.375: victory fanfare in A major
  [12.375, 12.5, 12.625].forEach(t => brass(t, [64, 69, 73], 0.08, 0.12));
  brass(12.75, [57, 64, 69, 73, 76], 0.34, 0.13); kick(12.75); crash(12.75, 0.45); bass(12.75, 33, 0.36);
  brass(13.125, [62, 66, 69, 74], 0.34, 0.13); kick(13.125); snare(13.125, 0.7); bass(13.125, 38, 0.36);
  brass(13.5, [64, 68, 71, 76], 0.34, 0.13); kick(13.5); snare(13.5, 0.5); bass(13.5, 40, 0.36);
  brass(13.875, [57, 64, 69, 73, 76, 81], 1.05, 0.13); kick(13.875); crash(13.875, 0.45);
  for (let i = 0; i < 8; i++) { const t = 13.875 + b(i / 2); hat(t, 0.09); bass(t, 33 + (i % 2 ? 12 : 0), b(0.5) * 0.9, 0.8); if (i % 2 === 0) kick(t, 0.7); if (i === 2 || i === 6) snare(t, 0.55); }
  const SP = [81, 85, 88, 93];
  for (let i = 0; i < 14; i++) lead(13.875 + b(i / 4), SP[i % 4], b(0.25) * 0.8, 0.06, false);
  brass(14.625, [57, 64, 69, 73, 76, 81], 0.36, 0.12); crash(14.625, 0.35); kick(14.625);

  // ===== sound effects (bundled CC0 files) =====
  // S1
  P(0.0, 'whoosh', 0.7); P(0.04, 'qwoosh', 0.5, 0.9, { pan: 0.4 });
  P(-0.96, 'riser', 0.35);
  P(0.375, 'bighit', 0.85);
  P(0.75, 'chop', 0.45); P(0.84, 'chop', 0.45, 1.1);
  P(1.125, 'punch1', 0.9); P(1.125, 'hit2', 0.55);
  P(1.3, 'whoosh', 0.6, 0.8);
  // S2
  P(1.4, 'swoosh', 0.5);
  P(1.6875, 'soft', 0.7, 1.1); P(1.78125, 'soft', 0.7, 0.95);
  P(1.875, 'popin', 0.8); P(1.9, 'typing', 0.3, 1, { dur: 0.35 });
  P(2.625, 'popin', 0.8, 0.9); P(2.65, 'typing', 0.3, 1.05, { dur: 0.35, offset: 0.4 });
  P(3.0, 'qwoosh', 0.4, 0.8);
  P(3.1875, 'chop', 0.8); P(3.25, 'mpop', 0.6);
  P(3.375, 'punch1', 1.0); P(3.375, 'soft', 0.5);
  P(3.5, 'blip', 0.45);
  [3.65625, 3.75, 3.84375].forEach((t, i) => { P(t, 'plop', 0.45, 1.4 + i * 0.1); P(t + 0.094, 'punch3', 0.75, 1.1 + i * 0.08); });
  P(4.125, 'whoosh', 0.7, 1.1, { pan: -0.5 }); P(4.14, 'whoosh', 0.7, 1.0, { pan: 0.5 });
  P(4.3125, 'bighit', 1.0); P(4.3125, 'punch2', 0.8);
  P(4.36, 'swoosh', 0.5, 0.8);
  // S3
  P(4.5, 'swoosh', 0.5, 1.2);
  SWAPS.forEach((t, i) => { P(t - 0.03, 'qwoosh', 0.3, 1.2); P(t, i % 2 ? 'punch2' : 'punch1', 0.85, 0.95 + (i % 3) * 0.06, { pan: i % 2 ? -0.3 : 0.3 }); });
  P(7.125, 'hit2', 0.5); P(7.15, 'whoosh', 0.6, 0.9); P(7.2, 'swoosh', 0.4, 0.7);
  // S4
  P(7.55, 'qwoosh', 0.4, 0.6);
  P(7.875, 'ding', 0.7); P(7.875, 'soft', 0.6);
  P(7.9, 'whoosh', 0.5, 1.2, { pan: -0.6 }); P(7.92, 'whoosh', 0.5, 1.1, { pan: 0.6 });
  P(8.12, 'power', 0.3); P(8.13, 'power', 0.3, 0.9);
  P(8.3, 'mpop', 0.6); P(8.48, 'mpop', 0.6, 0.9);
  P(8.8125, 'chop', 0.6); P(8.95, 'bighit', 0.8); P(8.95, 'punch2', 0.8);
  P(9.3, 'ding2', 0.45);
  for (let t = 9.0, i = 0; t < 10.49; t += b(0.25), i++) P(t, ['punch1', 'punch2', 'punch3'][i % 3], 0.32 + (i % 4 === 0 ? 0.3 : 0), 0.9 + hash1(i) * 0.3, { pan: (hash1(i + 9) - 0.5) * 0.8 });
  [9.375, 9.75, 10.125].forEach(t => P(t, 'hit2', 0.35));
  P(10.55, 'whoosh', 0.6, 0.8);
  [10.875, 11.0625, 11.25, 11.4375].forEach(t => P(t, 'tick', 0.7));
  for (let t = 10.875, i = 0; t < 12.0; t += b(0.25), i++) P(t, ['punch1', 'punch2', 'punch3'][i % 3], 0.22, 0.9, { lp: 500 });
  P(11.6, 'qwoosh', 0.35, 1.3); P(11.625, 'ding', 0.8, 1.1);
  P(11.8125, 'power', 0.5);
  P(12.0, 'swoosh', 0.7, 0.7); P(12.0, 'soft', 0.6, 0.8);
  P(12.1875, 'mpop', 0.8); P(12.25, 'mpop', 0.8, 1.15);
  P(12.375, 'popin', 0.7);
  P(12.75, 'bighit', 0.9);
  P(13.0, 'soft', 0.8, 0.85); P(13.03, 'soft', 0.7, 0.75);
  P(13.125, 'punch1', 0.9);
  P(13.6, 'typing', 0.28, 1.1, { dur: 0.7 });
};
