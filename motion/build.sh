#!/usr/bin/env bash
# Build the Esquirely motion piece end to end.
#   needs: python3 + numpy + scipy, node + playwright (chromium), ffmpeg
set -euo pipefail
cd "$(dirname "$0")"

python3 audio/compose.py                 # 1. the track, 7 bars of F minor at 120 BPM
python3 audio/analyze.py                 # 2. measure its beat grid -> beats.js
node render.mjs beats                    # 3. one frame per beat for review (+ exports cues.json)
python3 audio/mix.py                     # 4. UI sounds on the measured cues -> esquirely-pipeline.wav
node render.mjs full "${WORKERS:-4}"     # 5. 60 fps, 4 subframes blended per frame -> out/video.mkv

# 6. final encode: H.264 for anywhere, AAC audio, moov atom first for the web
ffmpeg -hide_banner -loglevel error -y -i out/video.mkv -i audio/esquirely-pipeline.wav \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -tune animation \
  -c:a aac -b:a 256k -shortest -movflags +faststart esquirely-motion.mp4
echo "-> esquirely-motion.mp4"
