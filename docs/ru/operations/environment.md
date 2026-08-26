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
| `VITE_API_URL` | URL Backend API | `http://localhost:8000` |

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
