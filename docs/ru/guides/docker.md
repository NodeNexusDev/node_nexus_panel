---
title: Docker
status: stable
translation_key: guides.docker
source_revision: 2026-09-07
---

# Docker

Управление Docker-ресурсами на подключённых нодах.

## Обзор

Страница Docker — единый интерфейс для контейнеров, образов, сетей, томов, системы и Compose на Docker-нодах. Использует `Drawer Variant C` (`800px`, портал в `body`, `slide-in-right 0.2s`) — клик по строке открывает drawer, без per-row кнопок (как в нодах).

## Выбор ноды

Выберите Docker-ноду из выпадающего списка вверху. Отображаются только ноды с `has_docker`. Синхронизируется с URL `?node=:id` и `?tab=containers|images|networks|volumes|system|compose` (можно шарить ссылку, `MainLayout` `64px` хедеры выровнены, версии `Panel v·API v` рядом с `Подключено`).

## Контейнеры

Просмотр и управление контейнерами.

### Возможности

- **Infinite scroll** `20` (`useInfiniteDockerContainers` + `InfiniteScroll` 200px), **Поиск** по имени/образу, **Фильтр** `все/запущенные/остановленные`, **Сортировка** по имени/образу/статусу/дате
- **Без per-row кнопок** — клик → `ContainerDrawer` (6 вкладок). Массовая панель над таблицей для выбранных: `Перезапустить все/Запустить все/Остановить все/Удалить/Выполнить/Инспекция/Логи/Статистика` с `207` per-container `BulkResult`
- **Без зебры** — `w-full` + `table-row-hover` `transition:none` мгновенно, `hover 6%/10%`

### Drawer контейнера (Variant C)

6 вкладок: `обзор` (ID/Имя/Образ/Статус/Порты/Создан + копировать), `логи` (tail/since + `ContainerLogsContent`), `статистика` (CPU/память/сеть/блок через `useDockerContainerStats` 5s), `выполнить` (`sh` по умолчанию, `ExecContainerContent`), `инспекция` (`ContainerInspectContent` + NetworkSettings JSON), `топ` (`TopContainerContent`). Шапка: `Start/Stop/Restart/Pause/Unpause/Завершить (Kill SIGTERM)/Порт/Обновить (память/CPU)/Ожидать/Переименовать/Удалить` (per-container, `207`).

## Образы

Просмотр и управление образами.

### Возможности

- **Infinite** `20` + **Поиск** + **Сортировка** по репозиторию/тегу/размеру/дате, клик → `ImageDrawer` (без per-row кнопок)
- **Массово** `Удалить` (один `bulkImageRemovals {image_ids}` `207`), `Собрать`/`Скачать` модалки

### Drawer образа

3 вкладки: `обзор` (ID/Репозиторий/Тег/Размер/Создан), `инспекция` (`ImageInspectContent` + `formatBytes`), `история` (`useImageHistory` слои). Действия: `Отметить тегом` (`repo:tag` → `POST /images/{id}/tag`), `Отправить в реестр (Push)` (`pushImage`/`pushImageById`), `Удалить`.

## Сети

Просмотр и управление сетями.

### Возможности

- **Infinite** + **Поиск** + **Сортировка** по имени/драйверу/области, **Массовое удаление** (`bulkNetworkRemovals`), **Очистка** (`POST /networks/prune`), клик → `NetworkDrawer`

### Drawer сети

3 вкладки: `обзор` (ID/Имя/Драйвер/Область), `инспекция` (`NetworkInspectContent` + контейнеры JSON), `контейнеры` (Подключить/Отключить `container_id` → `POST /networks/{id}/connect/disconnect`). Удаление.

## Тома

Просмотр и управление томами.

### Возможности

- **Infinite** + **Поиск** + **Сортировка** по имени/драйверу, **Массовое удаление** (`bulkVolumeRemovals`), **Очистка**, клик → `VolumeDrawer`

### Drawer тома

2 вкладки: `обзор` (Имя/Драйвер), `инспекция` (`VolumeInspectContent` точка монтирования + метки). Удаление.

## Система

Только чтение `SystemTab`: `GET /system/info` (версия сервера, ОС, архитектура, CPU, память, драйвер, запущенные/остановленные/образы) в 3 колонки + `GET /system/df` таблица (тип/всего/активно/освобождаемо). **Новое:** `GET /system/version` бейдж + кнопки **Очистка** `system/networks/images/volumes/containers` с подтверждением.

## Compose

Управление стеками per node (`useInfiniteComposeProjects` 20 + `Search` + массово).

### Drawer Compose (Variant C)

8 вкладок: `обзор` (compose YAML), `ps` (`GET /ps`), `logs` (`GET /logs`), `config` (`GET /config`), `images` (`GET /images`), `top` (`GET /top`), `version` (`GET /version`), `port` (`GET /port?service&port`). Шапка: `Запустить (up)` (с `services` фильтр `comma` + чекбоксы `Скачать`/`Собрать` → `POST /ups {build,pull,services}` `BulkResult` per-service `207`), `Остановить (down)` (`volumes`/`orphans` → `POST /downs {volumes,remove_orphans}`), `Перезапустить` (`POST /restarts {services}`), `Редактировать` (textarea + `PATCH /{projectName}`), `Удалить`. Результат `BulkResult_ComposeServiceBulkResult_` per-service `service/status/output/error` с `succeeded/failed`.

## Docker-подключение

Для управления Docker ноды должны быть настроены:

- **Тип подключения:** SSH
- **Есть Docker:** true
- **Docker-хост:** путь к сокету (напр. `/var/run/docker.sock`)

См. [Ноды](nodes.md) для добавления нод с Docker.
