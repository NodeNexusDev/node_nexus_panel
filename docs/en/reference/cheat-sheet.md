---
title: Cheat Sheet
status: stable
translation_key: reference.cheat_sheet
source_revision: 2026-08-16
---

# Cheat Sheet

## Development

```bash
npm run dev          # Start dev server
npm run build        # Typecheck + build
npm run lint         # Run linter
npm run preview      # Preview build
```

## Git

```bash
git checkout -b feature/name  # Create feature branch
git add . && git commit -m "feat(scope): description"
git push origin feature/name
```

## API Calls

```typescript
import { api } from '@/api/client';

const data = await api.get('/nodes');
const result = await api.post('/commands', { nodeId, command });
```
