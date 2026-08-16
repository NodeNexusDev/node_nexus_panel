---
title: Design System
status: stable
translation_key: architecture.design_system
source_revision: 2026-08-17
---

# Design System

## Styling

TailwindCSS 4 for utility-first styling. Configuration via `@theme` in `src/index.css`.

## Components

Reusable components in `src/components/ui/`:

- **Button** — primary, secondary, danger, ghost, gradient variants
- **Card** — glass, hover, gradient variants with CardHeader/CardContent
- **Input / Select** — form controls with label and error state
- **Table / ResponsiveTable** — typed tables with zebra-striping, sticky headers
- **Modal** — backdrop-blur with spring animation
- **ConfirmDialog** — wraps Modal for confirmations
- **Badge** — status badges (success, warning, danger, info)
- **Toast** — notification system with progress bar
- **Skeleton** — shimmer loading (StatCardSkeleton, TableSkeleton, CardListSkeleton, FormSkeleton)
- **Tooltip** — CSS hover tooltips (top/bottom)
- **DragDropList** — generic drag-and-drop reorderable list
- **MiniChart** — CSS-only bar chart for sparklines
- **Timeline** — event timeline
- **Typewriter** — animated text reveal
- **EmptyState** — empty state placeholder
- **Pagination** — paginated navigation
- **SearchInput** — debounced search
- **CommandPalette** — Ctrl+K command palette
- **ErrorBoundary** — React error boundary
- **ErrorCard / ErrorPage / NetworkError** — error states

## Theme

CSS custom properties in `src/index.css` with light/dark mode via `.dark` class.

## Icons

Monochrome SVG icons in `src/components/ui/Icons.tsx`. All icons use `currentColor` for inheritable coloring. Import specific icons:

```tsx
import { IconDashboard, IconNodes, IconCommands } from '../components/ui/Icons'

<IconDashboard className="w-5 h-5" />
```

Available icons: IconDashboard, IconNodes, IconCommands, IconScripts, IconSettings, IconGlobe, IconLogout, IconMoon, IconSun, IconLaptop, IconSearch, IconWarning, IconRocket, IconCheckCircle, IconXCircle, IconBox, IconZap, IconGrip, IconTerminal, IconFileText, IconMenu, IconX.
