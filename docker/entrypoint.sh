#!/bin/sh
set -e

# Escape VITE_API_URL for safe JSON string injection (prevent XSS)
ESCAPED_URL=$(printf '%s' "${VITE_API_URL:-}" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/</\\u003c/g' -e 's/>/\\u003e/g' -e 's/&/\\u0026/g')

# Replace placeholder __VITE_API_URL__ and legacy ${VITE_API_URL}
if [ -f /usr/share/nginx/html/index.html ]; then
  sed -i "s|__VITE_API_URL__|${ESCAPED_URL}|g" /usr/share/nginx/html/index.html
  # legacy fallback
  sed -i "s|\${VITE_API_URL}|${ESCAPED_URL}|g" /usr/share/nginx/html/index.html
fi

exec nginx -g 'daemon off;'
