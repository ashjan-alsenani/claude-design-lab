ORIGINAL UNDERSCORE - Arabic children's educational film (using antibiotics correctly)
=====================================================================================
Files
  music.ogg   final mix (committed as high-quality Ogg Vorbis; render.sh produces music.wav), 165.000 s
  music.mid   source MIDI (type 0, 10 channels)
  compose.py  composition script (writes music.mid; fixed seed, deterministic)
  master.py   bus processing + loudness normalisation (raw.wav -> music.wav)
  analyze.py  numeric QC (loudness, true peak, clipping, DC, gaps, spectrum, short-term curve)
  render.sh   regenerates everything: compose -> fluidsynth render -> master -> QC
  qc.txt      output of the last QC run
Regenerate: apt-get install fluidsynth fluid-soundfont-gm ffmpeg ;
            python3 -m venv venv && venv/bin/pip install mido numpy scipy ; ./render.sh

Musical summary
  Key: D major        Tempo: 96 BPM, 4/4 (1 bar = 2.5 s)        Length: 66 bars = 165 s
  Character: light, warm, gently positive modern explainer underscore. No toy/nursery melody,
  no hits, no drops. The only melodic line is a sparse celesta (with glockenspiel sparkles) in the
  A5-A6 register, well above the main speech range, and it rests for whole sections.
  All progressions, arpeggio figures and melodic lines were written for this piece (original).

Instrumentation (General MIDI, FluidR3_GM soundfont)
  Slow Strings pad (sustained, mid voicing)        Warm Pad (low, very soft glue)
  Grand piano - soft 8th-note arpeggio / sparse broken chords, final chord
  Rhodes e-piano - soft half-note / off-beat chords in some sections
  Acoustic bass - soft roots or light root-fifth pattern (A1..G#2)
  Pizzicato strings - light rhythmic figure in A2, A3, C, Lift
  Celesta - sparse high melody (A2, C, Lift, Outro, final)
  Glockenspiel - occasional sparkles (Intro, B, A3, A4, Lift)
  Brush kit - maracas/shaker 8ths, very soft kick + brush snare, low in the mix (A1, A2, A3, C, Lift)

Section map (timestamps in seconds)
  0.0 - 7.5    Intro   Dadd9 | Gmaj7/D | Asus4-A. Pads swell in, rising piano quarter notes, one glock sparkle.
  7.5 - 27.5   A1      D A/C# Bm7 Gmaj7 D/F# G Em7 A7sus4-A. Piano arpeggio, pads, bass, soft shaker.
  27.5 - 47.5  A2      Same progression + pizzicato, light kick/brush, sparse celesta melody.
  47.5 - 67.5  B       Bm7 Gmaj7 D A Bm7 Gadd9 Em7 Asus4-A. SPARSER: broken piano chords, Rhodes, glock, no drums.
  67.5 - 87.5  A3      A progression, piano arpeggio + pizz variation, glockenspiel counter-line, shaker.
  87.5 - 107.5 C       Gmaj7 A6 F#m7 Bm7 Em9 F#m7 Gmaj7 Asus4-A. Colour section, off-beat Rhodes, celesta melody.
  107.5 - 120  A4      D A/C# Bm7 Gmaj7 Asus4-A. Thin breather before the lift (piano, pads, bass, glock).
  120 - 145    Lift    G A F#m7 Bm G A D/F# Bm7 Em7 Asus4-A. Warmer/more hopeful: fuller strings, celesta+glock,
                       pizz, Rhodes, light brushes (about +2-3 LU over the body, ramped in smoothly).
  145 - 155    Outro   Gmaj7 D/F# Em7 Asus4-A. Thins out, short celesta echo.
  155 - 165    Ending  Final soft Dadd9 chord (piano with pedal, strings, pad, bass, celesta) held to ~160 s,
                       natural decay; raised-cosine fade 159-165 s to digital silence.
  Edit points that land on phrase starts: 7.5, 27.5, 47.5, 67.5, 87.5, 107.5, 120, 145, 155 s.

Soundfont
  FluidR3_GM.sf2 (Debian/Ubuntu package fluid-soundfont-gm) by Frank Wen and contributors,
  released under the MIT license (see /usr/share/doc/fluid-soundfont-gm/copyright).
  Rendered with FluidSynth 2.3.4 (LGPL-2.1), 32-bit float, built-in reverb on
  (room 0.62, damp 0.45, width 0.7, level 0.55), per-channel reverb/chorus sends via CC91/CC93.

Mastering chain (master.py)
  DC removal, 40 Hz high-pass; EQ: +0.5 dB low shelf 150 Hz, -1.5 dB @ 350 Hz (Q 0.8),
  -2.5 dB wide dip @ 2.5 kHz (Q 0.7, leaves room for speech), +1.5 dB air shelf @ 10 kHz;
  light synthetic convolution room (12 % wet); side x0.85 (gentle width);
  6 s raised-cosine fade-out; loudness normalised to -20 LUFS; 16-bit TPDF dither.
  No limiting was needed (limiter only engages if true peak would exceed -2.3 dBTP).

Measurements (ffmpeg ebur128, analyze.py; see qc.txt)
  Integrated loudness   -20.0 LUFS
  Loudness range        4.4 LU
  True peak             -4.4 dBTP     Sample peak -4.42 dBFS     Clipped samples: 0
  DC offset             ~1e-8 (none)
  Stereo                L/R correlation 0.59, side/mid RMS 0.51 (moderate width, mono-safe)
  Silent gaps           none: every 0.25 s window between 0 and 158 s is above -50 dBFS RMS
  Short-term loudness (3 s) in the body 9-158 s stays between -22.8 and -17.5 LUFS;
  largest step between neighbouring 3 s windows 3.8 LU (no step > 4 LU outside intro/outro).
  Band energy (share of total): 20-60 Hz 8 % | 60-250 41 % | 250-500 29 % | 500-1k 14 % |
  1-2k 5.5 % | 2-5k 2.0 % | 5-10k 0.1 % | 10-20k 0.1 %   (warm, low energy in the speech-presence band)
