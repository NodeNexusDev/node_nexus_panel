---
title: Управление состоянием
status: stable
translation_key: architecture.state_management
source_revision: 2026-08-20
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

| Файл хука | Назначение |
|-----------|------------|
| `useNodes` | CRUD нод, массовые операции, теги, метрики, проверки здоровья |
| `useCommands` | CRUD команд, выполнение, клонирование, статистика |
| `useScripts` | CRUD скриптов, выполнение, планирование, статистика |
| `useDashboard` | Статистика дашборда и активность |
| `useSettings` | Профиль пользователя, API-ключи, уведомления |
| `useDocker` | Docker-контейнеры, образы, сети, тома + Compose |
| `useCompose` | Стеки Compose per-node (бесконечная прокрутка) |
| `useTemplates` | Паки/реестры/шаблоны |
| `useDockerContainerSse` | Статус контейнеров в реальном времени через SSE |
| `useSse` | Универсальный хук SSE-потока событий |
| `useAudit` | Записи журнала аудита (курсорная пагинация) |
| `useFavorites` | Управление избранным (курсорная пагинация) |
| `useSearch` | Глобальный поиск |
| `useSort` | Переиспользуемая логика сортировки |
| `useHotkey` | Обработчик клавиатурных сокращений |
| `useDocumentTitle` | Динамические заголовки страниц |

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

## Паттерны

- Серверное состояние всегда через хуки React Query
- UI-состояние (тема, sidebar, модалки) через Zustand
- Состояние аутентификации общается между Zustand (хранилище) и React Query (валидация)
- Никогда не храните серверные данные в Zustand — используйте кэш React Query
