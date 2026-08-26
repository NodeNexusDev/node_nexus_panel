---
title: Environment Variables
status: stable
translation_key: operations.environment
source_revision: 2026-08-17
---

# Environment Variables

## Runtime Variables

These variables are injected at runtime via `docker/entrypoint.sh` (Docker) or `window.__ENV__` (browser).

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

## How It Works

In Docker, the entrypoint script runs `envsubst` to replace `${VITE_*}` placeholders in `index.html` with the actual environment variable values at container startup.

In local development (`npm run dev`), Vite reads `.env` files directly.

## Docker Usage

Set variables via `docker-compose.yml` or `docker run`:

```yaml
services:
  panel:
    image: ghcr.io/nodenexusdev/node_nexus_panel:latest
    environment:
      - VITE_API_URL=https://api.example.com
```

## Local Development

Create a `.env` file in the project root:

```bash
VITE_API_URL=http://localhost:8000
```
