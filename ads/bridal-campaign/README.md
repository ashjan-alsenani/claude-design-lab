# مفكّرة عروسة العُمر — Instagram campaign

A luxury bridal launch campaign for the interactive bridal planner on **OneClick**, aimed at GCC brides (Saudi first).
It sells the feeling: relief, excitement, elegance, organisation and confidence. Every product screen in it is the **current OneClick site** (captured from the same commit that is live), never a mock-up and never the old design.

## What's delivered

| | Count | Where |
|---|---|---|
| Reels (9:16, 1080×1920, H.264, 30 fps) | 15 | `exports/reels/` |
| Hook alternates for A/B tests (01, 02, 03, 04, 15) | 5 | `exports/reels-alternates/` |
| Static ads: 6 + 1 bonus (budget), each as 4:5 feed and 9:16 story, PNG + JPG | 7 × 2 | `exports/images/` |
| Thumbnails: cover 1080×1920, grid crop 1080×1350, 6-frame preview strip | 20 / 20 / 15 | `exports/thumbnails/` |
| Saudi VO scripts + recording sheet + timing JSON | 15 (+5 hooks) | `scripts/` |
| Captions (SRT + VTT, same timings as the burned captions) | 20 | `captions/` |
| Music beds + VO-ready (pre-ducked) beds | 15 + 15 | `audio/music/` |
| VO timing guide tracks | 20 | `audio/voice/` |
| Editable sources (HTML compositions) | 20 reels + 14 statics | `video/`, `static/` |
| Manifest describing every asset | 1 | `campaign-manifest.json` |

`exports/` and the `.wav` files are not committed to git (heavy and reproducible; see **Rebuild**). They are delivered separately.

## ⚠️ Missing asset: the Saudi female voice

**Not generated, on purpose.** No natural young Saudi female voice is available locally, and paid voice/TTS services were not authorised. A male, robotic or non-Saudi voice was not substituted.

The reels already work muted: every narrated line is burned in as an Arabic caption with the planned VO timing, and the music is a soft bed. When a voice is recorded:

1. Give the artist `scripts/vo-recording-sheet.md` (tone, pace, delivery format and per-line timings).
2. She records each ad from 0:00 against `audio/voice/<ad>.timing-guide.wav` (a soft pip marks each line start).
3. Run `tools/mix_vo.sh <ad> <recording.wav>` (add `hook-b` for an alternate). It writes `exports/reels-with-vo/<ad>.mp4` with:
   - VO at −16 LUFS;
   - music at −30 LUFS (about 14 dB under the voice), plus about 3 dB of sidechain ducking while she speaks;
   - a limiter at −1 dBTP.

   Tested with a stand-in signal: the music sits about 12 dB under the voice overall and about 15 dB under while she's speaking, inside the 12–16 dB brief.

## The reels

| # | Angle | Hook (A) | Hook (B) | Length | End-card tagline · CTA | Music |
|---|---|---|---|---|---|---|
| 01 | Fear of forgetting → relief | زواجك قرب… وتحسين إنك ناسية شيء؟ | كم ملاحظة كاتبتها عن زواجك؟ | 15.0 | رتّبي رحلة زفافك 🤍 · اكتشفي مفكّرتك الآن | morning |
| 02 | Countdown + readiness | كم باقي على زواجك؟ | باقي لك ١٨٧ يوم… تعرفين وش تسوين أول؟ | 14.6 | كل يوم… خطوته واضحة · ابدئي رحلتك | garden |
| 03 | Overwhelm → this week's focus | مو لازم تسوين كل شيء اليوم. | ٢٠٦ مهمة؟ لا تشيلين هم. | 14.6 | خطوة بخطوة لين يومك 🤍 · رتّبي يومك من اليوم | veil |
| 04 | Budget control | وين راحت ميزانية الزواج؟ | كل ريال… تعرفين وين راح. | 14.6 | ميزانيتك قدامك دائمًا. · شوفي مفكّرتك | promise |
| 05 | Payment & appointment reminders | دفعة المصورة بعد ٣ أيام. | — | 13.8 | ولا موعد يُنسى. · ابدئي رحلة زفافك | golden |
| 06 | RSVPs | مين للحين ما رد على الدعوة؟ | — | 14.2 | ضيوفك… مرتبين 🤍 · ابدئي الآن على OneClick | morning |
| 07 | Vendors in one place | قاعة؟ مصورة؟ ميكب؟ ورد؟ | — | 14.0 | كل تفاصيل زفافك في مكانها. · اكتشفي مفكّرتك الآن | promise |
| 08 | Small details remembered | في أشياء ما نتذكرها إلا متأخر… | — | 15.0 | ولا تفصيلة تُنسى. · رتّبي يومك من اليوم | veil |
| 09 | The whole journey | مو بس يوم الزواج… | — | 14.8 | رحلتك كاملة 🤍 · ابدئي رحلة زفافك | henna |
| 10 | Progress momentum | ٤٢٪ جاهزة ✨ | — | 13.2 | شوفي جاهزيتك تكبر. · ابدئي الآن على OneClick | garden |
| 11 | Before / after | قبل؟ / بعد؟ | — | 14.0 | التحضير صار أهدأ. · اكتشفي مفكّرتك الآن | veil |
| 12 | Wedding week (scenario) | باقي ٧ أيام 🤍 | — | 14.8 | Wedding Week 🤍 · رتّبي يومك من اليوم | golden |
| 13 | Bridal shopping / trousseau | جهازك… وش باقي منه؟ | — | 14.2 | كل تجهيزاتك معك. · شوفي مفكّرتك | morning |
| 14 | Wedding + new home | زواج… وتجهيز بيت بنفس الوقت؟ | — | 15.0 | بيت جديد. بداية جديدة. 🤍 · ابدئي رحلة زفافك | promise |
| 15 | Flagship sweep | يا عروسة… شوفي وش يصير لما كل شيء يكون مرتب. | عروسة ٢٠٢٧؟ هذي رحلتك… كاملة. | 17.8 | رحلتك كاملة… بمكان واحد · اكتشفي مفكّرتك الآن | golden |

Every end card shows «مفكّرة عروسة العُمر — على OneClick», the CTA and «الرابط في البايو». There are no price, "free" or purchase claims. Full VO lines, timings and on-screen copy are in `scripts/<ad>.md` and `campaign-manifest.json`.

**Hook alternates** only replace the opening (3.0–3.6 s). The rest of the video is the same frames, so an A/B test isolates the hook.

## The statics (`exports/images/`, 4:5 feed + 9:16 story)

| # | Headline | Product shown |
|---|---|---|
| 01 hero | زواجك له ألف تفصيلة… خليها كلها بمكان واحد. · CTA ابدئي رحلتك | dashboard in phone + greeting card + this-week card |
| 02 countdown | ١٨٧ باقي على زفافك · ٤٢٪ جاهزة | real countdown/readiness tiles |
| 03 this week | وش باقي عليك هالأسبوع؟ | «تركيزك هذا الأسبوع» |
| 04 before/after | من الفوضى… إلى رحلة مرتبة. | scattered notes vs dashboard |
| 05 checklist | مو لازم تتذكرين كل شيء. إحنا تذكرناه لك. · CTA اكتشفي المفكّرة | progress (٧٦ من ٢٠٦) + task rows |
| 06 full journey | من الملكة إلى شهر العسل… كل رحلتك معك. | milka → henna → wedding → sabahiya → honeymoon |
| 07 budget (bonus) | استمتعي بالتجهيز… بدون ما تضيع منك الميزانية. | paid / committed / remaining + upcoming payments |

## Product data shown (all real UI, fictional bride)

The public demo's sample wedding (bride «ليان») was set through the app's own Settings and forms:

- city: Riyadh, Saudi Arabia; currency: SAR;
- wedding date: 15 April 2027, so the app reads **187 days**;
- real tasks ticked until the app reads **42% ready**;
- one payment added through «دفعة جديدة»: «المصورة: الدفعة الثانية · ١٬٥٠٠ ر.س», due in 3 days.

The demo banner and the Next.js dev badge were hidden, because neither exists in the purchased app. Capture scripts are in `tools/capture/`, and element boxes for every crop are in `assets/screenshots/*-boxes.json`.

## Design decisions

- **Palette and type:**
  - Palette: ivory, warm white, champagne, beige, blush, dusty rose, a restrained antique gold, and sage for progress.
  - Type: Amiri for display, IBM Plex Sans Arabic for captions and labels, Cormorant Garamond for the Latin "OneClick".
  - All fonts are SIL OFL (licences in `assets/fonts/`); icons are Phosphor (MIT).
  - The product UI keeps its own pink: it is shown faithfully, and the campaign frame around it stays muted.
- **No photography.** The campaign uses only the current site's own visuals (UI, the Clicky mascot that lives in the dashboard). A bride photo from the earlier design was removed at the client's request: "stick to the current site".
- **Motion:**
  - Used: blur-to-focus reveals, masked wipes, slow parallax zooms, light sweeps across UI cards, counted numbers, progress rings.
  - Avoided: glitch, shake, punch zooms, flashes.
- **Captions:**
  - Warm-white type on a translucent warm-brown pill, at most two lines.
  - The hook line is shown as the headline instead of a duplicate caption.
- **Before/after (ad 11 and static 04):** «قبل» sits on the **right** and «بعد» on the left. The brief said left/right, but Arabic reads right-to-left, so the eye meets "before" first.
- **Ad 12** «باقي ٧ أيام» is a last-week scenario. The screens it shows (day-of schedule, emergency kit) are real, but the sample wedding itself is 187 days away. The product has no separate "Wedding Week mode", so the ad never claims one; "Wedding Week" is only the campaign's end-card line.
- **Ad 05** shows the reminder as a notification-style card. In the product it is the in-app «يحتاج انتباهك» alert, which is shown right after.

## Review (the brief's 10 questions)

The voice question is open for every ad until the recording exists.

| # | 1 Stops scroll | 2 Benefit instant | 3 UI readable | 4 Luxury | 5 Saudi voice | 6 Music under voice | 7 Works muted | 8 CTA visible | 9 Safe area | 10 Distinct angle |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | ✓ chaos montage + question | ✓ | ✓ zoomed hero card | ✓ | pending VO | ✓ (bed ready) | ✓ | ✓ | ✓ | forgetting |
| 02 | ✓ big question + date | ✓ | ✓ real onboarding "١٨٧ يومًا" | ✓ | pending | ✓ | ✓ | ✓ | ✓ | countdown |
| 03 | ✓ wall of 36 planner tasks | ✓ | ✓ this-week card at 2.3× | ✓ | pending | ✓ | ✓ | ✓ | ✓ | focus |
| 04 | ✓ money question | ✓ | ✓ summary + payments | ✓ | pending | ✓ | ✓ | ✓ | ✓ | budget |
| 05 | ✓ concrete alert | ✓ | ✓ | ✓ | pending | ✓ | ✓ | ✓ | ✓ | reminders |
| 06 | ✓ family question | ✓ counted RSVPs | ✓ | ✓ | pending | ✓ | ✓ | ✓ | ✓ | guests |
| 07 | ◐ icon-led, quieter open | ✓ | ✓ vendor cards | ✓ | pending | ✓ | ✓ | ✓ | ✓ | vendors |
| 08 | ✓ | ✓ | ✓ emergency kit | ✓ | pending | ✓ | ✓ | ✓ | ✓ | details |
| 09 | ◐ calm open by design | ✓ | ✓ honeymoon | ✓ | pending | ✓ | ✓ | ✓ | ✓ | journey |
| 10 | ✓ 42% ring | ✓ | ✓ | ✓ | pending | ✓ | ✓ | ✓ | ✓ | progress |
| 11 | ✓ split | ✓ | ◐ small phone in split, then large cards | ✓ | pending | ✓ | ✓ | ✓ | ✓ | contrast |
| 12 | ✓ "باقي ٧ أيام" + week strip | ✓ | ✓ | ✓ | pending | ✓ | ✓ | ✓ | ✓ | emotion |
| 13 | ✓ | ✓ ticks | ✓ closet | ✓ | pending | ✓ | ✓ | ✓ | ✓ | shopping |
| 14 | ✓ | ✓ | ◐ side-by-side cards are small, then large | ✓ | pending | ✓ | ✓ | ✓ | ✓ | new home |
| 15 | ✓ | ✓ | ✓ seven feature cards | ✓ | pending | ✓ | ✓ | ✓ | ✓ | flagship |

◐ means acceptable, but a stronger option exists if testing shows a weak spot. For example, 07 and 09 could open on a bolder number or question, as 02 and 10 do.

## Folder structure

```
README.md · campaign-manifest.json · .gitignore
scripts/      per-ad scripts (Arabic), vo-recording-sheet.md, vo-timing.json
captions/     <ad>.srt/.vtt and <ad>-hook-b.srt/.vtt
audio/music/  <ad>.wav (bed) and <ad>.vo-bed.wav (pre-ducked −13 dB under each line)   [git-ignored]
audio/voice/  <ad>.timing-guide.wav  (VO recordings go here)                         [git-ignored]
assets/       screenshots/ (current site, 3×) · fonts/ (OFL + licences)
video/        01-forgetting/ … 15-hero/  index.html (+ hook-b.html)
static/       01-hero/ … 07-budget/  feed-4x5.html, story-9x16.html
exports/      reels/ · reels-alternates/ · images/ · thumbnails/ (+previews/)        [git-ignored]
tools/        lib.py (design system + timeline engine), ads.py, statics.py, music.py, render.cjs,
              build.py, docs.py, make_music.py, encode.sh, mix_vo.sh, make_thumbs.py, manifest.py, capture/
```

## Rebuild

From `ads/bridal-campaign/`:

```bash
python3 tools/build.py && python3 tools/statics.py && python3 tools/docs.py && python3 tools/make_music.py
export FRAMES=/tmp/bridal-frames
(cd tools && python3 jobs.py | xargs -P4 -L1 sh -c 'node render.cjs "$0" "$1" "$2" "$3"')
bash tools/encode.sh && python3 tools/make_thumbs.py && python3 tools/manifest.py
# statics: VH=1350 node tools/render.cjs static/<id>/feed-4x5.html --still out.png 20
```

Re-capture the product with the app running on `localhost:3100`: `node tools/capture/capture.cjs` and `node tools/capture/onboard.cjs`.

Rendering is deterministic: each frame is `window.render(t)` at 30 fps.
