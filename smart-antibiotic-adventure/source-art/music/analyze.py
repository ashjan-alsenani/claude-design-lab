#!/usr/bin/env python3
"""analyze.py - numeric QC of music.wav (cannot listen, so measure)."""
import re
import subprocess
import numpy as np
from scipy import signal
from scipy.io import wavfile

F = "music.wav"
sr, x = wavfile.read(F)
print(f"file {F}: {sr} Hz, {x.shape[1]} ch, {x.dtype}, duration {len(x)/sr:.3f} s")
xf = x.astype(np.float64) / 32768.0

# ---- loudness / true peak
err = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", F, "-af", "ebur128=peak=true",
                      "-f", "null", "-"], capture_output=True, text=True).stderr
summ = err[err.rfind("Summary:"):]
I = float(re.search(r"I:\s+(-?[\d.]+) LUFS", summ).group(1))
LRA = float(re.search(r"LRA:\s+(-?[\d.]+) LU", summ).group(1))
TP = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", summ).group(1))
print(f"integrated {I:.1f} LUFS | LRA {LRA:.1f} LU | true peak {TP:.2f} dBTP")

# ---- clipping / DC / sample peak
clip = int((np.abs(x.astype(np.int32)) >= 32767).sum())
print(f"sample peak {20*np.log10(np.abs(xf).max()):.2f} dBFS | clipped samples {clip} | "
      f"DC L {xf[:,0].mean():.2e} R {xf[:,1].mean():.2e}")
mid, side = xf.mean(1), (xf[:, 0] - xf[:, 1]) / 2
print(f"stereo: side/mid RMS ratio {np.sqrt(np.mean(side**2))/np.sqrt(np.mean(mid**2)):.2f} | "
      f"L/R correlation {np.corrcoef(xf[:,0], xf[:,1])[0,1]:.2f}")

# ---- silent gaps (0.25 s windows, 0..158 s)
w = int(0.25 * sr)
rms = np.array([np.sqrt(np.mean(mid[i:i+w]**2)) for i in range(0, int(158*sr), w)])
db = 20*np.log10(rms + 1e-12)
gaps = np.where(db < -55)[0]
print(f"0.25 s windows 0-158 s: min RMS {db.min():.1f} dBFS at {db.argmin()*0.25:.2f} s; "
      f"windows below -55 dBFS: {len(gaps)} {list(gaps*0.25)[:10]}")

# ---- spectrum band energies
f, p = signal.welch(mid, sr, nperseg=8192)
bands = [(20, 60), (60, 250), (250, 500), (500, 1000), (1000, 2000), (2000, 5000), (5000, 10000), (10000, 20000)]
tot = p.sum()
print("band energy (share of total, dB rel. total):")
for lo, hi in bands:
    e = p[(f >= lo) & (f < hi)].sum()
    print(f"  {lo:>5}-{hi:<5} Hz  {100*e/tot:5.1f} %  {10*np.log10(e/tot):6.1f} dB")

# ---- short-term loudness curve, sampled every 3 s
st = [(float(m.group(1)), float(m.group(2))) for m in
      re.finditer(r"t:\s*([\d.]+).*?S:\s*(-?[\d.]+|-inf)", err)]
curve = []
for T in np.arange(3, 166, 3):
    v = min(st, key=lambda a: abs(a[0] - T))[1]
    curve.append((T, v))
print("short-term loudness (3 s window, ebur128 S) every 3 s:")
print("  " + "  ".join(f"{T:>3.0f}s:{v:6.1f}" for T, v in curve))
jumps = [(curve[i][0], curve[i+1][1]-curve[i][1]) for i in range(len(curve)-1)
         if 9 <= curve[i][0] <= 155 and abs(curve[i+1][1]-curve[i][1]) > 4]
mx = max(abs(curve[i+1][1]-curve[i][1]) for i in range(len(curve)-1) if 9 <= curve[i][0] <= 155)
print(f"max neighbour step 9-158 s: {mx:.1f} LU; steps > 4 LU: {jumps if jumps else 'none'}")
