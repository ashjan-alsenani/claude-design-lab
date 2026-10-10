"""Writes scripts/, captions/, audio/voice/ timing tracks and the per-ad music plan from ads.py."""
import json, os, sys, wave, struct, math
sys.path.insert(0, os.path.dirname(__file__))
from ads import ADS, ROOT

import re
def plain(s):
    s = re.sub(r"<[^>]+>", "", s.replace("<br>", " "))
    return s.replace("{h}", "🤍").replace("{s}", "✨").replace("*", "").replace("<br>", " ")

def ts(t, sep=","):
    t = max(0.0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h:02d}:{m:02d}:{int(s):02d}{sep}{int(round((s - int(s)) * 1000)):03d}"

def name(a):
    return f'{a["id"]}-{a["slug"]}'

def write_caps(a, v):
    lines = a["vo"](v)
    sfx = "" if v == "A" else "-hook-b"
    srt = "".join(f"{i+1}\n{ts(x)} --> {ts(y)}\n{plain(t)}\n\n" for i, (t, x, y) in enumerate(lines))
    vtt = "WEBVTT\n\n" + "".join(f"{ts(x, '.')} --> {ts(y, '.')}\n{plain(t)}\n\n" for (t, x, y) in lines)
    (ROOT / "captions" / f"{name(a)}{sfx}.srt").write_text(srt)
    (ROOT / "captions" / f"{name(a)}{sfx}.vtt").write_text(vtt)

def guide_track(a, v):
    """A VO-ready timing track: a soft 880 Hz pip marks the start of every line, silence elsewhere."""
    sr = 44100; n = int(sr * a["dur"]); buf = [0] * n
    for (_, x, _) in a["vo"](v):
        i0 = int(x * sr)
        for k in range(int(0.06 * sr)):
            if i0 + k < n: buf[i0 + k] = int(6000 * math.sin(2 * math.pi * 880 * k / sr) * (1 - k / (0.06 * sr)))
    sfx = "" if v == "A" else "-hook-b"
    p = ROOT / "audio" / "voice" / f"{name(a)}{sfx}.timing-guide.wav"
    with wave.open(str(p), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(struct.pack(f"<{n}h", *buf))

timing = {}
md_all = ["# نصوص التعليق الصوتي — مفكّرة عروسة العُمر\n",
          "**الصوت المطلوب:** صبية سعودية شابة، دافية وناعمة وأنيقة، كأنها صديقة راقية تكلم عروسة. مو مذيعة، مو بائعة، مو درامية. لهجة سعودية/خليجية طبيعية وواضحة بدون مبالغة.\n",
          "**الإيقاع:** هادي ومطمّن، مع وقفة خفيفة عند «…». كل سطر لازم يخلص داخل الوقت المكتوب جنبه عشان يطابق الكابشن المحروق في الفيديو.\n",
          "**التسليم:** WAV ‎48kHz/24-bit أحادي، ملف لكل إعلان باسم `<رقم>-<slug>.wav` (والبدائل `-hook-b`)، يبدأ من الثانية صفر بنفس توقيت الملف `audio/voice/*.timing-guide.wav`.\n"]
for a in ADS:
    for v in a["hooks"]:
        write_caps(a, v); guide_track(a, v)
        timing[f'{name(a)}{"" if v == "A" else "-hook-b"}'] = [{"text": plain(t), "start": x, "end": y} for (t, x, y) in a["vo"](v)]
    # per-ad script
    lines = a["vo"]("A")
    body = [f'# {a["id"]} · {plain(a["title"])}\n', f'**الزاوية:** {a["angle"]}\n', f'**المدة:** {a["dur"]} ث · **الموسيقى:** {a["music"][0]}\n',
            "## التعليق الصوتي (سعودي، أنثى)\n", "| من | إلى | النص |", "|---|---|---|"]
    body += [f"| {x:.1f} | {y:.1f} | {plain(t)} |" for (t, x, y) in lines]
    if "B" in a["hooks"]:
        body += ["\n## بديل الافتتاحية (B) — لاختبار A/B\n", "| من | إلى | النص |", "|---|---|---|"]
        body += [f"| {x:.1f} | {y:.1f} | {plain(t)} |" for (t, x, y) in a["vo"]("B")[:1]]
        body += [f"\nبقية الإعلان مطابقة للنسخة A. (البديل يستبدل أول {a['splice']} ث فقط.)"]
    body += ["\n## النص على الشاشة\n", f'- الافتتاحية: «{plain(a["hooks"]["A"])}»' + (f' / البديل: «{plain(a["hooks"]["B"])}»' if "B" in a["hooks"] else ""),
             f'- الختام: «{plain(a["tagline"])}»',
             f'- زر الدعوة: «{plain(a["action"])}» + «الرابط في البايو» + «مفكّرة عروسة العُمر على OneClick»']
    if a.get("scenario"):
        body += ["\n> ملاحظة: «باقي ٧ أيام» سيناريو توضيحي للأسبوع الأخير؛ الشاشات المعروضة (جدول اليوم وحقيبة الطوارئ) حقيقية من المنتج."]
    (ROOT / "scripts" / f"{name(a)}.md").write_text("\n".join(body) + "\n")
    md_all.append(f'\n## {a["id"]} · {plain(a["title"])} ({a["dur"]} ث)\n')
    md_all += [f"- `{x:04.1f}–{y:04.1f}`  {plain(t)}" for (t, x, y) in lines]
    if "B" in a["hooks"]:
        t, x, y = a["vo"]("B")[0]
        md_all.append(f"- **بديل الافتتاحية B** `{x:04.1f}–{y:04.1f}`  {plain(t)}")
(ROOT / "scripts" / "vo-recording-sheet.md").write_text("\n".join(md_all) + "\n")
(ROOT / "scripts" / "vo-timing.json").write_text(json.dumps(timing, ensure_ascii=False, indent=1))
print("docs ok", len(timing))
