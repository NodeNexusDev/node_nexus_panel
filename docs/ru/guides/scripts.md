---
title: Скрипты
status: stable
translation_key: guides.scripts
source_revision: 2026-09-09
---

# Скрипты

Создание и управление переиспользуемыми скриптами.

## Список скриптов

Просмотр всех скриптов с `Поиск` по имени/описанию, `Фильтр` по `тегам`, `Сортировка` по имени/тегам, `Infinite` 20. Без per-row кнопок — клик → `ScriptDrawer` Variant C `800px`. Массовая панель для выбранных: `Запустить (кол-во)` → `BulkRunScriptsOnNodesModal` `script_ids+node_ids` `M×N`, `Клонировать`, `Удалить` с `207`.

## Создание скриптов

Модалка `Создать скрипт`: `название`, `описание`, `теги` (`^[a-z0-9_-]{1,30}$`), `шаги` (`название/тип inline требует command / command требует command_id` via `superRefine`, `on_failure`). `POST /scripts/` `BulkResult`.

## Drawer скрипта (Variant C)

7 вкладок: `обзор` (описание, создано/обновлено), `шаги` (список `название тип on_failure` + `command`/`command_id`), `запуски` (`useInfiniteScriptExecutions` 10 + `InfiniteScroll`), `расписание` (`useScriptSchedule` `cron`/`timezone` + `useInfiniteScriptScheduleHistory` 5), `статистика` (`GET /scripts/{id}/stats` + `StatsGrid`), `запустить` (поиск чекбокс нод `выбрано` + `POST /scripts/executions` `M×N` per-step), `редактировать` (локальные `formValues` + превью шагов, подсказка `Edit steps in full page`).

Шапка: `Клонировать`, `Удалить`. Без `Просмотр`.
