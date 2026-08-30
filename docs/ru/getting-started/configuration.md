---
title: Конфигурация
status: stable
translation_key: getting_started.configuration
source_revision: 2026-08-17
---

# Конфигурация

## Переменные окружения

Создайте файл `.env` в корне проекта (см. `.env.example`):

```bash
VITE_API_URL= # пусто = same-origin
VITE_ENABLE_MOCKS=false
```

В Docker переменные инжектируются при запуске через `docker/entrypoint.sh`. Подробности в [Переменные окружения](../operations/environment.md).

## Конфигурация Vite

Панель использует Vite для разработки и сборки. См. `vite.config.ts` для расширенных опций.
