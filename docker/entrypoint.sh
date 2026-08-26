#!/bin/sh
set -e

envsubst '${VITE_API_URL}' \
  < /usr/share/nginx/html/index.html \
  > /usr/share/nginx/html/index.html.tmp

mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html

exec nginx -g 'daemon off;'
