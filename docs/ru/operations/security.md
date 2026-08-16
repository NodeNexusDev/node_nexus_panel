---
title: Безопасность
status: stable
translation_key: operations.security
source_revision: 2026-08-16
---

# Безопасность

## HTTPS

Всегда используйте HTTPS в продакшне.

## CORS

Настройте API сервер для разрешения домена вашей панели.

## Хранение токенов

JWT токены хранятся в `localStorage`. Для чувствительных сред рассмотрите дополнительное шифрование.

## CSP

Настройте заголовки Content Security Policy для вашего развертывания.
