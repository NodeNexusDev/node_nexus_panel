---
title: Переменные окружения
status: stable
translation_key: operations.environment
source_revision: 2026-08-16
---

# Переменные окружения

## Runtime переменные

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `VITE_API_URL` | URL Backend API | `http://localhost:8000` |
| `VITE_WS_URL` | URL WebSocket | `ws://localhost:8000` |

## Build-time переменные

Переменные должны начинаться с `VITE_` для доступа из клиентского бандла.
