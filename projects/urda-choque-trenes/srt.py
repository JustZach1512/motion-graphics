"""Write out/urda.srt from timeline.json (one cue per narrated line)."""
import json
from pathlib import Path

HERE = Path(__file__).parent
tl = json.loads((HERE / "timeline.json").read_text())


def ts(t: float) -> str:
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


lines = [l for s in tl["scenes"] for l in s["lines"]]
(HERE / "out").mkdir(exist_ok=True)
(HERE / "out" / "urda.srt").write_text(
    "\n".join(f"{i}\n{ts(l['start'])} --> {ts(l['end'] + 0.3)}\n{l['cap']}\n" for i, l in enumerate(lines, 1)))
print(len(lines), "cues")
