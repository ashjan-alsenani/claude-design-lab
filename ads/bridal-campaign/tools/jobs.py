"""Prints render jobs: page, frames dir, start, end (frames at 30 fps). Frames live outside the repo."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from ads import ADS
FR = os.environ.get("FRAMES", "/tmp/bridal-frames")
for a in ADS:
    d = f'../video/{a["id"]}-{a["slug"]}'
    print(f'{d}/index.html {FR}/{a["id"]}-A 0 {round(a["dur"]*30)}')
    if "B" in a["hooks"]:
        print(f'{d}/hook-b.html {FR}/{a["id"]}-B 0 {round(a["splice"]*30)}')
