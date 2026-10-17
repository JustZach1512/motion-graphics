# Builds diabetes.html from template.html: timeline from the voiceover clips,
# word timing from the pauses in each clip, embedded font and emoji icons,
# plus vo_track.wav (every clip placed on the timeline) for the final mix.
#   python3 build.py [path/to/fluent-emoji-flat/icons.json]
import base64, json, re, sys, wave
from pathlib import Path
import numpy as np

HERE = Path(__file__).parent
ICONS = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / 'assets/fluent-emoji-flat.json'
SR = 48000

GAP = 0.55            # pause after every line
SCENE_GAP = 1.0       # extra pause before a chapter title (transition)
START = 1.2           # first line starts here
END_CARD = 7.0        # end card after the last line
HOLD = {              # extra hold after a line so its animation can finish
    'i3': .6, 'a1': .6, 'a2': .5, 'a3': .6, 'a4': 1.2, 'a5': 1.4,
    'b1': .6, 'b2': .8, 'b3': 1.2, 'b4': 2.0,
    'c1': .8, 'c2': 1.4, 'c3': 1.0, 'c4': 1.0, 'c5': 1.6, 'c6': .8,
    'd1': .8, 'd2': 1.0, 'd3': 1.6, 'd4': 1.4, 'd5': 1.4, 'd6': 1.6, 'd7': 5.2, 'd7b': 1.4, 'd8': 1.0,
    'e1': .6, 'e2': 1.4, 'e3': 1.4,
    'f1': 1.0, 'f2': .8, 'f3': 1.0, 'f4': 1.2, 'f5': 1.2, 'f6': 1.0, 'f7': 1.2,
    'g1': .6, 'g2': 1.2, 'g3': 1.0, 'g4': 1.2, 'g5': 1.6, 'g6': 1.2, 'g7': 1.2,
    't8': .4, 'h1': .8, 'h2': 1.2, 'h3': 1.2, 'h4': 2.0,
}
PUNCT = re.compile(r'[,.;:!?…]+(?=\s)')


def read_wav(p):
    with wave.open(str(p)) as w:
        sr, n, ch, sw = w.getframerate(), w.getnframes(), w.getnchannels(), w.getsampwidth()
        raw = w.readframes(n)
    if sw == 2:
        a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    else:
        import soundfile as sf
        a, sr = sf.read(str(p), dtype='float32')
        return (a if a.ndim == 1 else a.mean(1)), sr
    return (a.reshape(-1, ch).mean(1) if ch > 1 else a), sr


def word_segments(text, a, sr):
    """Piecewise map from character index to time, anchored on the pauses the voice makes at punctuation."""
    hop = int(sr * .01)
    rms = np.sqrt(np.convolve(a ** 2, np.ones(hop) / hop, 'same'))[::hop]
    quiet = rms < max(rms.max() * .04, 1e-4)
    gaps, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            if j - i >= 9 and i > 5 and j < len(quiet) - 5:
                gaps.append(((i + j) / 2 * .01, (j - i) * .01))
            i = j
        else:
            i += 1
    marks = [m.end() for m in PUNCT.finditer(text)]
    dur, n = len(a) / sr, len(text)
    if not marks or not gaps:
        return [[0, 0], [n, dur]]
    if len(gaps) > len(marks):  # keep the longest pauses, in order
        gaps = sorted(sorted(gaps, key=lambda g: -g[1])[:len(marks)])
    pts = [[0, 0.0]]
    if len(gaps) == len(marks):
        pts += [[c, g[0]] for c, g in zip(marks, gaps)]
    else:  # fewer pauses than punctuation: pin each pause to the nearest mark by proportion
        used = set()
        for g in gaps:
            c = min((c for c in marks if c not in used), key=lambda c: abs(c / n - g[0] / dur))
            used.add(c)
            pts.append([c, g[0]])
        pts.sort()
    pts.append([n, dur])
    return [[c, round(t, 3)] for c, t in pts]


def main():
    script = json.loads((HERE / 'guion.json').read_text())
    lines, scenes, t = {}, [], START
    clips = []
    for k, sc in enumerate(script):
        if k > 0:
            t += SCENE_GAP
        s0 = t
        for lid, text in sc['lines']:
            a, sr = read_wav(HERE / f'vo/{lid}.wav')
            text = text.replace('|', ' ')
            dur = len(a) / sr
            lines[lid] = {'s': round(t, 3), 'e': round(t + dur, 3), 'text': text, 'seg': word_segments(text, a, sr)}
            clips.append((t, a, sr))
            t += dur + GAP + HOLD.get(lid, 0)
        scenes.append({'name': sc['scene'], 'title': sc.get('title', ''), 'first': sc['lines'][0][0], 's': round(s0, 3)})
    duration = round(t - GAP + END_CARD, 2)
    for i, sc in enumerate(scenes):
        sc['e'] = scenes[i + 1]['s'] if i + 1 < len(scenes) else duration
    tl = {'lines': lines, 'scenes': scenes, 'duration': duration}
    (HERE / 'timeline.json').write_text(json.dumps(tl, ensure_ascii=False, indent=1))

    # voiceover track at 48 kHz mono
    track = np.zeros(int(duration * SR) + SR, np.float32)
    for t0, a, sr in clips:
        if sr != SR:
            x = np.arange(int(len(a) * SR / sr)) * sr / SR
            a = np.interp(x, np.arange(len(a)), a).astype(np.float32)
        i = int(t0 * SR)
        track[i:i + len(a)] += a
    with wave.open(str(HERE / 'vo_track.wav'), 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(track, -1, 1) * 32767).astype(np.int16).tobytes())

    tpl = (HERE / 'template.html').read_text()
    names = sorted(set(re.findall(r"EM\('([a-z0-9-]+)'", tpl)))
    data = json.loads(ICONS.read_text())
    icons, aliases = data['icons'], data.get('aliases', {})
    emoji = {}
    for nm in names:
        src = nm if nm in icons else aliases.get(nm, {}).get('parent')
        if not src or src not in icons:
            sys.exit(f'missing emoji: {nm}')
        emoji[nm] = icons[src]['body']
    font = base64.b64encode((HERE / 'assets/fredoka-latin.woff2').read_bytes()).decode()
    html = (tpl.replace('/*TIMELINE*/null', json.dumps(tl, ensure_ascii=False))
               .replace('/*EMOJI*/null', json.dumps(emoji))
               .replace('FONT_BASE64', font))
    (HERE / 'diabetes.html').write_text(html)
    print(f'duration {duration:.1f}s  lines {len(lines)}  emoji {len(emoji)}  -> diabetes.html, timeline.json, vo_track.wav')


if __name__ == '__main__':
    main()
