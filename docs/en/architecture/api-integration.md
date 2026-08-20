---
title: API Integration
status: stable
translation_key: architecture.api_integration
source_revision: 2026-08-20
---

# API Integration

## Overview

The panel communicates with the NodeNexus API via REST and Server-Sent Events (SSE).

## Directory Structure

```
src/api/
├── types.ts        # TypeScript types for all entities
├── client.ts       # HTTP client with JWT auth
├── nodes.ts        # Node CRUD, bulk ops, tags, validation
├── commands.ts     # Command CRUD, execution, cloning, tags
├── scripts.ts      # Script CRUD, execution, scheduling, tags
├── settings.ts     # User profile, API keys, notifications
├── dashboard.ts    # Dashboard statistics and activity
├── docker.ts       # Docker containers, images, networks, volumes
├── audit.ts        # Audit log entries
├── notes.ts        # Entity notes (CRUD)
├── tags.ts         # Tag rename, delete
├── favorites.ts    # Favorites management
├── search.ts       # Global search
├── config.ts       # Runtime config
├── events.ts       # SSE event stream
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
const nodes = await api.get<PaginatedResponse<Node>>('/nodes')

// POST request
const result = await api.post<Node>('/nodes/', {
  name: 'server-01',
  host: '192.168.1.10',
  connection_type: 'ssh',
})
```

## TypeScript Types

All API types are defined in `src/api/types.ts`:

- `Node`, `NodeCreate`, `NodeUpdate`, `NodeMetrics` — node entities
- `Command`, `CommandCreate`, `CommandUpdate`, `CommandExecuteRequest`, `CommandResult` — command entities
- `Script`, `ScriptCreate`, `ScriptUpdate`, `ScriptExecuteRequest`, `ScriptExecutionBatchResult` — script entities
- `ScheduledJob`, `ScheduleRequest`, `ScheduleResponse` — scheduling
- `User`, `AuthResponse`, `LoginRequest` — auth entities
- `ApiKey`, `ApiKeyCreate`, `NotificationSettings` — settings entities
- `DockerContainer`, `DockerImage`, `DockerNetwork`, `DockerVolume` — Docker entities
- `AuditEntry`, `Note`, `Tag` — misc entities
- `PaginatedResponse<T>`, `ApiRequestError` — API wrappers

## Service Modules

### Nodes

| Method | Description |
|--------|-------------|
| `getAll` | List nodes with pagination, status/tags/search filters |
| `getById` | Get single node |
| `create` / `update` / `remove` | CRUD operations |
| `check` | Trigger health check |
| `getMetrics` | Get CPU/memory/disk metrics |
| `getHistory` | Command execution history |
| `execute` | Run ad-hoc command |
| `getTags` / `addTag` / `removeTag` | Per-node tag management |
| `bulkDelete` / `bulkCheck` / `bulkExecute` | Bulk operations |
| `bulkTagsAdd` / `bulkTagsRemove` | Bulk tag operations |
| `getStats` | Execution statistics |
| `getStatusHistory` | Status change history |
| `retryCommand` | Retry failed execution |
| `validateCredentials` | Pre-validate SSH/Docker credentials |
| `getBulkHistory` | Bulk execution history |

### Commands

| Method | Description |
|--------|-------------|
| `getAll` | List commands with pagination, tag/search filters |
| `getById` | Get single command |
| `create` / `update` / `remove` | CRUD operations |
| `execute` | Run command on node(s) |
| `clone` | Duplicate a command |
| `getStats` | Execution statistics |
| `getTags` | List all command tags |

### Scripts

| Method | Description |
|--------|-------------|
| `getAll` | List scripts with pagination, tag/search filters |
| `getById` | Get single script |
| `create` / `update` / `remove` | CRUD operations |
| `execute` | Run script on node(s) |
| `clone` | Duplicate a script |
| `getStats` | Execution statistics |
| `getTags` | List all script tags |
| `getSchedule` / `setSchedule` / `removeSchedule` | Cron scheduling |
| `getExecutions` | Execution history |
| `getScheduleHistory` | Scheduled run history |
| `cancelExecution` / `retryExecution` | Execution control |

### Docker

| Method | Description |
|--------|-------------|
| `getContainers` | List containers with filters |
| `startContainer` / `stopContainer` / `removeContainer` | Container lifecycle |
| `inspectContainer` | Container details |
| `execInContainer` | Execute command in container |
| `getImages` / `pullImage` / `removeImage` | Image management |
| `getNetworks` / `removeNetwork` | Network management |
| `getVolumes` / `removeVolume` | Volume management |

### Settings

| Method | Description |
|--------|-------------|
| `getProfile` / `updateProfile` / `changePassword` | User profile |
| `getApiKeys` / `createApiKey` / `deleteApiKey` | API key management |
| `getNotificationSettings` / `updateNotificationSettings` | Notifications |
| `resetAllData` | Factory reset |

### Dashboard

| Method | Description |
|--------|-------------|
| `getStats` | Dashboard statistics (nodes, commands, scripts, docker) |
| `getRecentActivity` | Recent activity feed |
| `getRecentCommands` | Recently executed commands |

### Other Modules

| Module | Description |
|--------|-------------|
| `auditApi` | Audit log entries |
| `notesApi` | Per-entity notes CRUD |
| `tagsApi` | Global tag rename/delete |
| `favoritesApi` | Favorites management |
| `searchApi` | Global search across entities |
| `configApi` | Runtime configuration |
| `eventsApi` | SSE event stream |

## Server-Sent Events (SSE)

The panel uses SSE for real-time updates via `src/api/events.ts` and the `useSse` hook:

```typescript
import { useSse } from './hooks/useSse'

// Auto-reconnects and parses events
useSse('/events', (event) => {
  if (event.type === 'node:status') {
    // Handle node status change
  }
})
```

## Environment Variables

```bash
VITE_API_URL=http://localhost:8000    # REST API base URL
VITE_WS_URL=ws://localhost:8000       # WebSocket URL (for future use)
```
