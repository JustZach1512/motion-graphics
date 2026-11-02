# El pueblo que no existía (Short 9:16)

Short animado de unos 69 s, al estilo de los canales de historias curiosas con dibujos en 3D:

- personajes de cabeza redonda en escenarios 3D con sombreado de dibujo animado;
- un narrador que cuenta en presente, y voces distintas para los personajes cuando hablan;
- subtítulos palabra a palabra;
- un giro y un remate final.

**Historia:** en los años 30, los cartógrafos Otto G. Lindberg y Ernest Alpers se inventan el pueblo de Agloe en un cruce perdido de Nueva York, como trampa para pillar a quien les copie los mapas. Años después aparece Agloe en el mapa de la competencia, y resulta que alguien ha abierto allí la "Agloe General Store", porque lo vio en el mapa.

**Vídeo final:** `build/el-pueblo-que-no-existia.mp4`. Son 1080×1920 a 30 fps. El 3D se renderiza a 720×1280 (la resolución de los vídeos de referencia) y se escala; los subtítulos y los gráficos 2D van a 1080 nítidos.

## Para publicarlo en YouTube

- **Título:** `Se inventaron un pueblo… y alguien abrió una tienda allí 🐄`
- **Descripción:**
  > En los años 30, dos cartógrafos de Nueva York dibujaron un pueblo que no existía para pillar a los que copiaban sus mapas. No salió como esperaban. #historia #curiosidades #shorts #mapas
- **Música:** el vídeo **no lleva música**. Los vídeos de referencia sí tienen una base musical constante. Añádela al subir el Short con el botón "Añadir sonido" de YouTube, que tiene licencia para Shorts, y ponla baja, por debajo de la voz.
- **Créditos:** no hacen falta. Los efectos son CC0, y en `build/CREDITS.txt` tienes la lista por si te preguntan. Las voces son sintéticas.

## Voces

| Personaje | Motor y voz | Ajuste |
|---|---|---|
| Narrador | Kokoro `em_santa` (la más expresiva de las probadas) | +2 semitonos, velocidad 1,15 |
| Otto | Piper `es_ES-davefx-medium` | +1 semitono |
| Ernest | Kokoro `em_alex` | +4 semitonos (más joven) |
| La competencia | Kokoro `em_alex` | −3 semitonos, más lento |
| El tendero | Piper `es_MX-claude-high` | −4 semitonos, más lento |

El tono se cambia con rubberband, conservando los formantes para que no suene a ardilla. Todas las voces pasan además por una cadena de ecualización, de-esser y compresión.

Cada frase generada se transcribe con el reconocedor de voz Parakeet:

- comprueba que se entiende (el resultado está en `build/voice_report.txt`);
- da los tiempos reales de cada palabra, con los que se sincronizan los subtítulos y los cortes.

## Cómo está hecho

| Archivo | Qué hace |
|---|---|
| `script.json` | El guion con quién dice cada frase, y la voz, velocidad y tono de cada personaje. |
| `tools/voices.py` | Genera las voces (Kokoro y Piper), las procesa y las alinea palabra a palabra con Parakeet. |
| `src/engine.js` | Motor three.js: sombreado toon, contorno de tinta, profundidad de campo, resplandor, desenfoque de movimiento y etalonaje. |
| `src/characters.js` | Personajes 3D: cabeza esférica con la cara pintada encima (ojos, cejas, bocas que hablan), cuerpo con la ropa pintada, extremidades de palo, sombreros 3D y poses. |
| `src/textures.js` | Texturas pintadas por código: madera, papel pintado, hierba, campos de cultivo, ladrillo, el cartel de la tienda y el mapa de carreteras. |
| `src/props.js` | Objetos: tienda, coche de los años 30, vacas, mesa de dibujo, lámparas, ratonera, lupa, billetes y letras 3D. |
| `src/sets.js` | Escenarios: oficina, oficina rival, calle de Nueva York, cruce en el campo, mapa sobre la mesa, sueño de billetes y mesa con la ratonera. |
| `src/shots.js` | Lista de planos. Cada plano empieza en una palabra de la narración. |
| `src/main.js` | Monta cada fotograma: posa el plano, renderiza el 3D y dibuja los subtítulos encima. |
| `tools/render.js` | Render con Chromium headless (WebGL) y codificación con ffmpeg. |
| `tools/mix.py` | Mezcla la voz con efectos CC0 de `skills/sound-effects/sfx` a −16 LUFS. |

### Volver a generarlo

```bash
cd shorts/agloe
npm install
# modelos (desde GitHub releases), en una carpeta MODELS:
#   kokoro-v1.0.onnx y voices-v1.0.bin        github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)
#   vits-piper-es_ES-davefx-medium, vits-piper-es_MX-claude-high,
#   sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 github.com/k2-fsa/sherpa-onnx/releases (tts-models, asr-models)
python3 -m venv .venv && .venv/bin/pip install kokoro-onnx piper-tts sherpa-onnx soundfile
.venv/bin/python tools/voices.py script.json MODELS build     # ya están en build/ si no cambias el guion
python3 tools/timings_js.py build
node tools/render.js build/silent.mp4 4                      # unos 35 min con CPU (sin GPU)
python3 tools/mix.py build/vo.wav build/cues.json ../../skills/sound-effects/sfx build
ffmpeg -i build/silent.mp4 -i build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest \
  -movflags +faststart build/el-pueblo-que-no-existia.mp4
```

Para revisar planos sueltos: `node tools/stills.js index.html <carpeta> 1.5 12.3 …` saca fotogramas en esos segundos.

## English version (for the English channel)

`script.en.json` holds the English script: same structure and same shots, with American voices from Kokoro, which sound noticeably more natural than the Spanish ones.

| Character | Voice |
|---|---|
| Narrator | `am_fenrir` (+1.5 semitones) |
| Otto | `am_puck` |
| Ernest | `am_michael` (+3, younger) |
| The competition | `bm_george` (a posh Brit, −2) |
| The grocer | `am_santa` (old country fellow) |

The shots are written against the Spanish narration. `ANCHORS` in `src/shots.js` maps each anchor word to its English counterpart, and the on-screen text (title, stamp, poster, map credit) switches with `?lang=en`.

**Final video:** `build/en/the-town-that-didnt-exist.mp4`

- **Title:** `They invented a fake town… then someone opened a store there 🐄`
- **Description:**
  > In the 1930s, two New York mapmakers drew a town that didn't exist to catch anyone copying their maps. It didn't go as planned. #history #historyfacts #shorts #maps

```bash
.venv/bin/python tools/voices.py script.en.json MODELS build/en && python3 tools/timings_js.py build/en
SHORT_LANG=en node tools/render.js build/en/silent.mp4 4
python3 tools/mix.py build/en/vo.wav build/en/cues.json ../../skills/sound-effects/sfx build/en
ffmpeg -i build/en/silent.mp4 -i build/en/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest \
  -movflags +faststart build/en/the-town-that-didnt-exist.mp4
```

### Grabar tu propia voz

Si la grabas tú, como hace el canal de referencia:

1. Guárdala como `build/vo.wav`.
2. Pasa cada frase por `tools/voices.py`, o escribe `build/timings.json` con el mismo formato.

Los planos, los subtítulos y el movimiento de las bocas se recolocan solos.
