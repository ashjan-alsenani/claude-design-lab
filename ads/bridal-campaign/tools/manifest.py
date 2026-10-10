"""Writes campaign-manifest.json describing every asset (reels, alternates, statics, captions, audio, thumbnails, sources)."""
import json, os, sys, subprocess, re
sys.path.insert(0, os.path.dirname(__file__))
from ads import ADS, ROOT
from statics import STATICS

def plain(s):
    return re.sub(r"<[^>]+>", "", s.replace("<br>", " ")).replace("{h}", "🤍").replace("{s}", "✨").replace("*", "")

def probe(p):
    f = ROOT / p
    if not f.exists(): return None
    o = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration,size", "-of", "json", str(f)], capture_output=True, text=True).stdout
    d = json.loads(o)["format"]; return {"seconds": round(float(d["duration"]), 2), "bytes": int(d["size"])}

def rel(p):
    return p if (ROOT / p).exists() else None

reels = []
for a in ADS:
    n = f'{a["id"]}-{a["slug"]}'
    vo = a["vo"]("A")
    item = {
        "id": a["id"], "slug": n, "title": plain(a["title"]), "angle": a["angle"], "duration_s": a["dur"],
        "hook_on_screen": {k: plain(v) for k, v in a["hooks"].items()},
        "voiceover": [{"start": x, "end": y, "text": plain(t)} for (t, x, y) in vo],
        "end_card": {"tagline": plain(a["tagline"]), "cta": plain(a["action"]), "line": "الرابط في البايو", "brand": "مفكّرة عروسة العُمر — على OneClick", "starts_at_s": a["end"]},
        "music": {"theme": a["music"][0], "transpose": a["music"][1], "seed": a["music"][2], "bed": f"audio/music/{n}.wav", "vo_ready_bed": f"audio/music/{n}.vo-bed.wav"},
        "product_screens": a["screens"],
        "scenario_note": "«باقي ٧ أيام» is an illustrative last-week scenario; every screen shown is real." if a.get("scenario") else None,
        "files": {
            "export": rel(f"exports/reels/{n}.mp4"), "export_probe": probe(f"exports/reels/{n}.mp4"),
            "source": f"video/{n}/index.html", "script": f"scripts/{n}.md",
            "captions_srt": f"captions/{n}.srt", "captions_vtt": f"captions/{n}.vtt",
            "voice_timing_guide": f"audio/voice/{n}.timing-guide.wav", "voice_recording": None,
            "thumbnail_cover": rel(f"exports/thumbnails/{n}-cover-1080x1920.jpg"), "thumbnail_grid": rel(f"exports/thumbnails/{n}-grid-1080x1350.jpg"),
            "preview_strip": rel(f"exports/thumbnails/previews/{n}-strip.jpg"),
        },
    }
    if "B" in a["hooks"]:
        b = a["vo"]("B")[0]
        item["alternate_hook_b"] = {
            "replaces_first_seconds": a["splice"], "voiceover_line": {"start": b[1], "end": b[2], "text": plain(b[0])},
            "export": rel(f"exports/reels-alternates/{n}-hook-b.mp4"), "source": f"video/{n}/hook-b.html",
            "captions_srt": f"captions/{n}-hook-b.srt", "captions_vtt": f"captions/{n}-hook-b.vtt",
            "voice_timing_guide": f"audio/voice/{n}-hook-b.timing-guide.wav",
            "thumbnail_cover": rel(f"exports/thumbnails/{n}-hook-b-cover-1080x1920.jpg"),
        }
    reels.append(item)

statics = []
for sid, slug, _, head in STATICS:
    n = f"{sid}-{slug}"
    statics.append({"id": sid, "slug": n, "headline": head, "bonus": sid == "07",
                    "files": {"feed_4x5_png": rel(f"exports/images/{n}-feed-1080x1350.png"), "feed_4x5_jpg": rel(f"exports/images/{n}-feed-1080x1350.jpg"),
                              "story_9x16_png": rel(f"exports/images/{n}-story-1080x1920.png"), "story_9x16_jpg": rel(f"exports/images/{n}-story-1080x1920.jpg"),
                              "source_feed": f"static/{n}/feed-4x5.html", "source_story": f"static/{n}/story-9x16.html"}})

manifest = {
    "campaign": "مفكّرة عروسة العُمر — Bride of a Lifetime · Instagram launch",
    "product": "Interactive bridal planner on OneClick (oneclick.computer)",
    "audience": "GCC brides, especially Saudi Arabia; engagement → milka → henna → wedding → sabahiya → new home → honeymoon",
    "positioning": "Relief, excitement, elegance, organisation, confidence — a luxury bridal companion, not a software ad.",
    "product_source": {"site": "current OneClick site (branch claude/brave-fermi-t1pa59, commit b3b4800 = production)", "route": "/ar/demo/bride-planner",
                       "data": "fictional sample wedding (Layan) set to Riyadh / SAR / 15 April 2027 → 187 days, 42% ready, plus one photographer payment due in 3 days, all entered through the app's own forms",
                       "capture_tools": "tools/capture/*.cjs", "screenshots": "assets/screenshots/ (390 CSS px wide at 3x)"},
    "format": {"reels": "1080×1920, 9:16, H.264 High, 30 fps, AAC 48 kHz, faststart", "statics": "1080×1350 (4:5 feed) and 1080×1920 (9:16 story), PNG + JPG"},
    "safe_areas": {"top_px": 230, "bottom_px": 420, "right_px": 130, "left_px": 90, "note": "Hooks start at y≈250; captions sit with their bottom edge 420 px above the frame bottom and 150 px clear of the right-side IG controls."},
    "design": {"palette": {"ivory": "#FBF6EF", "warm_white": "#FFFCF7", "champagne": "#E8DAC3", "beige": "#EFE4D6", "blush": "#EFD9D2", "dusty_rose": "#C9979A", "deep_rose_text": "#9A5F63",
                           "antique_gold": "#B19363", "sage": "#A7BBA2", "sage_deep": "#5E7C5C", "warm_brown_text": "#3A2A23"},
               "type": {"display": "Amiri 700 (SIL OFL)", "captions_ui": "IBM Plex Sans Arabic 500–700 (SIL OFL)", "latin_accent": "Cormorant Garamond (SIL OFL)"},
               "icons": "Phosphor Icons (MIT), extracted to tools/icons.json"},
    "voice": {"status": "MISSING — not generated", "reason": "No natural young Saudi female voice is available locally, and paid TTS/voice services were not authorised. No male or robotic substitute was used.",
              "ready": ["scripts/vo-recording-sheet.md", "scripts/vo-timing.json", "captions/*.srt|vtt (same timings)", "audio/voice/*.timing-guide.wav", "audio/music/*.vo-bed.wav (pre-ducked −13 dB)", "tools/mix_vo.sh"],
              "mix_spec": "VO −16 LUFS, music −30 LUFS (≈14 dB under) + sidechain ≈3 dB while speaking; limiter at −1 dBTP"},
    "music": {"source": "Original, synthesised for this campaign by tools/music.py (piano, light strings, harp, warm pad; no drums, no heavy bass)", "license": "Owned outright — no third-party samples; cleared for commercial advertising",
              "export_level": "−18 LUFS integrated in the music-only exports, gentle fade-in/out"},
    "reels": reels, "statics": statics,
    "cta_rotation": ["اكتشفي مفكّرتك الآن", "ابدئي رحلة زفافك", "رتّبي يومك من اليوم", "شوفي مفكّرتك", "ابدئي الآن على OneClick", "ابدئي رحلتك"],
    "policy": {"no_price_or_free_claims": True, "no_purchase_language": True, "emoji_max": "one small heart/sparkle (drawn as SVG on screen)"},
}
(ROOT / "campaign-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
print("manifest ok", len(reels), len(statics))
