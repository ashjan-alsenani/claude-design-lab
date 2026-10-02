"""Generate the film's character voices once, offline.

Reads src/film/dialogue.json and writes, for every line:
  public/voices/<id>.mp3   loudness-normalised mono speech
  src/film/voice-meta.json duration + lip-sync tracks

Every character has ONE fixed neural Arabic voice. The script refuses to run if a
voice's catalogue gender or language does not match the character, and never
substitutes another voice.

Aleen is a young girl. Her female voice is rendered slightly slower and then
resampled by `childScale`, which raises pitch AND formants together (a child's
shorter vocal tract) without the metallic artifacts of a pitch-shift effect.

Lip-sync: every 20 ms the mouth gets
  mouth  openness 0..9  from loudness x jaw height (first formant, F1)
  shape  0..9           lip shape from the second formant: 0 rounded (u/o), 9 spread (i/e)
smoothed like real articulation (fast opening, slower closing), shifted 40 ms
early because lips move slightly before the sound is heard.

Usage:  pip install edge-tts numpy && python tools/generate_voices.py [line ids...]
        --meta-only   recompute durations / lip-sync from existing mp3 files
Needs ffmpeg. Optional: TTS_CA_FILE=<ca bundle> behind a TLS-inspecting proxy.
"""
import asyncio, json, os, ssl, subprocess, sys, tempfile
import numpy as np
import edge_tts
import edge_tts.communicate as _comm

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIALOGUE = os.path.join(ROOT, 'src/film/dialogue.json')
OUT_DIR = os.path.join(ROOT, 'public/voices')
META = os.path.join(ROOT, 'src/film/voice-meta.json')
SR = 24000
FRAME = 0.02      # lip-sync frame (s)
LEAD = 2          # frames the mouth leads the sound

if os.environ.get('TTS_CA_FILE'):
    _comm._SSL_CTX = ssl.create_default_context(cafile=os.environ['TTS_CA_FILE'])


def ffmpeg(*args):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *args], check=True)


def decode(path, sr=SR, af=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', path] + (['-af', af] if af else []) + ['-ac', '1', '-ar', str(sr), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).copy()


def loudness(path):
    r = subprocess.run(['ffmpeg', '-v', 'info', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True)
    lines = [l for l in r.stderr.splitlines() if l.strip().startswith('I:')]
    return float(lines[-1].split()[1])


def frame_db(x, sr, hop):
    n = len(x) // hop
    e = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1))
    return 20 * np.log10(e + 1e-9)


def tidy(x, max_pause, sr=SR):
    """Trim edges and shorten over-long pauses (the TTS leaves ~1 s between sentences,
    which sounds read-aloud rather than spoken)."""
    hop = int(sr * 0.01)
    db = frame_db(x, sr, hop)
    act = db > db.max() - 40
    idx = np.where(act)[0]
    a, b = max(0, idx[0] - 2), min(len(act), idx[-1] + 4)
    x = x[a * hop: b * hop]
    act = act[a:b]
    out, i, keep_from = [], 0, 0
    xf = int(sr * 0.03)
    while i < len(act):
        if not act[i]:
            j = i
            while j < len(act) and not act[j]:
                j += 1
            gap = (j - i) * 0.01
            if gap > max_pause:
                cut_a = (i + int(max_pause * 50)) * hop          # keep first half of the pause…
                cut_b = (j - int(max_pause * 50)) * hop          # …and the last half
                out.append(x[keep_from:cut_a])
                keep_from = cut_b
            i = j
        else:
            i += 1
    out.append(x[keep_from:])
    y = out[0]
    for seg in out[1:]:  # equal-power crossfades in near-silence
        f = np.linspace(0, 1, min(xf, len(y), len(seg)))
        y = np.concatenate([y[: len(y) - len(f)], y[len(y) - len(f):] * np.cos(f * np.pi / 2) + seg[: len(f)] * np.sin(f * np.pi / 2), seg[len(f):]])
    fi, fo = int(sr * 0.015), int(sr * 0.06)
    y[:fi] *= np.linspace(0, 1, fi)
    y[-fo:] *= np.linspace(1, 0, fo)
    return y


def write_mp3(y, path, target=-16.0):
    with tempfile.TemporaryDirectory() as tmp:
        w = os.path.join(tmp, 'a.f32')
        y.astype(np.float32).tofile(w)
        mid = os.path.join(tmp, 'b.wav')
        ffmpeg('-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', w, '-af', 'highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=7', '-ar', str(SR), mid)
        gain = target - loudness(mid)   # measured second pass: every line lands on the same loudness
        ffmpeg('-i', mid, '-af', f'volume={gain:.2f}dB,alimiter=limit=0.89', '-ar', str(SR), '-ac', '1', '-b:a', '64k', path)


def lpc_formants(fr, sr, order=12):
    fr = np.append(fr[0], fr[1:] - 0.63 * fr[:-1]) * np.hamming(len(fr))
    r = np.correlate(fr, fr, 'full')[len(fr) - 1: len(fr) + order]
    if r[0] <= 1e-9:
        return None
    a, e = np.zeros(order + 1), r[0]
    a[0] = 1
    for i in range(1, order + 1):           # Levinson-Durbin
        k = -(r[i] + np.dot(a[1:i], r[i - 1:0:-1])) / e
        a[1:i + 1] = a[1:i + 1] + k * np.append(a[1:i][::-1], 1)
        e *= 1 - k * k
    roots = [z for z in np.roots(a) if np.imag(z) > 0]
    f = sorted(np.angle(z) * sr / (2 * np.pi) for z in roots if -np.log(abs(z)) * sr / np.pi < 400)
    f = [v for v in f if v > 200]
    return f[:2] if len(f) >= 2 else None


def lipsync(path, scale=1.0):
    """Mouth openness + lip shape per 20 ms frame, from the actual speech sound."""
    sr = 10000
    x = decode(path, sr)
    hop, win = int(sr * FRAME), int(sr * 0.04)
    n = max(1, len(x) // hop)
    db = np.array([20 * np.log10(np.sqrt(np.mean(x[i * hop: i * hop + win] ** 2)) + 1e-9) for i in range(n)])
    top = np.percentile(db, 95)
    loud = np.clip((db - (top - 30)) / 30, 0, 1)                    # 0 at -30 dB from peak
    f1lo, f1hi = 300 * scale, 850 * scale
    f2lo, f2hi = 950 * scale, 2300 * scale
    jaw, shape = np.full(n, 0.5), np.full(n, 0.5)
    zc = np.array([np.mean(np.abs(np.diff(np.sign(x[i * hop: i * hop + win])))) / 2 for i in range(n)])
    for i in range(n):
        fr = x[i * hop: i * hop + win]
        if len(fr) < win or loud[i] < 0.15:
            continue
        fm = lpc_formants(fr.astype(np.float64), sr)
        if not fm:
            continue
        jaw[i] = np.clip((fm[0] - f1lo) / (f1hi - f1lo), 0, 1)
        shape[i] = np.clip((fm[1] - f2lo) / (f2hi - f2lo), 0, 1)
    voiced = zc < 0.25                                               # hiss (s, sh, f) keeps the teeth nearly together
    openv = loud * np.where(voiced, 0.35 + 0.65 * jaw, 0.35)
    openv = np.convolve(np.pad(openv, 1, mode='edge'), [0.25, 0.5, 0.25], mode='valid')
    # articulation dynamics: lips open fast, close a little slower (no flicker, no chewing)
    sm, prev = np.zeros(n), 0.0
    for i, v in enumerate(openv):
        k = 0.65 if v > prev else 0.4
        prev = prev + (v - prev) * k
        sm[i] = prev
    sh = np.convolve(np.pad(shape, 2, mode='edge'), np.ones(5) / 5, mode='valid')
    sm = np.append(sm[LEAD:], np.zeros(LEAD))                        # lips lead the sound slightly
    sh = np.append(sh[LEAD:], np.full(LEAD, 0.5))
    sm[-3:] = [min(sm[-3], 0.3), min(sm[-2], 0.15), 0]               # always ends closed
    enc = lambda v: ''.join(str(int(round(c * 9))) for c in np.clip(v, 0, 1))
    return enc(sm), enc(sh), len(decode(path)) / SR


async def retry(make, tries=4):
    """The online voice service occasionally drops a request; try again before failing."""
    for i in range(tries):
        try:
            return await make()
        except Exception:
            if i == tries - 1:
                raise
            await asyncio.sleep(2 * (i + 1))


async def render(line, c):
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, 'raw.mp3')
        await retry(lambda: edge_tts.Communicate(line['say'], c['voice'], rate=c['rate'], pitch=c['pitch']).save(raw))
        k = c.get('childScale')
        y = decode(raw, SR, f'aresample=48000,asetrate={int(48000 * k)},aresample={SR}' if k else None)
        return tidy(y, c.get('maxPause', 0.5))


async def main():
    data = json.load(open(DIALOGUE, encoding='utf-8'))
    args = sys.argv[1:]
    meta = json.load(open(META, encoding='utf-8')) if os.path.exists(META) else {}
    if args == ['--meta-only']:
        for scene in data['scenes'].values():
            for line in scene:
                c = data['cast'][line['who']]
                m, s, dur = lipsync(os.path.join(OUT_DIR, f'{line["id"]}.mp3'), c.get('childScale', 1.0))
                meta[line['id']] = {'who': line['who'], 'voice': c['voice'], 'dur': round(dur, 3), 'mouth': m, 'shape': s}
        json.dump(meta, open(META, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
        return
    catalogue = {v['ShortName']: v for v in await retry(edge_tts.list_voices)}
    for who, c in data['cast'].items():
        v = catalogue.get(c['voice'])
        if not v:
            sys.exit(f'voice {c["voice"]} for {who} not available — refusing to substitute another voice')
        if v['Gender'] != c['gender']:
            sys.exit(f'{who} is {c["gender"]} but {c["voice"]} is {v["Gender"]} — refusing')
        if not v['Locale'].startswith('ar-'):
            sys.exit(f'{c["voice"]} is not an Arabic voice — refusing')
    os.makedirs(OUT_DIR, exist_ok=True)
    ids = {l['id'] for s in data['scenes'].values() for l in s}
    for stale in set(meta) - ids:
        meta.pop(stale)
    for scene in data['scenes'].values():
        for line in scene:
            lid = line['id']
            if args and lid not in args:
                continue
            c = data['cast'][line['who']]
            out = os.path.join(OUT_DIR, f'{lid}.mp3')
            write_mp3(await render(line, c), out)
            m, s, dur = lipsync(out, c.get('childScale', 1.0))
            meta[lid] = {'who': line['who'], 'voice': c['voice'], 'dur': round(dur, 3), 'mouth': m, 'shape': s}
            print(f'{lid:12} {line["who"]:8} {c["voice"]:22} {dur:5.2f}s {loudness(out):6.1f} LUFS')
    json.dump(meta, open(META, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)


asyncio.run(main())
