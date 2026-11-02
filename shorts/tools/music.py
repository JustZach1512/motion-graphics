"""Original background music for a short, composed as MIDI and rendered with FluidSynth.

usage: python music.py <story>/music.json <out_dir>
writes <out_dir>/music.mid and <out_dir>/music.wav (48 kHz stereo)

Two kits (music.json "kit"):
  period  harpsichord + pizzicato strings + bassoon + woodblock (default)
  march   1940s sneaky march: piccolo + clarinet lead, tuba, pizzicato, snare and bass drum,
          trombone "wah wah wah" for the comic beat
D minor, with sections placed on story beats (times in seconds, from music.json):
  theme    the sneaky main tune, looping its 8 bars
  stop     everything stops (one timpani hit) - the comic freeze
  jaunty   the tune again, brighter, glockenspiel doubling the melody
  mystery  sparse and low (strings pad, clarinet, soft pizzicato) for the reveal
  final    the tune with timpani on the downbeats, ending on a big D minor chord
Instruments come from FluidR3 GM (MIT licence, apt package fluid-soundfont-gm).
The composition is original and belongs to whoever publishes the video.
"""
import json, subprocess, sys
import mido

plan_path, out = sys.argv[1:3]
P = json.load(open(plan_path))
BPM = P.get('bpm', 112)
SPB = 60 / BPM                     # seconds per beat
TPB = 480
SF2 = P.get('soundfont', '/usr/share/sounds/sf2/FluidR3_GM.sf2')

KIT = P.get('kit', 'period')
CH = {'harpsi': (0, 6), 'pizz': (1, 45), 'bassoon': (2, 70), 'clar': (3, 71), 'timp': (4, 47), 'glock': (5, 9), 'pad': (6, 48), 'comic': (7, 70), 'drums': (9, None)}
if KIT == 'march':
    CH.update({'harpsi': (0, 72), 'bassoon': (2, 58), 'comic': (7, 57)})   # piccolo lead, tuba bass, trombone gag
events = []  # (time_s, channel, note, dur_s, vel)


def note(t, ch, n, dur_beats, vel):
    events.append((t, CH[ch][0], n, dur_beats * SPB, vel))


# ---- material (beats inside a bar) ----
CHORDS = ['Dm', 'A7', 'Dm', 'A7', 'Gm', 'Dm', 'A7', 'Dm']
BASS = {'Dm': [50, 45, 50, 45], 'A7': [45, 52, 49, 52], 'Gm': [43, 50, 46, 50], 'Bb': [46, 53, 50, 53], 'A': [45, 52, 49, 52]}
VOICE = {'Dm': [62, 65, 69], 'A7': [61, 64, 67], 'Gm': [62, 67, 70], 'Bb': [62, 65, 70], 'A': [61, 64, 69]}
MEL = [
    [(0, 74, .45), (1, 69, .45), (1.5, 70, .45), (2, 69, .45), (3, 65, .45), (3.5, 67, .45)],
    [(0, 69, .45), (1, 64, .45), (1.5, 65, .45), (2, 64, .45), (3, 61, .9)],
    [(0, 74, .45), (1, 77, .45), (1.5, 76, .45), (2, 74, .45), (3, 73, .45), (3.5, 74, .45)],
    [(0, 76, .9), (1, 73, .45), (2, 69, 1.8)],
    [(0, 79, .45), (1, 77, .45), (1.5, 74, .45), (2, 70, .45), (3, 74, .45), (3.5, 79, .45)],
    [(0, 77, .45), (1, 74, .45), (1.5, 69, .45), (2, 65, .45), (3, 69, .45), (3.5, 74, .45)],
    [(0, 76, .45), (1, 73, .45), (1.5, 76, .45), (2, 79, .45), (3, 76, .45), (3.5, 73, .45)],
    [(0, 74, .45), (1, 69, .45), (2, 62, 1.5)],
]


def bars_in(t0, t1):
    """yield (bar_index, bar_start_time) for whole and partial bars between t0 and t1"""
    i, t = 0, t0
    while t < t1 - 1e-3:
        yield i, t
        i += 1; t = t0 + i * 4 * SPB


def theme(t0, t1, bright=False, final=False, vel=1.0):
    for i, tb in bars_in(t0, t1):
        b = i % 8; ch = CHORDS[b]
        def at(beat): return tb + beat * SPB
        for k, (beat, n, d) in enumerate(MEL[b]):
            if at(beat) < t1: note(at(beat), 'harpsi', n + (12 if KIT == 'march' else 0), d * (.8 if KIT == 'march' else 1), int((86 if k == 0 else 74) * vel * (.8 if KIT == 'march' else 1)))
            if KIT == 'march' and at(beat) < t1: note(at(beat), 'clar', n, d, int(60 * vel))
            if bright and at(beat) < t1: note(at(beat), 'glock', n + 12, d, int(52 * vel))
        for beat in (0, 2):
            if at(beat) < t1: note(at(beat), 'pizz', BASS[ch][beat] - 12 if beat == 0 else BASS[ch][beat] - 12, .35, int(92 * vel))
        for beat in (1, 3):
            if at(beat) < t1:
                for n in VOICE[ch]: note(at(beat), 'pizz', n, .3, int(58 * vel))
        if KIT == 'march':  # tuba oom on 1 and 3, every bar
            for beat in (0, 2):
                if at(beat) < t1: note(at(beat), 'bassoon', BASS[ch][beat] - 12, .5, int(80 * vel))
        elif i >= 8 or final:  # second pass: bassoon joins on the bass line
            for beat in (0, 1, 2, 3):
                if at(beat) < t1: note(at(beat), 'bassoon', BASS[ch][beat] - 12, .4, int(62 * vel))
        if KIT == 'march':  # snare on the eighths with accents, bass drum on 1 and 3
            for e in range(8):
                if at(e * .5) < t1: note(at(e * .5), 'drums', 38, .1, int([62, 22, 38, 22, 58, 22, 38, 30][e] * vel))
            for beat in (0, 2):
                if at(beat) < t1: note(at(beat), 'drums', 36, .2, int(64 * vel))
            if i % 4 == 0 and at(0) < t1: note(at(0), 'drums', 49, 1, int(46 * vel))
        else:
            for beat in (0, 1, 2, 3):  # tick-tock woodblock
                if at(beat) < t1: note(at(beat), 'drums', 76 if beat % 2 == 0 else 77, .1, int(34 * vel))
        if bright:
            for e in range(8):
                if at(e * .5) < t1: note(at(e * .5), 'drums', 42, .1, 30)
        if final and at(0) < t1: note(at(0), 'timp', 38 if ch != 'A7' else 45, 1, 96)


def mystery(t0, t1):
    prog = ['Dm', 'Dm', 'Bb', 'Bb', 'Gm', 'Gm', 'A', 'A']
    clar = [[(0, 69, 2), (2, 70, 1), (3, 69, 1)], [(0, 65, 4)], [(0, 67, 2), (2, 69, 1), (3, 65, 1)], [(0, 62, 4)],
            [(0, 70, 2), (2, 69, 1), (3, 67, 1)], [(0, 65, 3), (3, 67, 1)], [(0, 64, 2), (2, 61, 2)], [(0, 64, 4)]]
    note(t0, 'timp', 38, 2, 70)
    for i, tb in bars_in(t0, t1):
        ch = prog[i % 8]
        def at(beat): return tb + beat * SPB
        for n in VOICE[ch]: note(at(0), 'pad', n - 12, min(4, (t1 - at(0)) / SPB) * .98, 48)
        note(at(0), 'pizz', BASS[ch][0] - 12, .5, 70)
        note(at(2), 'pizz', BASS[ch][2] - 12, .5, 56)
        if i >= 1:
            for beat, n, d in clar[(i - 1) % 8]:
                if at(beat) < t1: note(at(beat), 'clar', n, min(d, (t1 - at(beat)) / SPB) * .95, 64)
        if i % 2 == 1 and at(3.5) < t1: note(at(3.5), 'glock', 81, .5, 38)


def comic(t):  # sad "wah wah wah" (bassoon in the period kit, trombone in the march kit)
    for k, n in enumerate([50, 49, 48]): note(t + k * .5 * SPB * 2, 'comic', n, .9, 84)
    note(t + 3 * SPB, 'comic', 47, 2.5, 80)


for s in P['sections']:
    st, a, b = s['style'], s.get('from', 0), s.get('to', 0)
    if st == 'theme': theme(a, b)
    elif st == 'jaunty': theme(a, b, bright=True)
    elif st == 'final': theme(a, b, final=True)
    elif st == 'mystery': mystery(a, b)
    elif st == 'stop': note(a, 'timp', 38, 2, 110); note(a, 'drums', 49, 1, 70)
    elif st == 'quiet': theme(a, b, vel=.7)
    elif st == 'end':
        t = s['at']
        for n in [38, 50, 62, 65, 69, 74]: note(t, 'pizz', n, 1, 100)
        for n in [62, 69, 74]: note(t, 'harpsi', n, 2, 90)
        note(t, 'timp', 38, 2, 110); note(t, 'glock', 86, 2, 70); note(t, 'drums', 49, 2, 60)
for t in P.get('comic', []): comic(t)

# ---- write MIDI ----
mid = mido.MidiFile(ticks_per_beat=TPB)
tr = mido.MidiTrack(); mid.tracks.append(tr)
tr.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(BPM), time=0))
for name, (ch, prog) in CH.items():
    if prog is not None: tr.append(mido.Message('program_change', channel=ch, program=prog, time=0))
    tr.append(mido.Message('control_change', channel=ch, control=91, value=50, time=0))  # reverb send
msgs = []
for t, ch, n, d, v in events:
    msgs.append((t, 1, mido.Message('note_on', channel=ch, note=n, velocity=max(1, min(127, v)))))
    msgs.append((t + d, 0, mido.Message('note_off', channel=ch, note=n, velocity=0)))
msgs.sort(key=lambda x: (x[0], x[1]))
last = 0
for t, _, m in msgs:
    tick = int(round(t / SPB * TPB)); m.time = max(0, tick - last); last = max(last, tick); tr.append(m)
mid.save(f'{out}/music.mid')
subprocess.run(['fluidsynth', '-ni', '-g', '0.55', '-r', '48000', '-F', f'{out}/music_raw.wav', SF2, f'{out}/music.mid'], check=True, capture_output=True)
end = P.get('length', max(e[0] + e[3] for e in events) + 2)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{out}/music_raw.wav', '-t', f'{end:.2f}', '-af', f'afade=t=out:st={end - 1.2:.2f}:d=1.2,loudnorm=I=-20:TP=-3', '-ar', '48000', '-ac', '2', f'{out}/music.wav'], check=True)
print(f'{len(events)} notes, {end:.1f} s -> {out}/music.wav')
