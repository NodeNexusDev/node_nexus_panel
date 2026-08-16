---
title: Интеграция с API
status: stable
translation_key: architecture.api_integration
source_revision: 2026-08-16
---

# Интеграция с API

## Обзор

Панель общается с NodeNexus API через REST и WebSocket.

## API клиент

Расположен в `src/api/`, обрабатывает:

- Заголовки аутентификации
- Обработку ошибок
- Интерцепторы запросов/ответов

## WebSocket

Обновления в реальном времени для:

- Статуса нод
- Вывода команд
- Системных событий
