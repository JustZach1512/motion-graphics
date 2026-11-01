#!/usr/bin/env python3
"""Inline the fonts and the CC0 sound effects into one self-contained HTML page.

    python3 build.py            # video.src.html -> claude-code-roblox.html
"""
import base64
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parent.parent
FONTS = REPO / "skills/motion-broll/engine/fonts"
SFX_DIR = REPO / "skills/sound-effects/sfx"

# name used in the page -> bundled CC0 file (see CREDITS.txt)
SFX = {
    "whoosh": "kit/whoosh.ogg",
    "qwoosh": "whoosh/fs-683101-quick-woosh.ogg",
    "click": "kit/click.ogg",
    "tick": "kit/tick.ogg",
    "pop": "kit/pop.ogg",
    "plop": "pop/fs-447910-plop.ogg",
    "riser": "kit/riser.ogg",
    "impact": "kit/impact.ogg",
    "pip": "ding/fs-634690-lil-pip.ogg",
    "confirm": "ding/kenney-interface-confirmation-001.ogg",
    "bell": "ding/fs-571513-soft-notifications-bell-ding-d.ogg",
    "toggle": "click/kenney-interface-toggle-001.ogg",
    "select": "click/kenney-interface-select-002.ogg",
    "max": "transition/kenney-interface-maximize-005.ogg",
    "keys": "typing/fs-447909-keyboard-typing.ogg",
    "type2": "typing/fs-323432-typing.ogg",
    "keys2": "typing/fs-79388-keyboard-typing-wav.ogg",
}


def b64(path: pathlib.Path) -> str:
    return base64.b64encode(path.read_bytes()).decode("ascii")


def main() -> None:
    fonts = (
        "<style>\n"
        "@font-face{font-family:'Geist';font-weight:100 900;font-display:block;"
        f"src:url(data:font/woff2;base64,{b64(FONTS / 'Geist-Variable.woff2')}) format('woff2')}}\n"
        "@font-face{font-family:'Geist Mono';font-weight:100 900;font-display:block;"
        f"src:url(data:font/woff2;base64,{b64(FONTS / 'GeistMono-Medium.woff2')}) format('woff2')}}\n"
        "</style>"
    )
    sfx = "<script>window.SFX={" + ",".join(
        f'"{k}":"{b64(SFX_DIR / v)}"' for k, v in SFX.items()
    ) + "};</script>"
    src = (HERE / "video.src.html").read_text(encoding="utf-8")
    assert "<!--ASSETS-->" in src
    out = HERE / "claude-code-roblox.html"
    out.write_text(src.replace("<!--ASSETS-->", fonts + "\n" + sfx), encoding="utf-8")
    print(f"{out.name}: {out.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
