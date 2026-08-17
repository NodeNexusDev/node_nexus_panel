---
title: Авторизация
status: stable
translation_key: getting_started.authentication
source_revision: 2026-08-17
---

# Авторизация

NodeNexus Panel использует авторизацию через переменные окружения. Учётные данные настраиваются через env-переменные.

## Вход

1. Введите учётные данные на странице входа
2. Панель сверяет их с `VITE_PANEL_LOGIN` и `VITE_PANEL_PASSWORD`
3. При успешном входе состояние сохраняется в `sessionStorage`

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `VITE_PANEL_LOGIN` | Логин для входа в панель | `admin` |
| `VITE_PANEL_PASSWORD` | Пароль для входа в панель | `password` |

Подробности в [Переменные окружения](../operations/environment.md).

## API ключи

Для программного доступа к backend API настройте `VITE_API_KEY` — он будет передаваться в заголовке `X-API-Key`.
