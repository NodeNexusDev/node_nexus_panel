---
title: Deployment
status: stable
translation_key: operations.deployment
source_revision: 2026-08-17
---

# Deployment

## Build

```bash
npm run build
```

## Docker

Pull and run the pre-built image:

```bash
docker pull ghcr.io/nodenexusdev/node_nexus_panel:latest
docker run -d \
  -p 8080:8080 \
  -e VITE_API_URL=https://api.example.com \
  ghcr.io/nodenexusdev/node_nexus_panel:latest
```

Or use docker-compose:

```yaml
services:
  panel:
    image: ghcr.io/nodenexusdev/node_nexus_panel:latest
    ports:
      - "8080:8080"
    environment:
      - VITE_API_URL=https://api.example.com
    restart: unless-stopped
```

See [Environment Variables](./environment.md) for all available options.

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
