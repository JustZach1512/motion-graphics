# Choque de trenes en Urda (Toledo) · recreación en motion graphics

Vídeo de 2:27 (1920×1080, 30 fps) con narración en español. Recrea, según la información publicada hasta el 29 de octubre de 2026, el choque del 28 de octubre de 2026 entre el AVE 2080 de Renfe y el Iryo 6076 en la línea de alta velocidad Madrid–Sevilla.

## Qué cuenta (y de dónde sale)

| Escena | Hecho | Fuente |
|---|---|---|
| Salidas | Iryo 6076, Atocha 07:54 → Sevilla, ≈147 viajeros. AVE 2080, 08:00, misma vía y sentido, ≈397 viajeros (544 en total) | CNN, Latin Times, Infobae, OKDiario (las cifras varían entre 146 y 151, y entre 393 y 397) |
| LZB | Hacia las 08:30 un fallo informático deja el LZB fuera de servicio; seis trenes se detienen automáticamente | Ministro Óscar Puente; El Español |
| LZB | El Iryo queda parado en la señal de entrada de Urda; su maquinista dice que no puede reiniciar el LZB | Audios publicados (EFE, Cadena SER, eldiario.es) |
| Orden | 08:36: el centro de control de Adif en Atocha da al AVE la orden «desconecte y vuelva a conectar el LZB y reanude con marcha normal», con la señal en rojo y el tramo ocupado | EFE, Cadena SER, El Español, Infobae |
| Orden | Según el Ministerio, la norma exigía «marcha a la vista», 40 km/h como máximo | Ministerio de Transportes, Cadena SER |
| Choque | El Iryo no había recibido orden de reanudar. Choque hacia las 08:53–08:54, cerca del PK 118, entre Mora, Orgaz y Urda | El Español, 112 Castilla-La Mancha, Ministerio |
| Choque | Velocidad media del AVE de ≈137 km/h en el minuto del choque, con la frenada incluida (no es la velocidad del impacto) | Datos de Renfe recogidos por SpainTrainRadar (El Español) |
| Balance | Al menos 68 fallecidos, 107 hospitalizados (15 muy graves); balance provisional | García-Page / Junta de Castilla-La Mancha, CMM, El Español |
| Investigación | Puente: «inexplicable», «una decisión errónea». Juzgado de Orgaz: secreto de las actuaciones y custodia de las cajas negras. Investiga también la CIAF. Línea suspendida. Tres días de luto oficial (BOE) | eldiario.es, Infobae, El Español, CMM |

## Qué es ilustrativo

- **El esquema de la vía no está a escala.** Los trenes, las distancias y las señales son representativos. Solo el PK 118 y la señal de entrada de Urda vienen de las fuentes.
- **El punto donde se paró el AVE no se conoce.** Solo se sabe que el Iryo estaba «varios kilómetros por delante». En el vídeo, el AVE se para en el PK 96.
- **El reloj y los movimientos de los trenes entre las 08:00 y las 08:30 están comprimidos.** Las horas exactas son las de salida, ≈08:30, 08:36 y ≈08:54.
- **El mapa muestra un trazado aproximado de la línea.**
- **La frenada antes del choque sigue la información publicada** (el tren frenaba bruscamente antes del impacto), pero su perfil es ilustrativo.

## Cómo se hace

```bash
# voz: piper es_ES-davefx-medium vía sherpa-onnx (sin conexión; necesita sherpa-onnx<2, que trae el fonetizador espeak-ng)
pip install "sherpa-onnx<2" soundfile numpy
curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-es_ES-davefx-medium.tar.bz2 && tar xjf vits-piper-es_ES-davefx-medium.tar.bz2
python3 tts.py vits-piper-es_ES-davefx-medium        # → audio/narration.wav + timeline.json

# mapa (provincias de España + Portugal y vecinos de Natural Earth)
python3 -I prep_map.py spain-provinces.geojson ne_50m_admin_0_countries.geojson > work/map.json

python3 build.py                                      # → dist/urda.html (página autocontenida; seek(t) puro)
python3 mix.py                                        # → audio/mix.wav (narración + efectos CC0)
python3 srt.py                                        # → out/urda.srt
node render.mjs dist/urda.html out/urda.mp4 30 2 4    # → out/urda_silent.mp4 (Playwright + ffmpeg, desenfoque de movimiento)
ffmpeg -i out/urda_silent.mp4 -i audio/mix.wav -af loudnorm=I=-16:TP=-5:LRA=11 -ar 48000 -c:v copy -c:a aac -b:a 192k -shortest out/urda.mp4
```

Todos los tiempos de la animación salen de `timeline.json`, es decir, de la propia narración. Si cambias el texto de `narration.json` y vuelves a ejecutar `tts.py`, la animación se reajusta sola.

`dist/urda.html` se puede abrir en el navegador para recorrer la animación (pon `urda-audio.m4a` al lado para oírla).

## Créditos

- Voz: modelo Piper `es_ES-davefx-medium` (dataset CC0, NabuCasa), ejecutado con sherpa-onnx.
- Efectos de sonido (CC0, de `skills/sound-effects/sfx`): «Whoosh» de qubodup; «scary hits risers 002» de Xinematix; «dramatic hit» de qubodup; Kenney Sci-fi Sounds y Digital Audio.
- Mapa: provincias de España de Code for America `click_that_hood` (MIT); Portugal y países vecinos de Natural Earth (dominio público).
- Tipografías: Geist y Geist Mono (SIL OFL).
