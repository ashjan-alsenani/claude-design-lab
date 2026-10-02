"""Generate the film's character voices once, offline.

Reads src/film/dialogue.json and writes, for every line:
  public/voices/<id>.mp3   loudness-normalised mono speech
  src/film/voice-meta.json duration + mouth-openness envelope (lip-sync)

Every character has ONE fixed neural voice. The script refuses to run if a
voice's catalogue gender does not match the character's gender, so a female
character can never be given a male voice (and vice versa).

Usage:  pip install edge-tts numpy && python tools/generate_voices.py
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
FRAME = 0.04  # 40 ms envelope frames

if os.environ.get('TTS_CA_FILE'):
    _comm._SSL_CTX = ssl.create_default_context(cafile=os.environ['TTS_CA_FILE'])


def ffmpeg(*args):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *args], check=True)


def loudness(path):
    r = subprocess.run(['ffmpeg', '-v', 'info', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True)
    lines = [l for l in r.stderr.splitlines() if l.strip().startswith('I:')]
    return float(lines[-1].split()[1])


def normalise(path, target=-16.0):
    """Second pass: measure integrated loudness and apply the exact gain so every line matches."""
    gain = target - loudness(path)
    tmp = path + '.tmp.mp3'
    ffmpeg('-i', path, '-af', f'volume={gain:.2f}dB,alimiter=limit=0.89', '-ar', '24000', '-ac', '1', '-b:a', '64k', tmp)
    os.replace(tmp, path)


def envelope(path):
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, np.float32)
    n = int(16000 * FRAME)
    frames = [np.sqrt(np.mean(x[i:i + n] ** 2)) for i in range(0, len(x), n)]
    e = np.array(frames)
    peak = np.percentile(e, 95) or 1.0
    e = np.clip((e - 0.012) / (peak - 0.012), 0, 1)        # gate breath noise
    e = np.convolve(e, [0.25, 0.5, 0.25], mode='same')       # soften jitter
    return ''.join(str(int(round(v * 9))) for v in e), len(x) / 16000


async def main():
    data = json.load(open(DIALOGUE, encoding='utf-8'))
    if sys.argv[1:] in (['--normalise-only'], ['--meta-only']):
        meta = json.load(open(META, encoding='utf-8'))
        for scene in data['scenes'].values():
            for line in scene:
                f = os.path.join(OUT_DIR, f'{line["id"]}.mp3')
                if sys.argv[1] == '--normalise-only':
                    normalise(f)
                env, dur = envelope(f)
                meta[line['id']].update(dur=round(dur, 3), mouth=env)
                print(f'{line["id"]:12} {loudness(f):6.1f} LUFS {dur:5.2f}s')
        json.dump(meta, open(META, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
        return
    catalogue = {v['ShortName']: v for v in await edge_tts.list_voices()}
    for who, c in data['cast'].items():
        v = catalogue.get(c['voice'])
        if not v:
            sys.exit(f'voice {c["voice"]} for {who} not available — refusing to substitute another voice')
        if v['Gender'] != c['gender']:
            sys.exit(f'{who} is {c["gender"]} but {c["voice"]} is {v["Gender"]} — refusing')
        if not v['Locale'].startswith('ar-'):
            sys.exit(f'{c["voice"]} is not an Arabic voice — refusing')
    os.makedirs(OUT_DIR, exist_ok=True)
    meta = {}
    only = set(sys.argv[1:])
    old = json.load(open(META)) if os.path.exists(META) else {}
    for scene in data['scenes'].values():
        for line in scene:
            lid = line['id']
            if only and lid not in only:
                meta[lid] = old.get(lid)
                continue
            c = data['cast'][line['who']]
            with tempfile.TemporaryDirectory() as tmp:
                raw = os.path.join(tmp, 'raw.mp3')
                await edge_tts.Communicate(line['say'], c['voice'], rate=c['rate'], pitch=c['pitch']).save(raw)
                out = os.path.join(OUT_DIR, f'{lid}.mp3')
                # trim leading/trailing silence, normalise loudness, gentle fades
                ffmpeg('-i', raw, '-af',
                       'silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
                       'silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
                       'loudnorm=I=-16:TP=-1.5:LRA=7,afade=t=in:d=0.02,areverse,afade=t=in:d=0.06,areverse',
                       '-ar', '24000', '-ac', '1', '-b:a', '64k', out)
            normalise(out)
            env, dur = envelope(out)
            meta[lid] = {'who': line['who'], 'voice': c['voice'], 'dur': round(dur, 3), 'mouth': env}
            print(f'{lid:12} {line["who"]:8} {c["voice"]:22} {dur:5.2f}s')
    json.dump(meta, open(META, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)


asyncio.run(main())
