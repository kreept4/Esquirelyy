#!/usr/bin/env bash
# Build the Esquirely motion piece end to end.
#   needs: python3 + numpy + scipy, node + playwright (chromium), ffmpeg
#
#   esquirely-motion.mp4       17 s: the piece once, then its ending (post this one)
#   esquirely-motion-loop.mp4  14 s: the seamless loop (for anywhere that repeats it)
set -euo pipefail
cd "$(dirname "$0")"
OUTRO=3

python3 audio/compose.py                 # 1. the track, 7 bars of F minor at 120 BPM
python3 audio/analyze.py                 # 2. measure its beat grid -> beats.js
node render.mjs beats                    # 3. one frame per beat for review (+ exports cues.json, cues-outro.json)
python3 audio/mix.py                     # 4. UI sounds on the measured cues -> esquirely-pipeline.wav
python3 audio/mix.py --outro "$OUTRO"    #    …and the version that ends -> esquirely-pipeline-full.wav
node render.mjs full "${WORKERS:-4}"            # 5. 60 fps, 12 subframes (180° shutter) per frame -> out/video.mkv
node render.mjs full "${WORKERS:-4}" "$OUTRO"   #    the loop once, then the ending -> out/video-full.mkv

# 6. final encodes: H.264 for anywhere, AAC audio, moov atom first for the web
enc() { ffmpeg -hide_banner -loglevel error -y -i "$1" -i "$2" \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -tune animation \
  -c:a aac -b:a 256k -shortest -movflags +faststart "$3"; }
enc out/video-full.mkv audio/esquirely-pipeline-full.wav esquirely-motion.mp4
enc out/video.mkv      audio/esquirely-pipeline.wav      esquirely-motion-loop.mp4
echo "-> esquirely-motion.mp4, esquirely-motion-loop.mp4"
