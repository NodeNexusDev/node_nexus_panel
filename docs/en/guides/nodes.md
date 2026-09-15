---
title: Nodes
status: stable
translation_key: guides.nodes
source_revision: 2026-09-09
---

# Nodes

Manage and monitor your connected nodes.

## Node List

View all registered nodes with their status, tags, and system info. Features:

- **Search** by name or host (debounced 300ms)
- **Filter** by status (active, unreachable, error)
- **Filter** by tags (single tag server-side, `multi-tag` shows `Multi-tag filter shows only loaded pages` hint)
- **Sort** by name, host, status, tags, has_docker, created_at
- **Favorites** — star nodes for quick access
- **Docker column** — badge `docker` if `has_docker`
- **Bulk bar** — select via checkbox, `{{count}} selected` (plural `one/few/many`), actions: `Check`, `Metrics`, `Update`, `Validate`, `Delete`, `Run Commands`, `Run Scripts` (no `Bulk` prefix)
- **No per-row buttons** — click row to open Drawer (as in Commands/Scripts)

## Adding Nodes

1. Click "Add Node" button
2. Fill in the form:
   - **Name** — display name
   - **Host** — IP address or hostname
   - **Port** — SSH port (default: 22)
   - **Connection Type** — SSH
   - **Username** — SSH username
   - **Password** — SSH password (optional if using key)
   - **SSH Key** — private key content (optional)
   - **Passphrase** — SSH key passphrase (optional)
   - **Docker Host** — Docker socket path
   - **Has Docker** — toggle Docker support
   - **Tags** — comma-separated, `^[a-z0-9_-]{1,30}$`, max 20, deduped lowercase
3. Click "Validate" to test connectivity before saving

## Node Drawer (Variant C)

Click row → side sheet `800px` (`lg` `max-w-4xl w-[min(800px,92vw)]`), `slide-in-right 0.2s`, `backdrop-blur`, `portal` to `body` (escapes `will-change-transform`), focus trap, `body overflow hidden`.

7 tabs:

### Overview

Basic info: name, host:port (copy), description, connection type, status, username (copy), Docker host, has Docker, tags, created/updated. Badges for status variant.

### Metrics

Real-time via `GET /nodes/{id}/metrics` (10s stale): CPU (cores + %), Memory (used/total %), Disk (used/total %), Uptime since, Load average 1m/5m/15m. `Card` + `KeyValueList`.

### Stats

Execution stats `GET /commands/stats?node_id` with `date_from/date_to` inputs, `StatsGrid` total/successRate/avgDuration/failed.

### History

Two infinite lists (limit 5, `InfiniteScroll`): Status History (`active→unreachable` with source) and Command History (`command_fingerprint` mono, `exit_code` badge, `Retry` for failed). Shows `command_fingerprint` (hash) — name resolved via `Command` lookup where available.

### Edit

Inline form: name, host, port, connection_type, description (1000), credentials (username/password/ssh_key/passphrase with `Clear` toggles), Docker (host + has_docker), tags. `Save` → `PATCH /nodes/{id}`.

### Exec (Commands)

Nested `Command/Custom` tabs. `Command` → searchable checkbox list of commands (bulk select, `selected` count, `default params` hint for bulk), `Custom` → input `command` + `timeout`. `Execute` → `POST /commands/executions` `M×N` `command_ids+node_ids` with `207` handling, per-service `BulkResult` `succeeded/failed`. History of custom outputs with `Clear`.

### Script

Similar: searchable scripts, `Run` → `POST /scripts/executions` `M×N`, per-service steps with `ExecutionResult`.

## Node Actions (in Drawer)

- **Check** — `POST /nodes/checks` (bulk) / `POST /nodes/{id}/check`
- **Validate** — inline `Check` badge `success/active` vs `failed`
- **Edit** — via Edit tab
- **Delete** — footer `Delete` → `DELETE /nodes/{id}` with confirm
- **Docker** — `Open Docker` → `/docker?node=:id`
