---
title: Интеграция с API
status: stable
translation_key: architecture.api_integration
source_revision: 2026-08-16
---

# Интеграция с API

## Обзор

Панель общается с NodeNexus API через REST и WebSocket.

## Структура каталогов

```
src/api/
├── types.ts        # TypeScript типы для всех сущностей
├── client.ts       # HTTP-клиент с JWT-авторизацией
├── nodes.ts        # Эндпоинты нод
├── commands.ts     # Эндпоинты команд
├── scripts.ts      # Эндпоинты скриптов
├── auth.ts         # Эндпоинты аутентификации
├── settings.ts     # Эндпоинты настроек
├── dashboard.ts    # Эндпоинты дашборда
├── websocket.ts    # WebSocket клиент
└── index.ts        # Реэкспорт
```

## API-клиент

Класс `ApiClient` в `client.ts` обеспечивает:

- Автоматическую подстановку JWT `Authorization` заголовка
- Обработку JSON запросов/ответов
- Обработку ошибок через класс `ApiRequestError`
- Автоматический редирект на `/login` при 401

```typescript
import { api } from './api'

// GET запрос
const nodes = await api.get<PaginatedResponse<Node>>('/api/nodes')

// POST запрос
const result = await api.post<ApiResponse<Command>>('/api/commands/execute', {
  command: 'uptime',
  nodeId: 'node-1',
})
```

## TypeScript типы

Все типы API определены в `src/api/types.ts`:

- `Node`, `NodeStats` — сущности нод
- `Command`, `CommandExecuteRequest` — сущности команд
- `Script`, `ScriptCreateRequest` — сущности скриптов
- `User`, `AuthResponse`, `LoginRequest` — сущности аутентификации
- `ApiKey`, `NotificationSettings` — сущности настроек
- `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError` — обёртки API

## Сервисные модули

| Модуль | Эндпоинты |
|--------|-----------|
| `nodesApi` | `getAll`, `getById`, `getStats`, `create`, `remove`, `restart` |
| `commandsApi` | `execute`, `getHistory`, `getById` |
| `scriptsApi` | `getAll`, `getById`, `create`, `update`, `remove`, `run` |
| `authApi` | `login`, `logout`, `me`, `refreshToken` |
| `settingsApi` | `getProfile`, `updateProfile`, `changePassword`, `getApiKeys`, `createApiKey`, `deleteApiKey`, `getNotificationSettings`, `updateNotificationSettings`, `resetAllData` |
| `dashboardApi` | `getStats`, `getRecentActivity`, `getRecentCommands` |

## WebSocket

Класс `WebSocketClient` в `websocket.ts` обеспечивает:

- Автоматическое переподключение с экспоненциальной задержкой
- Механизм heartbeat
- Подписку на события

```typescript
import { wsClient } from './api'

wsClient.connect(token)

wsClient.on('node:status', (payload) => {
  // Обработка изменения статуса ноды
})

wsClient.on('command:output', (payload) => {
  // Обработка вывода команды
})
```

## Переменные окружения

```bash
VITE_API_URL=http://localhost:8000    # Базовый URL REST API
VITE_WS_URL=ws://localhost:8000       # URL WebSocket
```
