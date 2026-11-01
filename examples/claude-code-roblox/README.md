# Claude Code crea un juego (motion graphics, 60 s)

Una persona le pide a Claude Code un juego de Roblox. Claude le pregunta dónde construirlo, la persona elige **Roblox Studio** y **solo código**, y Claude hace las dos versiones. En medio, la mascota de Claude Code escribe el script en Luau.

- `claude-code-roblox.mp4`: el vídeo final (1920×1080, 60 fps, con sonido).
- `claude-code-roblox.html`: la misma animación en una sola página. Ábrela en el navegador para reproducirla o moverte por la línea de tiempo (barra espaciadora = play/pausa).
- `video.src.html`: el código fuente de la animación. `build.py` le añade las fuentes y los efectos de sonido y genera `claude-code-roblox.html`.
- `render.mjs`: convierte la página en MP4 (copia del script de `skills/explainer-default`).

## Escenas

| Tiempo | Escena |
|---|---|
| 0–4 s | «Todo empieza con una idea.» |
| 4–10 s | Una persona frente al portátil imagina un obby; la idea entra en la pantalla y empieza a escribir |
| 10–19 s | Claude Code: el prompt, «Pensando…», la pregunta (Roblox Studio / Solo código) y se marcan las dos opciones |
| 19–28 s | La cámara entra en la mascota; la mascota teclea y el script `Monedas.server.lua` se escribe solo |
| 28–40 s | Roblox Studio: aparecen 12 plataformas, monedas y checkpoints; clic en «Jugar» y el avatar completa el obby |
| 40–50 s | «…o solo con código.»: Claude escribe `index.html`, `juego.js` y `jugador.js`, y en el navegador se juega un mini plataformas con la mascota |
| 50–60 s | «Tú pones la idea. Claude Code escribe el código.» y la tarjeta final |

## Volver a generarlo

```
python3 build.py                                              # -> claude-code-roblox.html
npm i playwright                                              # si no lo tienes (y ffmpeg en el PATH)
node render.mjs claude-code-roblox.html borrador.mp4 30 1 4   # borrador rápido
node render.mjs claude-code-roblox.html claude-code-roblox.mp4 60 4 4   # final con desenfoque de movimiento
```

Los textos están en `video.src.html` (`PROMPT`, `REPLY2`, `makeTitle(...)`, `LUA`, `JS`) y los tiempos en el objeto `T`.

## Notas

- La interfaz de Claude Code y la de Roblox Studio están redibujadas de forma simplificada (no son capturas). No se usan logotipos; los nombres van como texto.
- El código Luau y los números de líneas o archivos son contenido de ejemplo.
- La música está sintetizada en la página. Si quieres una pista propia, cárgala en `buildAudio` (ver `skills/explainer-default/SKILL.md`). Créditos de los efectos en `CREDITS.txt` (todos CC0).
