---
title: Конфигурация
status: stable
translation_key: getting_started.configuration
source_revision: 2026-08-17
---

# Конфигурация

## Переменные окружения

Создайте файл `.env` в корне проекта:

```bash
VITE_API_URL=http://localhost:8000
```

В Docker переменные инжектируются при запуске через `docker/entrypoint.sh`. Подробности в [Переменные окружения](../operations/environment.md).

## Конфигурация Vite

Панель использует Vite для разработки и сборки. См. `vite.config.ts` для расширенных опций.
