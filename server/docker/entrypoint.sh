#!/bin/sh
set -e

Xvfb :99 -screen 0 1920x1080x24 &

# Wait for Xvfb display socket to be created
while [ ! -e /tmp/.X11-unix/X99 ]; do
  sleep 0.1
done

x11vnc -display :99 -forever -shared -nopw -rfbport 5900 -listen 127.0.0.1 &
websockify --web=/usr/share/novnc 127.0.0.1:6080 127.0.0.1:5900 &

npx prisma migrate deploy

exec node dist/index.js
