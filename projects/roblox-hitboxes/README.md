# Por qué las hitboxes de Roblox son una mierda

Vídeo de motion graphics de 90 s (1920×1080, 60 fps), en español, que explica con diagramas animados por qué en los juegos de Roblox le das a alguien y no cuenta (y por qué a ti te pegan desde 3 metros).

- **Vídeo final:** `roblox-hitboxes.mp4`
- **Fuente:** `video.html`, una página autocontenida que dibuja cualquier fotograma con `seek(t)`. Ábrela en el navegador para ver el vídeo con la música y moverte por la línea de tiempo.

## Guion (6 razones)

| Tiempo | Escena | Idea |
|---|---|---|
| 0–8 s | Cold open | Le das, lo ves, MISS. Luego a ti te pegan desde lejos: la hitbox de su espada es enorme. |
| 8–12 s | Título | La hitbox inunda la pantalla: «POR QUÉ LAS HITBOXES DE ROBLOX SON UNA MIERDA.» |
| 12–27 s | 01 Lo que ves ya pasó | Su ordenador → servidor → tu pantalla. Cada salto añade retraso. Le das a donde *estaba*. |
| 27–36 s | 02 Nadie rebobina | Shooters como CS o Valorant rebobinan el tiempo para comprobar el golpe. En Roblox eso no viene de serie. |
| 36–48 s | 03 Hitboxes de un solo frame | `GetPartBoundsInBox` se comprueba una vez; si llegas un frame tarde, no existe. La «solución»: hacerla enorme. |
| 48–58 s | 04 Tu hitbox va detrás de ti | El servidor crea la hitbox donde *estabas* mientras haces dash. |
| 58–68 s | 05 Se comprueba a saltos | 60 comprobaciones/s detecta el golpe, 20/s lo atraviesa. `.Touched` tiene el mismo problema. |
| 68–80 s | 06 ¿Quién decide si has dado? | Cliente: justo para ti, injusto para el otro y con trampas. Servidor: seguro pero con lag. |
| 80–90 s | Resumen | «No es solo tu wifi. Es cómo están hechas.» |

La hoja de tiempos completa (con cada sonido) está al principio del `<script>` en `src/video.src.html`.

## Datos y fuentes

- «La mayoría juega con 100–300 ms de latencia»: documentación oficial de Roblox, *Client-server runtime* (create.roblox.com/docs/projects/client-server).
- «Server Authority» predice el movimiento en el cliente, pero la detección de golpes con compensación de lag todavía no viene incluida (Roblox dice que quiere añadirla): documentación de *Server Authority* y el hilo *Server Authority – Tech Deep Dive* del DevForum (consultados en noviembre de 2026).
- El retraso de los paneles de la escena 01 está exagerado a propósito para que se vea, y así lo indica el propio vídeo.

## Sonido

- **Efectos:** sonidos reales CC0 de la skill `sound-effects` (Freesound y Kenney), colocados con `make_sound.py` → `cues.json` + `swaps.json`. Dos de ellos están recortados en `sfx-local/` (mismo origen CC0). Créditos opcionales en `CREDITS.txt`.
- **Música:** sintetizada en código para este vídeo (`buildAudio` en `video.html`, 120 BPM, La menor). No tiene licencia de terceros. Las pistas de Mixkit que sugiere la skill no se pudieron descargar desde este entorno; si quieres otra música, cambia `out/music.wav` por la pista y repite la pasada de sonido.
- Mezcla medida en el MP4 exportado: unos −16 LUFS integrados con el pico real por debajo de −4 dBFS (los números exactos están en `SOUND.md`).

## Volver a renderizar

Hace falta Node con Playwright (Chromium) y ffmpeg. Para la pasada de sonido, Python con `librosa soundfile numpy scipy matplotlib`.

```bash
python3 build.py                                   # src/video.src.html + fonts/embed.css -> video.html
node render.mjs video.html checks/sheet.png --stills 2,9.5,24,30.5,40.5,51.5,61.5,77,88   # fotogramas de control
node render.mjs video.html out/final.mp4 60 3 4    # 60 fps, desenfoque de movimiento x3, 4 procesos
node audio.mjs video.html out/music.wav 90.004     # la música, de la misma duración que el vídeo (para que empiece en 0)
python3 make_sound.py                              # efectos recortados, manifest local, cues.json, swaps.json
python ../../skills/sound-effects/scripts/sound_pass.py --video out/final_silent.mp4 --cues cues.json \
  --music out/music.wav --manifest manifest.local.json --swaps swaps.json --music-db -4 --out out/sound
```

`out/sound/after.mp4` es el vídeo final con sonido.

## Licencias

Fuentes Inter Tight, JetBrains Mono e Instrument Serif: SIL Open Font License (incrustadas en `fonts/embed.css` y `video.html`). Efectos de sonido: CC0 1.0. Los personajes son figuras de bloques genéricas; el vídeo no usa logos ni recursos de Roblox.
