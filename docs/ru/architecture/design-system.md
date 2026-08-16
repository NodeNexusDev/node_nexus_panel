---
title: Дизайн-система
status: stable
translation_key: architecture.design_system
source_revision: 2026-08-17
---

# Дизайн-система

## Стилизация

TailwindCSS 4 для utility-first стилизации. Конфигурация через `@theme` в `src/index.css`.

## Компоненты

Переиспользуемые компоненты в `src/components/ui/`:

- **Button** — варианты primary, secondary, danger, ghost, gradient
- **Card** — glass, hover, gradient с CardHeader/CardContent
- **Input / Select** — контролы формы с label и состоянием ошибки
- **Table / ResponsiveTable** — типизированные таблицы с zebra-striping, sticky headers
- **Modal** — backdrop-blur с spring-анимацией
- **ConfirmDialog** — обёртка Modal для подтверждений
- **Badge** — статусные бейджи (success, warning, danger, info)
- **Toast** — система уведомлений с полоской прогресса
- **Skeleton** — shimmer-загрузка (StatCardSkeleton, TableSkeleton, CardListSkeleton, FormSkeleton)
- **Tooltip** — CSS-тултипы при наведении (top/bottom)
- **DragDropList** — generic drag-and-drop reorderable list
- **MiniChart** — CSS-only bar chart для спарклайнов
- **Timeline** — таймлайн событий
- **Typewriter** — анимированное появление текста
- **EmptyState** — заглушка пустого состояния
- **Pagination** — навигация по страницам
- **SearchInput** — debounce-поиск
- **CommandPalette** — палитра команд (Ctrl+K)
- **ErrorBoundary** — React error boundary
- **ErrorCard / ErrorPage / NetworkError** — состояния ошибок

## Тема

CSS custom properties в `src/index.css` с light/dark режимом через класс `.dark`.

## Иконки

Монохромные SVG-иконки в `src/components/ui/Icons.tsx`. Все иконки используют `currentColor` для наследования цвета. Импорт:

```tsx
import { IconDashboard, IconNodes, IconCommands } from '../components/ui/Icons'

<IconDashboard className="w-5 h-5" />
```

Доступные иконки: IconDashboard, IconNodes, IconCommands, IconScripts, IconSettings, IconGlobe, IconLogout, IconMoon, IconSun, IconLaptop, IconSearch, IconWarning, IconRocket, IconCheckCircle, IconXCircle, IconBox, IconZap, IconGrip, IconTerminal, IconFileText, IconMenu, IconX.
