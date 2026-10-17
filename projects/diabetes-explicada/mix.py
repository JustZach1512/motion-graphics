# Mixes the soundtrack: voiceover (vo_track.wav) + CC0 sound effects from the
# sound-effects skill on every cue in cues.json + a soft plucked music bed that
# ducks under the voice. Writes out/mix.wav (48 kHz stereo, not yet normalised).
#   python3 mix.py
import json, wave
from pathlib import Path
import numpy as np
import soundfile as sf

HERE = Path(__file__).parent
SFX = HERE / '../../skills/sound-effects/sfx'
SR = 48000

# one bundled CC0 sound (or a few takes) per cue category, and its level
KIT = {
    'pop':    (['kit/pop.ogg', 'pop/kenney-interface-pluck-001.ogg', 'pop/fs-447910-plop.ogg', 'pop/kenney-interface-pluck-002.ogg'], 0.20),
    'whoosh': (['kit/whoosh.ogg', 'whoosh/fs-169867-swoosh.ogg', 'whoosh/fs-683101-quick-woosh.ogg'], 0.20),
    'tick':   (['kit/tick.ogg', 'tick/fs528561.ogg'], 0.20),
    'click':  (['kit/click.ogg'], 0.32),
    'ding':   (['ding/kenney-interface-confirmation-001.ogg', 'ding/fs-634690-lil-pip.ogg', 'ding/kenney-interface-glass-001.ogg'], 0.24),
    'impact': (['kit/impact.ogg'], 0.50),
}


def load(path):
    a, sr = sf.read(str(path), dtype='float32', always_2d=True)
    a = a.mean(1)
    if sr != SR:
        a = np.interp(np.arange(int(len(a) * SR / sr)) * sr / SR, np.arange(len(a)), a).astype(np.float32)
    return a / (np.abs(a).max() + 1e-9)


def add(buf, a, t, g=1.0, pan=0.0):
    i = max(0, int(t * SR))
    if i >= len(buf):
        return
    a = a[:len(buf) - i]
    buf[i:i + len(a), 0] += a * g * np.sqrt(0.5 * (1 - pan))
    buf[i:i + len(a), 1] += a * g * np.sqrt(0.5 * (1 + pan))


# ---------------------------------------------------------------- music bed
def ks_pluck(freq, dur, seed):
    """Karplus-Strong plucked string, computed a period at a time."""
    n = int(dur * SR)
    N = max(2, int(round(SR / freq)))
    rng = np.random.default_rng(seed)
    y = np.zeros(n + N + 1, np.float32)
    y[:N + 1] = rng.uniform(-1, 1, N + 1).astype(np.float32)
    y[:N + 1] -= y[:N + 1].mean()
    k = N + 1
    while k < n + N + 1:
        e = min(k + N, n + N + 1)
        y[k:e] = 0.4985 * (y[k - N:e - N] + y[k - N - 1:e - N - 1])
        k = e
    out = y[N + 1:N + 1 + n]
    out = np.convolve(out, [0.25, 0.5, 0.25], 'same')  # soften
    return out / (np.abs(out).max() + 1e-9)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def music(duration):
    bpm = 96
    beat = 60 / bpm
    bar = 4 * beat
    # C G Am F | F G C Am  (MIDI chord tones)
    prog = [[48, 55, 60, 64, 67], [43, 55, 59, 62, 67], [45, 57, 60, 64, 69], [41, 53, 57, 60, 65],
            [41, 53, 57, 60, 65], [43, 55, 59, 62, 67], [48, 55, 60, 64, 67], [45, 57, 60, 64, 69]]
    cache = {}

    def pluck(m, d=1.6):
        if m not in cache:
            cache[m] = ks_pluck(midi(m), d, m)
        return cache[m]

    buf = np.zeros((int(duration * SR) + SR * 2, 2), np.float32)
    rng = np.random.default_rng(3)
    t, b = 0.0, 0
    pattern = [1, 3, 2, 4, 3, 2, 4, 3]  # arpeggio over chord tones, eighth notes
    while t < duration:
        ch = prog[b % len(prog)]
        # bass on beats 1 and 3
        for k, bt in enumerate((0, 2)):
            f = midi(ch[0] - 12 if ch[0] > 45 else ch[0])
            n = int(beat * 2 * SR)
            tt = np.arange(n) / SR
            env = (1 - np.exp(-tt * 60)) * np.exp(-tt * 2.2)
            add(buf, (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt)) * env, t + bt * beat, 0.55)
        # plucked arpeggio
        for i, p in enumerate(pattern):
            m = ch[p]
            v = (0.9 if i % 2 == 0 else 0.7) * (0.92 + 0.16 * rng.random())
            add(buf, pluck(m), t + i * beat / 2 + rng.normal(0, 0.004), 0.32 * v, pan=(-0.35 if i % 2 else 0.35))
        # soft shaker on eighths
        for i in range(8):
            n = int(0.05 * SR)
            nz = rng.uniform(-1, 1, n).astype(np.float32)
            nz = np.diff(nz, prepend=0)  # high-pass
            env = np.exp(-np.arange(n) / SR * 90)
            add(buf, nz * env, t + i * beat / 2, 0.035 if i % 2 else 0.02, pan=0.2)
        t += bar
        b += 1
    return buf


def envelope(x, attack, release):
    """Peak follower with separate attack/release times (seconds), on 10 ms frames."""
    hop = SR // 100
    fr = np.sqrt(np.add.reduceat(x ** 2, np.arange(0, len(x), hop)) / hop)
    out = np.zeros_like(fr)
    a, r = np.exp(-0.01 / attack), np.exp(-0.01 / release)
    v = 0.0
    for i, f in enumerate(fr):
        v = a * v + (1 - a) * f if f > v else r * v + (1 - r) * f
        out[i] = v
    return np.repeat(out, hop)[:len(x)]


def main():
    tl = json.loads((HERE / 'timeline.json').read_text())
    dur = tl['duration']
    n = int(dur * SR)
    with wave.open(str(HERE / 'vo_track.wav')) as w:
        vo = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)[:n] / 32768
    vo = np.pad(vo, (0, n - len(vo)))
    vo /= np.abs(vo).max() + 1e-9
    vo *= 0.9

    # sound effects
    fx = np.zeros((n, 2), np.float32)
    takes = {k: [load(SFX / f) for f in fs] for k, (fs, _) in KIT.items()}
    cues = json.loads((HERE / 'cues.json').read_text())
    merged = []
    for c in cues:  # one sound per category within 120 ms
        if merged and merged[-1]['cat'] == c['cat'] and c['t'] - merged[-1]['t'] < 0.12:
            merged[-1]['gain'] = max(merged[-1]['gain'], c['gain'])
            continue
        merged.append(dict(c))
    count = {}
    for c in merged:
        k = c['cat']
        i = count.get(k, 0); count[k] = i + 1
        a = takes[k][i % len(takes[k])]
        lead = 0.07 if k == 'whoosh' else 0.0  # whooshes start just before the move
        add(fx, a, max(0, c['t'] - lead), KIT[k][1] * c['gain'], pan=((i * 37) % 7 - 3) * 0.06)
    (HERE / 'out').mkdir(exist_ok=True)
    (HERE / 'out/cues_used.json').write_text(json.dumps(merged))

    # music: quiet bed, ducked by ~9 dB under the voice, fades at both ends
    mu = music(dur)[:n]
    speech = vo[np.abs(vo) > 0.02]
    vo_rms = np.sqrt(np.mean(speech ** 2))
    mu *= (vo_rms * 10 ** (-15 / 20)) / (np.sqrt(np.mean(mu ** 2)) + 1e-9)
    env = envelope(vo, 0.06, 0.45)
    duck = 1 - (1 - 10 ** (-9 / 20)) * np.clip(env / (vo_rms * 0.5), 0, 1)
    t = np.arange(n) / SR
    fade = np.clip(t / 1.5, 0, 1) * np.clip((dur - t) / 4.0, 0, 1)
    mu *= (duck * fade)[:, None]

    mix = mu + fx + np.stack([vo, vo], 1)
    peak = np.abs(mix).max()
    if peak > 0.98:
        mix *= 0.98 / peak
    sf.write(str(HERE / 'out/mix.wav'), mix, SR, subtype='PCM_24')
    print(f'mix: {dur:.1f}s, {len(merged)} sfx ({count}), peak {peak:.2f} -> out/mix.wav')


if __name__ == '__main__':
    main()
