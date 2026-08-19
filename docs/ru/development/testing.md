---
title: Тестирование
status: stable
translation_key: development.testing
source_revision: 2026-08-20
---

# Тестирование

## Настройка

Проект использует:

- **Vitest** — тестовый раннер (Vite-native, совместимый с Jest)
- **@testing-library/react** — тестирование компонентов
- **@testing-library/user-event** — имитация пользовательских действий
- **MSW (Mock Service Worker)** — мокирование API

## Запуск тестов

```bash
# Режим отслеживания
npm test

# Однократный запуск
npm run test:run

# С покрытием
npm run test:coverage
```

## Конфигурация

См. `vitest.config.ts`:

- Окружение: `jsdom`
- Глобалы: включены (не нужно импортировать `describe`, `it`, `expect`)
- Файл настройки: `src/test/setup.ts`
- Провайдер покрытия: `v8`

## Написание тестов

Файлы тестов размещаются рядом с компонентами:

```
src/
  components/
    ui/
      Button.tsx
      Button.test.tsx
```

### Пример теста компонента

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Мокирование API

Обработчики MSW организованы по доменам в `src/mocks/handlers/`.

### Структура

```
src/mocks/
├── index.ts              # Настройка MSW browser/node
├── browser.ts            # Browser worker
├── node.ts               # Node сервер
├── data/                 # Фикстуры мок-данных
│   ├── nodes.ts
│   ├── commands.ts
│   ├── scripts.ts
│   ├── dashboard.ts
│   ├── docker.ts
│   ├── audit.ts
│   ├── api-keys.ts
│   ├── favorites.ts
│   └── notes.ts
└── handlers/             # Обработчики запросов MSW
    ├── index.ts          # Объединяет все обработчики
    ├── nodes.ts
    ├── commands.ts
    ├── scripts.ts
    ├── dashboard.ts
    ├── docker.ts
    ├── audit.ts
    ├── api-keys.ts
    ├── config.ts
    ├── events.ts
    ├── favorites.ts
    ├── notes.ts
    ├── search.ts
    └── tags.ts
```

### Добавление новых обработчиков

```typescript
// src/mocks/handlers/nodes.ts
import { http, HttpResponse } from 'msw'
import { mockNodes } from '../data/nodes'

export const nodeHandlers = [
  http.get(`${API_URL}/api/v1/nodes`, () => {
    return HttpResponse.json({ data: mockNodes, total: mockNodes.length })
  }),
]
```

### Переопределение в отдельных тестах

```typescript
import { server } from '@/mocks/node'
import { http, HttpResponse } from 'msw'

it('handles error', async () => {
  server.use(
    http.get('/api/v1/nodes', () => {
      return new HttpResponse(null, { status: 500 })
    })
  )
  // ... тестирование обработки ошибок
})
```

## Структура файлов

```
src/test/
└── setup.ts              # Глобальная настройка тестов

src/mocks/
├── index.ts              # Настройка MSW browser/node
├── browser.ts            # Browser worker
├── node.ts               # Node сервер
├── data/                 # Фикстуры мок-данных
└── handlers/             # Обработчики запросов MSW
```
