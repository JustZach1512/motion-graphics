# Claude motion reel

A 15-second, 128 BPM promo made with the [`explainer-high-energy`](../../skills/explainer-high-energy/SKILL.md) skill. The brief was "make a motion graphic about how good you are at making motion graphics."

- `demo.html`: the whole video as one self-contained page with fonts embedded. Open it to scrub and play it live, with sound.
- `demo.mp4`: the final render: 1920×1080, 60 fps, motion blur and a synthesised soundtrack.

Render it again with the skill's `render.mjs`:

```
node render.mjs demo.html demo.mp4 60 6 4
```
