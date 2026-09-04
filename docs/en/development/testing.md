---
title: Testing
status: stable
translation_key: development.testing
source_revision: 2026-08-20
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

MSW handlers are organized by domain in `src/mocks/handlers/`.

### Structure

```
src/mocks/
├── index.ts              # MSW browser/node setup
├── browser.ts            # Browser worker
├── node.ts               # Node server
├── data/                 # Mock data fixtures
│   ├── nodes.ts
│   ├── commands.ts
│   ├── scripts.ts
│   ├── dashboard.ts
│   ├── docker.ts
│   ├── audit.ts
│   ├── api-keys.ts
│   ├── favorites.ts
│   ├── compose.ts
│   └── templates.ts
└── handlers/             # MSW request handlers
    ├── index.ts          # Combines all handlers
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
    ├── compose.ts
    ├── templates.ts
    ├── search.ts
    └── tags.ts
```

### Adding New Handlers

```typescript
// src/mocks/handlers/nodes.ts
import { http, HttpResponse } from 'msw'
import { mockNodes } from '../data/nodes'

export const nodeHandlers = [
  http.get(`${API_URL}/api/v2/nodes/`, () => {
    return HttpResponse.json({ items: mockNodes, limit: 20, next_cursor: null, has_more: false })
  }),
]
```

### Per-Test Overrides

```typescript
import { server } from '@/mocks/node'
import { http, HttpResponse } from 'msw'

it('handles error', async () => {
  server.use(
    http.get('/api/v2/nodes/', () => {
      return new HttpResponse(null, { status: 500 })
    })
  )
  // ... test error handling
})
```

## File Structure

```
src/test/
└── setup.ts              # Global test setup

src/mocks/
├── index.ts              # MSW browser/node setup
├── browser.ts            # Browser worker
├── node.ts               # Node server
├── data/                 # Mock data fixtures
└── handlers/             # MSW request handlers
```
