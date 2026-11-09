# Cómo funciona un script de Delta: StarHack Hub · Piggy Auto Farm

Motion graphic de 73 s (1920×1080, español) que explica qué pasa cuando pegas esto en Delta Executor:

```lua
loadstring(game:HttpGet("https://raw.githubusercontent.com/StarHackScripts/StarHack-Hub-Deepstar-Hub/refs/heads/main/StarHackHub_AutoFarm_Piggy.lua.txt"))()
```

Lo hice con la skill [`explainer-default`](../../skills/explainer-default/SKILL.md).

| Archivo | Qué es |
|---|---|
| `demo.html` | La animación completa. Ábrela en el navegador para reproducirla y moverte por la línea de tiempo. Las fuentes van incrustadas. |
| `demo.mp4` | Render final: 60 fps, motion blur y música sintetizada (−16 LUFS). |
| `render.mjs` | El renderizador de la skill: `node render.mjs demo.html demo.mp4 60 4 4`. Necesita Node 18+, ffmpeg y `npm i playwright`. |

## Qué está verificado

El script descargado está ofuscado con **MoonSec V3**: son 161.988 caracteres en una sola línea, y el código real va cifrado dentro de una máquina virtual. Para ver qué hace, lo ejecuté **dentro de un Roblox simulado y aislado**: un sandbox de Lua sin acceso a red ni a archivos, sin cuenta real, que imita la API de Roblox y del executor y registra cada llamada. Nunca se ejecutó dentro de Roblox. Todo lo que muestra el video sale de ese registro:

- **Comprobaciones anti-manipulación.** La máquina virtual solo arranca si detecta que está en Roblox (por ejemplo, que no existe `string.dump`) y que el código no fue reformateado (mira los números de línea de los errores).
- **Su propio menú.** Crea un `ScreenGui` en `CoreGui` con el título `⭐ StarHack Hub - Piggy Auto Farm v1.0 ⭐`, el texto en inglés que sale en el video y los botones `Set Piggy`, `OFF/ON`, `Rejoin` y `-`. Los colores, tamaños y animaciones del video son los valores que fija el propio script (escalados ×2).
- **Notificaciones.** Muestra `Welcome / Made by StarHackScripts`, con borde degradado rosa y cian y una barra verde.
- **Segundo script remoto.** Al arrancar ejecuta `loadstring(game:HttpGet(".../StarHack-Deepstar-Development/refs/heads/main/Credits-Message"))()`. Ese archivo también está ofuscado con MoonSec V3 y no lo ejecuté.
- **`Set Piggy`.** Recorre los jugadores y busca `Character:FindFirstChild("Enemy")`. Al jugador local no lo revisa. Si nadie lo tiene, avisa `Piggy not found`.
- **`OFF` → `ON`.** El botón se desliza a la derecha y pasa de `rgb(200,60,60)` a `rgb(60,200,80)`. Si no hay Piggy, avisa `There is no Piggy in the match.`
- **`Rejoin`.** Avisa `Rejoining to the same server...` y llama a `TeleportService:TeleportToPrivateServer(…, game.PrivateServerId, {LocalPlayer})`.

**Qué no se pudo observar:** el bucle de farmeo que corre con un Piggy real en la partida, porque en el entorno simulado no hay partida. Por eso el video describe el reparto entre las dos cuentas con el texto del propio menú y no inventa el mecanismo.

En la parte que llegó a ejecutarse no vi envíos a webhooks ni peticiones HTTP aparte de la de `Credits-Message`. Eso no garantiza nada sobre el código que no se ejecutó ni sobre versiones futuras del archivo.

## Guion

| t (s) | Escena |
|---|---|
| 0.0 | "Cómo funciona" y luego el nombre sobre el degradado |
| 4.2 | Se escribe el one-liner en el executor; clic en "Ejecutar" |
| 11.05 | "La línea no es el script: lo trae de internet." |
| 13.3 | Anatomía: 1 `HttpGet` descarga · 2 `loadstring` lo convierte en código · 3 `()` lo ejecuta |
| 20.75 | "Lo que descarga viene cifrado." |
| 22.9 | 161.988 caracteres en 1 línea → texto de MoonSec V3 → la máquina virtual comprueba, descifra y ejecuta |
| 31.95 | "Dentro de Roblox, dibuja su propio menú." |
| 34.2 | El menú real, el toast de bienvenida y la descarga de `Credits-Message` |
| 41.85 | "“Set Piggy” busca quién es Piggy." |
| 44.0 | Escaneo de jugadores en busca de `"Enemy"` |
| 51.25 | "Después automatiza el farmeo entre dos cuentas." |
| 53.5 | Toggle ON · cuenta alterna vs. cuenta Piggy · `Rejoin` al mismo servidor privado |
| 63.15 | "Cada vez que lo ejecutas, corre [código que no puedes leer / lo que el autor haya subido ese día / con tu cuenta en juego]" → "Entiende lo que pegas antes de ejecutarlo." |
| 69.6 | Cierre |

**Contenido de ejemplo:** los nombres de jugadores (`Jugador_4821`, `TuCuentaMain`…) y el panel "Executor", que es un editor genérico y no la interfaz real de Delta. La paleta y el degradado son los de la skill.

**Para una v2:** versión vertical 9:16 para TikTok o Shorts, o voz en off en español sobre este mismo guion.
