---
title: Configuration
status: stable
translation_key: getting_started.configuration
source_revision: 2026-08-17
---

# Configuration

## Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```bash
VITE_API_URL= # empty = same-origin
VITE_ENABLE_MOCKS=false
```

In Docker, environment variables are injected at runtime via `docker/entrypoint.sh`. See [Environment Variables](../operations/environment.md) for details.

## Vite Configuration

The panel uses Vite for development and building. See `vite.config.ts` for advanced options.
