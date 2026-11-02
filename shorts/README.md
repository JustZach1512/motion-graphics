# Shorts: kit para Shorts animados en 3D

Cada carpeta es un vídeo. Todos comparten motor, personajes y herramientas.

| Carpeta | Vídeo |
|---|---|
| [`agloe/`](agloe/README.md) | *El pueblo que no existía* / *The Town That Didn't Exist* |
| [`el-turco/`](el-turco/README.md) | *La máquina que venció a Napoleón* |
| [`fantasma/`](fantasma/README.md) | *El ejército de goma* / *The Rubber Army* |

## Qué hay en el kit

| Carpeta | Qué hace |
|---|---|
| `engine/engine.js` | Render three.js: sombreado toon, contorno de tinta, profundidad de campo, resplandor, desenfoque de movimiento y etalonaje (3D a 720×1280, salida a 1080×1920). |
| `engine/characters.js` | Personajes de cabeza redonda: caras pintadas (con bocas que hablan), ropa, sombreros, poses y brazos con IK para coger cosas. Reparto en `CAST`. |
| `engine/props.js`, `engine/textures.js` | Objetos y texturas genéricos: árboles, vallas, nubes, vacas, coches, tienda, lámparas, mapas, etc. |
| `engine/runtime.js` | Subtítulos palabra a palabra, movimiento de bocas, cámara y `seek(t)`. Cada historia solo aporta sus escenarios, su reparto y su lista de planos. |
| `tools/voices.py` | Voces (Kokoro y Piper), tono con rubberband, cadena de voz y tiempos por palabra con el reconocedor Parakeet. |
| `tools/music.py` | Música original: compone en MIDI y la renderiza con FluidSynth y FluidR3 GM (licencia MIT), con secciones colocadas en momentos de la historia. |
| `tools/mix.py` | Mezcla voz, efectos CC0 y música (bajando la música cuando alguien habla) a −16 LUFS. |
| `tools/render.js`, `tools/stills.js` | Render con Chromium headless y fotogramas sueltos para revisar. |

## Hacer un vídeo

```bash
cd shorts && npm install
.venv/bin/python tools/voices.py <historia>/script.json MODELS <historia>/build && python3 tools/timings_js.py <historia>/build
.venv/bin/python tools/music.py <historia>/music.json <historia>/build          # si lleva música (pip install mido; apt install fluidsynth fluid-soundfont-gm)
node tools/render.js <historia> <historia>/build/silent.mp4 4
python3 tools/mix.py <historia>/build/vo.wav <historia>/build/cues.json ../skills/sound-effects/sfx <historia>/build [<historia>/build/music.wav <historia>/build/timings.json]
ffmpeg -i <historia>/build/silent.mp4 -i <historia>/build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart <historia>/build/<nombre>.mp4
```

Con `SHORT_LANG=en` y `?lang=en` se hace la versión en inglés, en `<historia>/build/en/`. En `agloe/README.md` están los modelos de voz y de dónde descargarlos.
