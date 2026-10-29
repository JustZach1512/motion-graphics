"""Mix the narration with a few CC0 effects from skills/sound-effects, timed from timeline.json.

    python3 mix.py            → audio/mix.wav (48 kHz stereo, not yet loudness-normalised)

Cue times mirror the anchors in src.html (T_IMPACT, the LZB failure, the radio card, the control-centre card).
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).parent
SFX = HERE.parent.parent / "skills" / "sound-effects" / "sfx"
SR = 48000

tl = json.loads((HERE / "timeline.json").read_text())
S = {s["id"]: s for s in tl["scenes"]}
L = lambda sid, i: S[sid]["lines"][i]
T_IMPACT = L("choque", 1)["end"] - 1.35


def load(rel: str) -> np.ndarray:
    x, sr = sf.read(SFX / rel, dtype="float32", always_2d=True)
    x = x.mean(1)
    if sr != SR:
        n = int(round(len(x) * SR / sr))
        x = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)
    return x


def hit_time(x: np.ndarray) -> float:
    """Where a riser's hit lands: the first point within 0.5 s before the loudest 10 ms that is within 6 dB of it."""
    w = SR // 100
    db = 20 * np.log10(np.sqrt(np.convolve(x * x, np.ones(w) / w, mode="same") + 1e-12))[::w]
    peak = int(np.argmax(db))
    lo = max(0, peak - 50)
    return float((lo + int(np.argmax(db[lo:peak + 1] > db[peak] - 6))) * w / SR)


def fade(x: np.ndarray, fin: float = 0.0, fout: float = 0.0, length: float | None = None) -> np.ndarray:
    x = x[: int(length * SR)].copy() if length else x.copy()
    if fin:
        n = min(len(x), int(fin * SR)); x[:n] *= np.linspace(0, 1, n)
    if fout:
        n = min(len(x), int(fout * SR)); x[-n:] *= np.linspace(1, 0, n)
    return x


narr, sr = sf.read(HERE / "audio" / "narration.wav", dtype="float32")
assert sr == SR
out = np.zeros((len(narr), 2), np.float32)
out[:, 0] += narr; out[:, 1] += narr

riser = load("riser/fs-396160-scary-hits-risers-002.ogg")
cues = [  # (time, sound, gain dB, pan -1..1)
    (S["salidas"]["start"] - 0.15, load("kit/whoosh.ogg"), -16, 0),
    (L("lzb", 1)["start"] + 0.9, fade(load("glitch/kenney-sci-computernoise-000.ogg"), 0.02, 0.6, 1.3), -30, 0),
    (L("lzb", 2)["end"] - 3.4, load("ui-blip/kenney-digital-twotone1.ogg"), -24, 0.25),
    (L("orden", 0)["start"] + 0.2, load("ui-blip/kenney-digital-twotone2.ogg"), -24, -0.25),
    (T_IMPACT - hit_time(riser), fade(riser, 0.8, 1.2), -9, 0),
    (T_IMPACT, fade(load("impact/fs-222517-dramatic-hit.ogg"), 0, 1.5), -12, 0),
]
for t, x, gain, pan in cues:
    a = int(round(t * SR)); x = x[: max(0, len(out) - a)] * 10 ** (gain / 20)
    out[a:a + len(x), 0] += x * min(1, 1 - pan)
    out[a:a + len(x), 1] += x * min(1, 1 + pan)
    print(f"{t:7.2f}s  gain {gain:+d} dB")

out *= 0.9 / max(1e-6, np.abs(out).max())
sf.write(HERE / "audio" / "mix.wav", out, SR, subtype="PCM_16")
print(f"riser hit at {hit_time(riser):.2f}s into the file; impact at {T_IMPACT:.2f}s")
