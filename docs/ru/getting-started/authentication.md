---
title: Авторизация
status: stable
translation_key: getting_started.authentication
source_revision: 2026-08-17
---

# Авторизация

NodeNexus Panel использует JWT-авторизацию через Backend API.

## Вход

1. Введите email и пароль на странице входа
2. Панель отправляет запрос `POST /auth/login` на Backend API
3. При успешном входе JWT access token сохраняется в памяти, refresh token — в HttpOnly cookie
4. Состояние авторизации дублируется в `sessionStorage`

## Выход

- `POST /auth/logout` — инвалидирует refresh token на сервере
- access token удаляется из памяти
- `sessionStorage` очищается

## Токены

| Тип | Хранение | Срок жизни |
|-----|----------|------------|
| Access token | Память (JS) | Короткий |
| Refresh token | HttpOnly cookie | Длинный |

## API ключи

Для программного доступа к Backend API настройте API ключи через панель (Settings → API Keys). API ключи передаются в заголовке `X-API-Key`.
