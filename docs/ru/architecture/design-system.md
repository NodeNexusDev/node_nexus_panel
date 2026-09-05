---
title: Дизайн-система
status: stable
translation_key: architecture.design_system
source_revision: 2026-09-06
---

# Дизайн-система

## Стилизация

TailwindCSS 4 для utility-first стилизации. Конфигурация через `@theme` в `src/index.css` (`--header-height: 64px`, `--color-*`, `--radius-*`). `Card` hover `0.15s`, `spring 0.35s`, `stagger 20ms`, `table-row-hover` `transition: none` мгновенно, `scrollbar-none` для Tabs.

## Компоненты

Переиспользуемые компоненты в `src/components/ui/`:

### Макет и навигация
- **PageHeader** — заголовок страницы с хлебными крошками и кнопками действий
- **Tabs** — навигация по вкладкам (`scroll-smooth snap-x`, `transition-none` мгновенно, `Arrow/Home/End`)
- **InfiniteScroll** — бесконечная прокрутка на курсорах с IntersectionObserver (`rootMargin 200px`)
- **Breadcrumb** — навигация по хлебным крошкам

### Отображение данных
- **Badge** — статусные бейджи (success, warning, danger, info, default)
- **TagBadge** — бейдж тега с кнопкой удаления
- **StatCard** — карточка статистики дашборда с индикатором тренда
- **KeyValueList** — отображение пар ключ-значение
- **ResponsiveTable** — типизированные таблицы `w-full` `table-row-hover` мгновенно (`transition:none`, `hover 6%/10%`), sticky headers, без зебры, `onRowClick → Drawer`
- **SortableHeader** — сортируемые заголовки столбцов

### Графики
- **MetricsChart** — SVG-столбчатая/площадная диаграмма с тултипами, легендами и пресетами дат

### Формы
- **Input** — поле ввода с label и состоянием ошибки
- **DropdownMenu** — выпадающее меню с элементами
- **FilterBar** — панель фильтров
- **SearchInput** — поле поиска с debounce (300мс)
- **NodeSelect** — выпадающий выбор ноды
- **ModalFooter** — кнопки действий модального окна (отмена/подтверждение)

### Обратная связь
- **Toast** — система уведомлений с полоской прогресса
- **ConfirmDialog** — обёртка Modal для подтверждений
- **EmptyState** — заглушка пустого состояния с иконкой
- **ErrorState** — состояние ошибки с повтором (показывает `request_id` + `detail` массив)
- **ErrorPage** — полноэкранное отображение ошибки
- **Skeleton** — shimmer-загрузка (StatCardSkeleton, TableSkeleton, CardListSkeleton, FormSkeleton)
- **Spinner** — индикатор загрузки inline

### Оверлеи
- **Modal** — `portal` в `body`, `backdrop-blur`, `spring 0.35s`
- **Drawer** — Variant C боковая панель `800px` (`lg` `max-w-4xl w-[min(800px,92vw)]`), `slide-in-right 0.2s`, `portal` в `body`, `backdrop-blur`, `focus-trap` `Tab`/`Esc`, `body overflow hidden` (`openDrawerCount`), `Tabs` внутри
- **Tooltip** — CSS-тултипы при наведении (top/bottom)
- **CommandPalette** — палитра команд (Ctrl+K)

### Утилиты
- **ErrorBoundary** — React error boundary (DEV `console.error` guard)
- **FavoriteButton** — кнопка-звёздочка для избранного
- **Typewriter** — анимированное появление текста
- **Icons** — монохромная SVG-система иконок

## Тема

CSS custom properties в `src/index.css` с light/dark режимом через класс `.dark` (`--header-height: 64px` оба хедера выровнены, версии `Panel v·API v` в основном хедере рядом с `Подключено`).

## Иконки

Монохромные SVG-иконки в `src/components/ui/Icons.tsx`. Все иконки используют `currentColor` для наследования цвета. Импорт:

```tsx
import { IconDashboard, IconNodes, IconCommands } from '../components/ui/Icons'

<IconDashboard className="w-5 h-5" />
```

Доступные иконки: IconDashboard, IconNodes, IconCommands, IconScripts, IconSettings, IconGlobe, IconLogout, IconMoon, IconSun, IconLaptop, IconSearch, IconWarning, IconRocket, IconCheckCircle, IconXCircle, IconBox, IconZap, IconGrip, IconTerminal, IconFileText, IconMenu, IconX.
