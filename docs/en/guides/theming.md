---
title: Theming
status: stable
translation_key: guides.theming
source_revision: 2026-08-16
---

# Theming

## Overview

The panel supports three theme modes: dark, light, and system (auto-detect).

## Architecture

- Theme state is managed in `src/stores/ui-store.ts` (Zustand)
- Theme preference is persisted to localStorage
- Applied via CSS classes on `<html>` element
- Theme colors defined in `src/styles/theme.ts`

## Usage

### Toggle Theme

```tsx
import { useUiStore } from './stores/ui-store'

const { theme, setTheme } = useUiStore()
setTheme('light') // 'dark' | 'light' | 'system'
```

### ThemeToggle Component

```tsx
import { ThemeToggle } from './components/layout/ThemeToggle'

<ThemeToggle /> // Cycles through dark → light → system
```

## Color Palette

### Dark Theme

| Token | Value |
|-------|-------|
| bg-primary | `#030712` |
| bg-secondary | `#111827` |
| bg-tertiary | `#1f2937` |
| text-primary | `#f9fafb` |
| text-secondary | `#9ca3af` |
| border | `#1f2937` |
| accent | `#4f46e5` |

### Light Theme

| Token | Value |
|-------|-------|
| bg-primary | `#ffffff` |
| bg-secondary | `#f9fafb` |
| bg-tertiary | `#f3f4f6` |
| text-primary | `#111827` |
| text-secondary | `#6b7280` |
| border | `#e5e7eb` |
| accent | `#4f46e5` |

## Adding a New Theme

1. Add theme colors to `src/styles/theme.ts`
2. Add theme option to the `Theme` type in `src/stores/ui-store.ts`
3. Update `applyTheme()` function to handle the new theme
