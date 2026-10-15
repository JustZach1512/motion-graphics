"""Inline fonts, sound effects and scripts from src/ into one self-contained page."""
import base64, json, pathlib

HERE = pathlib.Path(__file__).parent
SRC = HERE / 'src'
SFX_DIR = HERE.parent.parent / 'skills' / 'sound-effects' / 'sfx'

FONTS = {  # family, weight range, file (latin subsets from Google Fonts, SIL OFL)
    'Bangers': ('400', 'fonts/bangers.woff2'),
    'Press Start 2P': ('400', 'fonts/pressstart.woff2'),
    'Inter': ('100 900', 'fonts/inter.woff2'),
}
SFX = {  # key -> bundled CC0 file in skills/sound-effects/sfx
    'punch1': 'impact/kenney-impact-impactpunch-heavy-000.ogg',
    'punch2': 'impact/kenney-impact-impactpunch-heavy-001.ogg',
    'punch3': 'impact/fs745291.ogg',
    'bighit': 'impact/fs-347561-micheal-bay-hit.ogg',
    'hit2': 'impact/fs-222517-dramatic-hit.ogg',
    'soft': 'kit/impact.ogg',
    'whoosh': 'kit/whoosh.ogg',
    'qwoosh': 'whoosh/fs-683101-quick-woosh.ogg',
    'chop': 'whoosh/fs-127197-fast-simple-chop-5-aif.ogg',
    'swoosh': 'transition/fs-786514-swoosh-v2.ogg',
    'popin': 'pop/fs-824189-pop-in-sfx.ogg',
    'plop': 'pop/fs-447910-plop.ogg',
    'mpop': 'pop/fs-258269-mouth-pop.ogg',
    'typing': 'typing/fs-416777-digital-typing-wav.ogg',
    'ding': 'ding/fs-571513-soft-notifications-bell-ding-d.ogg',
    'ding2': 'ding/kenney-interface-confirmation-002.ogg',
    'riser': 'riser/fs-685256-riser-sound-effect-short-wav.ogg',
    'power': 'riser/kenney-digital-powerup2.ogg',
    'tick': 'kit/tick.ogg',
    'blip': 'ui-blip/kenney-digital-pepsound1.ogg',
}

def b64(p):
    return base64.b64encode(pathlib.Path(p).read_bytes()).decode()

css = '\n'.join(
    f"@font-face{{font-family:'{fam}';font-weight:{w};font-display:block;src:url(data:font/woff2;base64,{b64(HERE / 'build' / f)}) format('woff2');}}"
    for fam, (w, f) in FONTS.items())
sfx = 'const SFX = ' + json.dumps({k: b64(SFX_DIR / v) for k, v in SFX.items()}) + ';'
page = (SRC / 'page.html').read_text()
for tag, body in [('FONTS', css), ('SFX', sfx), ('CORE', (SRC / 'core.js').read_text()), ('SCENES', (SRC / 'scenes.js').read_text()),
                  ('AUDIO', (SRC / 'audio.js').read_text()), ('MAIN', (SRC / 'main.js').read_text())]:
    page = page.replace(f'/*@@{tag}@@*/', body)
out = HERE / 'claude-vs-chatgpt.html'
out.write_text(page)
print(out, f'{len(page) / 1024:.0f} KB')
