---
title: State Management
status: stable
translation_key: architecture.state_management
source_revision: 2026-08-20
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

| Hook File | Purpose |
|-----------|---------|
| `useNodes` | Node CRUD, bulk operations, tags, metrics, health checks |
| `useCommands` | Command CRUD, execution, cloning, statistics |
| `useScripts` | Script CRUD, execution, scheduling, statistics |
| `useDashboard` | Dashboard statistics and activity |
| `useSettings` | User profile, API keys, notifications |
| `useDocker` | Docker containers, images, networks, volumes + Compose |
| `useCompose` | Compose per-node stacks (infinite scroll) |
| `useTemplates` | Packs/registries/templates |
| `useDockerContainerSse` | Real-time container status via SSE |
| `useSse` | Generic SSE event stream hook |
| `useAudit` | Audit log entries (cursor pagination) |
| `useFavorites` | Favorites management (cursor pagination) |
| `useSearch` | Global search |
| `useSort` | Reusable sorting logic |
| `useHotkey` | Keyboard shortcut handler |
| `useDocumentTitle` | Dynamic page titles |

### Usage Pattern

```typescript
import { useNodes, useDeleteNode } from './hooks/useNodes'

function NodeList() {
  const { data, isLoading, error } = useNodes()
  const deleteNode = useDeleteNode()

  if (isLoading) return <TableSkeleton rows={5} cols={3} />
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

## Patterns

- Server state always goes through React Query hooks
- UI state (theme, sidebar, modals) goes through Zustand
- Auth state is shared between Zustand (storage) and React Query (validation)
- Never store server data in Zustand — use React Query's cache
