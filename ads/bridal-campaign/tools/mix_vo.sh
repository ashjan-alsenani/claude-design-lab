#!/usr/bin/env bash
# Lays a recorded Saudi VO onto a finished reel with automatic ducking.
# The VO must start at 0:00 and follow audio/voice/<ad>.timing-guide.wav (same timings as the burned captions).
#   tools/mix_vo.sh 01-forgetting path/to/01-forgetting.wav            -> exports/reels-with-vo/01-forgetting.mp4
#   tools/mix_vo.sh 01-forgetting path/to/vo.wav hook-b                 -> uses the hook-B alternate
# Levels: VO normalised to -16 LUFS, music bed to -30 LUFS (≈14 dB under the voice, inside the 12–16 dB brief),
# plus a sidechain compressor that dips the music a further ~3 dB while she speaks; gentle music fades are in the bed.
set -euo pipefail
cd "$(dirname "$0")/.."
AD="$1"; VO="$2"; VAR="${3:-}"
SRC="exports/reels/$AD.mp4"; OUT="exports/reels-with-vo/$AD.mp4"
if [ "$VAR" = "hook-b" ]; then SRC="exports/reels-alternates/$AD-hook-b.mp4"; OUT="exports/reels-with-vo/$AD-hook-b.mp4"; fi
mkdir -p exports/reels-with-vo
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC")
ffmpeg -nostdin -y -loglevel error -i "$SRC" -i "$VO" -i "audio/music/$AD.wav" -filter_complex "\
[1:a]aformat=channel_layouts=stereo,highpass=f=80,loudnorm=I=-16:TP=-2:LRA=7,aresample=48000,apad,asplit=2[vo][sc];\
[2:a]loudnorm=I=-30:TP=-6:LRA=7,aresample=48000,apad[m];\
[m][sc]sidechaincompress=threshold=0.03:ratio=4:attack=20:release=400:makeup=1[duck];\
[vo][duck]amix=inputs=2:duration=longest:normalize=0,atrim=0:$DUR,alimiter=limit=0.89[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT"
echo "wrote $OUT"
