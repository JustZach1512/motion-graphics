"""Inline fonts and sound effects into src/scene.html -> index.html (one self-contained file)."""
import base64, json, pathlib

HERE = pathlib.Path(__file__).parent
SFX_DIR = HERE / '../../skills/sound-effects/sfx'
SFX = {  # all CC0, from the sound-effects skill's bundled library
    'tick': 'kit/tick.ogg', 'click': 'kit/click.ogg', 'pop': 'kit/pop.ogg',
    'whoosh': 'kit/whoosh.ogg', 'riser': 'kit/riser.ogg', 'impact': 'kit/impact.ogg',
    'bell': 'ding/fs-571513-soft-notifications-bell-ding-d.ogg', 'pip': 'ding/fs-634690-lil-pip.ogg',
    'confirm': 'ding/kenney-interface-confirmation-001.ogg', 'blip': 'ui-blip/kenney-ui-rollover1.ogg',
    'glitch': 'glitch/kenney-interface-glitch-002.ogg', 'swipe': 'transition/fs-702773-swipe-wav.ogg',
    'qwoosh': 'whoosh/fs-683101-quick-woosh.ogg', 'triangle': 'ding/fs-349504-triangle-open-04.ogg',
}
FONTS = [  # family, file, weight range, style
    ('Newsreader', 'Newsreader.woff2', '300 700', 'normal'),
    ('Newsreader', 'Newsreader-Italic.woff2', '300 700', 'italic'),
    ('Geist', 'Geist-Variable.woff2', '100 900', 'normal'),
    ('Geist Mono', 'GeistMono-Medium.woff2', '500', 'normal'),
]
b64 = lambda p: base64.b64encode(p.read_bytes()).decode()
faces = '\n'.join(
    f"@font-face{{font-family:'{fam}';src:url(data:font/woff2;base64,{b64(HERE / 'fonts' / f)}) format('woff2');"
    f"font-weight:{w};font-style:{s};font-display:block}}" for fam, f, w, s in FONTS)
sfx = json.dumps({k: b64(SFX_DIR / v) for k, v in SFX.items()})
html = (HERE / 'src/scene.html').read_text()
html = html.replace('/*@FONTS@*/', faces).replace('/*@SFX@*/{}', sfx)
(HERE / 'index.html').write_text(html)
print('index.html', len(html) // 1024, 'KB')
