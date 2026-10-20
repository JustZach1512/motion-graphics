# Example: VERITY (Minecraft mod teaser)

An 18 s, 16:9, 120 BPM teaser made with this skill for **Verity**, the Minecraft horror companion from ThatMob's *VERITY™* series. On-screen copy is in Spanish. It's a fan piece, not affiliated with ThatMob or the mod authors.

`verity.html` is the whole video: one self-contained page (fonts and sound effects inlined). Open it in a browser to scrub and play it, or render it with the skill's `render.mjs`:

```
node render.mjs verity.html verity.mp4 60 6 4
```

## The idea

It starts cute and ends in horror. A friendly yellow smiley becomes the demon, and the soundtrack goes from a music-box groove to a tape stop and a drone.

| Time | Scene | What carries into the next one |
|---|---|---|
| 0.0 | Spark: a yellow pixel on a block grid stretches into a line | the line floods the frame yellow |
| 2.0 | Brand slam: `VERITY.`, weight 150 → 900, *tu nuevo mejor amigo.* | the full stop grows into a black flood |
| 4.0 | The box drops, shakes and opens, and Verity rises and says hi in Minecraft chat | Verity flies through the lens |
| 6.0 | Kinetic triplet: `HABLA.` / `TE SIGUE.` / *te observa.* in a camera viewfinder | the viewfinder brackets contract into a chat card |
| 9.5 | AI chat: *verity, ¿dónde estás?* → *detrás de ti :)*, with a flashlight battery toast | the `:)` turns upright and fills the frame |
| 12.0 | The face lands on a towering demon, and Minecraft blocks ripple red at each step | hard cut on the downbeat |
| 14.0 | `CORRE.` slams on red | the red frame collapses to a dot and a ring |
| 15.5 | End card: `VERITY` with Verity as the full stop, whose eyes turn red on the last beat | — |

## Facts used

Only things the public sources say: Verity is a yellow smiley that works as an AI assistant you can talk to; it arrives in its own box; it follows the player; it can turn into the Verity Demon when its mental state breaks; the Bedrock mod has a flashlight whose battery drains; there are mods for Java and Bedrock. There are no download counts or other stats on screen. The chat lines are example content.

## Credits

- Fonts (SIL OFL): Inter Tight, Instrument Serif, JetBrains Mono, Pixelify Sans, Rock Salt.
- Music: synthesised in the page (`buildAudio`).
- Sound effects (CC0 1.0, from `skills/sound-effects/sfx/`): scary riser by [Xinematix](https://freesound.org/people/Xinematix/sounds/396160/), short riser by [syntheffects](https://freesound.org/people/syntheffects/sounds/685256/), dramatic hit by [qubodup](https://freesound.org/people/qubodup/sounds/222517/), glitch transition by [brktkrgll](https://freesound.org/people/brktkrgll/sounds/856168/), whooshes by [florianreichelt](https://freesound.org/people/florianreichelt/sounds/683101/) and [CVLTIV8R](https://freesound.org/people/CVLTIV8R/sounds/810485/), and impacts and glitch by [Kenney](https://kenney.nl/assets).
- VERITY™ is ThatMob's. This is fan-made.
