---
title: API Integration
status: stable
translation_key: architecture.api_integration
source_revision: 2026-08-16
---

# API Integration

## Overview

The panel communicates with the NodeNexus API via REST and WebSocket.

## Directory Structure

```
src/api/
├── types.ts        # TypeScript types for all entities
├── client.ts       # HTTP client with JWT auth
├── nodes.ts        # Node endpoints
├── commands.ts     # Command endpoints
├── scripts.ts      # Script endpoints
├── auth.ts         # Authentication endpoints
├── settings.ts     # Settings endpoints
├── dashboard.ts    # Dashboard endpoints
├── websocket.ts    # WebSocket client
└── index.ts        # Re-exports
```

## API Client

The `ApiClient` class in `client.ts` provides:

- Automatic JWT `Authorization` header injection
- Request/response JSON handling
- Error handling with `ApiRequestError` class
- Auto-redirect to `/login` on 401 responses

```typescript
import { api } from './api'

// GET request
const nodes = await api.get<PaginatedResponse<Node>>('/api/nodes')

// POST request
const result = await api.post<ApiResponse<Command>>('/api/commands/execute', {
  command: 'uptime',
  nodeId: 'node-1',
})
```

## TypeScript Types

All API types are defined in `src/api/types.ts`:

- `Node`, `NodeStats` — node entities
- `Command`, `CommandExecuteRequest` — command entities
- `Script`, `ScriptCreateRequest` — script entities
- `User`, `AuthResponse`, `LoginRequest` — auth entities
- `ApiKey`, `NotificationSettings` — settings entities
- `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError` — API wrappers

## Service Modules

| Module | Endpoints |
|--------|-----------|
| `nodesApi` | `getAll`, `getById`, `getStats`, `create`, `remove`, `restart` |
| `commandsApi` | `execute`, `getHistory`, `getById` |
| `scriptsApi` | `getAll`, `getById`, `create`, `update`, `remove`, `run` |
| `authApi` | `login`, `logout`, `me`, `refreshToken` |
| `settingsApi` | `getProfile`, `updateProfile`, `changePassword`, `getApiKeys`, `createApiKey`, `deleteApiKey`, `getNotificationSettings`, `updateNotificationSettings`, `resetAllData` |
| `dashboardApi` | `getStats`, `getRecentActivity`, `getRecentCommands` |

## WebSocket

The `WebSocketClient` class in `websocket.ts` provides:

- Auto-reconnection with exponential backoff
- Heartbeat mechanism
- Event-based subscription model

```typescript
import { wsClient } from './api'

wsClient.connect(token)

wsClient.on('node:status', (payload) => {
  // Handle node status change
})

wsClient.on('command:output', (payload) => {
  // Handle command output stream
})
```

## Environment Variables

```bash
VITE_API_URL=http://localhost:8000    # REST API base URL
VITE_WS_URL=ws://localhost:8000       # WebSocket URL
```
