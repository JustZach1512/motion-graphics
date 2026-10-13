# GROK: logo reveal (12 s)

Animación de motion graphics de 12 segundos, cinematográfica: un logo abstracto azul y púrpura en una habitación oscura se enciende, se expande y gira como un giroscopio mientras suelta partículas de luz. Al final se coloca en el centro y aparece el texto **GROK**.

- **Vídeo final:** [`grok-intro.mp4`](grok-intro.mp4): 1920×1080, 60 fps, H.264 (High, CRF 14), audio AAC 256 kbps normalizado a −16 LUFS / −1,5 dBTP.
- **Fuente editable:** [`grok-intro.html`](grok-intro.html): ábrelo en Chrome para reproducirlo en vivo y moverte por la línea de tiempo (espacio = play/pausa).

## Qué pasa en cada momento

| Tiempo | Imagen | Sonido |
|---|---|---|
| 0–2,2 s | Fundido desde negro. El logo, pequeño y quieto, de cromo oscuro bajo un haz de luz con polvo en el aire. El núcleo late cada vez más rápido. | Drone grave, aire, latidos suaves, *riser* |
| 2,12 s | Todo contiene la respiración | Casi silencio |
| **2,25 s** | **Ignición:** destello, onda expansiva, explosión de partículas, los anillos se encienden | Impacto + sub boom + campanas, entra el acorde Rem(add9) |
| 2,25–9 s | Se expande y gira como un giroscopio; los anillos lanzan chispas; el fondo se llena de formas geométricas suaves que laten y giran con cada golpe | Taikos a 80 BPM, arpegio de campanas, coro, *shaker* en crescendo; Sib maj7 → Do(add9) |
| 8,6–9 s | Los anillos encajan uno detrás de otro | Redoble de toms, *ticks* de cristal, *swell* inverso |
| **9 s** | **Bloqueo:** logo perfecto en el centro, pulso de luz suave | Re mayor(add9) con metales, boom, triángulo |
| 9,2–10,4 s | El logo sube un poco y **GROK** entra letra a letra (desenfoque → nitidez, el *tracking* se cierra) | *Whoosh* y destellos agudos, uno por letra |
| 10,4–11,2 s | Un barrido de luz recorre el logo y el texto | Brillo agudo |
| 11,3–12 s | Fundido a negro | Cola de reverb |

## Cómo está hecho

Todo es código: una página que dibuja cualquier fotograma a partir de un tiempo `t` (`window.seek(t)`), sin estado entre fotogramas.

- **Logo 3D por ray marching** (tres arcos tipo cinta + núcleo), material de cromo oscuro con emisión en degradado azul → púrpura.
- **~13.000 partículas** calculadas analíticamente, con estela de movimiento real y desenfoque de profundidad (bokeh).
- **Atmósfera volumétrica** (haz de luz con niebla y resplandor del núcleo), suelo con reflejo difuso.
- **Post-proceso de cine:** bloom HDR, destello anamórfico, aberración cromática, refracción de la onda expansiva, tone mapping ACES, viñeta, grano de película.
- **Motion blur y antialiasing:** 6 sub-fotogramas por fotograma dentro de un obturador de 180°.
- **Música** compuesta y sintetizada con Web Audio (pads de sierras desafinadas, coro por formantes, campanas FM, taikos, sub, reverb de convolución) sobre la misma línea de tiempo que la imagen, más 4 efectos reales CC0.

## Renderizar de nuevo

Necesitas Node 18+, `npm i playwright` (con Chromium) y `ffmpeg` en el PATH.

```bash
python3 build_assets.py                      # empaqueta fuente y efectos en assets.js (ya incluido)
node render.mjs grok-intro.html grok-intro.mp4 --fps 60 --sub 6 --workers 3    # final (~15 min en 4 núcleos, sin GPU)
node render.mjs grok-intro.html borrador.mp4 --scale 0.5 --sub 1 --fps 30      # borrador rápido
node render.mjs grok-intro.html hoja.png --stills 1.6,2.3,6,9,10.9             # hoja de fotogramas
node render.mjs grok-intro.html banda.wav --audio-only                         # solo la banda sonora
```

`--scale 2` renderiza en 4K (3840×2160), unas 4 veces más lento.

## Cambiarlo

Todo está al principio del `<script>` de `grok-intro.html`:

- **Texto:** `WORD`, `WEIGHT`, `FONT_PX`, `TRACK_END`.
- **Colores:** `PAL` (JS) y `pal()` (GLSL), de azul a púrpura.
- **Tiempos:** `T_IGN` (ignición), `T_LOCK` (bloqueo), `T_TEXT`, `T_FADE`; tempo en `BEAT` y `BEATS`.
- **Forma del logo:** `RING_R` (radios), `SPAN` (longitud de los arcos), `GAP_C` (posición de los huecos).
- **Música:** `window.buildAudio` (acordes en `pad(...)`, arpegio en `chordAt`).

## Créditos y licencias

- El logotipo es un diseño abstracto original creado para esta pieza; no es el logotipo oficial de ninguna marca.
- Música: original, sintetizada en código para esta pieza.
- Fuente: Geist (Vercel), SIL Open Font License (`skills/motion-broll/engine/fonts/OFL-Geist.txt`).
- Efectos de sonido (CC0 1.0, no requieren crédito), de `skills/sound-effects/sfx/`:
  - "Cinematic Riser #3 subtle" de BeaconStudio: https://freesound.org/people/BeaconStudio/sounds/859482/
  - "soft_impact3" de peoplearehappy: https://freesound.org/people/peoplearehappy/sounds/841274/
  - "Whoosh" de qubodup: https://freesound.org/people/qubodup/sounds/60013/
  - "triangle-open-04" de cabled_mess: https://freesound.org/people/cabled_mess/sounds/349504/
