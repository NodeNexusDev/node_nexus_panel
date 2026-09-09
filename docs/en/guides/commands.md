---
title: Commands
status: stable
translation_key: guides.commands
source_revision: 2026-09-09
---

# Commands

Execute commands on remote nodes.

## Command List

View all command templates with `Search` by name/command, `Filter` by `tags` (single server-side, `multi-tag` hint), `Sort` by name/command/tags, `Infinite` 20. No per-row buttons — click row → `CommandDrawer` Variant C `800px`. `Bulk` bar for selected: `Execute (count)` → `BulkRunCommandsModal` `command_ids+node_ids` `M×N`, `Clone`, `Delete` with `207` per-command `BulkResult`.

## Creating Commands

`Create Command` modal: `name`, `command` (`df -h`), `description`, `tags` (`^[a-z0-9_-]{1,30}$` max 20), `parameters` (`name/type/required/default` via `ParameterEditor`). `POST /commands/` `BulkResult`.

## Command Drawer (Variant C)

Click row → side sheet `800px` `slide-in-right 0.2s` `portal`:

5 tabs: `overview` (command `pre` + copy, description, created/updated), `params` (list `name type required` badges), `stats` (`GET /commands/{id}/stats` with `date_from/date_to` + `StatsGrid`), `exec` (node searchable checkbox list `selected` + `params` `CommandParamInputs` → `POST /commands/executions` `M×N` with `207` per-node `BulkResult`, single `Exec` vs bulk), `edit` (`react-hook-form` `commandUpdateSchema` + `normalizeParameters`).

Header: `Clone`, `Delete` (confirm). No `View` page — detail routes removed (`App.tsx`).
