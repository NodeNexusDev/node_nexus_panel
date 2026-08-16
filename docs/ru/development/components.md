---
title: Компоненты
status: stable
translation_key: development.components
source_revision: 2026-08-17
---

# Компоненты

## Структура

```
src/
├── components/
│   ├── ui/              # Переиспользуемые UI-компоненты
│   │   ├── Badge.tsx
│   │   ├── Breadcrumb.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── DragDropList.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ErrorCard.tsx
│   │   ├── ErrorPage.tsx
│   │   ├── Icons.tsx
│   │   ├── Input.tsx
│   │   ├── MiniChart.tsx
│   │   ├── Modal.tsx
│   │   ├── NetworkError.tsx
│   │   ├── Pagination.tsx
│   │   ├── ResponsiveTable.tsx
│   │   ├── SearchInput.tsx
│   │   ├── Select.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Spinner.tsx
│   │   ├── Table.tsx
│   │   ├── Timeline.tsx
│   │   ├── Toast.tsx
│   │   ├── Toggle.tsx
│   │   ├── Tooltip.tsx
│   │   └── Typewriter.tsx
│   ├── guards/          # Guard-ы маршрутов
│   │   └── AuthGuard.tsx
│   └── layout/          # Компоненты лейаута
│       ├── ThemeToggle.tsx
│       └── MobileMenu.tsx
├── pages/               # Компоненты страниц
├── hooks/               # Пользовательские React хуки
├── api/                 # API-клиент
├── stores/              # Zustand хранилища
├── lib/                 # Утилиты и валидации
├── styles/              # Конфигурация темы
└── test/                # Настройка тестов и моки
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
import { useToast } from './components/ui/Toast'

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

### Select

Выпадающий список с label и состоянием ошибки.

```tsx
<Select label="Нода" options={[{ value: '1', label: 'Сервер 01' }]} />
```

### Toggle

Переключатель с label и описанием.

```tsx
<Toggle checked={enabled} onChange={setEnabled} label="Функция" description="Переключить это" />
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

### DragDropList

Generic drag-and-drop reorderable list.

```tsx
<DragDropList
  items={items}
  onReorder={setItems}
  keyExtractor={(item) => item.id}
  renderItem={(item, index) => <div>{item.name}</div>}
/>
```

### MiniChart

CSS-only bar chart для спарклайнов.

```tsx
<MiniChart data={[4, 6, 3, 8, 5, 7, 4]} color="bg-surface-400" className="h-8" />
```

### Typewriter

Анимированное появление текста посимвольно.

```tsx
<Typewriter text="Hello World" speed={30} onComplete={() => console.log('done')} />
```

### Timeline

Таймлайн событий.

```tsx
<Timeline items={[
  { id: '1', title: 'Нода онлайн', description: 'Сервер 01 подключён', time: '2 мин назад' },
]} />
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

### Table

Типизированная таблица с zebra-striping и sticky headers.

```tsx
<Table
  data={nodes}
  columns={[
    { key: 'name', header: 'Имя', render: (item) => item.name },
    { key: 'status', header: 'Статус', render: (item) => <Badge variant="success">{item.status}</Badge> },
  ]}
  keyExtractor={(item) => item.id}
/>
```

## Конвенции

- Используйте TypeScript для всех компонентов
- Предпочитайте функциональные компоненты с хуками
- Держите компоненты маленькими и сфокусированными
- Размещайте стили рядом с компонентами через Tailwind
- Размещайте тесты рядом с компонентами
- Используйте SVG-иконки из `Icons.tsx` (не эмодзи)
- Используйте Skeleton для загрузки страниц (не Spinner)
