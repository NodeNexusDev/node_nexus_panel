---
title: Security
status: stable
translation_key: operations.security
source_revision: 2026-08-17
---

# Security

## HTTPS

Always use HTTPS in production.

## CORS

Configure the API server to allow your panel domain.

## Session Storage

Authentication state is stored in `sessionStorage`, which is cleared when the browser tab is closed. This is more secure than `localStorage` for session data.

## Environment Variables

Login credentials (`VITE_PANEL_LOGIN`, `VITE_PANEL_PASSWORD`) are injected at runtime in Docker, not baked into the JS bundle. See [Environment Variables](./environment.md).

## CSP

Configure Content Security Policy headers for your deployment.
