---
title: Интеграция с API
status: stable
translation_key: architecture.api_integration
source_revision: 2026-08-20
---

# Интеграция с API

## Обзор

Панель общается с NodeNexus API через REST и Server-Sent Events (SSE).

## Структура каталогов

```
src/api/
├── types.ts        # TypeScript-типы для всех сущностей
├── client.ts       # HTTP-клиент с JWT-авторизацией
├── nodes.ts        # CRUD нод, массовые операции, теги, валидация
├── commands.ts     # CRUD команд, выполнение, клонирование, теги
├── scripts.ts      # CRUD скриптов, выполнение, планирование, теги
├── settings.ts     # Профиль пользователя, API-ключи, уведомления
├── dashboard.ts    # Статистика дашборда и активность
├── docker.ts       # Docker-контейнеры, образы, сети, тома
├── compose.ts      # Стеки Compose (per-node)
├── templates.ts    # Паки/реестры/шаблоны
├── audit.ts        # Записи журнала аудита
├── favorites.ts    # Управление избранным
├── search.ts       # Глобальный поиск
├── config.ts       # Runtime-конфигурация
├── events.ts       # SSE-поток событий
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

// GET-запрос (курсорная пагинация)
const nodes = await api.get<CursorPage<NodeResponse>>('/nodes?limit=20')

// POST-запрос
const result = await api.post<NodeResponse>('/nodes/', {
  name: 'server-01',
  host: '192.168.1.10',
  connection_type: 'ssh',
})
```

## TypeScript-типы

Все типы API определены в `src/api/types.ts`:

- `Node`, `NodeCreate`, `NodeUpdate`, `NodeMetrics` — сущности нод
- `Command`, `CommandCreate`, `CommandUpdate`, `CommandExecuteRequest`, `CommandResult` — сущности команд
- `Script`, `ScriptCreate`, `ScriptUpdate`, `ScriptExecuteRequest`, `ScriptExecutionBatchResult` — сущности скриптов
- `ScheduledJob`, `ScheduleRequest`, `ScheduleResponse` — планирование
- `User`, `AuthResponse`, `LoginRequest` — сущности аутентификации
- `ApiKey`, `ApiKeyCreate`, `NotificationSettings` — сущности настроек
 - `DockerContainer`, `DockerImage`, `DockerNetwork`, `DockerVolume` — Docker-сущности
 - `AuditEntry`, `Tag` — прочие сущности
 - `CursorPage<T>`, `ApiRequestError` — обёртки API

## Сервисные модули

### Ноды

| Метод | Описание |
|-------|----------|
| `getAll` | Список нод с пагинацией, фильтрами по статусу/тегам/поиску |
| `getById` | Получение одной ноды |
| `create` / `update` / `remove` | Операции CRUD |
| `check` | Запуск проверки здоровья |
| `getMetrics` | Получение метрик CPU/памяти/диска |
| `getHistory` | История выполнения команд |
| `execute` | Запуск ad-hoc команды |
| `getTags` / `addTag` / `removeTag` | Управление тегами ноды |
| `bulkDelete` / `bulkCheck` / `bulkExecute` | Массовые операции |
| `bulkTagsAdd` / `bulkTagsRemove` | Массовые операции с тегами |
| `getStats` | Статистика выполнения |
| `getStatusHistory` | История изменения статуса |
| `retryCommand` | Повтор неудачного выполнения |
| `validateCredentials` | Предварительная проверка SSH/Docker-учётных данных |
| `getBulkHistory` | Массовая история выполнения |

### Команды

| Метод | Описание |
|-------|----------|
| `getAll` | Список команд с пагинацией, фильтрами по тегам/поиску |
| `getById` | Получение одной команды |
| `create` / `update` / `remove` | Операции CRUD |
| `execute` | Запуск команды на нодах |
| `clone` | Дублирование команды |
| `getStats` | Статистика выполнения |
| `getTags` | Список всех тегов команд |

### Скрипты

| Метод | Описание |
|-------|----------|
| `getAll` | Список скриптов с пагинацией, фильтрами по тегам/поиску |
| `getById` | Получение одного скрипта |
| `create` / `update` / `remove` | Операции CRUD |
| `execute` | Запуск скрипта на нодах |
| `clone` | Дублирование скрипта |
| `getStats` | Статистика выполнения |
| `getTags` | Список всех тегов скриптов |
| `getSchedule` / `setSchedule` / `removeSchedule` | Планирование по cron |
| `getExecutions` | История выполнений |
| `getScheduleHistory` | История запланированных запусков |
| `cancelExecution` / `retryExecution` | Управление выполнением |

### Docker

| Метод | Описание |
|-------|----------|
| `getContainers` | Список контейнеров с фильтрами |
| `startContainer` / `stopContainer` / `removeContainer` | Жизненный цикл контейнера |
| `inspectContainer` | Детали контейнера |
| `execInContainer` | Выполнение команды в контейнере |
| `getImages` / `pullImage` / `removeImage` | Управление образами |
| `getNetworks` / `removeNetwork` | Управление сетями |
| `getVolumes` / `removeVolume` | Управление томами |

### Настройки

| Метод | Описание |
|-------|----------|
| `getProfile` / `updateProfile` / `changePassword` | Профиль пользователя |
| `getApiKeys` / `createApiKey` / `deleteApiKey` | Управление API-ключами |
| `getNotificationSettings` / `updateNotificationSettings` | Уведомления |
| `resetAllData` | Сброс всех данных |

### Дашборд

| Метод | Описание |
|-------|----------|
| `getStats` | Статистика дашборда (ноды, команды, скрипты, Docker) |
| `getRecentActivity` | Лента последней активности |
| `getRecentCommands` | Последние выполненные команды |

### Прочие модули

| Модуль | Описание |
|--------|----------|
| `auditApi` | Записи журнала аудита (курсорная пагинация) |
| `composeApi` | Стеки Compose per-node |
| `templatesApi` | Паки/реестры |
| `favoritesApi` | Управление избранным (курсорная пагинация) |
| `searchApi` | Глобальный поиск по сущностям |
| `configApi` | Runtime-конфигурация |
| `eventsApi` | SSE-поток событий |

## Server-Sent Events (SSE)

Панель использует SSE для обновлений в реальном времени через `src/api/events.ts` и хук `useSse`:

```typescript
import { useSse } from './hooks/useSse'

// Автоматическое переподключение и парсинг событий
useSse('/events', (event) => {
  if (event.type === 'node:status') {
    // Обработка изменения статуса ноды
  }
})
```

## Переменные окружения

```bash
VITE_API_URL=http://localhost:8000    # Базовый URL REST API
VITE_WS_URL=ws://localhost:8000       # URL WebSocket (для будущего использования)
```
