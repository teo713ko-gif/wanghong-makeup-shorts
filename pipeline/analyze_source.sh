#!/usr/bin/env bash
# 원본 분석: 음성 유무 · 검정 구간 · 실제 화면 영역 · 장면 전환 · 장면 모음 이미지
# 사용: bash pipeline/analyze_source.sh work/원본/왕홍메이크업_1차.mp4 work/분석
set -euo pipefail
SRC="$1"; OUT="${2:-work/분석}"; mkdir -p "$OUT/frames"
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of compact "$SRC" | tee "$OUT/probe.txt"
# 1) 음성: -91dB면 무음(이 원본은 무음 → 자막이 유일한 내레이션)
ffmpeg -hide_banner -i "$SRC" -vn -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume" | tee "$OUT/volume.txt"
# 2) 분석용 저해상도 프록시(빠름)
ffmpeg -v error -y -i "$SRC" -an -vf "scale=540:960,fps=30" -c:v h264_videotoolbox -b:v 3M "$OUT/proxy540.mp4" || \
ffmpeg -v error -y -i "$SRC" -an -vf "scale=540:960,fps=30" -c:v libx264 -crf 28 "$OUT/proxy540.mp4"
# 3) 검정 구간(이 원본은 461초 이후 끝까지 검정)
ffmpeg -hide_banner -i "$OUT/proxy540.mp4" -vf "blackdetect=d=0.5:pix_th=0.08" -f null - 2>&1 | grep black_start | tee "$OUT/black.txt"
# 4) 실제 화면 영역(세로 캔버스 안 정사각에 가까운 영역: 540:548:0:206 → 4K 기준 2160:2192:0:824)
ffmpeg -hide_banner -t 461 -i "$OUT/proxy540.mp4" -vf "cropdetect=24:2:0" -f null - 2>&1 | grep -o "crop=[0-9:]*" | sort | uniq -c | sort -rn | head -3 | tee "$OUT/crop.txt"
# 5) 장면 전환 시각(컷 경계 = 카메라 클립 경계)
ffmpeg -hide_banner -t 461 -i "$OUT/proxy540.mp4" -vf "crop=540:548:0:206,select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep -o "pts_time:[0-9.]*" | cut -d: -f2 > "$OUT/scenes.txt"
# 6) 5초 간격 장면 모음(어떤 장면이 어디 있는지 한눈에)
ffmpeg -v error -y -t 461 -i "$OUT/proxy540.mp4" -vf "crop=540:548:0:206,fps=1/5,scale=160:162" "$OUT/frames/g_%03d.jpg"
ffmpeg -v error -y -pattern_type glob -i "$OUT/frames/g_*.jpg" -vf "tile=12x8" -frames:v 1 "$OUT/sheet5s.jpg"
echo "완료: $OUT"
