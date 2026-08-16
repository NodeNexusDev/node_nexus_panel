---
title: Документация
status: stable
translation_key: development.documentation
source_revision: 2026-08-16
---

# Документация

## Вклад

1. Создавайте или редактируйте файлы в `docs/en/` или `docs/ru/`
2. Следуйте формату front-matter
3. Обеспечивайте паритет локалей (EN ↔ RU)
4. Запускайте `check_docs.py` для валидации

## Формат front-matter

```yaml
---
title: "Название страницы"
status: stable
translation_key: unique.key.name
source_revision: YYYY-MM-DD
---
```

## Значения статуса

- `stable` — опубликовано, поддерживается
- `draft` — в разработке
- `deprecated` — запланировано к удалению
