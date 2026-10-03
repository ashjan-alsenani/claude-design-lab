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
| Film (`#film`) | ~2.5-minute animated cartoon in 8 chapters: the microscopic world, bacteria vs viruses, the doctor, correct use, how resistance develops, how everyone helps, and the finale. Aleen (a young girl's voice), Dr. Huda and Kabsool the antibiotic hero speak natural Arabic with fixed character voices, lip-sync to their own audio, gesture, blink, look at each other, listen and react, over soft background music. Arabic captions are always on. `public/aleen-film.mp4` is the captioned film with the character voices, for download |

### Play park «ساحة الألعاب» (`#play`)

Seven short, replayable activities in three colour-coded corners. Every finished activity earns a sticker for the album and up to 3 stars. Progress is saved in the browser and kept when the adventure is restarted.

| Corner | Activity | What the child does |
| --- | --- | --- |
| 🧠 Thinking | Memory «لعبة الذاكرة» | Flip cards to find 6 pairs; each match teaches a short fact |
| | True or false «صح أم خطأ؟» | 8 random statements, ✅ / ❌, with a kind explanation after each |
| | Steps «رتّب الخطوات» | Tap steps in order: «when I feel sick» and «how to wash my hands» |
| ⚡ Moving | Hand washing «اغسل يديك!» | Wet → soap → scrub for a real 20 seconds while the germs fade → rinse → dry |
| | Catch «اصطد العادات الصحية» | Steer the shield to catch helpful things (soap, vaccine, doctor…) and avoid old medicine, sharing and germs. Plays by finger, mouse, arrow keys or on-screen buttons; never «game over» |
| 🎨 Creating & noticing | Detective «المحقق الصغير» | Find the 4 wrong behaviours among 9 photos; right behaviours are praised, never punished |
| | Colouring «لوّن كبسول» | Two colouring pages (Kabsool and the shield), 12 colours, save the picture as PNG |

Aleen guides every activity: she explains, cheers and gives hints. All activities share one shell: intro card → play → reward card with the sticker, stars and points. The content lives in `src/data/activities.ts` and the games in `src/activities/`.

Every drag interaction has a tap/keyboard alternative. Wrong answers never punish: the card wiggles, Baktoro gloats, and Aleen gives a hint with a light bulb.

## Structure

```
src/
  art/          SVG art kit (objects, icons, scenes), Aleen and Baktoro
  components/   HUD, parallax, transitions, flying stars, confetti, cursor sparkles, tilt cards
  data/         mission content (all text lives here)
  games/        Quiz, Clock, Sort, Lab, Compare, Shield mini-games (adventure missions)
  activities/   play-park shell + Memory, TrueFalse, Sequence, HandWash, Catch, Detective, Coloring
  screens/      Landing, Mission map, Mission shell, Final, Film player, Play park hub
  film/         film characters (Aleen rig, doctor, capsule hero), 8 scenes, dialogue.json (script),
                voice-meta.json (generated: durations + lip-sync envelopes), timeline.ts
public/voices/  one pre-recorded MP3 per dialogue line (generated)
public/music/   film-music.mp3, the dialogue-ducked background music (generated)
tools/          generate_voices.py (character voices + lip-sync), build_music.py (music mix), build_aleen_rig.py (Aleen's animation layers)
  state/        game state, progress persistence (localStorage, optional)
  lib/          sound layer, environment detection
source-art/     original supplied Aleen image (the app uses a background-removed WebP of it)
```

## Aleen

`source-art/student-hero-original.jpg` is the supplied character. `src/assets/aleen.webp` is the same image with only the stone-wall background removed (local `rembg` cut-out) so she sits inside the illustrated worlds. Her face, clothing, hijab and colours are untouched; only her presentation is animated.

## Film voices

Every line in `src/film/dialogue.json` has a caption (`text`) and a speech text (`say`) written as natural, conversational Modern Standard Arabic: plain spelling, no heavy vowel marks, few commas (heavy marks and extra commas made the delivery choppy). Vowels are added only where a word needs them, e.g. «أَلِين». `tools/generate_voices.py` renders each line once with a fixed neural Arabic voice per character and ships it as a static MP3, so every visitor hears exactly the same voices: the browser/device speech engine is never used.

| Character | Gender | Voice (fixed) | Measured pitch |
| --- | --- | --- | --- |
| Aleen (young girl) | Female | `ar-LB-LaylaNeural`, child rendering ×1.18 | 271–314 Hz |
| Dr. Huda (adult doctor) | Female | `ar-AE-FatimaNeural` (−3 % rate, calm) | 195–225 Hz |
| Kabsool | Male | `ar-KW-FahedNeural` (+18 Hz, −6 % rate) | 128–155 Hz |

- **Aleen's child voice.** The female voice is rendered slightly slower, then resampled ×1.18. This raises pitch *and* formants together, as a child's shorter vocal tract does, with no pitch-shift artifacts.
- **No wrong voice, ever.** The generator refuses to run if a voice's catalogue gender or language does not match the character, and it never substitutes another voice. If a voice file fails to load in the browser, that line stays captions-only.
- **Clean, even audio.** Each clip is trimmed, its long sentence pauses are shortened (≤ 0.42 s for Aleen, ≤ 0.55 s for Dr. Huda), and it is loudness-normalised with a measured second pass.
- **Lip-sync data.** Each clip is analysed every 20 ms into mouth openness (loudness × jaw height from the first formant) and lip shape (rounded u/o ↔ spread i/e from the second formant). The data is smoothed like real articulation and leads the sound by 40 ms.
- **Timing and sync.** The player schedules lines from their real durations: no overlaps, a 0.75 s reaction pause at every change of speaker. While a character speaks, their voice is the master clock, so lips and picture follow the sound.
- **Visuals on cue.** Scene beats are anchored to the words that introduce them (`cue()` in `scenes.tsx`), so they stay in place when lines are regenerated.
- **Regenerating.** After editing dialogue, run `pip install edge-tts numpy && python tools/generate_voices.py [line ids…]`, then `python tools/build_music.py`. This uses Microsoft Edge's online neural voices at build time and needs network access and ffmpeg. `--meta-only` refreshes durations and lip-sync data from the existing files.

## Film music

`source-art/music/` holds an original underscore composed for the film: D major, 96 BPM; piano, Rhodes, strings, pizzicato, celesta, soft brushes. It comes with its MIDI and the scripts that render it with the MIT-licensed FluidR3_GM soundfont. `tools/build_music.py` mixes it against the dialogue timeline into `public/music/film-music.mp3`:
- under every line it sits about 19 dB below the voices (at least 15 dB);
- it rises gently in scene transitions, the intro and the outro;
- its resolved final chord lands on the last seconds of the film.

The player keeps it locked to the picture and has its own 🎵 toggle.

## Aleen's animation rig

`tools/build_aleen_rig.py` splits the approved cut-out into four layers without repainting her:
- **Skirt.** Wherever the arms, hands or backpack cover the dress, it is rebuilt from the same pleats lower down.
- **Upper body.** The torso, sleeves and backpack lean, breathe, shrug and shift weight around the waist seam.
- **Clasped hands.** They rise from the elbows, present toward what she talks about, and beat on stressed syllables.
- **Head.** It tilts, nods, turns toward whoever is speaking and listens.

An SVG overlay animates her real irises (gaze toward the viewer, the other character or the visual), her eyelids (natural blinks), her eyebrows (raised for surprise and curiosity, inner ends up when worried) and her own lips. The lips part and change shape with her vowels; the mouth stays closed when she is silent.

Gestures are chosen per spoken phrase, so they never loop mechanically. At rest the layers recompose to the original image. Dr. Huda (fully drawn) explains with an open hand, points toward the visuals with her clipboard, tilts her head toward Aleen, nods while listening, blinks and lip-syncs to her own voice.

## Sound

The 🔊/🔇 toggle (off by default) drives `src/lib/sound.ts`. Sounds are synthesised with the Web Audio API, so there are no audio files. To use real samples, replace the body of `play(name)`. Nothing depends on sound.

## Motion, accessibility, performance

- `prefers-reduced-motion`: ambient floats, parallax, cursor trail and big rotations are disabled; essential feedback stays (short fades, small bursts).
- Pointer parallax, tilt and cursor sparkles only run on fine pointers; low-power devices (≤4 cores or ≤3 GB) get fewer particles and no parallax.
- Animations use transforms/opacity; ambient loops are CSS (off main thread), interactions use Motion springs.
- Real buttons everywhere, visible focus rings, `aria-live` feedback, Escape closes the certificate.
- Dependencies: React, Motion, and the self-hosted Baloo Bhaijaan 2 font. No WebGL.
