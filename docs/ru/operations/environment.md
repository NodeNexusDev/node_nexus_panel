---
title: Переменные окружения
status: stable
translation_key: operations.environment
source_revision: 2026-08-17
---

# Переменные окружения

## Runtime переменные

Переменные инжектируются при запуске контейнера через `docker/entrypoint.sh` (Docker) или `window.__ENV__` (браузер).

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `VITE_API_URL` | URL Backend API (пусто = same-origin через nginx/Vite proxy) | `` (пусто) |
| `VITE_ENABLE_MOCKS` | Включить MSW моки в dev (`true`/`false`) | `false` |

Полный пример с бэкенд переменными (`DATABASE_URL`, `SECRET_KEY`, `SSH_*` и т.д.) смотрите в `.env.example`. Бэкенд переменные документированы в [API репозитории](https://github.com/NodeNexusDev/node_nexus_api).

## Как это работает

В Docker entrypoint-скрипт выполняет `envsubst`, который подставляет плейсхолдеры `${VITE_*}` в `index.html` значениями переменных окружения при старте контейнера.

В локальной разработке (`npm run dev`) Vite читает переменные напрямую из `.env` файлов.

## Использование в Docker

Задайте переменные через `docker-compose.yml` или `docker run`:

```yaml
services:
  panel:
    image: ghcr.io/nodenexusdev/node_nexus_panel:latest
    environment:
      - VITE_API_URL=https://api.example.com
```

## Локальная разработка

Создайте файл `.env` в корне проекта:

```bash
VITE_API_URL=http://localhost:8000
```
