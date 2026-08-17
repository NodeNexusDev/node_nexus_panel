---
title: Authentication
status: stable
translation_key: getting_started.authentication
source_revision: 2026-08-17
---

# Authentication

NodeNexus Panel uses environment-based authentication. Login credentials are configured via environment variables.

## Login

1. Enter your credentials on the login page
2. The panel validates against `VITE_PANEL_LOGIN` and `VITE_PANEL_PASSWORD`
3. On success, authentication state is stored in `sessionStorage`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_PANEL_LOGIN` | Panel login credential | `admin` |
| `VITE_PANEL_PASSWORD` | Panel password credential | `password` |

See [Environment Variables](../operations/environment.md) for Docker and local configuration.

## API Keys

For programmatic access to the backend API, configure `VITE_API_KEY` to send an `X-API-Key` header with requests.
