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
  components/    # Reusable UI components
  pages/         # Route-level components
  hooks/         # Custom React hooks
  utils/         # Utility functions
  api/           # API client
  assets/        # Static assets
```

## Conventions

- Use TypeScript for all components
- Prefer functional components with hooks
- Keep components small and focused
- Co-locate styles with components using Tailwind
