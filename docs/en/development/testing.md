---
title: Testing
status: stable
translation_key: development.testing
source_revision: 2026-08-16
---

# Testing

## Setup

The project uses:

- **Vitest** — test runner (Vite-native, Jest-compatible)
- **@testing-library/react** — component testing
- **@testing-library/user-event** — user interaction simulation
- **MSW (Mock Service Worker)** — API mocking

## Running Tests

```bash
# Watch mode
npm test

# Single run
npm run test:run

# With coverage
npm run test:coverage
```

## Configuration

See `vitest.config.ts`:

- Environment: `jsdom`
- Globals: enabled (no need to import `describe`, `it`, `expect`)
- Setup file: `src/test/setup.ts`
- Coverage provider: `v8`

## Writing Tests

Place test files next to components:

```
src/
  components/
    ui/
      Button.tsx
      Button.test.tsx
```

### Component Test Example

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

## Mocking API

MSW handlers are defined in `src/test/mocks/handlers.ts`.

### Adding New Handlers

```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('http://localhost:8000/api/nodes', () => {
    return HttpResponse.json({ data: [...], total: 1 })
  }),
]
```

### Per-Test Overrides

```typescript
import { server } from '../test/mocks/server'
import { http, HttpResponse } from 'msw'

it('handles error', async () => {
  server.use(
    http.get('/api/nodes', () => {
      return new HttpResponse(null, { status: 500 })
    })
  )
  // ... test error handling
})
```

## File Structure

```
src/test/
├── setup.ts              # Global test setup
└── mocks/
    ├── handlers.ts       # MSW request handlers
    └── server.ts         # MSW server setup
```
