"""Thumbnails from the rendered frames: a 9:16 cover, a 4:5 grid crop (what the profile grid shows) and a 6-frame preview strip."""
import os, sys
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from ads import ADS, ROOT
FR = os.environ["FRAMES"]
COVER = {"10": 4.7, "11": 4.2, "12": 2.0, "09": 5.6, "07": 2.4, "13": 3.55}
out = ROOT / "exports" / "thumbnails"; (out / "previews").mkdir(parents=True, exist_ok=True)
def frame(d, t):
    p = f"{FR}/{d}/f{int(round(t * 30)):04d}.jpg"
    return Image.open(p).convert("RGB")
for a in ADS:
    n = f'{a["id"]}-{a["slug"]}'
    for v, d in (("A", f'{a["id"]}-A'), ("B", f'{a["id"]}-B')):
        if v == "B" and "B" not in a["hooks"]: continue
        t = COVER.get(a["id"], 1.2)
        if v == "B": t = min(t, a["splice"] - 0.4)
        im = frame(d, t); sfx = "" if v == "A" else "-hook-b"
        im.save(out / f"{n}{sfx}-cover-1080x1920.jpg", quality=92)
        im.crop((0, 285, 1080, 1635)).save(out / f"{n}{sfx}-grid-1080x1350.jpg", quality=92)
    ts = [0.6, a["dur"] * 0.22, a["dur"] * 0.4, a["dur"] * 0.58, a["dur"] * 0.72, a["end"] + 2.0]
    strip = Image.new("RGB", (6 * 360, 640), "white")
    for i, t in enumerate(ts):
        strip.paste(frame(f'{a["id"]}-A', min(t, a["dur"] - 0.05)).resize((360, 640)), (i * 360, 0))
    strip.save(out / "previews" / f"{n}-strip.jpg", quality=86)
print("thumbs ok")
