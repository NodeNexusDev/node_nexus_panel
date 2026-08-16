---
title: Темизация
status: stable
translation_key: guides.theming
source_revision: 2026-08-16
---

# Темизация

## Обзор

Панель поддерживает три режима темы: тёмная, светлая и системная (автоопределение).

## Архитектура

- Состояние темы управляется в `src/stores/ui-store.ts` (Zustand)
- Предпочтение темы персистится в localStorage
- Применяется через CSS-классы на элементе `<html>`
- Цвета темы определены в `src/styles/theme.ts`

## Использование

### Переключение темы

```tsx
import { useUiStore } from './stores/ui-store'

const { theme, setTheme } = useUiStore()
setTheme('light') // 'dark' | 'light' | 'system'
```

### Компонент ThemeToggle

```tsx
import { ThemeToggle } from './components/layout/ThemeToggle'

<ThemeToggle /> // Переключает dark → light → system
```

## Цветовая палитра

### Тёмная тема

| Токен | Значение |
|-------|----------|
| bg-primary | `#030712` |
| bg-secondary | `#111827` |
| bg-tertiary | `#1f2937` |
| text-primary | `#f9fafb` |
| text-secondary | `#9ca3af` |
| border | `#1f2937` |
| accent | `#4f46e5` |

### Светлая тема

| Токен | Значение |
|-------|----------|
| bg-primary | `#ffffff` |
| bg-secondary | `#f9fafb` |
| bg-tertiary | `#f3f4f6` |
| text-primary | `#111827` |
| text-secondary | `#6b7280` |
| border | `#e5e7eb` |
| accent | `#4f46e5` |

## Добавление новой темы

1. Добавьте цвета темы в `src/styles/theme.ts`
2. Добавьте опцию темы в тип `Theme` в `src/stores/ui-store.ts`
3. Обновите функцию `applyTheme()` для обработки новой темы
