// Música de pelea sintetizada (determinista). Se usa en el navegador y en Node.
(function (root) {
  const BPM = 150, BEAT = 60 / BPM, DUR = 15;
  // Golpes (s) — compartidos con la animación para que el sonido y el "POW" coincidan.
  const HITS = [1.55, 2.8, 3.4, 4.0, 4.6, 5.15, 6.25, 7.0, 7.75, 9.2, 9.8, 10.4, 11.0, 12.3];
  function renderMusic(sr) {
    const n = Math.floor(sr * DUR), L = new Float32Array(n);
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    const add = (t0, len, fn, gain) => {
      const s0 = Math.floor(t0 * sr), m = Math.floor(len * sr);
      for (let i = 0; i < m && s0 + i < n; i++) if (s0 + i >= 0) L[s0 + i] += fn(i / sr) * gain;
    };
    const sq = (f, t) => (Math.sin(2 * Math.PI * f * t) > 0 ? 1 : -1);
    const saw = (f, t) => 2 * ((f * t) % 1) - 1;
    const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
    const kick = t => Math.sin(2 * Math.PI * (50 + 120 * Math.exp(-t * 30)) * t) * Math.exp(-t * 9);
    const snare = t => (rnd() * 0.8 + Math.sin(2 * Math.PI * 190 * t) * 0.4) * Math.exp(-t * 18);
    const hat = t => rnd() * Math.exp(-t * 60);
    const FIGHT_END = 13;
    // Batería + bajo + melodía en Re menor, estilo arcade
    const bass = [38, 38, 50, 38, 41, 41, 53, 41, 36, 36, 48, 36, 37, 37, 49, 45];
    const lead = [62, 65, 69, 67, 65, 64, 65, 62, 60, 64, 67, 69, 70, 69, 67, 64];
    for (let b = 0; b * BEAT < FIGHT_END; b++) {
      const t = b * BEAT;
      const fill = t > 12.0;
      add(t, 0.4, kick, 0.9);
      if (b % 2 === 1 || fill) add(t + (fill ? BEAT / 2 : 0), 0.25, snare, 0.45);
      add(t + BEAT / 2, 0.05, hat, 0.15); add(t, 0.05, hat, 0.1);
      for (let e = 0; e < 2; e++) { // bajo en corcheas
        const f = mtof(bass[b % 16]);
        add(t + e * BEAT / 2, BEAT / 2 * 0.9, x => saw(f, x) * Math.min(1, x * 200) * Math.exp(-x * 4), 0.22);
      }
      if (t >= 1.6) { // melodía tras "¡FIGHT!"
        for (let e = 0; e < 2; e++) {
          const f = mtof(lead[(b * 2 + e) % 16] + (t > 8.5 ? 2 : 0));
          add(t + e * BEAT / 2, BEAT / 2 * 0.85, x => sq(f, x) * Math.exp(-x * 5), 0.09);
        }
      }
    }
    // Golpes: thump + crujido
    HITS.forEach((h, i) => {
      const big = i === HITS.length - 1;
      add(h, big ? 0.9 : 0.3, t => (rnd() * Math.exp(-t * (big ? 6 : 25)) + Math.sin(2 * Math.PI * (90 * Math.exp(-t * 8)) * t) * Math.exp(-t * 10)), big ? 0.9 : 0.6);
    });
    add(0.55, 0.5, t => rnd() * Math.exp(-t * 5) * 0.5 + Math.sin(2 * Math.PI * 60 * t) * Math.exp(-t * 6), 0.8); // VS slam
    // Fanfarria de Meta (Do mayor, triunfal y algo ridícula)
    const fan = [[13.1, [60, 64, 67]], [13.45, [62, 65, 69]], [13.8, [64, 67, 72]], [14.15, [65, 69, 72, 77]]];
    fan.forEach(([t0, notes], i) => notes.forEach(m => add(t0, i === 3 ? 0.85 : 0.33,
      x => (saw(mtof(m), x) * 0.5 + sq(mtof(m) * 1.003, x) * 0.5) * Math.min(1, x * 80) * Math.exp(-x * (i === 3 ? 1.5 : 4)), 0.09)));
    add(13.0, 0.4, t => Math.sin(2 * Math.PI * (300 + 1500 * t) * t) * Math.exp(-t * 6), 0.25); // ¡swoosh!
    // limitador suave
    for (let i = 0; i < n; i++) L[i] = Math.tanh(L[i] * 1.1) * 0.9;
    for (let i = n - Math.floor(sr * 0.3); i < n; i++) L[i] *= (n - i) / (sr * 0.3);
    return L;
  }
  const api = { renderMusic, HITS, DUR, BPM };
  if (typeof module !== 'undefined') module.exports = api; else root.FightMusic = api;
})(this);
