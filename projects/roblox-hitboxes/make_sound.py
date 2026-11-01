#!/usr/bin/env python3
"""Build the sound pass inputs for sound_pass.py:
   - two trimmed CC0 derivatives in sfx-local/ (same peak level as the library: -3 dBFS)
   - manifest.local.json: the skill's manifest with absolute paths + the trimmed entries
   - cues.json and swaps.json (one real sound per cue)"""
import json, os, subprocess, copy
HERE = os.path.dirname(os.path.abspath(__file__))
SK = os.path.normpath(os.path.join(HERE, '../../skills/sound-effects/sfx'))
L = os.path.join(HERE, 'sfx-local')
def trim(src, dst, ss, dur, fade=.12):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(ss), '-t', str(dur), '-i', os.path.join(SK, src),
                    '-af', f'afade=t=in:d=0.02,afade=t=out:st={dur - fade:.3f}:d={fade:.3f},volume=0dB', '-c:a', 'libvorbis', '-q:a', '6', os.path.join(L, dst)], check=True)
    # peak-normalise to -3 dBFS like the library
    o = subprocess.run(['ffmpeg', '-nostats', '-i', os.path.join(L, dst), '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
    mx = float(o.split('max_volume:')[1].split('dB')[0])
    tmp = os.path.join(L, 'tmp_' + dst)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(L, dst), '-af', f'volume={-3 - mx}dB', '-c:a', 'libvorbis', '-q:a', '6', tmp], check=True)
    os.replace(tmp, os.path.join(L, dst))
trim('glitch/fs-402451-fast-forward.ogg', 'rewind-1s3.ogg', .3, 1.3)
trim('transition/fs-856168-cyberpunk-glitch-hologram-tran.ogg', 'glitch-0s5.ogg', .35, .5, .1)

man = json.load(open(os.path.join(SK, 'manifest.json')))
for grp in ('bundled', 'default_kit'):
    for e in man.get(grp, []):
        if e.get('file'): e['file'] = os.path.join(SK, e['file'])
orig = {os.path.basename(e['file']): e for e in man['bundled']}
def derived(name, src, cat):
    e = copy.deepcopy(orig[os.path.basename(src)]); e.update(file=os.path.join(L, name), category=cat, note=f"trimmed + peak -3 dBFS from {os.path.basename(src)} (same CC0 source)")
    man['bundled'].append(e); return e['file']
REW = derived('rewind-1s3.ogg', 'glitch/fs-402451-fast-forward.ogg', 'glitch')
GL = derived('glitch-0s5.ogg', 'transition/fs-856168-cyberpunk-glitch-hologram-tran.ogg', 'glitch')
json.dump(man, open(os.path.join(HERE, 'manifest.local.json'), 'w'), indent=1)

S = lambda f: os.path.join(SK, f)
CHOP, WL, WS = S('whoosh/fs-127197-fast-simple-chop-5-aif.ogg'), S('whoosh/fs-683101-quick-woosh.ogg'), S('kit/whoosh.ogg')
PUNCH0, PUNCH1 = S('impact/kenney-impact-impactpunch-heavy-000.ogg'), S('impact/kenney-impact-impactpunch-heavy-001.ogg')
SOFT0, SOFT1 = S('impact/kenney-impact-impactsoft-heavy-000.ogg'), S('impact/kenney-impact-impactsoft-heavy-001.ogg')
BIG = S('impact/fs-177242-cinematic-impact.ogg')
MAX1, MAX2 = S('pop/kenney-interface-maximize-001.ogg'), S('pop/kenney-interface-maximize-002.ogg')
PL1, PL2 = S('pop/kenney-interface-pluck-001.ogg'), S('pop/kenney-interface-pluck-002.ogg')
D1, D2, D3 = S('ding/kenney-interface-confirmation-001.ogg'), S('ding/kenney-interface-confirmation-002.ogg'), S('ding/kenney-interface-confirmation-003.ogg')
TYPE_S, TYPE_L = S('typing/fs-416777-digital-typing-wav.ogg'), S('typing/fs-447909-keyboard-typing.ogg')
SWIPE = S('transition/fs-702773-swipe-wav.ogg'); RISE_S = S('riser/fs-685256-riser-sound-effect-short-wav.ogg')
C = []
def cue(t, typ, desc, sw=None, dur=None):
    c = {'t': round(t, 3), 'type': typ, 'desc': desc}
    if dur: c['dur'] = dur
    C.append((c, sw))
# S1 cold open
cue(.45, 'movement', 'player dashes in'); cue(1.40, 'movement', 'player swing', CHOP)
cue(2.0, 'reveal', 'MISS stamp'); cue(2.0, 'error_or_tech', 'MISS glitch', GL)
cue(2.45, 'typing', '> Le has dado.', TYPE_S, .32); cue(2.95, 'typing', '> Lo has visto.', TYPE_S, .34)
cue(3.45, 'appear', 'Y no cuenta.'); cue(4.45, 'movement', 'player steps back', WS); cue(4.92, 'movement', 'enemy swing', CHOP)
cue(5.5, 'reveal', 'you get hit from far away', PUNCH0); cue(5.55, 'typing', '> Y a ti te pegan', TYPE_S, .4)
cue(6.0, 'appear', 'desde ahí.', PL1); cue(6.95, 'appear', 'sword hitbox revealed', MAX1)
cue(6.5, 'build_up', 'hitbox grows to fill screen', None, 1.5)
# S2 title
cue(8.0, 'reveal', 'hitbox floods -> title', BIG); cue(8.5, 'appear', 'HITBOXES DE', PL1); cue(9.0, 'appear', 'ROBLOX SON', PL2)
cue(9.5, 'reveal', 'UNA MIERDA.', SOFT0); cue(10.2, 'error_or_tech', 'misaligned hitbox', GL)
cue(11.15, 'movement', 'full stop detaches', WS); cue(11.5, 'scene_cut', 'dot floods ink', WL)
# S3 lag
cue(12.0, 'reveal', 'header 01', SOFT1); cue(13.5, 'appear', 'three panels')
cue(21.3, 'movement', 'camera pushes into your screen', WL); cue(22.45, 'movement', 'swing at the past', CHOP)
cue(22.95, 'appear', 'your hitbox', MAX2); cue(23.2, 'success', 'on your screen: yes', D1)
cue(24.0, 'reveal', 'server: MISS'); cue(24.0, 'error_or_tech', 'MISS glitch', GL)
# S4 rewind
cue(27.0, 'reveal', 'header 02', SOFT0); cue(29.0, 'error_or_tech', 'rewind 0.7 s', REW)
cue(30.5, 'success', 'HIT after rewind', D2); cue(30.5, 'reveal', 'HIT impact', PUNCH1)
cue(31.0, 'scene_cut', 'hard cut to text', WS); cue(31.5, 'reveal', 'NO VIENE DE SERIE', SOFT1)
cue(34.15, 'appear', 'Cada juego se lo programa', PL2); cue(34.75, 'reveal', '...O NO.')
cue(35.6, 'scene_cut', 'accent wipe')
# S5 one frame
cue(36.0, 'reveal', 'header 03', SOFT0); cue(37.9, 'typing', 'code typing', TYPE_L, 2.2)
cue(39.75, 'movement', 'swing', CHOP); cue(40.0, 'click', 'one-frame check'); cue(40.5, 'reveal', 'MISS'); cue(40.5, 'error_or_tech', 'MISS glitch', GL)
cue(43.25, 'click', 'select 5, 5, 5'); cue(43.6, 'typing', 'retype size', TYPE_S, .4); cue(43.95, 'typing', 'retype comment', TYPE_S, .7)
cue(44.0, 'movement', 'box becomes enormous', WL); cue(44.4, 'movement', 'swing', CHOP); cue(45.0, 'reveal', 'HIT from 3 metres', PUNCH0)
cue(47.3, 'build_up', 'giant box floods', RISE_S, .7)
# S6 dash
cue(48.0, 'reveal', 'header 04', SOFT1); cue(48.02, 'scene_cut', 'green collapses', WS)
cue(50.0, 'movement', 'dash', WL); cue(50.45, 'movement', 'swing', CHOP); cue(50.9, 'appear', 'server spawns box behind', MAX1)
cue(51.5, 'reveal', 'MISS'); cue(51.5, 'error_or_tech', 'MISS glitch', GL)
cue(57.0, 'movement', 'dash out', WS); cue(57.4, 'scene_cut', 'streak wipe', SWIPE)
# S7 tick rate
cue(58.0, 'reveal', 'header 05', SOFT0); cue(60.0, 'movement', 'shot 60/s', CHOP); cue(60.27, 'success', 'detected', D3)
cue(61.0, 'movement', 'shot 20/s', CHOP); cue(61.5, 'error_or_tech', 'goes straight through', GL)
cue(62.0, 'movement', 'zoom in', WS); cue(64.6, 'movement', 'zoom out', WS); cue(67.3, 'scene_cut', 'blue flood', WL)
# S8 who decides
cue(68.0, 'reveal', 'header 06', SOFT1); cue(69.55, 'scene_cut', 'orange half slides in', SWIPE)
cue(70.3, 'appear', 'row 1', PL1); cue(71.0, 'appear', 'row 2', PL2); cue(71.7, 'appear', 'row 3', PL1)
cue(72.4, 'appear', 'hitbox expander inflates', MAX2); cue(73.5, 'success', 'HIT (expander)', D1)
cue(73.6, 'appear', 'row 4', PL2); cue(74.3, 'appear', 'row 5', PL1); cue(75.0, 'appear', 'row 6', PL2)
cue(75.9, 'hover_or_small_ui', 'mini MISS'); cue(76.6, 'movement', 'bar slides up', WS); cue(77.0, 'reveal', 'punchline')
cue(79.4, 'scene_cut', 'bar floods ink', WL)
# S9 recap + end
for i in range(6): cue(80.4 + i * .45, 'hover_or_small_ui', f'recap row {i + 1}')
cue(84.4, 'movement', 'rows out', WS); cue(85.0, 'reveal', 'No es solo tu wifi.', BIG); cue(86.0, 'appear', 'Es cómo están hechas.', PL1)
cue(87.45, 'appear', 'hitbox of the sentence', MAX1); cue(88.0, 'reveal', 'final MISS', PUNCH1); cue(88.0, 'error_or_tech', 'MISS glitch', GL)
cues = [c for c, _ in C]; swaps = {str(i): sw for i, (_, sw) in enumerate(C) if sw}
json.dump(cues, open(os.path.join(HERE, 'cues.json'), 'w'), indent=1, ensure_ascii=False)
json.dump(swaps, open(os.path.join(HERE, 'swaps.json'), 'w'), indent=1)
print(len(cues), 'cues,', len(swaps), 'swaps')
