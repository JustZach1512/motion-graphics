# El pueblo que no existía (Short 9:16)

Short animado de 60 s al estilo de los canales de historias curiosas con dibujos: personajes de cabeza redonda, voz en off que cuenta en presente, subtítulos palabra a palabra, un giro y un remate final.

**Historia:** en los años 30, Otto G. Lindberg y Ernest Alpers, que hacían mapas de carreteras en Nueva York, se inventan el pueblo de Agloe como trampa para pillar a quien les copie los mapas. Años después aparece Agloe en el mapa de la competencia, y resulta que alguien ha abierto allí la "Agloe General Store", porque lo vio en el mapa.

Vídeo final: `build/el-pueblo-que-no-existia.mp4`. Son 1080×1920 a 30 fps y 60,3 s. La voz y los efectos están mezclados a −16,7 LUFS, con el pico real a −4,3 dBFS.

## Para publicarlo en YouTube

- **Título:** `Se inventaron un pueblo… y alguien abrió una tienda allí 🐄`
- **Descripción:**
  > En los años 30, dos cartógrafos de Nueva York dibujaron un pueblo que no existía para pillar a los que copiaban sus mapas. No salió como esperaban. #historia #curiosidades #shorts #mapas
- **Música:** el vídeo **no lleva música**. Añádela al subir el Short con el botón "Añadir sonido" de YouTube. Esa biblioteca tiene licencia para Shorts. Ponla baja, por debajo de la voz.
- **Créditos:** no hacen falta, porque todos los efectos son CC0. En `build/CREDITS.txt` tienes la lista por si una plataforma te pregunta de dónde salen.

## Cómo está hecho

| Archivo | Qué hace |
|---|---|
| `script.json` | El guion, frase a frase, con la voz, la velocidad y la pausa de cada línea. |
| `tools/voiceover.py` | Genera la voz con Kokoro TTS (`em_alex`, y `em_santa` para la respuesta de la competencia) y calcula cuándo cae cada palabra (`build/timings.json`). |
| `src/lib.js` | Easing, cámara con paralaje y profundidad de campo, ruido y texturas procedurales. |
| `src/art.js` | Personajes (poses, ojos, bocas, sombreros), vacas, la tienda, el coche y el resto de accesorios. Todo en SVG. |
| `src/scenes.js` | Escenarios: oficina, oficina rival, Nueva York, campo con cruce, mapa visto desde arriba y el sueño de billetes. |
| `src/shots.js` | La lista de planos. Cada plano empieza en una palabra de la narración, así que si cambias la voz los cortes la siguen. |
| `index.html` | Monta cada fotograma y los subtítulos. Ábrelo en un navegador para verlo con el deslizador. |
| `tools/render.js` | Renderiza en paralelo con Chromium headless, con desenfoque de movimiento de 2 subfotogramas. |
| `tools/mix.py` | Mezcla la voz con efectos CC0 de `skills/sound-effects/sfx` y la deja en −16 LUFS. |

### Volver a generarlo

```bash
cd shorts/agloe
npm install                                   # fuentes (Montserrat, Rye, Special Elite, Alfa Slab One)
# voz (opcional: build/vo.wav y build/timings.json ya están en el repo)
python3 -m venv .venv && .venv/bin/pip install kokoro-onnx soundfile
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
.venv/bin/python tools/voiceover.py script.json . build
python3 tools/timings_js.py build
# vídeo y audio
node tools/render.js build/silent.mp4 4 30      # unos 7 min con 4 núcleos
python3 tools/mix.py build/vo.wav build/cues.json ../../skills/sound-effects/sfx build
ffmpeg -i build/silent.mp4 -i build/mix.wav -map 0:v -map 1:a -c:v libx264 -crf 20 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart build/el-pueblo-que-no-existia.mp4
```

### Grabar tu propia voz

La voz es sintética. Si la grabas tú, como hace el canal de referencia, guárdala como `build/vo.wav` y escribe los tiempos de cada palabra en `build/timings.json`, con el mismo formato. Los planos y los subtítulos se recolocan solos.
