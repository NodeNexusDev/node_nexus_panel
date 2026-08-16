---
title: Деплой
status: stable
translation_key: operations.deployment
source_revision: 2026-08-16
---

# Деплой

## Сборка

```bash
npm run build
```

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
