---
title: Components
status: stable
translation_key: development.components
source_revision: 2026-08-20
---

# Components

## Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI primitives
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
│   │   ├── NotesPanel.tsx
│   │   ├── PageHeader.tsx
│   │   ├── Pagination.tsx
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
│   ├── commands/         # Command-specific components
│   ├── docker/           # Docker page components
│   │   ├── ContainersTab.tsx
│   │   ├── ContainerRow.tsx
│   │   ├── ContainerDetailPanel.tsx
│   │   ├── ContainerInspectContent.tsx
│   │   ├── ExecContainerContent.tsx
│   │   ├── CreateContainerForm.tsx
│   │   ├── ImagesTab.tsx
│   │   ├── NetworksTab.tsx
│   │   └── VolumesTab.tsx
│   ├── guards/           # Route guards
│   │   └── AuthGuard.tsx
│   ├── layout/           # Layout components
│   │   ├── ThemeToggle.tsx
│   │   └── MobileMenu.tsx
│   ├── nodes/            # Node-specific components
│   │   └── ConnectionTypeSelect.tsx
│   └── scripts/          # Script-specific components
├── pages/                # Route-level components
├── hooks/                # Custom React hooks
├── api/                  # API client layer
├── stores/               # Zustand stores
├── lib/                  # Utilities and validators
├── i18n/                 # Internationalization
├── layouts/              # Page layout wrappers
├── mocks/                # MSW mock data and handlers
├── styles/               # Theme configuration
└── test/                 # Test setup and utilities
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
import { useToast } from './components/ui/useToast'

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

### DropdownMenu

Dropdown menu with items.

```tsx
<DropdownMenu trigger={<Button>Options</Button>}>
  <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
  <DropdownMenuItem onClick={handleDelete} variant="danger">Delete</DropdownMenuItem>
</DropdownMenu>
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

### MetricsChart

SVG bar/area chart with tooltips, legends, and date presets.

```tsx
<MetricsChart
  data={chartData}
  title="Command Metrics"
  type="bar"
  datePreset="7d"
  onDatePresetChange={setDatePreset}
/>
```

### Typewriter

Animated text reveal character by character.

```tsx
<Typewriter text="Hello World" speed={30} onComplete={() => console.log('done')} />
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

### ResponsiveTable

Typed table with zebra-striping and sticky headers.

```tsx
<ResponsiveTable
  data={nodes}
  columns={[
    { key: 'name', header: 'Name', render: (item) => item.name },
    { key: 'status', header: 'Status', render: (item) => <Badge variant="success">{item.status}</Badge> },
  ]}
  keyExtractor={(item) => item.id}
/>
```

### TagBadge

Tag badge with optional remove button.

```tsx
<TagBadge tag="production" onRemove={() => handleRemoveTag('production')} />
```

### FavoriteButton

Star toggle for marking items as favorites.

```tsx
<FavoriteButton entityId="node-1" entityType="node" isFavorite={true} onToggle={handleToggle} />
```

### NotesPanel

Entity notes with markdown preview and CRUD.

```tsx
<NotesPanel entityType="node" entityId="node-1" />
```

### NodeSelect

Node selector dropdown with search.

```tsx
<NodeSelect value={selectedNodeId} onChange={setSelectedNodeId} placeholder="Select a node" />
```

### FilterBar

Filter controls bar for list pages.

```tsx
<FilterBar>
  <SearchInput value={search} onChange={setSearch} />
  <Select options={statusOptions} value={status} onChange={setStatus} />
</FilterBar>
```

## Domain Components

### Docker (`src/components/docker/`)

| Component | Description |
|-----------|-------------|
| `ContainersTab` | Container list with search, filters, and SSE updates |
| `ContainerRow` | Single container row with actions |
| `ContainerDetailPanel` | Expandable container details (inspect, logs, exec) |
| `ContainerInspectContent` | JSON view of container inspect output |
| `ExecContainerContent` | Interactive terminal for container exec |
| `CreateContainerForm` | Form for creating new containers |
| `ImagesTab` | Image list with pull/remove actions |
| `NetworksTab` | Network list with remove action |
| `VolumesTab` | Volume list with remove action |

### Nodes (`src/components/nodes/`)

| Component | Description |
|-----------|-------------|
| `ConnectionTypeSelect` | SSH/Docker/Proxmox connection type selector |

## Conventions

- Use TypeScript for all components
- Prefer functional components with hooks
- Keep components small and focused
- Co-locate styles with components using Tailwind
- Co-locate tests next to components
- Use SVG icons from `Icons.tsx` (not emoji)
- Use Skeleton for page-level loading (not Spinner)
