# حكاية قدوم: launch video and product mockup

A 30-second vertical ad (1080×1920, 30 fps, H.264 + AAC) and a phone + laptop mockup image for the product page. Every screen in them is the real app, captured from the current code with fictional data (أم سلمى، سلمى، مسقط).

| File | What |
|---|---|
| `assets/` | Real screens: `m-*` phone (Pixel 7), `d-*` desktop (1280×720) |
| `video/ad.html` | The ad composition (`window.render(t)`): 6 scenes + end card |
| `video/mockup.html` | Laptop + phone mockup |
| `audio/music.wav` | Original synthesised piano bed (`../bridal-campaign/tools/music.py morning 30 … 7`), owned outright (not committed) |
| `exports/hikayat-qudoom-ad-1080x1920.mp4` | Full-quality ad (not committed) |
| `exports/hikayat-qudoom-ad-web.mp4` | 720×1280 web copy, also at `oneclick/public/brand/qudoom/ad.mp4` |

The ad has no voice-over, no price and no "free" claim. Its captions are burned in, so it works muted.

## Rebuild

```bash
# 1. screens (dev server on, owner accounts): copy tools/capture.spec.ts into oneclick/tests/e2e/ and run
CAP=$PWD/assets npx playwright test tests/e2e/capture.spec.ts   # then remove the copy
# 2. frames, music, encode
node ../bridal-campaign/tools/render.cjs video/ad.html /tmp/frames 0 900 30
python3 ../bridal-campaign/tools/music.py morning 30 audio/music.wav 7 0
ffmpeg -framerate 30 -i /tmp/frames/f%04d.jpg -i audio/music.wav -filter_complex "[1:a]loudnorm=I=-18:TP=-1.5:LRA=9,aresample=48000,afade=t=out:st=28:d=2,atrim=0:30[a]" -map 0:v -map "[a]" -c:v libx264 -pix_fmt yuv420p -crf 18 -r 30 -movflags +faststart -c:a aac exports/hikayat-qudoom-ad-1080x1920.mp4
# 3. mockup
node tools/still.cjs video/mockup.html exports/mockup.png 1600 960
```
