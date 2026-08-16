---
title: Workflow
status: stable
translation_key: development.workflow
source_revision: 2026-08-16
---

# Workflow

## Branches

- `main` — production
- `dev` — development
- `feature/*` — feature branches

## Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

type: feat | fix | docs | refactor | test | chore | perf | ci | build
scope: components | pages | hooks | utils | api | styles | config
```

## Pull Requests

1. Create feature branch from `dev`
2. Make changes
3. Run `npm run lint` and `npm run build`
4. Open PR to `dev`
5. Merge after CI passes
