# Nintendo Switch 2: anuncio conceptual (fan-made)

Un anuncio de 30 segundos de la Nintendo Switch 2 hecho entero con código: la consola modelada en 3D con sus proporciones reales, los Joy-Con 2 que se acoplan con imanes, la pantalla más grande, los tres modos de juego, GameChat con el botón C y, como siempre, el cierre con el logo de Nintendo.

> **Anuncio conceptual hecho por fans.** No es oficial ni está afiliado a Nintendo, y así lo dice la letra pequeña del último plano. Nintendo, Nintendo Switch 2 y Joy-Con son marcas de Nintendo. Los logotipos están redibujados con formas simples y tipografías libres; no son los archivos oficiales.

## Archivos

| Archivo | Qué es |
|---|---|
| `switch2-ad.mp4` | El vídeo final: 1920×1080, 60 fps, con motion blur y sonido. |
| `switch2-ad.html` | La misma pieza en una sola página. Ábrela en el navegador, pulsa ▶ (o la barra espaciadora) y arrastra la barra para recorrerla. |
| `src/ad.js` | Todo el anuncio: el modelo 3D, los planos, los textos, la pantalla del juego y la banda sonora. |
| `src/index.html` | La plantilla de la página. |
| `build.mjs` | Junta three.js, las fuentes y los sonidos en `switch2-ad.html`. |
| `render.mjs` | El renderizador de las skills `explainer-*` (Playwright + ffmpeg), con SwiftShader activado para máquinas sin GPU. |

## Guion (120 BPM, un compás = 2 s)

| t (s) | Imagen | Texto |
|---|---|---|
| 0–2 | Se enciende una luz: el Joy-Con 2 izquierdo en la oscuridad | «Ese clic que ya conoces…» |
| 2–4 | El Joy-Con 2 derecho, con su raíl magnético rojo | |
| 4–6 | Los dos Joy-Con 2 se acercan, flotan y los imanes ganan | |
| 6 | **Clic.** Destello en las uniones | «JOY-CON 2 · …ahora es magnético.» |
| 10–14 | Se enciende la pantalla: logo de arranque y juego | «Una pantalla más grande.» 7,9 pulgadas · 1080p · HDR · Hasta 120 Hz |
| 14–16 | En la base, el juego en la tele | «MODO TELEVISOR · En la tele.» Hasta 4K |
| 16–18 | De pie sobre la mesa, pantalla partida, un Joy-Con 2 por jugador | «MODO SOBREMESA · En la mesa.» |
| 18–20 | En las manos | «MODO PORTÁTIL · En tus manos.» |
| 20–21.6 | Primer plano del botón C, que se pulsa | «NUEVO BOTÓN C · Pulsa C» |
| 21.6–23.6 | Aparecen los amigos en GameChat; la cámara entra en la pantalla | «GAMECHAT · Habla con tus amigos.» |
| 24 | El icono de Switch se cierra con un clic: NINTENDO SWITCH 2 | «YA DISPONIBLE» |
| 27–30 | Fondo blanco y el logo rojo de Nintendo | letra pequeña de fan-made |

## Volver a generarlo

```
npm i
node build.mjs                                          # crea switch2-ad.html
node render.mjs switch2-ad.html check.png --stills 3,6.1,12.5,15,17,19,20.7,22.6,25.8,28.5
node render.mjs switch2-ad.html draft.mp4 30 1 4        # borrador rápido, sin motion blur
node render.mjs switch2-ad.html switch2-ad.mp4 60 2 4   # final, 60 fps con motion blur (sin GPU tarda ~45 min)
```

Para cambiar los textos, los colores o el ritmo, todo está en `src/ad.js`: los planos son las funciones `shot*`, los textos están en `drawFx` y la música en `buildAudio`, todos con los mismos tiempos del guion de arriba.

## Datos de la consola

Sacados de la ficha técnica de Nintendo: 272 × 116 × 13,9 mm con los Joy-Con 2 puestos, pantalla LCD de 7,9 pulgadas a 1920×1080 con HDR10 y hasta 120 Hz, y hasta 4K en modo televisor. Los Joy-Con 2 de serie son negros con el aro bajo el stick y el raíl magnético en azul claro (izquierdo) y rojo claro (derecho), y el botón C está debajo del botón HOME. El juego que sale en pantalla es genérico, dibujado en el propio código.

## Créditos

- [three.js](https://threejs.org) r170, licencia MIT.
- Tipografías Montserrat y Poppins, SIL Open Font License 1.1 (licencias en `assets/fonts/`).
- Efectos de sonido CC0 de la skill [`sound-effects`](../../skills/sound-effects/LICENSES.md): «Classic Click» de adh.dreaming, un clic de Mediasaur, «soft_impact3» de peoplearehappy, un golpe de qubodup, «Whoosh» de qubodup, whooshes de MeanRaccoon y Halgrimm, «Cinematic Riser #3 subtle» de BeaconStudio, un pop de Sadiquecat, «Click / Tick» de Squirrel_404 y un triángulo de cabled_mess (todos en Freesound).
- La música está sintetizada en el propio código (`buildAudio`).
