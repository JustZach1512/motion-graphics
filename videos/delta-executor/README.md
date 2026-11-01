# Delta Executor, explicado (motion graphics)

Vídeo explicativo de 2:06 (16:9, 1920×1080, 60 fps) en español: qué es el executor Delta para Roblox, qué hacen los scripts en los juegos, cómo funciona por dentro y por qué el anticheat de Roblox no siempre lo detecta. El vídeo también deja claro que no es indetectable y cuáles son los riesgos.

Es un vídeo **educativo y conceptual**. No explica cómo descargar, instalar ni usar Delta, ni da detalles técnicos para saltarse un anticheat.

## Archivos

| Archivo | Qué es |
|---|---|
| `delta-executor.mp4` | El vídeo final con audio. |
| `delta-executor.html` | La animación completa. Ábrela en el navegador para verla y moverte por la línea de tiempo (Play / Espacio). Lleva las fuentes y los sonidos incrustados. |
| `src.html` | El código fuente de la animación (sin fuentes ni sonidos incrustados). Es el archivo que se edita. |
| `build.mjs` | Inserta las fuentes y los efectos de sonido en `src.html` y genera `delta-executor.html`. |
| `render.mjs` | Convierte la página en MP4 (renderizador de la skill `explainer-default`, con un limitador añadido al audio). |

## Volver a generarlo

Necesitas Node 18+, ffmpeg y Playwright (`npm i playwright`).

```
node build.mjs                                                         # src.html -> delta-executor.html
node render.mjs delta-executor.html check.png --stills 3.5,15,40,75    # fotogramas sueltos para revisar
node render.mjs delta-executor.html borrador.mp4 30 1 4                # borrador rápido
node render.mjs delta-executor.html delta-executor.mp4 60 4 4          # final con desenfoque de movimiento
```

Para cambiar un texto o un tiempo, edita `src.html`; cada escena es un bloque `// ===== …` y todos los tiempos de escena están en el objeto `T`.

## Guion

| Tiempo | Escena | En pantalla |
|---|---|---|
| 0:00 | Intro | «Delta Executor»: qué hace · cómo funciona · por qué el anticheat no lo detecta |
| 0:07 | Qué es | «Un executor mete tus propios scripts dentro de un juego de Roblox.» |
| 0:11 | Demo en el móvil | Botón flotante, panel del executor, se teclea `WalkSpeed = 100`, el personaje acelera |
| 0:21 | Parte 1 | ¿Qué hace en los juegos? Auto-farm, ESP, velocidad y vuelo, teletransporte |
| 0:35 | Parte 2 | ¿Cómo funciona? 1) app de Roblox modificada (con key temporal) 2) el juego carga sus scripts en la VM Luau 3) Delta mete tu script ahí con más permisos 4) añade funciones extra |
| 0:58 | Cliente y servidor | La posición y los eventos remotos sin comprobar pasan; lo que comprueba el servidor (Robux, compras, datos) no |
| 1:10 | Parte 3 | ¿Por qué el anticheat no lo detecta? |
| 1:13 | Hyperion | Roblox compró Byfron en 2022; Hyperion llegó al cliente de Windows en 2023 |
| 1:20 | Razón 1 | Se diseñó para PC; en móvil la protección ha sido históricamente más limitada |
| 1:26 | Razón 2 | No entra desde fuera: Delta ya viene dentro de la app y puede manipular las comprobaciones |
| 1:34 | Razón 3 | Para el servidor eres un jugador más: solo ve peticiones |
| 1:39 | Razón 4 | El gato y el ratón: cada actualización de Roblox obliga al executor a adaptarse |
| 1:46 | Pero no es invisible | Baneo diferido, a menudo en oleadas |
| 1:53 | Riesgos | Baneo, descargas falsas con malware, scripts que roban cuentas; va contra los Términos de Uso |
| 2:00 | Cierre | «Indetectable hoy no significa seguro mañana.» |

## Datos y fuentes

- Roblox anunció la compra de Byfron el 11 de octubre de 2022: [Welcoming Byfron to Roblox (DevForum)](https://devforum.roblox.com/t/welcoming-byfron-to-roblox/2018233).
- Hyperion salió con el cliente de 64 bits de Windows en mayo de 2023, y si detecta software que interfiere con el cliente lo cierra: [Hyperion (wiki de Roblox)](https://breezewiki.discard.no/roblox/wiki/Hyperion).
- Que Delta se centra en Android e iOS y se activa con una key temporal lo cuentan guías de terceros (por ejemplo [ExitLag](https://www.exitlag.com/blog/delta-roblox-ios/)). No hay fuente oficial de Delta. Por eso el vídeo no da cifras de usuarios, porcentajes de detección ni duración exacta de la key.
- «Protección en móvil históricamente más limitada» y «baneos en oleadas» se dicen con matices porque no hay ningún comunicado oficial de Roblox que lo detalle para Delta.

## Créditos

- Fuentes: Geist y Geist Mono (SIL Open Font License, ver `OFL-Geist.txt`).
- Música: sintetizada en el propio código (`buildAudio`), sin muestras externas.
- Efectos de sonido (CC0, del kit de la skill `sound-effects`):
  - "Whoosh" by qubodup (https://freesound.org/people/qubodup/sounds/60013/), CC0
  - "Classic Click" by adh.dreaming (https://freesound.org/people/adh.dreaming/sounds/671105/), CC0
  - "POP SFX Neutral" by ethernel0 (https://freesound.org/people/ethernel0/sounds/776016/), CC0
  - "Cinematic Riser #3 subtle" by BeaconStudio (https://freesound.org/people/BeaconStudio/sounds/859482/), CC0
  - "soft_impact3" by peoplearehappy (https://freesound.org/people/peoplearehappy/sounds/841274/), CC0
  - "Click / Tick" by Squirrel_404 (https://freesound.org/people/Squirrel_404/sounds/683048/), CC0
- No se usan logos de Roblox ni de Delta: los nombres aparecen solo como texto.
