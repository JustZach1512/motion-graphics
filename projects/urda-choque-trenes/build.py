"""Inline the timeline, the map and the fonts into src.html → dist/urda.html (one self-contained page).

    python3 build.py
"""
import base64
from pathlib import Path

HERE = Path(__file__).parent
FONTS = HERE.parent.parent / "skills" / "motion-broll" / "engine" / "fonts"


def b64(p: Path) -> str:
    return base64.b64encode(p.read_bytes()).decode()


page = (HERE / "src.html").read_text()
page = (page.replace("/*TIMELINE*/", (HERE / "timeline.json").read_text())
            .replace("/*MAP*/", (HERE / "work" / "map.json").read_text())
            .replace("/*FONT_GEIST*/", b64(FONTS / "Geist-Variable.woff2"))
            .replace("/*FONT_MONO*/", b64(FONTS / "GeistMono-Medium.woff2")))
out = HERE / "dist" / "urda.html"
out.parent.mkdir(exist_ok=True)
out.write_text(page)
print(out, f"{len(page) / 1e6:.2f} MB")
