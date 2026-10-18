"""Inline the Geist font and the CC0 sound effects into src.html -> bateria-redmi-13c.html."""
import base64, json, pathlib
here = pathlib.Path(__file__).parent
root = here.parent.parent / 'skills'
sfx = root / 'sound-effects' / 'sfx'
SOUNDS = {
    'whoosh': 'kit/whoosh.ogg', 'pop': 'kit/pop.ogg', 'tick': 'kit/tick.ogg', 'click': 'kit/click.ogg',
    'impact': 'kit/impact.ogg', 'riser': 'riser/fs-396161-scary-hits-risers-001.ogg',
    'boom': 'impact/kenney-sci-lowfrequency-explosion-000.ogg', 'hit': 'impact/fs-177242-cinematic-impact.ogg',
    'spark': 'glitch/kenney-interface-glitch-002.ogg', 'room': 'ambience/fs-426767-apartment-room-tone-wav.ogg',
    'ding': 'ding/fs-571513-soft-notifications-bell-ding-d.ogg', 'jet': 'whoosh/fs-264777-swoosh.ogg',
    'confirm': 'ding/kenney-interface-confirmation-001.ogg', 'plop': 'pop/fs-447910-plop.ogg',
}
b64 = lambda p: base64.b64encode(p.read_bytes()).decode()
html = (here / 'src.html').read_text()
html = html.replace('/*FONT*/', b64(root / 'motion-broll' / 'engine' / 'fonts' / 'Geist-Variable.woff2'))
html = html.replace('/*SFX*/', json.dumps({k: b64(sfx / v) for k, v in SOUNDS.items()}))
(here / 'bateria-redmi-13c.html').write_text(html)
print('ok', len(html) // 1024, 'KB')
