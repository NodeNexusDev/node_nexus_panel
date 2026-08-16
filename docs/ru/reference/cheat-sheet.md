---
title: Шпаргалка
status: stable
translation_key: reference.cheat_sheet
source_revision: 2026-08-16
---

# Шпаргалка

## Разработка

```bash
npm run dev          # Запуск сервера разработки
npm run build        # Typecheck + сборка
npm run lint         # Запуск линтера
npm run preview      # Предпросмотр сборки
```

## Git

```bash
git checkout -b feature/name  # Создание ветки фичи
git add . && git commit -m "feat(scope): описание"
git push origin feature/name
```

## API вызовы

```typescript
import { api } from '@/api/client';

const data = await api.get('/nodes');
const result = await api.post('/commands', { nodeId, command });
```
