"""Original romantic bridal underscore — soft piano, light strings, delicate harp, warm pads. No drums.
Pure synthesis written for this campaign, so it is owned outright and cleared for commercial advertising.

usage: music.py THEME SECONDS OUT.wav [SEED] [TRANSPOSE]
themes: morning, veil, promise, garden, henna, golden
"""
import sys, wave, numpy as np

SR = 44100
theme, dur, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
seed = int(sys.argv[4]) if len(sys.argv) > 4 else 1
TR = int(sys.argv[5]) if len(sys.argv) > 5 else 0
rng = np.random.default_rng(seed)
N = int(SR * (dur + 5))
L = np.zeros(N); R = np.zeros(N)
hz = lambda m: 440 * 2 ** ((m + TR - 69) / 12)
T = lambda s: np.arange(int(SR * s)) / SR

def put(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR)
    if i < 0: sig = sig[-i:]; i = 0
    if i >= N or len(sig) == 0: return
    j = min(N, i + len(sig)); s = sig[: j - i] * gain
    L[i:j] += s * np.sqrt(0.5 * (1 - pan)); R[i:j] += s * np.sqrt(0.5 * (1 + pan))

def smooth(x, a):
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x): acc += a * (v - acc); y[i] = acc
    return y

_pc = {}
def piano(m, length=3.2, vel=0.8):
    key = (m, round(length, 2))
    if key not in _pc:
        t = T(length); f = hz(m); B = 0.00025; dec = 0.55 + 0.45 * f / 1000
        s = sum((0.5 ** k) * np.sin(2 * np.pi * f * (k + 1) * np.sqrt(1 + B * (k + 1) ** 2) * t + 0.7 * k)
                * (0.7 * np.exp(-t * dec * (1 + .8 * k) * 2.2) + 0.3 * np.exp(-t * dec * (1 + .6 * k) * .5)) for k in range(6))
        _pc[key] = s * np.minimum(1, t / 0.006) * np.minimum(1, (length - t) / 0.35)
    return _pc[key] * vel
def harp(m, length=3.0):
    f = hz(m); P = max(2, int(round(SR / f))); n = int(SR * length)
    y = np.zeros(n + P); y[:P] = smooth(rng.uniform(-1, 1, P), 0.6)
    d = 0.9985 if f < 600 else 0.9975
    for s in range(P, n + P, P):
        prev = y[s - P:s]; y[s:s + P] = (0.5 * (prev + np.roll(prev, 1)) * d)[: len(y[s:s + P])]
    t = np.arange(n) / SR
    return y[P:] * np.minimum(1, t / 0.003) * np.minimum(1, (length - t) / 0.3)
def strings(ms, length, att=1.2, bright=0.5):
    t = T(length); env = np.minimum(1, t / att) * np.minimum(1, (length - t) / 1.0)
    s = 0
    for m in ms:
        for d in (-0.004, 0.0, 0.004):
            vib = 0.0035 * np.sin(2 * np.pi * (5.0 + d * 90) * t + rng.uniform(0, 6))
            ph = 2 * np.pi * hz(m) * (1 + d) * (t + np.cumsum(vib) / SR)
            s = s + sum(np.sin(k * ph) / (k ** (1.9 - 0.4 * bright)) for k in range(1, 6))
    return s * env / (3 * len(ms) * 1.6)
def pad(ms, length):
    t = T(length); env = np.minimum(1, t / 1.6) * np.minimum(1, (length - t) / 1.4)
    s = sum(np.sin(2 * np.pi * hz(m) * (1 + d) * t) for m in ms for d in (-0.002, 0.0015, 0.0045))
    return s * env * (1 + 0.08 * np.sin(2 * np.pi * 0.2 * t)) / (3 * len(ms))

H = lambda: rng.uniform(0, 0.012)
def bars(bar): return range(int(dur / bar) + 2)

def bed(prog, beat, mel=None, harp_pat=True, piano_pat="broken", str_gain=0.13, pad_gain=0.09):
    bar = 4 * beat
    for b in bars(bar):
        c = prog[b % len(prog)]; t0 = b * bar
        put(pad([n + 12 for n in c[1:]], bar + 1.4), t0 - 0.2, 0, pad_gain)
        put(strings([n + 12 for n in c[1:3]], bar + 1.2, 1.4), t0 - 0.1, 0.15, str_gain if b else str_gain * 0.6)
        put(piano(c[0], 4.2, 0.55), t0, -0.2, 1.0)
        if piano_pat == "broken":
            for k, n in enumerate([c[1], c[2], c[3], c[2]]): put(piano(n, 2.6, 0.32), t0 + (k + 0.5) * beat + H(), -0.25, 1.0)
        if harp_pat and b >= 1:
            for k, n in enumerate([c[1] + 12, c[2] + 12, c[3] + 12, c[2] + 24]):
                put(harp(n, 2.8), t0 + k * beat / 2 + 2 * beat + H(), 0.35, 0.16)
        if mel and b >= 1:
            for k, n in enumerate(mel[b % len(mel)]):
                if n: put(piano(n, 3.2, 0.62), t0 + k * beat + H(), 0.2, 1.0)

# Themes. Melodies are sparse on purpose: the voice must stay the focus.
if theme == "morning":      # D major, 72 bpm — romantic morning
    bed([[38, 54, 57, 62], [35, 54, 59, 62], [43, 55, 59, 62], [45, 54, 57, 61]], 60 / 72,
        [[74, 73, 71, None], [69, None, 71, 73], [74, 76, 78, None], [76, 73, None, None]])
elif theme == "veil":       # Bb major, 66 bpm — warm, slow strings + broken piano
    bed([[34, 50, 53, 58], [31, 50, 55, 58], [39, 51, 55, 58], [41, 53, 57, 60]], 60 / 66,
        [[70, None, 69, 67], [65, None, None, 67], [70, 72, 74, None], [72, None, 69, None]], str_gain=0.17)
elif theme == "promise":    # F major, 76 bpm — harp-forward
    bed([[41, 53, 57, 60], [38, 50, 57, 62], [46, 53, 58, 62], [36, 52, 55, 60]], 60 / 76,
        [[77, None, 76, 74], [74, None, 72, None], [74, 77, 79, None], [76, None, 72, None]], pad_gain=0.07)
elif theme == "garden":     # A major, 80 bpm — light, hopeful
    bed([[45, 57, 61, 64], [42, 57, 61, 66], [38, 57, 62, 66], [40, 56, 59, 64]], 60 / 80,
        [[76, 78, 81, None], [78, None, 76, None], [74, 76, 78, 81], [80, None, 76, None]])
elif theme == "henna":      # D nahawand colour, 70 bpm — a gentle Gulf touch
    bed([[38, 50, 53, 57], [34, 50, 53, 58], [31, 50, 55, 58], [33, 49, 52, 57]], 60 / 70,
        [[74, 73, 74, 77], [76, None, 74, None], [72, 74, 76, 77], [76, 73, 74, None]], str_gain=0.15)
elif theme == "golden":     # Eb major, 64 bpm — golden hour, strings lead
    bed([[39, 55, 58, 63], [36, 55, 60, 63], [32, 56, 60, 63], [34, 53, 58, 62]], 60 / 64,
        [[75, None, 74, 72], [72, None, 70, None], [72, 75, 79, None], [77, None, 74, None]], str_gain=0.19, piano_pat="broken")
else:
    raise SystemExit("unknown theme")

def fftfilt(x, fc):
    n = 1 << int(np.ceil(np.log2(len(x)))); X = np.fft.rfft(x, n); f = np.fft.rfftfreq(n, 1 / SR)
    return np.fft.irfft(X / (1 + (f / fc) ** 2), n)[: len(x)]
def ir(sd):
    r = np.random.default_rng(sd); n = int(SR * 2.8); t = np.arange(n) / SR
    x = fftfilt(r.normal(0, 1, n) * np.exp(-t * 2.5), 4800); x[: int(SR * .02)] *= np.linspace(0, 1, int(SR * .02))
    return x / np.sqrt((x ** 2).sum())
def conv(a, h):
    n = 1 << int(np.ceil(np.log2(len(a) + len(h))))
    return np.fft.irfft(np.fft.rfft(a, n) * np.fft.rfft(h, n), n)[: len(a)]
# no heavy bass: gentle high-pass by subtracting a very low low-pass
L = L - fftfilt(L, 70); R = R - fftfilt(R, 70)
L = fftfilt(L, 7500); R = fftfilt(R, 7500)
L2 = L + 0.32 * conv(L, ir(1)); R2 = R + 0.32 * conv(R, ir(2))
n = int(SR * dur); L2, R2 = L2[:n], R2[:n]
t = np.arange(n) / SR
fade = np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 2.0)   # gentle fade-in / fade-out
st = np.stack([L2 * fade, R2 * fade], 1); st /= np.abs(st).max() / 0.8
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype("<i2").tobytes())
