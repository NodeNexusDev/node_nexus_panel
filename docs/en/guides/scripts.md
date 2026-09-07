---
title: Scripts
status: stable
translation_key: guides.scripts
source_revision: 2026-09-07
---

# Scripts

Create and manage reusable scripts.

## Script List

View all scripts with `Search` by name/description, `Filter` by `tags`, `Sort` by name/tags, `Infinite` 20. No per-row buttons — click row → `ScriptDrawer` Variant C `800px`. Bulk bar for selected: `Run (count)` → `BulkRunScriptsOnNodesModal` `script_ids+node_ids` `M×N`, `Clone`, `Delete` with `207`.

## Creating Scripts

`Create Script` modal: `name`, `description`, `tags` (`^[a-z0-9_-]{1,30}$`), `steps` (label/type `inline` requires `command` / `command` requires `command_id` via `superRefine`, `on_failure` `stop/continue`). `POST /scripts/` `BulkResult`.

## Script Drawer (Variant C)

7 tabs: `overview` (description, created/updated), `steps` (list `label type on_failure` + `command`/`command_id`), `executions` (`useInfiniteScriptExecutions` 10 + `InfiniteScroll`), `schedule` (`useScriptSchedule` `cron`/`timezone` + `useInfiniteScriptScheduleHistory` 5), `stats` (`GET /scripts/{id}/stats` + `StatsGrid`), `run` (node searchable checklist `selected` + `POST /scripts/executions` `M×N` per-step `ExecutionResult`), `edit` (local `formValues` + steps preview, hint `Edit steps in full page`).

Header: `Clone`, `Delete`. No `View` page.
