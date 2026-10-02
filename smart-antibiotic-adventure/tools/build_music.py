"""Mix the film's background music bed against the dialogue timeline.

Input : source-art/music/music.ogg   original underscore (see README.txt there)
        src/film/dialogue.json + src/film/voice-meta.json (the same timeline the player builds)
Output: public/music/film-music.mp3  exactly as long as the film

- Under every line of dialogue the music dips well below the voices (speech
  is mastered at -16 LUFS; music under speech sits around -33 LUFS).
- In scene transitions, visual-only moments, the intro and the outro it rises
  gently (around -24 LUFS), never to a level that competes with speech.
- The music's own resolved ending is placed at the end of the film.

Usage: python tools/build_music.py   (needs numpy + ffmpeg)
"""
import json, os, subprocess, tempfile
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'source-art/music/music.ogg')
OUT = os.path.join(ROOT, 'public/music/film-music.mp3')
SR = 44100
# mirrors src/film/timeline.ts
SAME_SPEAKER_GAP, TURN_GAP, SCENE_TAIL = 0.4, 0.75, 1.4
# music gain (dB, relative to the -20 LUFS bed)
UNDER_SPEECH = -13.0
OPEN = -4.0
EDGES = -2.5            # intro / outro
BAR = 2.5               # 96 bpm, 4/4
ENDING_AT = 155.0       # where the composed ending phrase starts in the bed
START = 7.5             # bed time at film time 0 (three bars in: skips the near-silent swell)


def timeline():
    d = json.load(open(os.path.join(ROOT, 'src/film/dialogue.json'), encoding='utf-8'))
    m = json.load(open(os.path.join(ROOT, 'src/film/voice-meta.json'), encoding='utf-8'))
    spans, t0 = [], 0.0
    for scene, (key, lines) in enumerate(d['scenes'].items()):
        prev_end, prev_who = -1e9, None
        for l in lines:
            gap = SAME_SPEAKER_GAP if prev_who == l['who'] else TURN_GAP
            s = max(l['at'], prev_end + gap)
            e = s + m[l['id']]['dur']
            spans.append((t0 + s, t0 + e, scene))
            prev_end, prev_who = e, l['who']
        t0 += max(d['sceneDur'][key], prev_end + SCENE_TAIL)
    return spans, t0


def main():
    spans, total = timeline()
    x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', SRC, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
                                     capture_output=True, check=True).stdout, np.float32).reshape(-1, 2)
    # fit: start three bars into the bed (its first bars are a near-silent swell), then
    # cross-fade on a bar line into the composed ending so its final chord rings out
    # over the last seconds of the film
    head = x[int(START * SR):]
    ending = x[int(ENDING_AT * SR):]
    cut = np.floor((total - 7.5) / BAR) * BAR
    xf = int(1.5 * SR)
    a = head[: int(cut * SR) + xf].copy()
    f = np.linspace(0, 1, xf)[:, None]
    mix = a[-xf:] * np.cos(f * np.pi / 2) + ending[:xf] * np.sin(f * np.pi / 2)
    y = np.concatenate([a[:-xf], mix, ending[xf:]])
    n = int(total * SR)
    y = np.concatenate([y, np.zeros((max(0, n - len(y)), 2), np.float32)])[:n]

    # gain automation (dB) at 100 Hz control rate
    cr = 100
    tt = np.arange(int(total * cr) + 1) / cr
    g = np.full(len(tt), OPEN)
    first, last = spans[0][0], spans[-1][1]
    g[tt < first - 0.5] = EDGES
    g[tt > last + 0.8] = EDGES
    for s, e, _ in spans:
        g[(tt >= s - 0.35) & (tt <= e + 0.25)] = UNDER_SPEECH
    # short pauses inside a scene stay ducked (no pumping between sentences);
    # scene transitions and longer visual-only moments let the music rise
    for (s0, e0, a), (s1, e1, b) in zip(spans, spans[1:]):
        if a == b and s1 - e0 < 2.2:
            g[(tt >= e0) & (tt <= s1)] = UNDER_SPEECH
    # smooth: fast-ish dip before speech (0.35 s), slow recovery (1.2 s)
    sm = g.copy()
    for i in range(1, len(sm)):
        k = 1 - np.exp(-1 / (cr * (0.12 if g[i] < sm[i - 1] else 0.3)))
        sm[i] = sm[i - 1] + (g[i] - sm[i - 1]) * k
    gain = 10 ** (np.interp(np.arange(n) / SR, tt, sm) / 20)
    y = y * gain[:, None].astype(np.float32)
    fi = int(0.8 * SR)
    y[:fi] *= np.linspace(0, 1, fi)[:, None]
    fo = int(2.0 * SR)
    y[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, 'm.f32')
        y.astype(np.float32).tofile(raw)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', raw,
                        '-b:a', '96k', OUT], check=True)
    print(f'film {total:.2f}s  music {n / SR:.2f}s  -> {OUT}')


main()
