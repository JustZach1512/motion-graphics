#!/usr/bin/env python3
"""Inline the embedded fonts into src/video.src.html -> video.html (self-contained)."""
import pathlib
here = pathlib.Path(__file__).parent
src = (here / 'src/video.src.html').read_text()
fonts = (here / 'fonts/embed.css').read_text()
(here / 'video.html').write_text(src.replace('/*FONTS*/', fonts))
print('video.html', len(src) + len(fonts), 'bytes')
