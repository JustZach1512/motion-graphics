// ---------- assemble + seek ----------
const RENDER = new URLSearchParams(location.search).has('render');
window.VIDEO = { w: W, h: H, duration: DUR };
let CAM, STAGE, FLASH;
function build() {
  CAM = document.getElementById('cam'); STAGE = document.getElementById('stage'); FLASH = document.getElementById('FLASH');
  buildS1(); buildS2(); buildS3(); buildS4(); buildLT(); buildHUD();
}
function seek(t) {
  t = ((t % DUR) + DUR) % DUR;
  const [sx, sy, sr] = shakeAt(t);
  CAM.style.transform = `translate(${f2(sx)}px,${f2(sy)}px) rotate(${f2(sr)}deg)`;
  setS1(t); setS2(t); setS3(t); setS4(t); setLT(t); setHUD(t);
  FLASH.style.opacity = flashAt(t).toFixed(3);
  STAGE.style.filter = INVERTS.some(x => t >= x && t < x + 0.034) ? 'invert(1)' : '';
}
// ---------- preview ----------
function setupPreview() {
  const wrap = document.getElementById('wrap'), stage = STAGE;
  const fit = () => {
    const s = Math.min((innerWidth - 32) / W, (innerHeight - 90) / H);
    wrap.style.width = W * s + 'px'; wrap.style.height = H * s + 'px'; stage.style.transform = `scale(${s})`;
  };
  addEventListener('resize', fit); fit();
  const btn = document.getElementById('play'), scrub = document.getElementById('scrub'), tc = document.getElementById('tc');
  let buf, ac, src, startAt = 0, offset = 0, playing = false, busy = false;
  async function play() {
    if (busy) return; busy = true;
    ac ??= new AudioContext();
    if (!buf) { btn.textContent = '…'; const off = new OfflineAudioContext(2, Math.ceil(48000 * DUR), 48000); await buildAudio(off); buf = await off.startRendering(); }
    src = ac.createBufferSource(); src.buffer = buf; src.connect(ac.destination);
    src.start(0, offset % DUR); startAt = ac.currentTime; playing = true; busy = false; btn.textContent = '❚❚ Pause';
    src.onended = () => { if (playing && now() >= DUR - 0.05) { playing = false; offset = 0; btn.textContent = '▶ Play'; } };
  }
  function pause() { if (!playing) return; offset = (offset + ac.currentTime - startAt) % DUR; src.onended = null; src.stop(); playing = false; btn.textContent = '▶ Play'; }
  function now() { return playing ? Math.min(DUR, offset + ac.currentTime - startAt) : offset; }
  btn.onclick = () => playing ? pause() : play();
  scrub.oninput = () => { const was = playing; if (was) pause(); offset = +scrub.value; if (was) play(); };
  addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); btn.click(); } });
  (function loop() { const t = now(); seek(Math.min(t, DUR - 1e-3)); scrub.value = t; tc.textContent = t.toFixed(2).padStart(5, '0') + ' s'; requestAnimationFrame(loop); })();
}
(async () => {
  if (RENDER) document.body.classList.add('render');
  await Promise.all(['40px Bangers', '40px "Press Start 2P"', '800 40px Inter', '500 40px Inter', '900 40px Inter'].map(f => document.fonts.load(f)));
  build();
  window.seek = seek;
  seek(0);
  if (!RENDER) setupPreview();
})();
