---
title: Компоненты
status: stable
translation_key: development.components
source_revision: 2026-08-20
---

# Компоненты

## Структура

```
src/
├── components/
│   ├── ui/              # Переиспользуемые UI-компоненты
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── DropdownMenu.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ErrorPage.tsx
│   │   ├── ErrorState.tsx
│   │   ├── FavoriteButton.tsx
│   │   ├── FilterBar.tsx
│   │   ├── Icons.tsx
│   │   ├── Input.tsx
│   │   ├── KeyValueList.tsx
│   │   ├── MetricsChart.tsx
│   │   ├── Modal.tsx
│   │   ├── ModalFooter.tsx
│   │   ├── NodeSelect.tsx
│   │   ├── PageHeader.tsx
│   │   ├── Pagination.tsx          # legacy (users/api-keys page/size)
│   │   ├── InfiniteScroll.tsx      # курсорная пагинация
│   │   ├── ResponsiveTable.tsx
│   │   ├── SearchInput.tsx
│   │   ├── Skeleton.tsx
│   │   ├── SortableHeader.tsx
│   │   ├── Spinner.tsx
│   │   ├── StatCard.tsx
│   │   ├── Tabs.tsx
│   │   ├── TagBadge.tsx
│   │   ├── Toast.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Typewriter.tsx
│   │   ├── table-types.ts
│   │   └── useToast.ts
│   ├── commands/         # Компоненты команд
│   ├── docker/           # Компоненты страницы Docker
│   │   ├── ContainersTab.tsx
│   │   ├── ContainerRow.tsx
│   │   ├── ContainerDetailPanel.tsx
│   │   ├── ContainerInspectContent.tsx
│   │   ├── ExecContainerContent.tsx
│   │   ├── CreateContainerForm.tsx
│   │   ├── ImagesTab.tsx
│   │   ├── NetworksTab.tsx
│   │   └── VolumesTab.tsx
│   ├── guards/           # Guard-ы маршрутов
│   │   └── AuthGuard.tsx
│   ├── layout/           # Компоненты лейаута
│   │   ├── ThemeToggle.tsx
│   │   └── MobileMenu.tsx
│   ├── nodes/            # Компоненты нод
│   │   └── ConnectionTypeSelect.tsx
│   └── scripts/          # Компоненты скриптов
├── pages/                # Компоненты страниц
├── hooks/                # Пользовательские React хуки
├── api/                  # API-клиент
├── stores/               # Zustand хранилища
├── lib/                  # Утилиты и валидации
├── i18n/                 # Интернационализация
├── layouts/              # Обёртки страниц
├── mocks/                # Моки и обработчики MSW
├── styles/               # Конфигурация темы
└── test/                 # Настройка тестов и утилиты
```

## UI-компоненты

### Button

Универсальная кнопка с вариантами и размерами.

```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Нажми меня
</Button>
```

Варианты: `primary`, `secondary`, `danger`, `ghost`, `gradient`
Размеры: `sm`, `md`, `lg`

### Badge

Бейдж статуса с цветовыми вариантами.

```tsx
<Badge variant="success">Онлайн</Badge>
```

Варианты: `success`, `warning`, `danger`, `info`, `default`

### Card

Контейнер-карточка с заголовком и содержимым.

```tsx
<Card hover gradient glass>
  <CardHeader>Заголовок</CardHeader>
  <CardContent>Содержимое</CardContent>
</Card>
```

### Modal

Диалоговое окно с overlay, backdrop-blur, spring-анимацией, закрытием по Escape и клику вне окна.

```tsx
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Диалог" size="md">
  <p>Содержимое</p>
</Modal>
```

### Toast

Система toast-уведомлений через context provider с полоской прогресса.

```tsx
import { useToast } from './components/ui/useToast'

function MyComponent() {
  const { toast } = useToast()
  toast('success', 'Операция выполнена')
}
```

### Input

Поле ввода формы с label и состоянием ошибки.

```tsx
<Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
```

### DropdownMenu

Выпадающее меню с пунктами.

```tsx
<DropdownMenu trigger={<Button>Опции</Button>}>
  <DropdownMenuItem onClick={handleEdit}>Редактировать</DropdownMenuItem>
  <DropdownMenuItem onClick={handleDelete} variant="danger">Удалить</DropdownMenuItem>
</DropdownMenu>
```

### Skeleton

Shimmer-заглушки для страниц.

```tsx
import { StatCardSkeleton, TableSkeleton, CardListSkeleton, FormSkeleton } from './components/ui/Skeleton'

<Skeleton variant="text" className="w-1/2" />
<TableSkeleton rows={5} cols={7} />
<CardListSkeleton count={4} />
<FormSkeleton fields={3} />
```

Варианты: `text`, `circular`, `rectangular`

### Spinner

Индикатор загрузки для inline-кнопок (для загрузки страниц используйте Skeleton).

```tsx
<Spinner size="sm" />
```

### Icons

Монохромная SVG-система иконок. Все иконки используют `currentColor`.

```tsx
import { IconDashboard, IconNodes, IconCommands } from './components/ui/Icons'

<IconDashboard className="w-5 h-5" />
<IconNodes className="w-4 h-4 text-surface-500" />
```

### EmptyState

Заглушка для пустого состояния с поддержкой SVG-иконок.

```tsx
<EmptyState icon={<IconNodes className="w-10 h-10" />} title="Нет элементов" description="Создайте первый элемент" action={<Button>Добавить</Button>} />
```

### Tooltip

CSS-тултип при наведении (top/bottom).

```tsx
<Tooltip content="Удалить" position="top">
  <Button variant="ghost" size="sm">X</Button>
</Tooltip>
```

### MetricsChart

SVG bar/area график с тултипами, легендами и пресетами дат.

```tsx
<MetricsChart
  data={chartData}
  title="Метрики команд"
  type="bar"
  datePreset="7d"
  onDatePresetChange={setDatePreset}
/>
```

### Typewriter

Анимированное появление текста посимвольно.

```tsx
<Typewriter text="Hello World" speed={30} onComplete={() => console.log('done')} />
```

### ConfirmDialog

Диалог подтверждения, построенный на Modal.

```tsx
<ConfirmDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Удалить ноду"
  message="Вы уверены, что хотите удалить эту ноду?"
  confirmLabel="Удалить"
  variant="danger"
/>
```

### ErrorBoundary

React Error Boundary с fallback UI.

```tsx
<ErrorBoundary>
  <MyApp />
</ErrorBoundary>
```

### ResponsiveTable

Типизированная таблица с zebra-striping и sticky headers.

```tsx
<ResponsiveTable
  data={nodes}
  columns={[
    { key: 'name', header: 'Имя', render: (item) => item.name },
    { key: 'status', header: 'Статус', render: (item) => <Badge variant="success">{item.status}</Badge> },
  ]}
  keyExtractor={(item) => item.id}
/>
```

### TagBadge

Тег-бейдж с опциональной кнопкой удаления.

```tsx
<TagBadge tag="production" onRemove={() => handleRemoveTag('production')} />
```

### FavoriteButton

Кнопка-звёздочка для пометки элементов как избранных.

```tsx
<FavoriteButton entityId="node-1" entityType="node" isFavorite={true} onToggle={handleToggle} />
```

### InfiniteScroll

Курсорная бесконечная прокрутка с IntersectionObserver и кнопкой Load more.

```tsx
<InfiniteScroll hasMore={hasNextPage} isFetchingNextPage={isFetchingNextPage} onLoadMore={() => fetchNextPage()} />
```

### NodeSelect

Выпадающий список выбора ноды с поиском.

```tsx
<NodeSelect value={selectedNodeId} onChange={setSelectedNodeId} placeholder="Выберите ноду" />
```

### FilterBar

Панель фильтров для страниц со списками.

```tsx
<FilterBar>
  <SearchInput value={search} onChange={setSearch} />
  <Select options={statusOptions} value={status} onChange={setStatus} />
</FilterBar>
```

## Доменные компоненты

### Docker (`src/components/docker/`)

| Компонент | Описание |
|-----------|----------|
| `ContainersTab` | Список контейнеров с поиском, фильтрами и SSE-обновлениями |
| `ContainerRow` | Строка контейнера с действиями |
| `ContainerDetailPanel` | Раскрывающиеся детали контейнера (inspect, logs, exec) |
| `ContainerInspectContent` | JSON-вывод inspect контейнера |
| `ExecContainerContent` | Интерактивный терминал для exec в контейнер |
| `CreateContainerForm` | Форма создания нового контейнера |
| `ImagesTab` | Список образов с действиями pull/remove |
| `NetworksTab` | Список сетей с действием remove |
| `VolumesTab` | Список томов с действием remove |

### Nodes (`src/components/nodes/`)

| Компонент | Описание |
|-----------|----------|
| `ConnectionTypeSelect` | Селектор типа подключения SSH/Docker/Proxmox |

## Конвенции

- Используйте TypeScript для всех компонентов
- Предпочитайте функциональные компоненты с хуками
- Держите компоненты маленькими и сфокусированными
- Размещайте стили рядом с компонентами через Tailwind
- Размещайте тесты рядом с компонентами
- Используйте SVG-иконки из `Icons.tsx` (не эмодзи)
- Используйте Skeleton для загрузки страниц (не Spinner)
