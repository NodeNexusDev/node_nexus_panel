---
title: Design System
status: stable
translation_key: architecture.design_system
source_revision: 2026-08-20
---

# Design System

## Styling

TailwindCSS 4 for utility-first styling. Configuration via `@theme` in `src/index.css`.

## Components

Reusable components in `src/components/ui/`:

### Layout & Navigation
- **PageHeader** — page title with breadcrumbs and action buttons
- **Tabs** — tab navigation with active state
- **InfiniteScroll** — cursor-based infinite scroll with IntersectionObserver
- **Breadcrumb** — breadcrumb navigation

### Data Display
- **Badge** — status badges (success, warning, danger, info, default)
- **TagBadge** — tag badge with remove button
- **StatCard** — dashboard stat card with trend indicator
- **KeyValueList** — key-value pair display
- **ResponsiveTable** — typed tables with zebra-striping, sticky headers
- **SortableHeader** — sortable column headers

### Charts
- **MetricsChart** — SVG bar/area chart with tooltips, legends, and date presets

### Forms
- **Input** — form input with label and error state
- **DropdownMenu** — dropdown menu with items
- **FilterBar** — filter controls bar
- **SearchInput** — debounced search input
- **NodeSelect** — node selector dropdown
- **ModalFooter** — modal action buttons (cancel/confirm)

### Feedback
- **Toast** — notification system with progress bar
- **ConfirmDialog** — wraps Modal for confirmations
- **EmptyState** — empty state placeholder with icon
- **ErrorState** — error state with retry
- **ErrorPage** — full-page error display
- **Skeleton** — shimmer loading (StatCardSkeleton, TableSkeleton, CardListSkeleton, FormSkeleton)
- **Spinner** — inline loading indicator

### Overlay
- **Modal** — backdrop-blur with spring animation
- **Tooltip** — CSS hover tooltips (top/bottom)
- **CommandPalette** — Ctrl+K command palette

### Utility
- **ErrorBoundary** — React error boundary
- **FavoriteButton** — star toggle for favorites
- **Typewriter** — animated text reveal
- **Icons** — monochrome SVG icon system

## Theme

CSS custom properties in `src/index.css` with light/dark mode via `.dark` class.

## Icons

Monochrome SVG icons in `src/components/ui/Icons.tsx`. All icons use `currentColor` for inheritable coloring. Import specific icons:

```tsx
import { IconDashboard, IconNodes, IconCommands } from '../components/ui/Icons'

<IconDashboard className="w-5 h-5" />
```

Available icons: IconDashboard, IconNodes, IconCommands, IconScripts, IconSettings, IconGlobe, IconLogout, IconMoon, IconSun, IconLaptop, IconSearch, IconWarning, IconRocket, IconCheckCircle, IconXCircle, IconBox, IconZap, IconGrip, IconTerminal, IconFileText, IconMenu, IconX.
