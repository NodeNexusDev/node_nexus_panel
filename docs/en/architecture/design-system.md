---
title: Design System
status: stable
translation_key: architecture.design_system
source_revision: 2026-09-09
---

# Design System

## Styling

TailwindCSS 4 for utility-first styling. Configuration via `@theme` in `src/index.css` (`--header-height: 64px`, `--color-*`, `--radius-*`, `--shadow-*`). `Card` hover `0.15s`, `spring 0.35s`, `stagger 20ms`, `table-row-hover` `transition: none` instant, `scrollbar-none` for Tabs.

## Components

Reusable components in `src/components/ui/`:

### Layout & Navigation
- **PageHeader** — page title with breadcrumbs and action buttons
- **Tabs** — tab navigation (`scroll-smooth snap-x`, `transition-none` instant hover, `keyboard Arrow/Home/End`)
- **InfiniteScroll** — cursor-based infinite scroll with IntersectionObserver (`rootMargin 200px`)
- **Breadcrumb** — breadcrumb navigation

### Data Display
- **Badge** — status badges (success, warning, danger, info, default)
- **TagBadge** — tag badge with remove button
- **StatCard** — dashboard stat card with trend indicator
- **KeyValueList** — key-value pair display
- **ResponsiveTable** — typed tables `w-full` `table-row-hover` instant (`transition:none`, `hover 6%/10%`), sticky headers, no zebra, `onRowClick → Drawer`
- **SortableHeader** — sortable column headers

### Charts
- **MetricsChart** — SVG bar/area chart with tooltips, legends, and date presets

### Forms
- **Input** — form input with label and error state
- **DropdownMenu** — dropdown menu with items
- **FilterBar** — filter controls bar
- **SearchInput** — debounced search input (300ms)
- **NodeSelect** — node selector dropdown
- **ModalFooter** — modal action buttons (cancel/confirm)

### Feedback
- **Toast** — notification system with progress bar
- **ConfirmDialog** — wraps Modal for confirmations
- **EmptyState** — empty state placeholder with icon
- **ErrorState** — error state with retry (shows `request_id` + `detail` array)
- **ErrorPage** — full-page error display
- **Skeleton** — shimmer loading (StatCardSkeleton, TableSkeleton, CardListSkeleton, FormSkeleton)
- **Spinner** — inline loading indicator

### Overlay
- **Modal** — `portal` to `body` (`createPortal`), `backdrop-blur`, `spring 0.35s`
- **Drawer** — Variant C side sheet `800px` (`lg` `max-w-4xl w-[min(800px,92vw)]`), `slide-in-right 0.2s`, `portal` to `body`, `backdrop-blur`, focus trap `Tab`/`Esc`, `body overflow hidden` (`openDrawerCount`), `Tabs` inside
- **Tooltip** — CSS hover tooltips (top/bottom)
- **CommandPalette** — Ctrl+K command palette

### Utility
- **ErrorBoundary** — React error boundary (DEV `console.error` guard)
- **FavoriteButton** — star toggle for favorites
- **Typewriter** — animated text reveal
- **Icons** — monochrome SVG icon system

## Theme

CSS custom properties in `src/index.css` with light/dark mode via `.dark` class (`--header-height: 64px` equal headers, versions `Panel v·API v` in main header near `Connected`).

## Icons

Monochrome SVG icons in `src/components/ui/Icons.tsx`. All icons use `currentColor` for inheritable coloring. Import specific icons:

```tsx
import { IconDashboard, IconNodes, IconCommands } from '../components/ui/Icons'

<IconDashboard className="w-5 h-5" />
```

Available icons: IconDashboard, IconNodes, IconCommands, IconScripts, IconSettings, IconGlobe, IconLogout, IconMoon, IconSun, IconLaptop, IconSearch, IconWarning, IconRocket, IconCheckCircle, IconXCircle, IconBox, IconZap, IconGrip, IconTerminal, IconFileText, IconMenu, IconX.
