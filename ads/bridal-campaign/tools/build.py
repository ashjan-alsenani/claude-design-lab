"""Writes every ad page (main + hook alternates) into video/<id>-<slug>/."""
import sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent))
from ads import ADS, build_html, ROOT
for a in ADS:
    d = ROOT / "video" / f'{a["id"]}-{a["slug"]}'
    d.mkdir(parents=True, exist_ok=True)
    (d / "index.html").write_text(build_html(a, "A"))
    if "B" in a["hooks"]:
        (d / "hook-b.html").write_text(build_html(a, "B"))
print("built", len(ADS))
