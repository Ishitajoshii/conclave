#!/bin/bash
set -euo pipefail

if [ -z "${VIDEO_TARGET_IP:-}" ] || [ -z "${VIDEO_TARGET_PORT:-}" ]; then
  echo "[Video] VIDEO_TARGET not set, video streaming disabled."
  exec tail -f /dev/null
fi

DISPLAY="${DISPLAY:-:99}"

# Wait for X server to be ready
for i in {1..50}; do
  if xdpyinfo -display "$DISPLAY" >/dev/null 2>&1; then
    echo "[Video] Xvfb is ready"
    break
  fi
  sleep 0.2
done

DIM="$(xdpyinfo -display "$DISPLAY" 2>/dev/null | awk '/dimensions:/{print $2; exit}')"
if [ -z "$DIM" ]; then
  echo "[Video] ERROR: Could not detect display dimensions"
  exit 1
fi

FPS="${VIDEO_FRAMERATE:-30}"
BITRATE="${VIDEO_BITRATE:-1M}"
PAYLOAD="${VIDEO_PAYLOAD_TYPE:-96}"
SSRC="${VIDEO_SSRC:-22222222}"
RTCP_PORT="${VIDEO_RTCP_PORT:-$((VIDEO_TARGET_PORT + 1))}"

echo "[Video] Capturing ${DIM}@${FPS}fps → ${VIDEO_TARGET_IP}:${VIDEO_TARGET_PORT} (RTCP: ${RTCP_PORT})"

exec ffmpeg -nostdin -hide_banner -loglevel warning \
  -fflags +genpts -use_wallclock_as_timestamps 1 \
  -thread_queue_size 1024 \
  -f x11grab -draw_mouse 1 -video_size "$DIM" -framerate "$FPS" -i "${DISPLAY}.0" \
  -vf format=yuv420p \
  -c:v libvpx -deadline realtime -cpu-used 8 \
  -g "$((FPS * 2))" -keyint_min "$((FPS * 2))" \
  -b:v "${BITRATE}" -maxrate "${BITRATE}" -bufsize 4M \
  -payload_type "${PAYLOAD}" -ssrc "${SSRC}" \
  -f rtp "rtp://${VIDEO_TARGET_IP}:${VIDEO_TARGET_PORT}?rtcpport=${RTCP_PORT}&pkt_size=1200"
