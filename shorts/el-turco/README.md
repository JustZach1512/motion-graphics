# La máquina que venció a Napoleón (Short 9:16)

**Historia:** en 1809, en Viena, Napoleón juega al ajedrez contra el Turco, un autómata con turbante sentado sobre un armario lleno de engranajes que gana a todo el mundo.

- Napoleón hace un movimiento ilegal y el Turco devuelve la pieza a su sitio.
- Lo intenta otra vez, y el Turco barre todas las piezas del tablero.
- El truco: dentro del armario se escondía un maestro de ajedrez, a la luz de una vela, que se deslizaba en su asiento cuando abrían las puertas y movía el brazo con una palanca.

**Vídeo final:** `build/la-maquina-que-vencio-a-napoleon.mp4` (1080×1920, 30 fps, unos 64 s)

## Para publicarlo

- **Título:** `Napoleón perdió al ajedrez contra una máquina… o eso creía ♟️`
- **Descripción:**
  > En 1809, Napoleón intentó hacerle trampas a "el Turco", la máquina de ajedrez más famosa del mundo. Lo que no sabía es lo que había dentro. #historia #curiosidades #ajedrez #napoleon #shorts
- **Música:** ya va incluida. Es una composición original para este vídeo (clavecín, pizzicato, fagot y madera), renderizada con FluidR3 GM (licencia MIT). Es tuya, no hace falta añadir otra.

## Voces

| Personaje | Voz |
|---|---|
| Narrador | Kokoro `em_santa` +6 semitonos, velocidad 1,2. Se eligió midiendo el narrador de los vídeos de referencia: tono medio de unos 200 Hz, rango 2,2× y ritmo rápido; esta voz queda en 192 Hz, 2,0× y 3,6 palabras/s. No se ha clonado ninguna voz real. |
| Napoleón | Piper `es_ES-davefx-medium`, −2 semitonos |
| El dueño | Kokoro `em_alex`, +1 |
| El hombre escondido | Kokoro `em_alex`, +3, con filtro amortiguado (paso bajo y eco corto), como si hablara desde dentro del armario |

## Cómo está hecho

Usa el kit de `shorts/` (ver `../README.md`). En esta carpeta solo está lo propio de la historia:

| Archivo | Qué hace |
|---|---|
| `script.json` | Guion y voces. |
| `music.json` | Secciones de la música: tema, corte en seco en el barrido, tramo alegre, misterio en la revelación, final y el "wah wah" del fagot. |
| `src/props.js` | Tablero y piezas 3D, el armario (puertas, cajón, engranajes que giran, asiento deslizante, palanca), vela, lámparas de araña, columnas, cortinas, silla y banderas. |
| `src/sets.js` | Salón del palacio, fachada de Schönbrunn y la escena heroica de Napoleón. |
| `src/shots.js` | Lista de planos y la partida de ajedrez, que es una función del tiempo: jugadas, la trampa, la devolución y el barrido con física. |

## English version

`script.en.json` + `music.en.json`; output `build/en/the-machine-that-beat-napoleon.mp4`.

| Character | Voice |
|---|---|
| Narrator | Kokoro `am_fenrir` +5 semitones. Measured against the reference narrator: 197 Hz vs 203 Hz median pitch, 2.1× vs 2.2× range, 3.6 words/s on both, and the recogniser heard every word. A stock voice, not a clone. |
| Napoleon | `bm_george` −1 (pompous Brit) |
| The owner | `bm_fable` +1 |
| The hidden man | `am_echo` +3, muffled |

- **Title:** `Napoleon lost at chess to a machine… or so he thought ♟️`
- **Description:**
  > In 1809, Napoleon tried to cheat against "the Turk", the most famous chess machine in the world. He had no idea what was inside. #history #historyfacts #chess #napoleon #shorts

```bash
SHORT_LANG=en node tools/render.js el-turco el-turco/build/en/silent.mp4 4
python3 tools/music.py el-turco/music.en.json el-turco/build/en
python3 tools/mix.py el-turco/build/en/vo.wav el-turco/build/en/cues.json ../skills/sound-effects/sfx el-turco/build/en el-turco/build/en/music.wav el-turco/build/en/timings.json
```
