---
title: Components
status: stable
translation_key: development.components
source_revision: 2026-08-16
---

# Components

## Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
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
│   ├── guards/          # Route guards
│   │   └── AuthGuard.tsx
│   └── layout/          # Layout components
│       ├── ThemeToggle.tsx
│       └── MobileMenu.tsx
├── pages/               # Route-level components
├── hooks/               # Custom React hooks
├── api/                 # API client layer
├── stores/              # Zustand stores
├── lib/                 # Utilities and validations
├── styles/              # Theme configuration
└── test/                # Test setup and mocks
```

## UI Components

### Button

Versatile button with variants and sizes.

```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>
```

Variants: `primary`, `secondary`, `danger`, `ghost`
Sizes: `sm`, `md`, `lg`

### Badge

Status badge with color variants.

```tsx
<Badge variant="success">Online</Badge>
```

Variants: `success`, `warning`, `danger`, `info`, `default`

### Card

Card container with header and content sections.

```tsx
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Modal

Dialog with overlay, keyboard dismissal (Escape), and click-outside-to-close.

```tsx
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Dialog">
  <p>Content</p>
</Modal>
```

### Toast

Toast notification system via context provider.

```tsx
import { useToast } from './components/ui/Toast'

function MyComponent() {
  const { toast } = useToast()
  toast('success', 'Operation completed')
}
```

### Input

Form input with label and error state.

```tsx
<Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
```

### Select

Dropdown select with label and error state.

```tsx
<Select label="Node" options={[{ value: '1', label: 'Server 01' }]} />
```

### Toggle

Switch toggle with label and description.

```tsx
<Toggle checked={enabled} onChange={setEnabled} label="Feature" description="Toggle this" />
```

### Spinner

Loading indicator with size variants.

```tsx
<Spinner size="md" />
```

### EmptyState

Empty state placeholder.

```tsx
<EmptyState icon="📦" title="No items" description="Create your first item" action={<Button>Add</Button>} />
```

### ErrorBoundary

React error boundary with fallback UI.

```tsx
<ErrorBoundary>
  <MyApp />
</ErrorBoundary>
```

### Table

Composable table components.

```tsx
<Table>
  <TableHead>
    <TableHeaderCell>Name</TableHeaderCell>
    <TableHeaderCell>Status</TableHeaderCell>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>Server 01</TableCell>
      <TableCell><Badge variant="success">Online</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### ConfirmDialog

Confirmation dialog built on Modal.

```tsx
<ConfirmDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Delete Node"
  message="Are you sure you want to delete this node?"
  confirmLabel="Delete"
  variant="danger"
/>
```

## Conventions

- Use TypeScript for all components
- Prefer functional components with hooks
- Keep components small and focused
- Co-locate styles with components using Tailwind
- Co-locate tests next to components
