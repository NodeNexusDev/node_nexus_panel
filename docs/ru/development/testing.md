---
title: Тестирование
status: stable
translation_key: development.testing
source_revision: 2026-08-16
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

Обработчики MSW определены в `src/test/mocks/handlers.ts`.

### Добавление новых обработчиков

```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('http://localhost:8000/api/nodes', () => {
    return HttpResponse.json({ data: [...], total: 1 })
  }),
]
```

### Переопределение в отдельных тестах

```typescript
import { server } from '../test/mocks/server'
import { http, HttpResponse } from 'msw'

it('handles error', async () => {
  server.use(
    http.get('/api/nodes', () => {
      return new HttpResponse(null, { status: 500 })
    })
  )
  // ... тестирование обработки ошибок
})
```

## Структура файлов

```
src/test/
├── setup.ts              # Глобальная настройка тестов
└── mocks/
    ├── handlers.ts       # Обработчики запросов MSW
    └── server.ts         # Настройка сервера MSW
```
