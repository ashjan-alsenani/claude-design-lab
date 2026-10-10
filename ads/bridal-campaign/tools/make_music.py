"""Renders each ad's music bed and a VO-ready bed pre-ducked 13 dB under every narration line (0.25 s ramps)."""
import os, sys, subprocess, wave, numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from ads import ADS, ROOT
from concurrent.futures import ThreadPoolExecutor
M = ROOT / "audio" / "music"
def one(a):
    n = f'{a["id"]}-{a["slug"]}'
    theme, tr, seed = a["music"]
    full = M / f"{n}.wav"
    subprocess.run([sys.executable, str(ROOT / "tools" / "music.py"), theme, str(a["dur"]), str(full), str(seed), str(tr)], check=True)
    w = wave.open(str(full)); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), "<i2").reshape(-1, 2).astype(float); w.close()
    t = np.arange(len(x)) / sr; g = np.ones(len(x)); duck = 10 ** (-13 / 20); r = 0.25
    for (_, s, e) in a["vo"]("A"):
        k = np.clip(np.minimum((t - (s - r)) / r, ((e + r) - t) / r), 0, 1)
        g = np.minimum(g, 1 - (1 - duck) * k)
    y = (x * g[:, None]).astype("<i2")
    with wave.open(str(M / f"{n}.vo-bed.wav"), "wb") as o:
        o.setnchannels(2); o.setsampwidth(2); o.setframerate(sr); o.writeframes(y.tobytes())
    return n
with ThreadPoolExecutor(3) as ex:
    print(list(ex.map(one, ADS)))
