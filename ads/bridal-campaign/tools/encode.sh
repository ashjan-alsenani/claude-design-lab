#!/usr/bin/env bash
# Encodes rendered frames + music into the final reels (1080x1920, 30 fps, H.264 High, AAC 48 kHz).
# usage: FRAMES=/path/to/frames tools/encode.sh            (run from the campaign root)
set -euo pipefail
cd "$(dirname "$0")/.."
FR="${FRAMES:?set FRAMES to the rendered frames directory}"
mkdir -p exports/reels exports/reels-alternates exports/thumbnails/previews
python3 - <<'PY' > /tmp/bridal-encode-jobs.txt
import sys; sys.path.insert(0, "tools")
from ads import ADS
for a in ADS:
    print(a["id"], a["slug"], a["dur"], round(a["splice"] * 30) if a.get("splice") else 0)
PY
enc() { # frames_dir/pattern music out dur
  ffmpeg -nostdin -y -loglevel error -framerate 30 -i "$1" -i "$2" \
    -filter_complex "[1:a]loudnorm=I=-18:TP=-1.5:LRA=9,aresample=48000,apad,atrim=0:$4[a]" -map 0:v -map "[a]" \
    -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p -crf 18 -preset slow -r 30 -g 60 \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 -movflags +faststart -c:a aac -b:a 192k -ar 48000 "$3"
}
while read -r id slug dur splice; do
  if [ -n "${ONLY:-}" ] && [[ " $ONLY " != *" $id "* ]]; then continue; fi
  n="$id-$slug"
  enc "$FR/$id-A/f%04d.jpg" "audio/music/$n.wav" "exports/reels/$n.mp4" "$dur"
  if [ "$splice" != "0" ] && [ -d "$FR/$id-B" ]; then
    J="$FR/$id-Bfull"; mkdir -p "$J"
    total=$(ls "$FR/$id-A" | wc -l)
    for ((f=0; f<total; f++)); do
      src="$FR/$id-A/f$(printf %04d $f).jpg"; [ $f -lt "$splice" ] && src="$FR/$id-B/f$(printf %04d $f).jpg"
      ln -sf "$src" "$J/f$(printf %04d $f).jpg"
    done
    enc "$J/f%04d.jpg" "audio/music/$n.wav" "exports/reels-alternates/$n-hook-b.mp4" "$dur"
  fi
  echo "encoded $n"
done < /tmp/bridal-encode-jobs.txt
