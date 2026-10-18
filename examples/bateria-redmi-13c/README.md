# ¿Qué pasa si la batería de tu Redmi 13C se infla?

Motion graphic vertical (1080×1920, 60 s, en español) que explica qué pasa cuando la batería de litio de un Redmi 13C se hincha, por qué se hincha y cómo llega a arder o "explotar" (fuga térmica).

| Archivo | Qué es |
|---|---|
| `bateria-redmi-13c.mp4` | El vídeo final (60 fps, motion blur, efectos de sonido). |
| `bateria-redmi-13c.html` | La misma animación en el navegador: ábrela y mueve el scrubber. |
| `src.html` | El código fuente (sin la fuente ni los sonidos incrustados). |
| `build.py` | Incrusta Geist y los sonidos CC0 de `skills/sound-effects` en `src.html`. |
| `render.mjs` | El renderizador de los skills `explainer-*` (con un limitador de picos añadido: el audio queda a unos −20 LUFS y con picos por debajo de −4 dBFS). |

## Guion

| Tiempo | Escena |
|---|---|
| 0–5 s | Gancho: el Redmi 13C de espaldas, la tapa empieza a hincharse. |
| 5–11,5 s | Por dentro: placa, cámaras y la batería Li-ion de 5000 mAh en un móvil de 8 mm. |
| 11,5–19,5 s | Corte de la celda: cátodo, separador, ánodo, electrolito; los iones Li+ cruzan al cargar. El electrolito es inflamable. |
| 19,5–26 s | Por qué se infla: calor, mala carga, años de uso, golpes. |
| 26–33 s | El electrolito se descompone y suelta gases (CO₂, CO, H₂…): la bolsa se hincha como un globo. |
| 33–38,5 s | Vista lateral: la tapa se levanta, la pantalla se presiona, el móvil "baila" en la mesa. |
| 38,5–49,5 s | Perforación → cortocircuito → 80 °C capa protectora, 130 °C separador, 200 °C oxígeno del cátodo, +400 °C fuga térmica. No es una bomba: es gas inflamable saliendo a presión y ardiendo. |
| 49,5–56,5 s | Qué hacer: no cargarlo, no apretarlo ni pincharlo, apagarlo sobre algo que no arda, servicio técnico, reciclaje. |
| 56,5–60 s | Cierre: "Una batería inflada no se arregla: se cambia." |

Datos del móvil (batería de 5000 mAh, 168 × 78 × 8,09 mm) de la ficha oficial de Xiaomi. Las temperaturas son aproximadas y así se indica en pantalla. El móvil está dibujado en código (sin logos) y el grosor de la vista lateral está exagerado para que se vea.

## Volver a generarlo

```
python3 build.py
npm i playwright            # o enlaza una instalación global
node render.mjs bateria-redmi-13c.html bateria-redmi-13c.mp4 60 4 4
```

## Sonido

Solo efectos reales con licencia CC0 de `skills/sound-effects/sfx` (whoosh, pop, tick, click, impact, riser, explosión, ding, room tone). No lleva música: añade la tuya en el editor si la quieres.
