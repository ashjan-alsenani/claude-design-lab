# مغامرة المضاد الذكي — Smart Antibiotic Adventure

An animated, Arabic-first (RTL) interactive children's adventure about using antibiotics wisely. Aleen guides the child through five illustrated worlds to protect «مدينة الصحة» from resistant bacteria, while Baktoro (a cute, funny bacteria villain) reacts to every answer.

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
| Mission map | Winding road through five coloured worlds; locked / open / current / completed states; Aleen walks along the road (CSS `offset-path`) to each newly unlocked mission |
| 1 · Clinic Zone 🏥 | Illustrated quiz cards: who prescribes, bacteria vs viruses, colds |
| 2 · Medicine Clock Tower ⏰ | Drag the capsule to the next dose time (every 8 hours) — the hands sweep 8 hours; then completing the course and missed doses |
| 3 · Friendship Garden 🤝 | Drag / swipe / tap cards into ✅ / ❌ baskets; never share medicine |
| 4 · Bacteria Laboratory 🔬 | Step-through microscope story: bacteria → antibiotic → survivors → shields → multiplication; flip-card comparison body ❌ vs bacteria ✅ |
| 5 · Shield Castle 🛡️ | Mini-game: correct action bubbles fly into a 3D shield piece by piece until it turns gold; Baktoro falls over |
| Final | Confetti, score count-up, badge spin, golden rules recap, printable certificate with the child's name |
| Film (`#film`) | ~2.5-minute animated cartoon in 8 chapters: the microscopic world, bacteria vs viruses, the doctor, correct use, how resistance develops, how everyone helps, and the finale. Aleen, Dr. Huda and Kabsool the antibiotic hero speak with fixed character voices, lip-sync to their own audio, blink, look at each other and react. Arabic captions are always on. `public/aleen-film.mp4` is the captioned film with the character voices, for download |

Every drag interaction has a tap/keyboard alternative. Wrong answers never punish: the card wiggles, Baktoro gloats, and Aleen gives a hint with a light bulb.

## Structure

```
src/
  art/          SVG art kit (objects, icons, scenes), Aleen and Baktoro
  components/   HUD, parallax, transitions, flying stars, confetti, cursor sparkles, tilt cards
  data/         mission content (all text lives here)
  games/        Quiz, Clock, Sort, Lab, Compare, Shield mini-games
  screens/      Landing, Mission map, Mission shell, Final, Film player
  film/         film characters (Aleen rig, doctor, capsule hero), 8 scenes, dialogue.json (script),
                voice-meta.json (generated: durations + lip-sync envelopes), timeline.ts
public/voices/  one pre-recorded MP3 per dialogue line (generated)
tools/          generate_voices.py (character voices), build_aleen_rig.py (Aleen's animation layers)
  state/        game state, progress persistence (localStorage, optional)
  lib/          sound layer, environment detection
source-art/     original supplied Aleen image (the app uses a background-removed WebP of it)
```

## Aleen

`source-art/student-hero-original.jpg` is the supplied character. `src/assets/aleen.webp` is the same image with only the stone-wall background removed (local `rembg` cut-out) so she sits inside the illustrated worlds. Her face, clothing, hijab and colours are untouched; only her presentation is animated.

## Film voices

Every line in `src/film/dialogue.json` has a caption text (`text`) and a separate pronunciation-tuned speech text (`say`, light diacritics, Arabic punctuation, short sentences). `tools/generate_voices.py` renders each line ONCE with a fixed neural Arabic voice per character and ships it as a static MP3, so every visitor hears exactly the same voices — the browser/device speech engine is never used.

| Character | Gender | Voice (fixed) |
| --- | --- | --- |
| Aleen | Female | `ar-QA-AmalNeural` (+8 Hz, youthful) |
| Dr. Huda | Female | `ar-JO-SanaNeural` (−6 % rate, calm) |
| Kabsool | Male | `ar-KW-FahedNeural` (+18 Hz, −9 % rate) |

- The generator refuses to run if a voice's catalogue gender or language does not match the character, and never substitutes another voice.
- Each clip is trimmed, loudness-normalised to −16 LUFS (measured second pass) and analysed into a 40 ms mouth-openness envelope for lip-sync.
- At runtime the player schedules lines from their real durations (no overlaps, a short pause at every change of speaker). If a voice file fails to load, that line stays captions-only — no fallback voice.
- Regenerate after editing dialogue: `pip install edge-tts numpy && python tools/generate_voices.py [line ids…]` (uses Microsoft Edge's online neural voices at build time; needs network and ffmpeg). `--meta-only` refreshes durations/envelopes from existing files.

## Aleen's animation rig

`tools/build_aleen_rig.py` splits the approved cut-out into three layers (body, head, hands) without repainting her: the head turns a few degrees around the neck, the clasped hands lift from the elbows for gestures (the navy dress behind them is filled from its surroundings), and an SVG overlay animates her real irises (gaze), eyelids (blinks, using her own skin and lash colours) and mouth (her own lower lip drops to reveal the mouth, driven by her voice envelope). At rest the layers recompose to the original image.

## Sound

The 🔊/🔇 toggle (off by default) drives `src/lib/sound.ts`. Sounds are synthesised with the Web Audio API, so there are no audio files. To use real samples, replace the body of `play(name)`. Nothing depends on sound.

## Motion, accessibility, performance

- `prefers-reduced-motion`: ambient floats, parallax, cursor trail and big rotations are disabled; essential feedback stays (short fades, small bursts).
- Pointer parallax, tilt and cursor sparkles only run on fine pointers; low-power devices (≤4 cores or ≤3 GB) get fewer particles and no parallax.
- Animations use transforms/opacity; ambient loops are CSS (off main thread), interactions use Motion springs.
- Real buttons everywhere, visible focus rings, `aria-live` feedback, Escape closes the certificate.
- Dependencies: React, Motion, and the self-hosted Baloo Bhaijaan 2 font. No WebGL.
