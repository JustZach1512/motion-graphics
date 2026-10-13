#!/usr/bin/env python3
"""Pack the font and the CC0 sound effects this piece uses into assets.js (base64),
so grok-intro.html works when opened straight from disk. Re-run after changing the list."""
import base64, json, pathlib

here = pathlib.Path(__file__).resolve().parent
repo = here.parent.parent
files = {
    'geist': repo / 'skills/motion-broll/engine/fonts/Geist-Variable.woff2',
    'riser': repo / 'skills/sound-effects/sfx/kit/riser.ogg',
    'impact': repo / 'skills/sound-effects/sfx/kit/impact.ogg',
    'whoosh': repo / 'skills/sound-effects/sfx/kit/whoosh.ogg',
    'triangle': repo / 'skills/sound-effects/sfx/ding/fs-349504-triangle-open-04.ogg',
}
out = {k: base64.b64encode(p.read_bytes()).decode() for k, p in files.items()}
(here / 'assets.js').write_text('window.ASSETS = ' + json.dumps(out) + ';\n')
print('assets.js', sum(len(v) for v in out.values()) // 1024, 'KB')
