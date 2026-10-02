#!/usr/bin/env python3
"""
master.py - bus processing of the fluidsynth render (raw.wav) -> music.wav
  * DC removal + 40 Hz high-pass
  * warm bus EQ: +0.5 dB low shelf @150 Hz, -1.5 dB @350 Hz (Q 0.8, de-mud),
    -2.5 dB wide dip @2.5 kHz (Q 0.7, speech-clarity pocket), +1.5 dB air shelf @10 kHz
  * light extra convolution "room" (synthetic decaying-noise IR, 12 % wet)
  * gentle stereo width trim (side * 0.85)
  * trim/pad to exactly 165.0 s, 6 s cosine fade-out (159-165 s)
  * normalise to -20 LUFS integrated (ffmpeg ebur128), soft-knee safety
    limiter so true peak stays < -2 dBTP, 16-bit TPDF dither
"""
import re
import subprocess
import sys

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 44100
LEN = 165.0
TARGET = -20.0
IN, OUT = "raw.wav", "music.wav"


def biquad(kind, f0, gain_db=0.0, q=0.707):
    A = 10 ** (gain_db / 40)
    w = 2 * np.pi * f0 / SR
    cw, sw = np.cos(w), np.sin(w)
    alpha = sw / (2 * q)
    if kind == "peak":
        b = [1 + alpha * A, -2 * cw, 1 - alpha * A]
        a = [1 + alpha / A, -2 * cw, 1 - alpha / A]
    elif kind == "lowshelf":
        sa = 2 * np.sqrt(A) * alpha
        b = [A * ((A + 1) - (A - 1) * cw + sa), 2 * A * ((A - 1) - (A + 1) * cw), A * ((A + 1) - (A - 1) * cw - sa)]
        a = [(A + 1) + (A - 1) * cw + sa, -2 * ((A - 1) + (A + 1) * cw), (A + 1) + (A - 1) * cw - sa]
    elif kind == "highshelf":
        sa = 2 * np.sqrt(A) * alpha
        b = [A * ((A + 1) + (A - 1) * cw + sa), -2 * A * ((A - 1) + (A + 1) * cw), A * ((A + 1) + (A - 1) * cw - sa)]
        a = [(A + 1) - (A - 1) * cw + sa, 2 * ((A - 1) - (A + 1) * cw), (A + 1) - (A - 1) * cw - sa]
    b, a = np.array(b) / a[0], np.array(a) / a[0]
    return b, a


def lufs_tp(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true",
                        "-f", "null", "-"], capture_output=True, text=True).stderr
    summ = r[r.rfind("Summary:"):]
    i = float(re.search(r"I:\s+(-?[\d.]+) LUFS", summ).group(1))
    tp = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", summ).group(1))
    return i, tp


def write16(path, x, seed=1):
    rng = np.random.default_rng(seed)
    d = (rng.random(x.shape) - rng.random(x.shape)) / 32768.0       # TPDF dither
    y = np.clip(np.round((x + d) * 32767), -32768, 32767).astype(np.int16)
    wavfile.write(path, SR, y)


sr, x = wavfile.read(IN)
assert sr == SR
x = x.astype(np.float64) / (32768.0 if x.dtype == np.int16 else 1.0)

# length: exactly 165 s
n = int(LEN * SR)
x = x[:n] if len(x) >= n else np.pad(x, ((0, n - len(x)), (0, 0)))

# DC + HPF
x -= x.mean(axis=0)
sos = signal.butter(2, 40, "highpass", fs=SR, output="sos")
x = signal.sosfiltfilt(sos, x, axis=0)

# bus EQ
for kind, f, g, q in [("lowshelf", 150, 0.5, 0.7), ("peak", 350, -1.5, 0.8), ("peak", 2500, -2.5, 0.7), ("highshelf", 10000, 1.5, 0.7)]:
    b, a = biquad(kind, f, g, q)
    x = signal.lfilter(b, a, x, axis=0)

# light convolution room (synthetic, decorrelated L/R, 1.4 s decay, darkened)
rng = np.random.default_rng(7)
ir_len = int(1.6 * SR)
tt = np.arange(ir_len) / SR
env = np.exp(-tt * 6.9 / 1.4)
ir = rng.standard_normal((ir_len, 2)) * env[:, None]
ir = signal.sosfilt(signal.butter(2, 4500, "lowpass", fs=SR, output="sos"), ir, axis=0)
ir[: int(0.02 * SR)] = 0        # 20 ms pre-delay
ir /= np.sqrt((ir ** 2).sum(axis=0))
wet = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[:n] for c in range(2)], axis=1)
x = x + 0.12 * wet / max(1e-9, np.sqrt(np.mean(wet ** 2)) / np.sqrt(np.mean(x ** 2)))

# stereo width: slightly narrower side
mid, side = (x[:, 0] + x[:, 1]) / 2, (x[:, 0] - x[:, 1]) / 2
side *= 0.85
x = np.stack([mid + side, mid - side], axis=1)

# fade-out last 6 s (raised cosine) + 5 ms fade-in
f0 = int(159.0 * SR)
fade = 0.5 * (1 + np.cos(np.linspace(0, np.pi, n - f0)))
x[f0:] *= fade[:, None]
x[: int(0.005 * SR)] *= np.linspace(0, 1, int(0.005 * SR))[:, None]
x -= x.mean(axis=0)

# loudness normalisation (iterate with ffmpeg measurement)
x /= np.max(np.abs(x))
write16("_tmp.wav", x * 0.5)
I, _ = lufs_tp("_tmp.wav")
gain = 0.5 * 10 ** ((TARGET - I) / 20)
x *= gain


def soft_limit(x, ceil):
    """Smooth gain-riding limiter (look-ahead 5 ms, release 200 ms)."""
    look = int(0.005 * SR)
    pk = np.max(np.abs(x), axis=1)
    pk = np.maximum.reduce([np.roll(pk, -k) for k in range(look)])
    g = np.minimum(1.0, ceil / np.maximum(pk, 1e-9))
    rel = np.exp(-1 / (0.2 * SR))
    out = np.empty_like(g)
    cur = 1.0
    for i, v in enumerate(g):
        cur = v if v < cur else v + (cur - v) * rel
        out[i] = cur
    return x * out[:, None]


for it in range(4):
    write16(OUT, x)
    I, TP = lufs_tp(OUT)
    print(f"pass {it}: I={I:.2f} LUFS  TP={TP:.2f} dBTP")
    if TP < -2.3 and abs(I - TARGET) < 0.3:
        break
    if TP >= -2.3:
        x = soft_limit(x, 10 ** (-3.0 / 20))
    x *= 10 ** ((TARGET - lufs_tp(OUT)[0]) / 20) if abs(I - TARGET) >= 0.3 else 1.0
subprocess.run(["rm", "-f", "_tmp.wav"])
print("done", OUT)
sys.exit(0)
