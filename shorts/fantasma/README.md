# El ejército de goma (Short 9:16)

**Historia:** Francia, 1944. Dos franceses que van en bici ven a cuatro soldados americanos levantar un tanque de 30 toneladas con las manos. "Es que los americanos somos muy fuertes", les dice uno.

- **El truco:** el tanque era de goma. Era hinchable.
- **Quiénes eran:** el Ejército Fantasma (23rd Headquarters Special Troops). Su misión era engañar a los alemanes:
  - De noche hinchaban tanques, camiones y cañones de goma.
  - Ponían altavoces con ruido de motores y de cadenas.
  - Llenaban la radio de mensajes falsos.
  - Contaban mentiras en los bares del pueblo, por si había espías escuchando.
- **Quiénes los formaban:** muchos eran artistas (pintores, diseñadores y decoradores).
- **El remate:** los únicos que estuvieron a punto de pillarles fueron dos señores en bici.

**Vídeo final:** `build/el-ejercito-de-goma.mp4` (1080×1920, 30 fps, unos 60 s)

## Para publicarlo

- **Título:** `4 soldados levantaron un tanque de 30 toneladas… con las manos 💪`
- **Descripción:**
  > En 1944, dos franceses vieron a cuatro soldados americanos levantar un tanque. El truco era otro: el Ejército Fantasma, artistas que engañaron a los alemanes con tanques de goma. #historia #curiosidades #segundaguerramundial #ejercitofantasma #shorts
- **Música:** ya va incluida. Es una marcha original compuesta para este vídeo (flautín, clarinete, tuba, pizzicato y caja). Tiene un corte en seco en "¡era hinchable!" y el "wah wah" del trombón al final. Está renderizada con FluidR3 GM (licencia MIT), así que es tuya y no hace falta añadir otra.

## Voces

| Personaje | Voz |
|---|---|
| Narrador | Kokoro `em_santa` +6 semitonos, velocidad 1,2. Es la misma voz que en *La máquina que venció a Napoleón*, elegida midiendo el narrador de los vídeos de referencia (tono, rango y ritmo). No se ha clonado ninguna voz real. |
| El francés | Piper `es_ES-davefx-medium` |
| El soldado | Kokoro `em_alex`, −2 semitonos |

## Cómo está hecho

Usa el kit de `shorts/` (ver `../README.md`). El campo francés reutiliza el cruce de caminos de `agloe/`, sin la tienda ni los carteles. En esta carpeta solo está lo propio de la historia:

| Archivo | Qué hace |
|---|---|
| `script.json` | Guion y voces. |
| `music.json` | Secciones de la marcha, colocadas en momentos de la historia: tema, corte, tramo alegre al presentar el Ejército Fantasma, tramo suave de noche, final y "wah wah". |
| `src/props.js` | Tanque hinchable (se infla, se arruga y tiembla), bicis, camión con altavoces, radio, inflador, manguera, tiendas, avión, caballete, periódico y mesas de café. |
| `src/sets.js` | Campo de día con el campamento, campamento de noche (luna, estrellas y focos) y el café del pueblo. |
| `src/shots.js` | Lista de planos: el tanque en alto, el pinchazo, el desinflado, el inflado nocturno, los altavoces, la radio, el café, el avión y la vista con prismáticos. |

## English version

`script.en.json` + `music.en.json`; output `build/en/the-rubber-army.mp4` (about 58 s).

| Character | Voice |
|---|---|
| Narrator | Kokoro `am_fenrir` +5 semitones, speed 1.15: the same narrator as the English *The Machine That Beat Napoleon*, matched to the reference narrator's pitch, range and pace. A stock voice, not a clone. |
| The Frenchman | `bm_lewis` +1, opening with a "Mon Dieu!" |
| The soldier | `am_michael` −1 |

- **Title:** `4 soldiers lifted a 30-ton tank… with their bare hands 💪`
- **Description:**
  > In 1944, two Frenchmen saw four American soldiers lift a tank. The truth was even stranger: the Ghost Army, a unit of artists who fooled the Germans with rubber tanks. #history #historyfacts #ww2 #ghostarmy #shorts

```bash
SHORT_LANG=en node tools/render.js fantasma fantasma/build/en/silent.mp4 4
python3 tools/music.py fantasma/music.en.json fantasma/build/en
python3 tools/mix.py fantasma/build/en/vo.wav fantasma/build/en/cues.json ../skills/sound-effects/sfx fantasma/build/en fantasma/build/en/music.wav fantasma/build/en/timings.json
```
