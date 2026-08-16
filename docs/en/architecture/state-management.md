---
title: State Management
status: stable
translation_key: architecture.state_management
source_revision: 2026-08-16
---

# State Management

## Approach

The panel uses a layered state management approach:

- **Server state:** TanStack Query (React Query) for data fetching and caching
- **Client state:** Zustand for UI state and authentication
- **Local state:** `useState` for component-specific state

## TanStack Query

Used for all server-side data. Provides automatic caching, refetching, and error handling.

### QueryClient Configuration

Located in `src/lib/query-client.ts`:

```typescript
import { queryClient } from './lib/query-client'

// Default staleTime: 30 seconds
// Auto-retry on failure (except 404)
// Auto-redirect to /login on 401
```

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useNodes` | Fetch node list with pagination |
| `useNode` | Fetch single node by ID |
| `useNodeStats` | Fetch dashboard statistics |
| `useCreateNode` | Mutation to add a node |
| `useDeleteNode` | Mutation to remove a node |
| `useRestartNode` | Mutation to restart a node |
| `useCommandHistory` | Fetch command history |
| `useExecuteCommand` | Mutation to execute a command |
| `useScripts` | Fetch script list |
| `useCreateScript` | Mutation to create a script |
| `useUpdateScript` | Mutation to update a script |
| `useDeleteScript` | Mutation to delete a script |
| `useRunScript` | Mutation to run a script |
| `useLogin` | Mutation for login |
| `useCurrentUser` | Fetch current user |
| `useLogout` | Mutation for logout |
| `useProfile` | Fetch user profile |
| `useUpdateProfile` | Mutation to update profile |
| `useApiKeys` | Fetch API keys |
| `useNotificationSettings` | Fetch notification settings |

### Usage Pattern

```typescript
import { useNodes, useDeleteNode } from './hooks/useNodes'

function NodeList() {
  const { data, isLoading, error } = useNodes()
  const deleteNode = useDeleteNode()

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <ul>
      {data.data.map(node => (
        <li key={node.id}>
          {node.name}
          <button onClick={() => deleteNode.mutate(node.id)}>Delete</button>
        </li>
      ))}
    </ul>
  )
}
```

## Zustand Stores

### Auth Store (`src/stores/auth-store.ts`)

```typescript
import { useAuthStore } from './stores/auth-store'

const { token, user, isAuthenticated, setAuth, logout } = useAuthStore()
```

- Persisted to localStorage
- Contains JWT token and user info
- Auto-syncs with API client

### UI Store (`src/stores/ui-store.ts`)

```typescript
import { useUiStore } from './stores/ui-store'

const { theme, sidebarOpen, setTheme, toggleSidebar } = useUiStore()
```

- Theme persistence (dark/light/system)
- Sidebar state
- Active modal tracking

### Connection Store (`src/stores/connection-store.ts`)

```typescript
import { useConnectionStore } from './stores/connection-store'

const { wsConnected, setWsConnected } = useConnectionStore()
```

- WebSocket connection status

## Patterns

- Server state always goes through React Query hooks
- UI state (theme, sidebar, modals) goes through Zustand
- Auth state is shared between Zustand (storage) and React Query (validation)
- Never store server data in Zustand — use React Query's cache
