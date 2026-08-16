---
title: API Integration
status: stable
translation_key: architecture.api_integration
source_revision: 2026-08-16
---

# API Integration

## Overview

The panel communicates with the NodeNexus API via REST and WebSocket.

## API Client

Located in `src/api/`, the client handles:

- Authentication headers
- Error handling
- Request/response interceptors

## WebSocket

Real-time updates for:

- Node status
- Command output
- System events
