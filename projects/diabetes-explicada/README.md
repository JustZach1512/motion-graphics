# La diabetes explicada (para niños)

Un vídeo animado de ~6 minutos, en español, que explica la diabetes tipo 1 a un niño de 8 años:
qué es la energía y la glucosa, la insulina como «llave», por qué el páncreas deja de fabricarla,
cómo se pincha la insulina (5 pasos), cómo se mide el azúcar, qué son la hipo y la hiper,
qué y cómo comer, y que puede seguir haciendo todo lo que le gusta.

- `diabetes.mp4` — el vídeo final (1920×1080, con voz, subtítulos, efectos y música).
- `diabetes.html` — la misma animación en el navegador: se puede pausar y saltar a cualquier parte
  (barra espaciadora = play/pausa). Si `diabetes_audio.m4a` está en la misma carpeta, suena sincronizado.

Es material divulgativo: no sustituye las indicaciones del equipo médico (dosis, objetivos de glucosa,
tratamiento de la hipo). Ese aviso aparece también al final del vídeo.

## Cómo está hecho

Sigue el contrato de página de `skills/explainer-default` (una página HTML que dibuja cualquier
fotograma con `seek(t)`) y los efectos del skill `skills/sound-effects`.

| Archivo | Qué hace |
|---|---|
| `guion.json` | El guion: una línea de narración por frase, agrupadas por capítulo. |
| `vo/*.wav` | La voz de cada línea (Kokoro TTS, voz `ef_dora`, velocidad 0.88), comprobada con Whisper. |
| `tts/` | Scripts de la voz: `gen_vo.py` genera cada línea con Kokoro (sherpa-onnx) y la transcribe con Whisper para comprobar que se entiende. Modelos en `tts/models/` (de las releases `tts-models` y `asr-models` de k2-fsa/sherpa-onnx). |
| `build.py` | Calcula la línea de tiempo a partir de la voz (y el momento de cada palabra por las pausas), incrusta fuente e iconos y genera `diabetes.html`, `timeline.json` y `vo_track.wav`. |
| `template.html` | Toda la animación: personajes en SVG, escenas, subtítulos y los momentos de sonido (`CUES`). |
| `export_cues.mjs` | Saca los momentos de sonido de la página a `cues.json`. |
| `mix.py` | Mezcla voz + efectos CC0 + una música suave que baja cuando habla la voz. |
| `render.mjs` | Renderiza la página a MP4 (copiado de `skills/explainer-default`). |

```
python3 build.py path/to/fluent-emoji-flat/icons.json   # npm pack @iconify-json/fluent-emoji-flat
node export_cues.mjs
python3 mix.py                                          # necesita numpy y soundfile
node render.mjs diabetes.html out/diabetes.mp4 30 2 4   # vídeo sin audio -> out/diabetes_silent.mp4
ffmpeg -i out/diabetes_silent.mp4 -i out/mix.wav \
  -af acompressor=threshold=0.125:ratio=3:attack=4:release=150:knee=4,loudnorm=I=-16:TP=-4.5:LRA=11 \
  -ar 48000 -c:v copy -c:a aac -b:a 192k -shortest diabetes.mp4
```

Créditos en `CREDITS.txt`.
