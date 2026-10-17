import sherpa_onnx, numpy as np, soundfile as sf, os
M = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
def make(voice, threads=4):
    if voice.startswith('kokoro'):
        d = f'{M}/kokoro-multi-lang-v1_0'
        cfg = sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
            model=f'{d}/model.onnx', voices=f'{d}/voices.bin', tokens=f'{d}/tokens.txt',
            data_dir=f'{d}/espeak-ng-data', dict_dir=f'{d}/dict', lexicon=f'{d}/lexicon-us-en.txt', lang='es'), num_threads=threads)
    else:
        name = voice.split(':')[0]
        d = f'{M}/vits-piper-{name}'
        cfg = sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=f'{d}/{name}.onnx', tokens=f'{d}/tokens.txt', data_dir=f'{d}/espeak-ng-data'), num_threads=threads)
    return sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=cfg, max_num_sentences=1))
def say(tts, text, sid=0, speed=1.0):
    a = tts.generate(text, sid=sid, speed=speed)
    return np.array(a.samples, dtype=np.float32), a.sample_rate
