# Voices every line of guion.json into vo/<id>.wav (Kokoro, voice ef_dora) and checks it with Whisper.
#   python3 tts/gen_vo.py <project dir> <speed, e.g. 0.88> [line ids to redo...]
import json, sys, os, numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(__file__))
from tts_lib import make, say
from asr_lib import transcribe, wer
P, SPEED = sys.argv[1], float(sys.argv[2])
only = set(sys.argv[3:])
os.makedirs(f'{P}/vo', exist_ok=True)
tts = make('kokoro')
out = {}
if os.path.exists(f'{P}/vo/vo.json'): out = json.load(open(f'{P}/vo/vo.json'))
for sc in json.load(open(f'{P}/guion.json')):
    for lid, text in sc['lines']:
        if only and lid not in only: continue
        parts = []
        for chunk in text.split('|'):
            a, sr = say(tts, chunk, sid=28, speed=SPEED)
            nz = np.where(np.abs(a) > 0.01)[0]; parts += [a[max(0, nz[0] - int(.03 * sr)): nz[-1] + int(.08 * sr)], np.zeros(int(.3 * sr), np.float32)]
        a = np.concatenate(parts[:-1])
        text = text.replace('|', ' ')
        # trim leading/trailing silence
        thr = 0.01; nz = np.where(np.abs(a) > thr)[0]
        a = a[max(0, nz[0] - int(.03 * sr)): nz[-1] + int(.08 * sr)]
        sf.write(f'{P}/vo/{lid}.wav', a, sr)
        h = transcribe(a, sr); e = wer(text, h)
        out[lid] = {'dur': round(len(a) / sr, 3), 'wer': round(e, 3), 'asr': h}
        print(f'{lid} {len(a)/sr:5.2f}s wer={e:.2f}' + ('' if e == 0 else f'  -> {h}'), flush=True)
json.dump(out, open(f'{P}/vo/vo.json', 'w'), ensure_ascii=False, indent=1)
print('total', round(sum(v['dur'] for v in out.values()), 1))
