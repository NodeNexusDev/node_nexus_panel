---
title: Компоненты
status: stable
translation_key: development.components
source_revision: 2026-08-16
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
│   │   ├── ConfirmDialog.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Select.tsx
│   │   ├── Spinner.tsx
│   │   ├── Table.tsx
│   │   ├── Toast.tsx
│   │   └── Toggle.tsx
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

Варианты: `primary`, `secondary`, `danger`, `ghost`
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
<Card>
  <CardHeader>Заголовок</CardHeader>
  <CardContent>Содержимое</CardContent>
</Card>
```

### Modal

Диалоговое окно с overlay, закрытием по Escape и клику вне окна.

```tsx
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Диалог">
  <p>Содержимое</p>
</Modal>
```

### Toast

Система toast-уведомлений через context provider.

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

### Spinner

Индикатор загрузки с вариантами размеров.

```tsx
<Spinner size="md" />
```

### EmptyState

Заглушка для пустого состояния.

```tsx
<EmptyState icon="📦" title="Нет элементов" description="Создайте первый элемент" action={<Button>Добавить</Button>} />
```

### ErrorBoundary

React Error Boundary с fallback UI.

```tsx
<ErrorBoundary>
  <MyApp />
</ErrorBoundary>
```

### Table

Компоненты таблицы.

```tsx
<Table>
  <TableHead>
    <TableHeaderCell>Имя</TableHeaderCell>
    <TableHeaderCell>Статус</TableHeaderCell>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>Сервер 01</TableCell>
      <TableCell><Badge variant="success">Онлайн</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>
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

## Конвенции

- Используйте TypeScript для всех компонентов
- Предпочитайте функциональные компоненты с хуками
- Держите компоненты маленькими и сфокусированными
- Размещайте стили рядом с компонентами через Tailwind
- Размещайте тесты рядом с компонентами
