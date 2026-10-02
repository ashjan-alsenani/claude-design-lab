#!/bin/sh
# Regenerate everything: MIDI -> fluidsynth render (32-bit float) -> master -> analysis
set -e
cd "$(dirname "$0")"
SF2=/usr/share/sounds/sf2/FluidR3_GM.sf2     # apt: fluid-soundfont-gm (MIT)
PY=./venv/bin/python                          # venv with mido numpy scipy
$PY compose.py
fluidsynth -ni -q -O float -F raw.wav -r 44100 -g 0.6 \
  -o synth.reverb.room-size=0.62 -o synth.reverb.damp=0.45 \
  -o synth.reverb.width=0.7 -o synth.reverb.level=0.55 \
  -o synth.chorus.level=0.6 "$SF2" music.mid
$PY master.py
$PY analyze.py
