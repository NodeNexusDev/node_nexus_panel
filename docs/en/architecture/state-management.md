---
title: State Management
status: stable
translation_key: architecture.state_management
source_revision: 2026-08-16
---

# State Management

## Approach

The panel uses React's built-in state management:

- **Local state:** `useState` for component-specific state
- **Shared state:** Context API for cross-component state
- **Server state:** Custom hooks with API integration

## Patterns

- Lift state up when needed
- Prefer composition over prop drilling
- Use custom hooks for reusable logic
