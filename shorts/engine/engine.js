// Renderer, post-processing (ink outlines, depth of field, bloom, grade), materials and textures.
import * as THREE from 'three';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
export { THREE };
export const W = 1080, H = 1920;           // output / overlay size
export const RW = 720, RH = 1280;          // 3D render size (upscaled by the canvas)
export const INK = '#1c1411';

// ---------- math ----------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const E = {
  lin: t => t, io: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), out: t => 1 - Math.pow(1 - t, 3),
  out5: t => 1 - Math.pow(1 - t, 5), in: t => t * t * t, sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  back: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
export const seg = (t, t0, t1, e = E.io) => e(clamp((t - t0) / (t1 - t0)));
export function k(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const [t0, v0] = keys[i - 1], [t1, v1, e] = keys[i];
    const p = (e || E.io)((t - t0) / (t1 - t0 || 1));
    return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], p)) : lerp(v0, v1, p);
  }
  return keys[keys.length - 1][1];
}
export function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
export function noise1(t, seed = 0) { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return lerp(hash(i + seed * 97.3), hash(i + 1 + seed * 97.3), u) * 2 - 1; }
export const pop = (t, t0, d = .35) => (t < t0 ? 0 : E.back(clamp((t - t0) / d)));
export const rnd = seed => { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };
export const D2R = Math.PI / 180;

// ---------- renderer ----------
export const canvas = document.getElementById('gl');
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(RW, RH, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // the final pass does the sRGB encode
const RT = (ms = 0) => new THREE.WebGLRenderTarget(RW, RH, { type: THREE.HalfFloatType, samples: ms, colorSpace: THREE.LinearSRGBColorSpace });
const rtScene = RT(4), rtA = RT(), rtB = RT(), rtAcc = RT();
export const outline = new OutlineEffect(renderer, { defaultThickness: 0.0042, defaultColor: [0.09, 0.065, 0.05], defaultAlpha: 1 });
const bloom = new UnrealBloomPass(new THREE.Vector2(RW / 2, RH / 2), 0.15, 0.45, 1.05);
let bokeh = null;
const quad = (frag, uniforms) => {
  const m = new THREE.ShaderMaterial({ uniforms, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }', fragmentShader: frag, depthTest: false, depthWrite: false });
  const ms = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m); const sc = new THREE.Scene(); sc.add(ms);
  return { m, sc };
};
const cam2 = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const copyAdd = quad('uniform sampler2D tex; uniform float w; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tex, vUv).rgb * w, 1.); }', { tex: { value: null }, w: { value: 1 } });
copyAdd.m.blending = THREE.AdditiveBlending; copyAdd.m.transparent = true;
const grade = quad(`
  uniform sampler2D tex; uniform float sepia, vig, sat, contrast, warm, flash, seed, grain, expo; uniform vec3 flashCol; varying vec2 vUv;
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + seed) * 43758.5453); }
  vec3 toSRGB(vec3 c){ c = max(c, 0.); return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - .055, step(.0031308, c)); }
  void main(){
    vec3 c = texture2D(tex, vUv).rgb * expo;
    c = c / (1. + c * .12);                       // gentle shoulder so highlights don't clip hard
    c = toSRGB(c);
    float l = dot(c, vec3(.299, .587, .114));
    c = mix(vec3(l), c, sat);
    c = (c - .5) * contrast + .5;
    c *= vec3(1. + warm * .06, 1. + warm * .01, 1. - warm * .07);
    vec3 sp = vec3(dot(c, vec3(.393, .769, .189)), dot(c, vec3(.349, .686, .168)), dot(c, vec3(.272, .534, .131)));
    c = mix(c, sp * vec3(1.02, .97, .86), sepia);
    vec2 d = vUv - vec2(.5, .48); c *= 1. - vig * smoothstep(.35, .95, length(d * vec2(1.25, .9)));
    c += (h(vUv * 1000.) - .5) * grain;
    c = mix(c, flashCol, flash);
    gl_FragColor = vec4(clamp(c, 0., 1.), 1.);
  }`, { tex: { value: null }, sepia: { value: 0 }, vig: { value: .35 }, sat: { value: 1.08 }, contrast: { value: 1.04 }, warm: { value: .5 }, flash: { value: 0 }, flashCol: { value: new THREE.Color(1, 1, 1) }, seed: { value: 0 }, grain: { value: .025 }, expo: { value: 1 } });

// one sub-frame: scene with ink lines -> depth of field -> bloom, added into the accumulator
function subframe(scene, camera, o, weight) {
  renderer.setRenderTarget(rtScene); renderer.setClearColor(scene.background instanceof THREE.Color ? scene.background : 0x000000, 1); renderer.clear();
  outline.render(scene, camera);
  let src = rtScene;
  if (o.dof) {
    if (!bokeh) { bokeh = new BokehPass(scene, camera, { focus: 10, aperture: .002, maxblur: .01 }); bokeh.setSize(RW, RH); }
    bokeh.scene = scene; bokeh.camera = camera;
    bokeh.uniforms.focus.value = o.dof.focus; bokeh.uniforms.aperture.value = o.dof.aperture; bokeh.uniforms.maxblur.value = o.dof.maxblur ?? .012;
    bokeh.uniforms.aspect.value = camera.aspect;
    bokeh.render(renderer, rtA, src); src = rtA;
  }
  if (o.bloom !== false) { bloom.strength = o.bloom ?? .15; bloom.render(renderer, null, src, 0, false); }
  renderer.setRenderTarget(rtAcc); copyAdd.m.uniforms.tex.value = src.texture; copyAdd.m.uniforms.w.value = weight;
  renderer.autoClear = false; renderer.render(copyAdd.sc, cam2); renderer.autoClear = true;
}
// render a frame. setState(dt) poses the world at frame time + dt; subframes blend for motion blur.
export function renderFrame(scene, camera, setState, o = {}) {
  const n = o.sub ?? 1, spread = o.shutter ?? (1 / 60);
  renderer.setRenderTarget(rtAcc); renderer.setClearColor(0x000000, 1); renderer.clear();
  for (let i = 0; i < n; i++) {
    const dt = n === 1 ? 0 : (i / (n - 1) - .5) * spread;
    setState(dt);
    subframe(scene, camera, o, 1 / n);
  }
  const u = grade.m.uniforms; u.tex.value = rtAcc.texture;
  u.sepia.value = o.sepia || 0; u.vig.value = o.vig ?? .38; u.sat.value = o.sat ?? 1.1; u.contrast.value = o.contrast ?? 1.05; u.warm.value = o.warm ?? .5;
  u.flash.value = o.flash || 0; u.flashCol.value.set(o.flashCol || '#ffffff'); u.seed.value = (o.seed || 0) % 100; u.grain.value = o.grain ?? .02; u.expo.value = o.expo ?? 1;
  renderer.setRenderTarget(null); renderer.render(grade.sc, cam2);
}

// ---------- materials ----------
function gradTex(steps) {
  const d = new Uint8Array(steps.map(v => Math.round(v * 255)));
  const t = new THREE.DataTexture(d, steps.length, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
}
export const G3 = gradTex([.42, .74, 1]);          // characters: crisp cel bands
export const G5 = gradTex([.38, .55, .72, .88, 1]); // sets: softer painted shading
export const GH = gradTex([.74, .9, 1]);           // heads: stay white
const noOutline = { visible: false };
export function toon(color, o = {}) {
  const m = new THREE.MeshToonMaterial({ color, gradientMap: o.g || G5, map: o.map || null, transparent: !!o.transparent, opacity: o.opacity ?? 1,
    side: o.side || THREE.FrontSide, emissive: o.emissive || 0x000000, emissiveIntensity: o.ei ?? 1, emissiveMap: o.emissiveMap || null, alphaTest: o.alphaTest || 0 });
  m.userData.outlineParameters = o.outline === false ? noOutline : { thickness: o.ol ?? .0042, color: o.olc || [.09, .065, .05], alpha: 1, visible: true };
  if (o.depthWrite === false) m.depthWrite = false;
  return m;
}
export const basic = (o = {}) => { const m = new THREE.MeshBasicMaterial(o); m.userData.outlineParameters = noOutline; return m; };
export const INKM = toon('#1c1411', { g: G3, ol: .002 });

// ---------- meshes ----------
export function mesh(geo, mat, o = {}) {
  const m = new THREE.Mesh(geo, mat);
  if (o.p) m.position.set(...o.p);
  if (o.r) m.rotation.set(...o.r.map(v => v * D2R));
  if (o.s !== undefined) Array.isArray(o.s) ? m.scale.set(...o.s) : m.scale.setScalar(o.s);
  m.castShadow = o.cast !== false; m.receiveShadow = o.receive !== false;
  if (o.parent) o.parent.add(m);
  return m;
}
export const group = (parent, p, r) => { const g = new THREE.Group(); if (p) g.position.set(...p); if (r) g.rotation.set(...r.map(v => v * D2R)); if (parent) parent.add(g); return g; };
const UP = new THREE.Vector3(0, 1, 0), tmpV = new THREE.Vector3(), tmpQ = new THREE.Quaternion();
// cylinder with unit height, placed between a and b (for limbs, poles, wires)
export function placeBetween(m, a, b, radius) {
  tmpV.subVectors(b, a); const len = tmpV.length();
  m.position.copy(a).addScaledVector(tmpV, .5);
  m.scale.set(radius, Math.max(len, 1e-4), radius);
  m.quaternion.copy(tmpQ.setFromUnitVectors(UP, tmpV.normalize()));
}
export const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 10, 1);
export const sphere = (r = 1, w = 32, h = 20) => new THREE.SphereGeometry(r, w, h);
export const box = (x, y, z) => new THREE.BoxGeometry(x, y, z);
export const cyl = (rt, rb, h, s = 24) => new THREE.CylinderGeometry(rt, rb, h, s);

// ---------- textures ----------
export function ctex(w, h, paint, o = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); paint(x, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (o.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...o.repeat); }
  return t;
}
export function svgImage(svg, w, h) {
  return new Promise((res, rej) => {
    const img = new Image(w, h); img.onload = () => res(img); img.onerror = rej;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.startsWith('<svg') ? svg : `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${svg}</svg>`);
  });
}
export async function svgTex(svg, w, h) {
  const img = await svgImage(svg, w, h);
  return ctex(w, h, (x) => x.drawImage(img, 0, 0, w, h));
}
// painterly speckle over any canvas
export function speckle(x, w, h, n, cols, seed = 1, size = [1, 4]) {
  const r = rnd(seed);
  for (let i = 0; i < n; i++) { x.fillStyle = cols[Math.floor(r() * cols.length)]; const s = size[0] + r() * (size[1] - size[0]); x.globalAlpha = .08 + r() * .18; x.fillRect(r() * w, r() * h, s, s * (.6 + r())); }
  x.globalAlpha = 1;
}
export function brushStrokes(x, w, h, n, cols, seed = 2, len = [10, 40], wid = [2, 6], angle = 0, jit = .4) {
  const r = rnd(seed); x.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const px = r() * w, py = r() * h, l = len[0] + r() * (len[1] - len[0]), a = angle + (r() - .5) * jit;
    x.strokeStyle = cols[Math.floor(r() * cols.length)]; x.globalAlpha = .1 + r() * .22; x.lineWidth = wid[0] + r() * (wid[1] - wid[0]);
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  x.globalAlpha = 1;
}
