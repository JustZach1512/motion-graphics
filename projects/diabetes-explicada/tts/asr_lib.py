import sherpa_onnx, soundfile as sf, numpy as np, os, re, unicodedata
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models/sherpa-onnx-whisper-small')
_r = None
def rec():
    global _r
    if _r is None:
        _r = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{M}/small-encoder.int8.onnx', decoder=f'{M}/small-decoder.int8.onnx',
            tokens=f'{M}/small-tokens.txt', language='es', task='transcribe', num_threads=4)
    return _r
def transcribe(samples, sr):
    r = rec(); s = r.create_stream(); s.accept_waveform(sr, samples); r.decode_stream(s); return s.result.text.strip()
def norm(t):
    t = unicodedata.normalize('NFD', t.lower()); t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9ñ ]', ' ', t).split()
def wer(ref, hyp):
    a, b = norm(ref), norm(hyp); d = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        p, d[0] = d[0], i
        for j in range(1, len(b) + 1):
            p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (a[i - 1] != b[j - 1]))
    return d[len(b)] / max(1, len(a))
