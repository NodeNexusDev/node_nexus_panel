---
title: Обзор архитектуры
status: stable
translation_key: architecture.overview
source_revision: 2026-08-16
---

# Обзор архитектуры

## Технологический стек

- **Фреймворк:** React 19
- **Язык:** TypeScript 6
- **Сборка:** Vite 8
- **Стилизация:** TailwindCSS 4

## Структура директорий

```
src/
├── components/     # Переиспользуемые UI компоненты
├── pages/          # Компоненты маршрутов
├── hooks/          # Пользовательские React хуки
├── utils/          # Утилиты
├── api/            # API клиент
├── assets/         # Статические файлы
├── App.tsx         # Корневой компонент
└── main.tsx        # Точка входа
```

## Поток данных

```mermaid
graph LR
    A[Компонент] --> B[Хук]
    B --> C[API клиент]
    C --> D[NodeNexus API]
    D --> C
    C --> B
    B --> A
```
