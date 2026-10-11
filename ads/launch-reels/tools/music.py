"""Original upbeat launch music: marimba hook, round bass, soft kick, claps, shaker and a bell sparkle.
Pure numpy synthesis written for these reels, so it is owned outright and cleared for advertising.

usage: music.py SECONDS OUT.wav [SEED] [TRANSPOSE] [HIT_TIMES comma-separated]
HIT_TIMES adds a celebratory chime + cymbal swell at those seconds (e.g. the "we're open" moment).
"""
import sys, wave, numpy as np

SR = 44100
dur, out = float(sys.argv[1]), sys.argv[2]
seed = int(sys.argv[3]) if len(sys.argv) > 3 else 1
TR = int(sys.argv[4]) if len(sys.argv) > 4 else 0
hits = [float(x) for x in sys.argv[5].split(",")] if len(sys.argv) > 5 and sys.argv[5] else []
rng = np.random.default_rng(seed)
N = int(SR * (dur + 3)); L = np.zeros(N); R = np.zeros(N)
hz = lambda m: 440 * 2 ** ((m + TR - 69) / 12)
T = lambda s: np.arange(int(SR * s)) / SR

def put(x, t0, pan=0.0, g=1.0):
    i = int(t0 * SR)
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), N - i)
    if n <= 0: return
    L[i:i + n] += x[:n] * g * np.sqrt(.5 - pan / 2); R[i:i + n] += x[:n] * g * np.sqrt(.5 + pan / 2)

def marimba(m, l=.5):
    t = T(l); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 40)) * np.exp(-t * 9) * np.minimum(1, t * 900)
def bell(m, l=1.6):
    t = T(l); f = hz(m)
    return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.76 * t) + .25 * np.sin(2 * np.pi * f * 5.4 * t)) * np.exp(-t * 3.2) * np.minimum(1, t * 600) / 1.75
def bass(m, l):
    t = T(l); f = hz(m)
    x = np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * 2 * f * t)
    return x * np.minimum(1, t * 200) * np.exp(-t * 2.2)
def kick():
    t = T(.35); f = 120 * np.exp(-t * 28) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)
def clap():
    t = T(.22); n = rng.normal(0, 1, len(t))
    env = np.exp(-t * 26) + .6 * np.exp(-np.maximum(0, t - .012) * 30) * (t > .012)
    return hp(n, 900) * env * .5
def shaker():
    t = T(.07); return hp(rng.normal(0, 1, len(t)), 6000) * np.exp(-t * 60) * .25
def pad(ms, l):
    t = T(l); s = sum(np.sin(2 * np.pi * hz(m) * t) + .3 * np.sin(2 * np.pi * hz(m) * 1.003 * t) for m in ms)
    return s * np.minimum(1, t / .25) * np.minimum(1, (l - t) / .4) / len(ms)
def hp(x, fc):
    n = 1 << int(np.ceil(np.log2(len(x) + 1))); X = np.fft.rfft(x, n); f = np.fft.rfftfreq(n, 1 / SR)
    return np.fft.irfft(X * (f / fc) ** 2 / (1 + (f / fc) ** 2), n)[:len(x)]
def swell(l=1.4):
    t = T(l); n = hp(rng.normal(0, 1, len(t)), 3500)
    return n * np.minimum(1, t / .05) * np.exp(-t * 2.4) * .35

BPM = 112; beat = 60 / BPM; bar = 4 * beat
# C major, bright I–V–vi–IV
prog = [[48, 60, 64, 67], [43, 59, 62, 67], [45, 60, 64, 69], [41, 60, 65, 69]]
hook = [[72, None, 76, 79, 76, None, 74, 72], [71, None, 74, 79, 74, None, 72, 71], [72, None, 76, 81, 79, None, 76, 74], [72, 74, 77, None, 76, None, 74, None]]
nb = int(dur / bar) + 2
for b in range(nb):
    t0 = b * bar; c = prog[b % 4]
    put(pad(c[1:], bar + .1), t0, 0, .10)
    for k in range(4):                                   # bass on every beat, octave pop on the "and"
        put(bass(c[0], beat * .9), t0 + k * beat, 0, .38)
        put(bass(c[0] + 12, beat * .4), t0 + (k + .5) * beat, 0, .18)
        put(kick(), t0 + k * beat, 0, .32 if b > 0 else .15)
        if k in (1, 3) and b > 0: put(clap(), t0 + k * beat, .1, .55)
    for k in range(8):
        put(shaker(), t0 + k * beat / 2, .3, .9 if k % 2 else .5)
        n = hook[b % 4][k]
        if n: put(marimba(n), t0 + k * beat / 2 + rng.uniform(0, .004), -.2, .9)
        if b > 1 and k % 2 == 0: put(marimba(c[1 + (k // 2) % 3] + 12, .3), t0 + k * beat / 2 + beat / 4, .35, .16)
for h in hits:                                           # the celebration: bell arpeggio + cymbal swell
    put(swell(), h - .05, 0, 1)
    for k, m in enumerate([84, 88, 91, 96]): put(bell(m), h + k * .07, (-.4 + k * .27), .28)

n = int(SR * dur); t = np.arange(n) / SR
fade = np.minimum(1, t / .3) * np.minimum(1, (dur - t) / 1.2)
st = np.stack([L[:n] * fade, R[:n] * fade], 1); st /= np.percentile(np.abs(st), 99.7); st = np.tanh(st * 1.1) * .85
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype("<i2").tobytes())
