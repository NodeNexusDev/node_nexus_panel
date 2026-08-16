---
title: Workflow
status: stable
translation_key: development.workflow
source_revision: 2026-08-16
---

# Workflow

## Ветки

- `main` — продакшн
- `dev` — разработка
- `feature/*` — ветки фич

## Коммиты

Следуйте [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): описание

type: feat | fix | docs | refactor | test | chore | perf | ci | build
scope: components | pages | hooks | utils | api | styles | config
```

## Pull Request'ы

1. Создайте ветку фичи из `dev`
2. Внесите изменения
3. Запустите `npm run lint` и `npm run build`
4. Откройте PR в `dev`
5. Мержьте после прохождения CI
