---
title: Локальная разработка
status: stable
translation_key: development.local_setup
source_revision: 2026-08-16
---

# Локальная разработка

## Требования

- Node.js 22+
- npm 10+

## Настройка

```bash
git clone https://github.com/NodeNexusDev/node_nexus_panel.git
cd node_nexus_panel
npm install
```

## Сервер разработки

```bash
npm run dev
```

Откроется на `http://localhost:5173`.

## Доступные команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск сервера разработки |
| `npm run build` | Typecheck + сборка |
| `npm run lint` | Запуск линтера |
| `npm run preview` | Предпросмотр сборки |
