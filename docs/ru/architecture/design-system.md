---
title: Дизайн-система
status: stable
translation_key: architecture.design_system
source_revision: 2026-08-20
---

# Дизайн-система

## Стилизация

TailwindCSS 4 для utility-first стилизации. Конфигурация через `@theme` в `src/index.css`.

## Компоненты

Переиспользуемые компоненты в `src/components/ui/`:

### Макет и навигация
- **PageHeader** — заголовок страницы с хлебными крошками и кнопками действий
- **Tabs** — навигация по вкладкам с активным состоянием
- **InfiniteScroll** — бесконечная прокрутка на курсорах с IntersectionObserver
- **Breadcrumb** — навигация по хлебным крошкам

### Отображение данных
- **Badge** — статусные бейджи (success, warning, danger, info, default)
- **TagBadge** — бейдж тега с кнопкой удаления
- **StatCard** — карточка статистики дашборда с индикатором тренда
- **KeyValueList** — отображение пар ключ-значение
- **ResponsiveTable** — типизированные таблицы с zebra-striping, sticky headers
- **SortableHeader** — сортируемые заголовки столбцов

### Графики
- **MetricsChart** — SVG-столбчатая/площадная диаграмма с тултипами, легендами и пресетами дат

### Формы
- **Input** — поле ввода с label и состоянием ошибки
- **DropdownMenu** — выпадающее меню с элементами
- **FilterBar** — панель фильтров
- **SearchInput** — поле поиска с debounce
- **NodeSelect** — выпадающий выбор ноды
- **ModalFooter** — кнопки действий модального окна (отмена/подтверждение)

### Обратная связь
- **Toast** — система уведомлений с полоской прогресса
- **ConfirmDialog** — обёртка Modal для подтверждений
- **EmptyState** — заглушка пустого состояния с иконкой
- **ErrorState** — состояние ошибки с повтором
- **ErrorPage** — полноэкранное отображение ошибки
- **Skeleton** — shimmer-загрузка (StatCardSkeleton, TableSkeleton, CardListSkeleton, FormSkeleton)
- **Spinner** — индикатор загрузки inline

### Оверлеи
- **Modal** — backdrop-blur с spring-анимацией
- **Tooltip** — CSS-тултипы при наведении (top/bottom)
- **CommandPalette** — палитра команд (Ctrl+K)

### Утилиты
- **ErrorBoundary** — React error boundary
- **FavoriteButton** — кнопка-звёздочка для избранного
- **Typewriter** — анимированное появление текста
- **Icons** — монохромная SVG-система иконок

## Тема

CSS custom properties в `src/index.css` с light/dark режимом через класс `.dark`.

## Иконки

Монохромные SVG-иконки в `src/components/ui/Icons.tsx`. Все иконки используют `currentColor` для наследования цвета. Импорт:

```tsx
import { IconDashboard, IconNodes, IconCommands } from '../components/ui/Icons'

<IconDashboard className="w-5 h-5" />
```

Доступные иконки: IconDashboard, IconNodes, IconCommands, IconScripts, IconSettings, IconGlobe, IconLogout, IconMoon, IconSun, IconLaptop, IconSearch, IconWarning, IconRocket, IconCheckCircle, IconXCircle, IconBox, IconZap, IconGrip, IconTerminal, IconFileText, IconMenu, IconX.
