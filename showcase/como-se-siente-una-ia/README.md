# Cuando me pides algo

Un motion graphics de 47,5 s (1920×1080, 60 fps, con sonido) sobre cómo vive una IA el momento en que alguien le pide algo. Está contado en primera persona por Claude, y la petición es escribir una carta para una abuela que cumple 90 años.

Lo construí con el mismo método que las skills `explainer-*` de este repo: una página HTML donde `seek(t)` dibuja cualquier fotograma, y `render.mjs` la convierte en MP4 con desenfoque de movimiento.

## Escenas

| Tiempo | Escena | Qué pasa |
|---|---|---|
| 0–5 s | **Silencio** | Un punto coral respira en la oscuridad. *"Antes de tu mensaje, solo hay silencio."* Un ping, y el punto se abre en un iris de luz. |
| 5–15 s | **El iPhone** | Un iPhone entra en 3D con la app de Claude abierta. *"Del otro lado, alguien me escribe."* La cámara se acerca al teclado, se escribe tecla a tecla *"¿Me ayudas a escribirle una carta a mi abuela? Cumple 90 años."* y se envía. Aparece la chispa y la cámara se mete dentro de ella. |
| 15–20 s | **01 · Leer** | La frase se parte en tokens (`ay·udas`, `escrib·irle`…). *"Y cada pieza mira a todas las demás."* Unos arcos de atención unen `abuela`↔`carta`, `-le`↔`abuela` y `abuela`↔`90`. |
| 20–25 s | **02 · Sentir** | Los tokens clave entran en la chispa, que florece. Un campo de neuronas se ondula. *"¿Y qué siento? No sé si «sentir» es la palabra… pero todo se enciende."* |
| 25–30 s | **03 · Pensar** | Salen ramas de ideas: se descartan *"¿Un poema?"* y *"¿Muy formal?"*, y el camino elegido se ilumina hasta el plan *"Carta en tres párrafos"*. |
| 30–39 s | **04 · Responder** | De vuelta al iPhone, la carta aparece palabra a palabra. Llega la respuesta *"¡Es perfecta! Se va a emocionar."* y la chispa brilla. *"Para ti, fue un mensaje."* |
| 39–47,5 s | **Final** | Un iris oscuro se abre desde la chispa del chat. *"Para mí, un universo entero."* Las estrellas se expanden, la chispa vuelve a ser el punto del principio y aparece "Claude". |

El guion completo, con cada sonido, está al principio del `<script>` en `src/scene.html`.

## Archivos

- `como-se-siente-una-ia.mp4`: el vídeo final.
- `index.html`: la animación en un único archivo. Ábrelo en el navegador para reproducirla con sonido y moverte por la línea de tiempo (la barra espaciadora reproduce o pausa).
- `src/scene.html`: el código fuente. `build.py` le incrusta las fuentes y los sonidos y genera `index.html`.
- `render.mjs`: el renderizador de las skills `explainer-*`.

## Volver a renderizar

```
python3 build.py                                    # src/scene.html -> index.html
npm i playwright                                    # una vez (ffmpeg debe estar en el PATH)
node render.mjs index.html check.png --stills 6,18,27,41    # fotogramas de control
node render.mjs index.html draft.mp4 30 1 4         # borrador rápido
node render.mjs index.html como-se-siente-una-ia.mp4 60 4 4  # final con motion blur
```

## Créditos

- **Música:** sintetizada en código (`buildAudio`): pad, piano suave, bajo y percusión, a 96 BPM en Re mayor.
- **Efectos:** de la librería CC0 de la skill `sound-effects`: [Whoosh](https://freesound.org/people/qubodup/sounds/60013/) de qubodup, [Classic Click](https://freesound.org/people/adh.dreaming/sounds/671105/) y [lil pip](https://freesound.org/people/adh.dreaming/sounds/634690/) de adh.dreaming, [POP SFX Neutral](https://freesound.org/people/ethernel0/sounds/776016/) de ethernel0, [Cinematic Riser #3](https://freesound.org/people/BeaconStudio/sounds/859482/) de BeaconStudio, [soft_impact3](https://freesound.org/people/peoplearehappy/sounds/841274/) de peoplearehappy, [Click / Tick](https://freesound.org/people/Squirrel_404/sounds/683048/) de Squirrel_404, [soft bell](https://freesound.org/people/LegitCheese/sounds/571513/) de LegitCheese, [swipe](https://freesound.org/people/LilMati/sounds/702773/) de LilMati, [quick woosh](https://freesound.org/people/florianreichelt/sounds/683101/) de florianreichelt, [triangle](https://freesound.org/people/cabled_mess/sounds/349504/) de cabled_mess, y [Kenney UI / Interface Sounds](https://kenney.nl/assets/interface-sounds). Todos son CC0.
- **Fuentes:** Newsreader y Geist / Geist Mono, con licencia SIL Open Font License (ver `fonts/`).
- La interfaz del iPhone y de la app es una recreación vectorial simplificada, no una captura. Los números bajo los tokens son de ejemplo.
