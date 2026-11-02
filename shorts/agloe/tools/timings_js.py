"""build/timings.json -> build/timings.js (the page loads it with a script tag, so it works from file://)"""
import json, sys
d = sys.argv[1] if len(sys.argv) > 1 else 'build'
open(f'{d}/timings.js', 'w').write('window.TIMINGS = ' + json.dumps(json.load(open(f'{d}/timings.json')), ensure_ascii=False) + ';\n')
