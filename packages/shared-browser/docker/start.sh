#!/bin/bash
set -e

Xvfb :99 -screen 0 ${RESOLUTION:-1280x720x24} &
sleep 1

chromium-browser \
    --disable-gpu \
    --disable-software-rasterizer \
    --disable-dev-shm-usage \
    --no-first-run \
    --start-maximized \
    --kiosk \
    "${START_URL:-about:blank}" &
sleep 2

x11vnc -display :99 -forever -shared -rfbport 5900 -nopw &
websockify --web=/usr/share/novnc 6080 localhost:5900

wait
