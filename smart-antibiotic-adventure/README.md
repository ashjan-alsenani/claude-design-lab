# مغامرة المضاد الذكي — Smart Antibiotic Adventure

An animated, Arabic-first (RTL) interactive children's adventure about using antibiotics wisely. Noor guides the child through five illustrated worlds to protect «مدينة الصحة» from resistant bacteria, while Baktoro (a cute, funny bacteria villain) reacts to every answer.

## Run

```bash
npm install
npm run dev       # local development
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build
npm run lint      # oxlint
```

## Experience

| Screen | What happens |
| --- | --- |
| Landing | Layered «مدينة الصحة» city with pointer parallax, floating 3D-style objects, extruded title, pulsing 3D start button, rocket + portal transition |
| Mission map | Winding road through five coloured worlds; locked / open / current / completed states; Noor walks along the road (CSS `offset-path`) to each newly unlocked mission |
| 1 · Clinic Zone 🏥 | Illustrated quiz cards: who prescribes, bacteria vs viruses, colds |
| 2 · Medicine Clock Tower ⏰ | Drag the capsule to the next dose time (every 8 hours) — the hands sweep 8 hours; then completing the course and missed doses |
| 3 · Friendship Garden 🤝 | Drag / swipe / tap cards into ✅ / ❌ baskets; never share medicine |
| 4 · Bacteria Laboratory 🔬 | Step-through microscope story: bacteria → antibiotic → survivors → shields → multiplication; flip-card comparison body ❌ vs bacteria ✅ |
| 5 · Shield Castle 🛡️ | Mini-game: correct action bubbles fly into a 3D shield piece by piece until it turns gold; Baktoro falls over |
| Final | Confetti, score count-up, badge spin, golden rules recap, printable certificate with the child's name |

Every drag interaction has a tap/keyboard alternative. Wrong answers never punish: the card wiggles, Baktoro gloats, and Noor gives a hint with a light bulb.

## Structure

```
src/
  art/          SVG art kit (objects, icons, scenes), Noor and Baktoro
  components/   HUD, parallax, transitions, flying stars, confetti, cursor sparkles, tilt cards
  data/         mission content (all text lives here)
  games/        Quiz, Clock, Sort, Lab, Compare, Shield mini-games
  screens/      Landing, Mission map, Mission shell, Final
  state/        game state, progress persistence (localStorage, optional)
  lib/          sound layer, environment detection
source-art/     original supplied Noor image (the app uses a background-removed WebP of it)
```

## Noor

`source-art/student-hero-original.jpg` is the supplied character. `src/assets/noor.webp` is the same image with only the stone-wall background removed (local `rembg` cut-out) so she sits inside the illustrated worlds. Her face, clothing, hijab and colours are untouched; only her presentation is animated.

## Sound

The 🔊/🔇 toggle (off by default) drives `src/lib/sound.ts`. Sounds are synthesised with the Web Audio API, so there are no audio files. To use real samples, replace the body of `play(name)`. Nothing depends on sound.

## Motion, accessibility, performance

- `prefers-reduced-motion`: ambient floats, parallax, cursor trail and big rotations are disabled; essential feedback stays (short fades, small bursts).
- Pointer parallax, tilt and cursor sparkles only run on fine pointers; low-power devices (≤4 cores or ≤3 GB) get fewer particles and no parallax.
- Animations use transforms/opacity; ambient loops are CSS (off main thread), interactions use Motion springs.
- Real buttons everywhere, visible focus rings, `aria-live` feedback, Escape closes the certificate.
- Dependencies: React, Motion, and the self-hosted Baloo Bhaijaan 2 font. No WebGL.
