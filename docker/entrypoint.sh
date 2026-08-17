#!/bin/sh
set -e

envsubst '${VITE_API_URL} ${VITE_WS_URL} ${VITE_API_KEY} ${VITE_PANEL_LOGIN} ${VITE_PANEL_PASSWORD}' \
  < /usr/share/nginx/html/index.html \
  > /usr/share/nginx/html/index.html.tmp

mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html

exec nginx -g 'daemon off;'
