---
title: Documentation
status: stable
translation_key: development.documentation
source_revision: 2026-08-16
---

# Documentation

## Contributing

1. Create or edit files in `docs/en/` or `docs/ru/`
2. Follow the front-matter format
3. Ensure locale parity (EN ↔ RU)
4. Run `check_docs.py` to validate

## Front-matter Format

```yaml
---
title: "Page Title"
status: stable
translation_key: unique.key.name
source_revision: YYYY-MM-DD
---
```

## Status Values

- `stable` — published, maintained
- `draft` — work in progress
- `deprecated` — scheduled for removal
