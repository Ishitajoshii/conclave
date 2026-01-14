#!/bin/bash
set -euo pipefail

if [ -z "${AUDIO_TARGET_IP:-}" ] || [ -z "${AUDIO_TARGET_PORT:-}" ]; then
  echo "[Audio] AUDIO_TARGET not set, audio streaming disabled."
  exec tail -f /dev/null
fi

mkdir -p /tmp/pulse
chmod 700 /tmp/pulse
chown -R browser:browser /tmp/pulse 2>/dev/null || true

export XDG_RUNTIME_DIR="/tmp/pulse"
export PULSE_RUNTIME_PATH="/tmp/pulse"
export PULSE_STATE_PATH="/tmp/pulse/state"
export PULSE_SERVER="unix:/tmp/pulse/native"

pulseaudio --kill 2>/dev/null || true
rm -f /tmp/pulse/native 2>/dev/null || true

pulseaudio --daemonize=yes --exit-idle-time=-1 --disallow-exit --log-target=stderr \
  --load="module-native-protocol-unix socket=/tmp/pulse/native auth-anonymous=1" \
  --load="module-null-sink sink_name=browser_sink sink_properties=device.description=BrowserSink" \
  --load="module-always-sink"

for i in {1..30}; do
  if pactl info >/dev/null 2>&1; then
    echo "[Audio] PulseAudio is ready"
    break
  fi
  sleep 0.2
done

pactl set-default-sink browser_sink >/dev/null 2>&1 || true

BITRATE="${AUDIO_BITRATE:-64k}"
PAYLOAD="${AUDIO_PAYLOAD_TYPE:-111}"
SSRC="${AUDIO_SSRC:-11111111}"
RTCP_PORT="${AUDIO_RTCP_PORT:-$((AUDIO_TARGET_PORT + 1))}"

echo "[Audio] Starting stream → ${AUDIO_TARGET_IP}:${AUDIO_TARGET_PORT} (RTCP: ${RTCP_PORT})"

exec ffmpeg -nostdin -hide_banner -loglevel warning \
  -use_wallclock_as_timestamps 1 \
  -f pulse -i browser_sink.monitor \
  -af "aresample=async=1:first_pts=0" \
  -ac 2 -ar 48000 -c:a libopus -b:a "${BITRATE}" -application lowdelay \
  -payload_type "${PAYLOAD}" -ssrc "${SSRC}" \
  -f rtp "rtp://${AUDIO_TARGET_IP}:${AUDIO_TARGET_PORT}?rtcpport=${RTCP_PORT}&pkt_size=1200"
