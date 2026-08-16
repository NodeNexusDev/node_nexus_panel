---
title: Deployment
status: stable
translation_key: operations.deployment
source_revision: 2026-08-16
---

# Deployment

## Build

```bash
npm run build
```

## Static Hosting

The panel is a static SPA. Deploy the `dist/` folder to any static host:

- Nginx
- Apache
- Netlify
- Vercel
- GitHub Pages

## Nginx Example

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
