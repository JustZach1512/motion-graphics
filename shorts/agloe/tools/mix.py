"""Voice + sound effects mix for the short.

usage: python mix.py build/vo.wav build/cues.json ../../skills/sound-effects/sfx build/
writes build/mix.wav (48 kHz stereo) and build/CREDITS.txt

Sound effects come only from the repo's bundled CC0 library (skills/sound-effects/sfx).
No music: add it in YouTube's Shorts editor (its library is cleared for Shorts) or
pass a licensed track to skills/sound-effects/scripts/sound_pass.py.
"""
import json, os, subprocess, sys
import numpy as np

vo_path, cues_path, sfx_dir, out = sys.argv[1:5]
SR = 48000
man = json.load(open(os.path.join(sfx_dir, 'manifest.json')))
meta = {e['file']: e for e in man['bundled']}
meta.update({e['file']: e for e in man['default_kit'] if e.get('file')})


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


db = lambda x: 10 ** (x / 20)
# cue type -> (candidate files, gain dB, offset s, max length s)
KIT = {
    'cut': (['whoosh/fs-683101-quick-woosh.ogg', 'kit/whoosh.ogg', 'whoosh/fs-127197-fast-simple-chop-5-aif.ogg', 'transition/fs-786514-swoosh-v2.ogg'], -24, -.07, .55),
    'whoosh': (['whoosh/fs-169867-swoosh.ogg', 'whoosh/fs393811.ogg'], -16, -.06, .9),
    'pop': (['kit/pop.ogg', 'pop/fs527522.ogg', 'pop/fs-824189-pop-in-sfx.ogg'], -13, 0, .6),
    'ding': (['ding/fs-349504-triangle-open-04.ogg', 'ding/fs-571513-soft-notifications-bell-ding-d.ogg'], -15, 0, 2.0),
    'reveal': (['kit/impact.ogg'], -11, 0, 1.8),
    'hit': (['impact/kenney-impact-impactsoft-heavy-000.ogg'], -12, 0, 1.0),
    'stamp': (['impact/kenney-impact-impactpunch-heavy-000.ogg'], -10, 0, 1.0),
    'snap': (['impact/kenney-impact-impactpunch-heavy-001.ogg'], -8, 0, 1.0),
    'impact': (['impact/fs-347561-micheal-bay-hit.ogg'], -11, 0, 2.5),
    'riser': (['riser/fs-685256-riser-sound-effect-short-wav.ogg'], -16, 0, 6),
    'ring': (['ui-blip/kenney-digital-twotone1.ogg'], -18, 0, 1.0),
    'sip': (['pop/fs-258269-mouth-pop.ogg'], -14, 0, .6),
    'brush': (['transition/fs-702773-swipe-wav.ogg'], -19, 0, 1.2),
    'boing': (['pop/kenney-interface-pluck-001.ogg'], -12, 0, .6),
}
vo = load(vo_path)
cues = json.load(open(cues_path))
# a cut that already has its own sound effect doesn't need a whoosh on top
cues = [c for c in cues if c['type'] != 'cut' or not any(o['type'] != 'cut' and abs(o['t'] - c['t']) < .2 for o in cues)]
dur = len(vo) / SR + 1.0
bus = np.zeros(int(dur * SR), dtype=np.float32)
used, log, count = {}, [], {}
for c in sorted(cues, key=lambda c: c['t']):
    files, gain, off, maxlen = KIT[c['type']]
    n = count.get(c['type'], 0); count[c['type']] = n + 1
    fpath = files[n % len(files)]
    a = load(os.path.join(sfx_dir, fpath))
    if c['type'] == 'riser' and 'end' in c:  # riser ends on the hit
        want = c['end'] - c['t']
        a = a[-int(want * SR):] if len(a) > want * SR else a
        start = c['end'] - len(a) / SR
    else:
        a = a[:int(maxlen * SR)]
        start = c['t'] + off
    fade = min(len(a), int(.04 * SR))
    a[-fade:] *= np.linspace(1, 0, fade)
    i0 = max(0, int(start * SR))
    seg = a[: len(bus) - i0] * db(gain)
    bus[i0:i0 + len(seg)] += seg
    used[fpath] = meta.get(fpath, {})
    log.append(f"{start:6.2f}s  {c['type']:7s} {fpath}  ({gain} dB)")

vo48 = np.zeros_like(bus); vo48[:len(vo)] = vo
mix = vo48 + bus
stereo = np.stack([mix, mix], axis=1)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-',
                '-af', 'loudnorm=I=-16:TP=-4.5:LRA=11', '-ar', str(SR), f'{out}/mix.wav'], input=stereo.astype(np.float32).tobytes(), check=True)
open(f'{out}/sfx_log.txt', 'w').write('\n'.join(log) + '\n')
lines = ['Sound effects (all CC0 1.0 - no credit required; listed as proof of source):']
for fp, e in sorted(used.items()):
    lines.append(f"- {e.get('title') or os.path.basename(fp)} - {e.get('attribution') or e.get('credit') or e.get('creator', '')} - {e.get('source_url', '')}")
lines += ['', 'Voice: synthetic narration generated with Kokoro TTS (Apache-2.0 model weights).']
open(f'{out}/CREDITS.txt', 'w').write('\n'.join(lines) + '\n')
print('\n'.join(log)); print(f'{len(cues)} cues, {len(used)} distinct sounds')
