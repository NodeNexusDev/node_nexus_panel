---
title: Управление состоянием
status: stable
translation_key: architecture.state_management
source_revision: 2026-08-16
---

# Управление состоянием

## Подход

Панель использует слоистый подход к управлению состоянием:

- **Серверное состояние:** TanStack Query (React Query) для получения и кэширования данных
- **Клиентское состояние:** Zustand для UI-состояния и аутентификации
- **Локальное состояние:** `useState` для состояния отдельных компонентов

## TanStack Query

Используется для всех серверных данных. Обеспавливает автоматическое кэширование, обновление и обработку ошибок.

### Конфигурация QueryClient

Расположена в `src/lib/query-client.ts`:

```typescript
import { queryClient } from './lib/query-client'

// По умолчанию staleTime: 30 секунд
// Автоповтор при ошибке (кроме 404)
// Авторедирект на /login при 401
```

### Пользовательские хуки

| Хук | Назначение |
|-----|-----------|
| `useNodes` | Получение списка нод с пагинацией |
| `useNode` | Получение ноды по ID |
| `useNodeStats` | Получение статистики дашборда |
| `useCreateNode` | Мутация для добавления ноды |
| `useDeleteNode` | Мутация для удаления ноды |
| `useRestartNode` | Мутация для перезапуска ноды |
| `useCommandHistory` | Получение истории команд |
| `useExecuteCommand` | Мутация для выполнения команды |
| `useScripts` | Получение списка скриптов |
| `useCreateScript` | Мутация для создания скрипта |
| `useUpdateScript` | Мутация для обновления скрипта |
| `useDeleteScript` | Мутация для удаления скрипта |
| `useRunScript` | Мутация для запуска скрипта |
| `useLogin` | Мутация для входа |
| `useCurrentUser` | Получение текущего пользователя |
| `useLogout` | Мутация для выхода |
| `useProfile` | Получение профиля |
| `useUpdateProfile` | Мутация для обновления профиля |
| `useApiKeys` | Получение API-ключей |
| `useNotificationSettings` | Получение настроек уведомлений |

### Паттерн использования

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
          <button onClick={() => deleteNode.mutate(node.id)}>Удалить</button>
        </li>
      ))}
    </ul>
  )
}
```

## Zustand хранилища

### Auth Store (`src/stores/auth-store.ts`)

```typescript
import { useAuthStore } from './stores/auth-store'

const { token, user, isAuthenticated, setAuth, logout } = useAuthStore()
```

- Персистентность в localStorage
- Содержит JWT-токен и информацию о пользователе
- Синхронизация с API-клиентом

### UI Store (`src/stores/ui-store.ts`)

```typescript
import { useUiStore } from './stores/ui-store'

const { theme, sidebarOpen, setTheme, toggleSidebar } = useUiStore()
```

- Персистентность темы (dark/light/system)
- Состояние sidebar
- Отслеживание активной модалки

### Connection Store (`src/stores/connection-store.ts`)

```typescript
import { useConnectionStore } from './stores/connection-store'

const { wsConnected, setWsConnected } = useConnectionStore()
```

- Статус WebSocket подключения

## Паттерны

- Серверное состояние всегда через хуки React Query
- UI-состояние (тема, sidebar, модалки) через Zustand
- Состояние аутентификации общается между Zustand (хранилище) и React Query (валидация)
- Никогда не храните серверные данные в Zustand — используйте кэш React Query
