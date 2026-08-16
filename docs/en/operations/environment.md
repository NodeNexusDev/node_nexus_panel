---
title: Environment Variables
status: stable
translation_key: operations.environment
source_revision: 2026-08-16
---

# Environment Variables

## Runtime Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:8000` |

## Build-time Variables

Variables must be prefixed with `VITE_` to be exposed to the client bundle.
