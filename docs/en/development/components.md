---
title: Components
status: stable
translation_key: development.components
source_revision: 2026-08-17
---

# Components

## Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
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

Variants: `primary`, `secondary`, `danger`, `ghost`, `gradient`
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
<Card hover gradient glass>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Modal

Dialog with overlay, backdrop-blur, spring animation, keyboard dismissal (Escape), and click-outside-to-close.

```tsx
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Dialog" size="md">
  <p>Content</p>
</Modal>
```

### Toast

Toast notification system via context provider with progress bar.

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

### Skeleton

Shimmer loading placeholders for pages.

```tsx
import { StatCardSkeleton, TableSkeleton, CardListSkeleton, FormSkeleton } from './components/ui/Skeleton'

<Skeleton variant="text" className="w-1/2" />
<TableSkeleton rows={5} cols={7} />
<CardListSkeleton count={4} />
<FormSkeleton fields={3} />
```

Variants: `text`, `circular`, `rectangular`

### Spinner

Loading indicator for inline button states (use Skeleton for page-level loading).

```tsx
<Spinner size="sm" />
```

### Icons

Monochrome SVG icon system. All icons use `currentColor`.

```tsx
import { IconDashboard, IconNodes, IconCommands } from './components/ui/Icons'

<IconDashboard className="w-5 h-5" />
<IconNodes className="w-4 h-4 text-surface-500" />
```

### EmptyState

Empty state placeholder with SVG icon support.

```tsx
<EmptyState icon={<IconNodes className="w-10 h-10" />} title="No items" description="Create your first item" action={<Button>Add</Button>} />
```

### Tooltip

CSS hover tooltip (top/bottom).

```tsx
<Tooltip content="Delete" position="top">
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

CSS-only bar chart for sparklines.

```tsx
<MiniChart data={[4, 6, 3, 8, 5, 7, 4]} color="bg-surface-400" className="h-8" />
```

### Typewriter

Animated text reveal character by character.

```tsx
<Typewriter text="Hello World" speed={30} onComplete={() => console.log('done')} />
```

### Timeline

Event timeline.

```tsx
<Timeline items={[
  { id: '1', title: 'Node online', description: 'Server 01 connected', time: '2 min ago' },
]} />
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

### ErrorBoundary

React error boundary with fallback UI.

```tsx
<ErrorBoundary>
  <MyApp />
</ErrorBoundary>
```

### Table

Typed table with zebra-striping and sticky headers.

```tsx
<Table
  data={nodes}
  columns={[
    { key: 'name', header: 'Name', render: (item) => item.name },
    { key: 'status', header: 'Status', render: (item) => <Badge variant="success">{item.status}</Badge> },
  ]}
  keyExtractor={(item) => item.id}
/>
```

## Conventions

- Use TypeScript for all components
- Prefer functional components with hooks
- Keep components small and focused
- Co-locate styles with components using Tailwind
- Co-locate tests next to components
- Use SVG icons from `Icons.tsx` (not emoji)
- Use Skeleton for page-level loading (not Spinner)
