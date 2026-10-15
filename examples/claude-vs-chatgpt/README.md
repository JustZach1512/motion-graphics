# Claude vs ChatGPT (… and Meta takes it)

A 15-second, 1920×1080, 60 fps cartoon fight made with the [`explainer-high-energy`](../../skills/explainer-high-energy/SKILL.md) method: one HTML page whose `seek(t)` draws any frame, rendered to MP4 with motion blur and its own soundtrack.

The Claude and ChatGPT logos fight for first place across interface scenes. While they fight, Meta sneaks in and takes the trophy.

- `claude-vs-chatgpt.mp4`: the final video (audio normalised to −16 LUFS).
- `claude-vs-chatgpt.html`: the same animation, live. Open it in a browser and press Play or scrub. Everything is embedded: fonts, sounds and code.

## Beat sheet (160 BPM, one beat = 0.375 s)

| Time | Scene | What happens |
|---|---|---|
| 0.0 | VS screen | Orange and green panels slam in. "VS" at 0.375, "ROUND 1" at 0.75, "¡PELEA!" at 1.125, then it zooms through the camera |
| 1.5 | Chat window | "Yo soy el #1" / "¿Perdona? El #1 soy YO". Claude's spring glove punches the bubble into ChatGPT (¡PUM!). ChatGPT fires the three typing dots back (¡ZAS!). They charge at each other, and the ¡BAM! burst floods the screen yellow |
| 4.5 | Ranking card | The two rows swap the #1 spot on every hit, faster and faster. Meta watches from #4. The last hit knocks the trophy loose |
| 7.5 | Podium | The trophy lands on #1. They play tug-of-war ("¡MÍO!"), then roll away in a cartoon fight cloud |
| 10.5 | — | Record scratch and freeze: "¡UN NUEVO RETADOR!". Meta tiptoes in, grabs the trophy and hops onto #1 |
| 12.0 | — | The cloud clears and the fighters see Meta ("?" "?"). Fanfare, confetti, K.O. "¡META SE LO QUEDA!" … "MIENTRAS ELLOS PELEABAN…" |

## Sound

- **Music**: an arcade fight track synthesised in code (Web Audio) on the same timeline as the visuals. It runs in A minor with an octave bass, a pulse-wave lead, stabs and drums. It stops dead on the record scratch, switches to sneaky pizzicato for Meta, then plays a victory fanfare in A major.
- **Sound effects**: real recordings from this repo's bundled library in [`skills/sound-effects/sfx`](../../skills/sound-effects/sfx/manifest.json). They are all **CC0 1.0** (Kenney impact, interface and digital packs, plus Freesound uploads by SamsterBirdies, Kinoton, qubodup, peoplearehappy, florianreichelt, dave.des, migoreng1, Sadiquecat, Breviceps, jcallison, Sky_Motion, LegitCheese, syntheffects and Squirrel_404). `build.py` lists exactly which file each sound key uses.

## Logos

The logos are hand-drawn cartoon approximations, made for parody and commentary. They are not the official artwork. Claude, ChatGPT and Meta are trademarks of their owners.

## Rebuild / re-render

```
npm i                      # playwright
python3 build.py           # src/ + fonts + sounds -> claude-vs-chatgpt.html
node render.mjs claude-vs-chatgpt.html draft.mp4 30 1 4              # quick draft
node render.mjs claude-vs-chatgpt.html claude-vs-chatgpt.mp4 60 6 4  # final, motion blur
```

Source lives in `src/`:

- `core.js`: the helpers, the fighter rig (12 facial moods, gloves, spring arms, dizzy stars) and the comic bursts.
- `scenes.js`: the beat sheet and the five scenes.
- `audio.js`: the soundtrack.

Fonts are Bangers, Press Start 2P and Inter (SIL OFL).
