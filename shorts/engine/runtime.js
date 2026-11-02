// Generic runtime shared by every short: captions, lip-sync timing, camera, seek(t).
// A story calls run(build): build(W) returns { sets, chars, shots } where W = { camera, talking, TL, LANG }.
import { THREE, W, H, renderFrame, clamp, lerp, E, noise1, D2R } from './engine.js';
import { pending } from './characters.js';

const TL = window.TIMINGS;
const LANG = window.LANG || 'es';
const overlay = document.getElementById('ov');
const camera = new THREE.PerspectiveCamera(32, W / H, .1, 600);
let WORLD = null, SHOTS = null;

// ---- captions: one or two words at a time (white, heavy black outline) ----
const WORDS = TL.lines.flatMap(l => l.words.map(w => ({ ...w, line: l.id })));
const GROUPS = [];
for (let i = 0; i < WORDS.length; i++) {
  const w = WORDS[i]; const g = { text: w.w, start: w.start, end: w.end, line: w.line };
  while (i + 1 < WORDS.length && WORDS[i + 1].line === w.line && /^[¿¡]?[\wáéíóúñ]{1,3}$/i.test(WORDS[i].w) && (g.text + ' ' + WORDS[i + 1].w).length <= 13) { i++; g.text += ' ' + WORDS[i].w; g.end = WORDS[i].end; }
  GROUPS.push(g);
}
GROUPS.forEach((g, i) => { const n = GROUPS[i + 1]; g.until = n && n.start - g.end < .45 ? n.start : g.end + .3; });
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function caption(t) {
  const g = GROUPS.find(g => t >= g.start - .02 && t < g.until); if (!g) return '';
  const p = clamp((t - g.start + .02) / .1), s = lerp(.82, 1, E.back(p));
  return `<g transform="translate(540 1330) scale(${s.toFixed(3)})">
    <text text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="96" fill="#000" opacity=".35" transform="translate(0 9)" stroke="#000" stroke-width="22" stroke-linejoin="round">${esc(g.text)}</text>
    <text text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="96" fill="#fff" stroke="#000" stroke-width="20" stroke-linejoin="round" paint-order="stroke">${esc(g.text)}</text></g>`;
}
// is this speaker mid-word at time t? (drives the talking mouth)
export function talking(who, t) {
  for (const l of TL.lines) if (l.who === who && t >= l.start - .02 && t <= l.end + .02) return l.words.some(w => t >= w.start - .03 && t <= w.end + .02);
  return false;
}

const v3 = (a) => new THREE.Vector3(...a);
function placeCamera(c, t) {
  const n = (s, f) => noise1(t * f, s);
  camera.fov = c.fov || 32; camera.updateProjectionMatrix();
  const pos = v3(c.pos), look = v3(c.look);
  const h = (c.shake || 0) * .06 + .02 * (c.hand ?? 1);
  pos.x += n(1, .7) * h * 1.5 + n(5, 13) * (c.shake || 0) * .05; pos.y += n(2, .6) * h + n(6, 13) * (c.shake || 0) * .05;
  look.x += n(3, .5) * h; look.y += n(4, .55) * h;
  camera.position.copy(pos); camera.up.set(Math.sin((c.roll || 0) * D2R), Math.cos((c.roll || 0) * D2R), 0); camera.lookAt(look);
}
function shotAt(t) { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.at - 1e-6) s = x; return s; }

async function seek(t) {
  const shot = shotAt(t), set = WORLD.sets[shot.set], scene = set.scene;
  for (const [name, c] of Object.entries(WORLD.chars)) {
    const on = (shot.cast || []).includes(name);
    if (on && c.root.parent !== scene) scene.add(c.root);
    c.root.visible = on;
  }
  const state = dt => {
    const tt = t + dt, lt = tt - shot.at;
    if (set.update) set.update(tt);
    shot.pose(tt, lt);
    placeCamera(shot.cam(tt, lt), tt);
  };
  state(0);
  if (pending.length) { await Promise.all(pending.splice(0)); state(0); }
  const fx = shot.fx ? shot.fx(t, t - shot.at) : {};
  renderFrame(scene, camera, state, { seed: Math.floor(t * 30), ...fx, ...(window.FXOVR || {}) });
  overlay.innerHTML = (shot.overlay ? shot.overlay(t, t - shot.at) : '') + caption(t);
  return true;
}

export function run(build) {
  window.init = async () => {
    for (const f of ['900 96px Montserrat', '40px Rye', '40px "Special Elite"', '40px "Alfa Slab One"']) await document.fonts.load(f);
    WORLD = await build({ camera, talking, TL, LANG });
    SHOTS = WORLD.shots; window.WORLD = WORLD;
    await Promise.all(pending);
    window.DURATION = TL.duration + .5;
  };
  window.seek = seek;
  window.shotAt = t => SHOTS.indexOf(shotAt(t));
  window.cues = () => SHOTS.flatMap(s => [{ t: s.at, type: 'cut' }, ...(s.sfx || [])]).filter(c => c.t > .05);
  window.ready = true;
}
