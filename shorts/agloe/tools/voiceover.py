"""Narration for the short: Kokoro TTS per line, then word timings for the captions.

usage: python voiceover.py script.json <kokoro-dir> <out-dir>
writes <out-dir>/vo.wav (24 kHz mono) and <out-dir>/timings.json

Kokoro gives no timestamps, so word times are estimated: each line is split at
its real pauses (silences found in the audio, matched to the punctuation), then
each clause is shared out by syllable count. Good to about +-0.1 s, which is
plenty for one-word captions.
"""
import json, re, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

script_path, kdir, out = sys.argv[1:4]
S = json.load(open(script_path))
k = Kokoro(f"{kdir}/kokoro-v1.0.onnx", f"{kdir}/voices-v1.0.bin")
SR = 24000
VOWELS = re.compile(r"[aeiouáéíóúü]+", re.I)


def syllables(w):
    return max(1, len(VOWELS.findall(w)))


def trim(a, thr=0.012):
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0:
        return a
    return a[max(0, idx[0] - 240): idx[-1] + 480]


def silences(a, min_len=0.07, thr=0.015):
    """inner silent spans (start, end) in seconds, using a 10 ms RMS envelope"""
    hop = 240
    n = len(a) // hop
    rms = np.array([np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)) for i in range(n)])
    quiet = rms < thr
    spans, i = [], 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if (j - i) * hop / SR >= min_len and i > 0 and j < n:
                spans.append((i * hop / SR, j * hop / SR))
            i = j
        else:
            i += 1
    return spans


def word_times(words, dur, sil):
    # clause boundaries after words that end in punctuation
    bounds = [i for i, w in enumerate(words[:-1]) if re.search(r"[,.:;?!…]$", w)]
    weights = [syllables(w) + (0.6 if re.search(r"[,.:;?!…]$", w) else 0) for w in words]
    total = sum(weights)
    # expected time of each boundary if speech were uniform
    cum = np.cumsum(weights) / total * dur
    cuts = []  # (word index, pause start, pause end)
    used = set()
    for b in bounds:
        exp = cum[b]
        best = None
        for si, (s0, s1) in enumerate(sil):
            if si in used:
                continue
            d = abs((s0 + s1) / 2 - exp)
            if d < 0.6 and (best is None or d < best[0]):
                best = (d, si)
        if best:
            used.add(best[1])
            cuts.append((b, *sil[best[1]]))
    cuts.sort()
    # share each clause's speech time out by syllables
    res = [None] * len(words)
    seg_start_w, seg_start_t = 0, 0.0
    for b, p0, p1 in cuts + [(len(words) - 1, dur, dur)]:
        ws = list(range(seg_start_w, b + 1))
        wt = [syllables(words[i]) for i in ws]
        span = p0 - seg_start_t
        t = seg_start_t
        for i, x in zip(ws, wt):
            d = span * x / sum(wt)
            res[i] = (round(t, 3), round(t + d, 3))
            t += d
        seg_start_w, seg_start_t = b + 1, p1
    return res


audio, lines, t = [], [], 0.25  # small lead-in
audio.append(np.zeros(int(0.25 * SR), dtype=np.float32))
for L in S["lines"]:
    a, sr = k.create(L["text"], voice=L.get("voice", S["voice"]), speed=L.get("speed", S["speed"]), lang="es")
    assert sr == SR
    a = trim(a.astype(np.float32))
    dur = len(a) / SR
    words = L["text"].split()
    wt = word_times(words, dur, silences(a))
    lines.append({
        "id": L["id"], "text": L["text"], "start": round(t, 3), "end": round(t + dur, 3),
        "words": [{"w": w, "start": round(t + s, 3), "end": round(t + e, 3)} for w, (s, e) in zip(words, wt)],
    })
    audio.append(a)
    gap = L.get("gap", 0.15)
    audio.append(np.zeros(int(gap * SR), dtype=np.float32))
    t += dur + gap
    print(f"{L['id']:8s} {lines[-1]['start']:6.2f}-{lines[-1]['end']:6.2f}  {L['text']}")

vo = np.concatenate(audio)
sf.write(f"{out}/vo.wav", vo, SR)
json.dump({"duration": round(len(vo) / SR, 3), "lines": lines}, open(f"{out}/timings.json", "w"), ensure_ascii=False, indent=1)
print("total", round(len(vo) / SR, 2), "s")
