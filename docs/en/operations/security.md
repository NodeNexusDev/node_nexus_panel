---
title: Security
status: stable
translation_key: operations.security
source_revision: 2026-08-16
---

# Security

## HTTPS

Always use HTTPS in production.

## CORS

Configure the API server to allow your panel domain.

## Token Storage

JWT tokens are stored in `localStorage`. For sensitive environments, consider additional encryption.

## CSP

Configure Content Security Policy headers for your deployment.
