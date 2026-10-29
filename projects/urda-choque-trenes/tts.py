"""Synthesise the narration line by line and write the timeline the animation reads.

    python3 tts.py <piper-model-dir>

Writes audio/narration.wav (48 kHz mono) and timeline.json (scene and line times in seconds).
"""
import json
import sys
from pathlib import Path

import numpy as np
import sherpa_onnx
import soundfile as sf

HERE = Path(__file__).parent
SR_OUT = 48000
LINE_GAP = 0.45     # silence between lines of the same scene
SCENE_TAIL = 0.4    # silence after a scene's last line, before the next scene's lead


def load_tts(model_dir: Path) -> sherpa_onnx.OfflineTts:
    onnx = next(model_dir.glob("*.onnx"))
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=str(onnx),
                tokens=str(model_dir / "tokens.txt"),
                data_dir=str(model_dir / "espeak-ng-data"),
            ),
            num_threads=4,
        ),
    )
    return sherpa_onnx.OfflineTts(cfg)


def resample(x: np.ndarray, sr: int) -> np.ndarray:
    if sr == SR_OUT:
        return x
    n = int(round(len(x) * SR_OUT / sr))
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)


def trim(x: np.ndarray, thresh: float = 0.01) -> np.ndarray:
    idx = np.where(np.abs(x) > thresh)[0]
    if not len(idx):
        return x
    pad = int(0.03 * SR_OUT)
    return x[max(0, idx[0] - pad): idx[-1] + pad]


def main() -> None:
    tts = load_tts(Path(sys.argv[1]))
    spec = json.loads((HERE / "narration.json").read_text())
    parts, t = [], 0.0
    timeline = {"scenes": []}

    def silence(sec: float) -> None:
        nonlocal t
        parts.append(np.zeros(int(round(sec * SR_OUT)), np.float32))
        t += sec

    for scene in spec["scenes"]:
        entry = {"id": scene["id"], "start": round(t, 3), "lines": []}
        silence(scene.get("lead", 0.8))
        for i, line in enumerate(scene["lines"]):
            if i:
                silence(LINE_GAP)
            audio = tts.generate(line["say"], sid=0, speed=spec["speed"])
            x = trim(resample(np.asarray(audio.samples, np.float32), audio.sample_rate))
            entry["lines"].append({"start": round(t, 3), "end": round(t + len(x) / SR_OUT, 3), "cap": line["cap"]})
            parts.append(x)
            t += len(x) / SR_OUT
        silence(SCENE_TAIL if scene["lines"] else 0)
        silence(scene.get("tail", 0))
        timeline["scenes"].append(entry)

    for a, b in zip(timeline["scenes"], timeline["scenes"][1:]):
        a["end"] = b["start"]
    timeline["scenes"][-1]["end"] = round(t, 3)
    timeline["duration"] = round(t, 3)

    wav = np.concatenate(parts)
    wav *= 0.89 / max(1e-6, np.abs(wav).max())
    (HERE / "audio").mkdir(exist_ok=True)
    sf.write(HERE / "audio" / "narration.wav", wav, SR_OUT, subtype="PCM_16")
    (HERE / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1))
    for s in timeline["scenes"]:
        print(f'{s["id"]:<14} {s["start"]:7.2f} → {s["end"]:7.2f}')
    print(f'total {t:.2f}s')


if __name__ == "__main__":
    main()
