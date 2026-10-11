#!/usr/bin/env bash
# Renders the three launch reels: frames (render.cjs) + original music (music.py) → exports/<reel>.mp4 (1080x1920, 30 fps, H.264, AAC).
set -euo pipefail
cd "$(dirname "$0")/.."
FR=${FRAMES:-/tmp/launch-frames}
# id  seconds  music-hits(celebration moments)
REELS="01-opening:15:11.2,12.9 02-less-effort:14:3.6,12.1 03-family:16:12.1,14.0"
mkdir -p exports audio
for r in $REELS; do
  IFS=: read -r id dur hits <<<"$r"; [ -n "${ONLY:-}" ] && [[ " $ONLY " != *" $id "* ]] && continue
  n=$(python3 -c "print(int($dur*30))"); q=$(( (n + 3) / 4 ))
  rm -rf "$FR/$id"; mkdir -p "$FR/$id"
  for k in 0 1 2 3; do a=$((k*q)); b=$(( (k+1)*q < n ? (k+1)*q : n )); node tools/render.cjs "video/$id/index.html" "$FR/$id" $a $b & done; wait
  python3 tools/music.py "$dur" "audio/$id.wav" 1 0 "$hits"
  ffmpeg -nostdin -y -loglevel error -framerate 30 -i "$FR/$id/f%04d.jpg" -i "audio/$id.wav" \
    -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=9,aresample=48000,apad,atrim=0:$dur[a]" -map 0:v -map "[a]" \
    -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p -crf 18 -preset slow -r 30 -g 60 -movflags +faststart \
    -c:a aac -b:a 192k -ar 48000 "exports/$id.mp4"
  ffmpeg -nostdin -y -loglevel error -ss 1.6 -i "exports/$id.mp4" -frames:v 1 -q:v 3 "exports/$id-cover.jpg"
  echo "built $id"
done
