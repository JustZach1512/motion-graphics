# Galaxy S25 por dentro

Un motion graphics de 72 segundos, al estilo de un anuncio de Samsung, que despieza el Galaxy S25 capa a capa y explica cada componente. Está hecho con código: una escena 3D en three.js que se dibuja para cualquier instante `t`, se renderiza a MP4 con desenfoque de movimiento y lleva su propia banda sonora sintetizada.

## Qué cuenta

| Tiempo | Capítulo | Qué se ve |
|---|---|---|
| 0–6 s | Intro | Destello de luz, el teléfono gira de canto a frente. «Descubre lo que hay dentro.» |
| 6–10 s | Despiece | El teléfono se separa en 8 capas, cada una con su nombre |
| 10–16 s | 01 Pantalla | Dynamic AMOLED 2X, lupa de subpíxeles, Gorilla Glass Victus 2, lector de huellas, cámara frontal |
| 16–22 s | 02 Refrigeración | La pantalla se aparta y el calor se reparte por la cámara de vapor |
| 22–30 s | 03 Procesador | Vuelta a la parte trasera, el Snapdragon 8 Elite for Galaxy se ilumina, ficha de CPU, GPU, NPU e ISP |
| 30–36 s | 04 Memoria | 12 GB de RAM LPDDR5X y almacenamiento UFS 4.0, con datos viajando por las pistas |
| 36–44 s | 05 Cámaras | Las lentes se separan y la luz llega al sensor: 12 MP ultra gran angular, 50 MP gran angular, 10 MP teleobjetivo 3x |
| 44–50 s | 06 Batería | La celda de 4000 mAh se llena y la bobina inalámbrica emite pulsos (25 W por cable, 15 W inalámbrica) |
| 50–56 s | 07 Conectividad y sonido | Ondas desde las antenas del marco, altavoces estéreo, motor háptico, USB-C |
| 56–62 s | 08 Marco | Solo queda el Armor Aluminum, IP68, 7,2 mm, 162 g |
| 62–72 s | Cierre | Todo se vuelve a montar de golpe, se enciende la pantalla. «Galaxy S25. Inteligencia en cada capa.» |

Las cifras son las especificaciones publicadas del Galaxy S25 (modelo base). El interior es una recreación ilustrativa: la disposición real de los chips en la placa no es exactamente esta.

## Archivos

- `galaxy-s25-por-dentro.html`: la página final, autocontenida (three.js y fuentes incluidas). Ábrela en el navegador para verla y moverte por la línea de tiempo con sonido.
- `src/main.js`: la escena 3D, la animación, los textos y la música.
- `src/page.html`: estilos y estructura de la página.
- `build.mjs`: empaqueta `src/` en la página final.
- `render.mjs`: convierte la página en MP4 (de la skill `explainer-high-energy`, con WebGL por software activado).

## Cómo regenerarlo

```
npm install
npm run build                                   # src/ -> galaxy-s25-por-dentro.html
node render.mjs galaxy-s25-por-dentro.html check.png --stills 3,12,26,40   # fotogramas sueltos
node render.mjs galaxy-s25-por-dentro.html draft.mp4 30 1 4                # borrador rápido
node render.mjs galaxy-s25-por-dentro.html galaxy-s25-por-dentro.mp4 30 4 4   # final con desenfoque de movimiento
```

Necesita ffmpeg y Chromium (Playwright). El render usa WebGL por software, así que el final tarda bastante en una máquina sin GPU.

## Qué cambiar para una segunda versión

- Textos: el array `CHAPTERS` y la lista `CALLOUTS` al principio de `src/main.js`.
- Color del teléfono: los materiales `frameMat` y de la tapa trasera (ahora en tono Icyblue).
- Encuadres: la tabla `SHOTS` (tiempo, órbita, elevación, distancia, objetivo, desplazamiento en pantalla).
- Formato vertical 9:16: cambia `W`/`H` y los encuadres.

Fuentes: Outfit e Inter (SIL Open Font License).
