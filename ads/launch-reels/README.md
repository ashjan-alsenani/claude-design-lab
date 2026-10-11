# One Click launch reels

Three opening reels for Instagram (9:16, 1080×1920, 30 fps, H.264 + AAC), drawn in the site's own design: cream background, Rubik, the flat Clicky, product chips exactly like the home page parade, soft blobs and the colored hand-drawn underline.

| Reel | Length | Story | Final line |
|---|---|---|---|
| `01-opening` | 15 s | Clicky drops in and says hi → the logo → products burst out → «يومك، صار أحلى.» → «افتتحنا!» with confetti | oneclick.computer · الرابط في البايو |
| `02-less-effort` | 14 s | «مهامك كثيرة؟» tasks fall in a pile → Clicky taps once → they line up → «والكثير غيرها +» → «جهد أقل. حياة أكثر.» | same end card |
| `03-family` | 16 s | «تعرّف على عائلة كليكي» → each member in their color (Clicky, Toot, Shams, Marjan, Lilac) → all dance → «حياة أكثر.» | same end card |

- Music: original, synthesized by `tools/music.py` (marimba, bass, light drums, a chime on the celebration moments), owned outright.
- No voice-over; every message is on screen, so the reels work muted.
- No prices, no "free", no claim that every product has a demo.

Rebuild: `tools/build.sh` (or `ONLY="02-less-effort" tools/build.sh`). Sources: `video/<reel>/index.html` + `video/lib.js`.
