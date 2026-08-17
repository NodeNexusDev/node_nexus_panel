---
title: Деплой
status: stable
translation_key: operations.deployment
source_revision: 2026-08-17
---

# Деплой

## Сборка

```bash
npm run build
```

## Docker

Скачайте и запустите готовый образ:

```bash
docker pull ghcr.io/nodenexusdev/node_nexus_panel:latest
docker run -d \
  -p 8080:8080 \
  -e VITE_API_URL=https://api.example.com \
  -e VITE_WS_URL=wss://api.example.com \
  -e VITE_PANEL_LOGIN=admin \
  -e VITE_PANEL_PASSWORD=secret \
  ghcr.io/nodenexusdev/node_nexus_panel:latest
```

Или используйте docker-compose:

```yaml
services:
  panel:
    image: ghcr.io/nodenexusdev/node_nexus_panel:latest
    ports:
      - "8080:8080"
    environment:
      - VITE_API_URL=https://api.example.com
      - VITE_WS_URL=wss://api.example.com
      - VITE_PANEL_LOGIN=admin
      - VITE_PANEL_PASSWORD=secret
    restart: unless-stopped
```

Подробности в [Переменные окружения](./environment.md).

## Статический хостинг

Панель — это статическое SPA. Разверните папку `dist/` на любом статическом хосте:

- Nginx
- Apache
- Netlify
- Vercel
- GitHub Pages

## Пример Nginx

```nginx
server {
    listen 80;
    root /var/www/panel;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
