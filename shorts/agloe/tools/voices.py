"""Multi-voice narration: narrator + character voices, with word timings from speech recognition.

usage: python voices.py script.json <models-dir> <out-dir>
  <models-dir> holds kokoro-v1.0.onnx, voices-v1.0.bin, vits-piper-<voice>/ folders
  and sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8/ (all downloadable from GitHub releases, see README)
writes <out-dir>/vo.wav (48 kHz mono), <out-dir>/timings.json, <out-dir>/voice_report.txt

Each line is synthesized with its speaker's engine (Kokoro or Piper), pitch-shifted with
formants preserved (rubberband) and given a light voice chain (high-pass, presence, compression).
Word times come from Parakeet (NeMo TDT) token timestamps, aligned to the script words; words the
recogniser hears differently (names like "Agloe") are interpolated from their neighbours.
"""
import difflib, json, re, subprocess, sys
import numpy as np
import sherpa_onnx
from kokoro_onnx import Kokoro
from piper import PiperVoice, SynthesisConfig

script_path, M, out = sys.argv[1:4]
S = json.load(open(script_path))
SR = 48000
kok = Kokoro(f"{M}/kokoro-v1.0.onnx", f"{M}/voices-v1.0.bin")
pipers = {}
P = f"{M}/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"
asr = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=f"{P}/encoder.int8.onnx", decoder=f"{P}/decoder.int8.onnx", joiner=f"{P}/joiner.int8.onnx",
                                                    tokens=f"{P}/tokens.txt", model_type="nemo_transducer", num_threads=4)


def synth(sp, text):
    if sp["engine"] == "kokoro":
        a, sr = kok.create(text, voice=sp["voice"], speed=sp.get("speed", 1.0), lang=sp.get("lang", "es"))
        return np.asarray(a, np.float32), sr
    v = pipers.get(sp["voice"]) or pipers.setdefault(sp["voice"], PiperVoice.load(f"{M}/vits-piper-{sp['voice']}/{sp['voice']}.onnx"))
    ch = list(v.synthesize(text, syn_config=SynthesisConfig(length_scale=1 / sp.get("speed", 1.0))))
    return np.concatenate([c.audio_float_array for c in ch]).astype(np.float32), ch[0].sample_rate


def process(a, sr, sp):
    """pitch shift (formants kept) + voice chain, resampled to 48 kHz"""
    ratio = 2 ** (sp.get("pitch", 0) / 12)
    chain = [f"aresample={SR}"]
    if abs(ratio - 1) > 1e-3:
        chain.append(f"rubberband=pitch={ratio:.4f}:formant=preserved:transients=smooth")
    chain += ["highpass=f=75", "equalizer=f=220:t=q:w=1:g=1.5", "equalizer=f=3200:t=q:w=1.2:g=2.5", "deesser=i=0.4",
              "acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2"]
    r = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "-", "-af", ",".join(chain), "-f", "f32le", "-"],
                       input=a.tobytes(), capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32).copy()


def trim(a, thr=0.01):
    idx = np.where(np.abs(a) > thr)[0]
    return a if len(idx) == 0 else a[max(0, idx[0] - int(.01 * SR)): idx[-1] + int(.03 * SR)]


norm = lambda w: re.sub(r"[^a-záéíóúñü]", "", w.lower())
VOW = re.compile(r"[aeiouáéíóúü]+", re.I)
syl = lambda w: max(1, len(VOW.findall(w)))


def recognise(a):
    a16 = np.interp(np.arange(0, len(a), SR / 16000), np.arange(len(a)), a).astype(np.float32)
    st = asr.create_stream(); st.accept_waveform(16000, a16); asr.decode_stream(st)
    r = st.result
    words = []  # (text, start)
    for tok, ts in zip(r.tokens, r.timestamps):
        if tok.startswith((" ", "▁")) or not words:
            words.append([tok.lstrip(" ▁"), ts])
        else:
            words[-1][0] += tok
    return r.text, words


def align(script_words, heard, dur):
    """start/end of each script word: recogniser times where words match, interpolation elsewhere"""
    sw = [norm(w) for w in script_words]
    hw = [norm(w) for w, _ in heard]
    starts = [None] * len(sw)
    for blk in difflib.SequenceMatcher(a=sw, b=hw, autojunk=False).get_matching_blocks():
        for i in range(blk.size):
            starts[blk.a + i] = heard[blk.b + i][1]
    if starts[0] is None:
        starts[0] = min(heard[0][1], 0.05) if heard else 0.0
    # fill gaps by syllable-weighted interpolation between known anchors
    anchors = [i for i, s in enumerate(starts) if s is not None] + [len(sw)]
    ends_t = dur - 0.05
    for a_i, b_i in zip(anchors, anchors[1:]):
        t0 = starts[a_i]; t1 = starts[b_i] if b_i < len(sw) else ends_t
        wts = [syl(script_words[j]) for j in range(a_i, b_i)]
        acc = 0
        for j, w in zip(range(a_i, b_i), wts):
            if starts[j] is None:
                starts[j] = t0 + (t1 - t0) * acc / sum(wts)
            acc += w
    for i in range(1, len(starts)):  # keep monotonic
        starts[i] = max(starts[i], starts[i - 1] + 0.06)
    ends = [starts[i + 1] - 0.02 for i in range(len(starts) - 1)] + [ends_t]
    return [(round(s, 3), round(e, 3)) for s, e in zip(starts, ends)]


audio = [np.zeros(int(.25 * SR), np.float32)]
t = .25
lines, report = [], []
for L in S["lines"]:
    sp = S["speakers"][L["who"]]
    a, sr = synth(sp, L["text"])
    a = trim(process(a, sr, sp))
    a *= 0.5 / max(1e-6, np.percentile(np.abs(a), 99.5))  # even level between voices
    dur = len(a) / SR
    text_heard, heard = recognise(a)
    words = L["text"].split()
    wt = align(words, heard, dur)
    matched = sum(1 for w in words if norm(w) in {norm(h) for h, _ in heard})
    report.append(f"{L['id']:8s} {L['who']:6s} {dur:5.2f}s  heard {matched}/{len(words)} words  | {text_heard}")
    lines.append({"id": L["id"], "who": L["who"], "text": L["text"], "start": round(t, 3), "end": round(t + dur, 3),
                  "words": [{"w": w, "start": round(t + s, 3), "end": round(t + e, 3)} for w, (s, e) in zip(words, wt)]})
    audio.append(a)
    gap = L.get("gap", .15)
    audio.append(np.zeros(int(gap * SR), np.float32))
    t += dur + gap
    print(report[-1], flush=True)

vo = np.concatenate(audio)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", f"{out}/vo.wav"], input=vo.tobytes(), check=True)
json.dump({"duration": round(len(vo) / SR, 3), "lines": lines}, open(f"{out}/timings.json", "w"), ensure_ascii=False, indent=1)
open(f"{out}/voice_report.txt", "w").write("\n".join(report) + "\n")
print("total", round(len(vo) / SR, 2), "s")
