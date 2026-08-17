---
title: Configuration
status: stable
translation_key: getting_started.configuration
source_revision: 2026-08-17
---

# Configuration

## Environment Variables

Create a `.env` file in the project root:

```bash
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_API_KEY=
VITE_PANEL_LOGIN=admin
VITE_PANEL_PASSWORD=password
```

In Docker, environment variables are injected at runtime via `docker/entrypoint.sh`. See [Environment Variables](../operations/environment.md) for details.

## Vite Configuration

The panel uses Vite for development and building. See `vite.config.ts` for advanced options.
