---
title: Authentication
status: stable
translation_key: getting_started.authentication
source_revision: 2026-08-17
---

# Authentication

NodeNexus Panel uses JWT authentication via the Backend API.

## Login

1. Enter your email and password on the login page
2. The panel sends a `POST /auth/login` request to the Backend API
3. On success, the JWT access token is stored in memory, the refresh token in an HttpOnly cookie
4. Authentication state is also saved in `sessionStorage`

## Logout

- `POST /auth/logout` — invalidates the refresh token on the server
- Access token is removed from memory
- `sessionStorage` is cleared

## Tokens

| Type | Storage | Lifetime |
|------|---------|----------|
| Access token | Memory (JS) | Short |
| Refresh token | HttpOnly cookie | Long |

## API Keys

For programmatic access to the Backend API, configure API keys through the panel (Settings → API Keys). API keys are sent via the `X-API-Key` header.
