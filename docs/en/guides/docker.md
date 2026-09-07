---
title: Docker
status: stable
translation_key: guides.docker
source_revision: 2026-09-07
---

# Docker

Manage Docker resources on connected nodes.

## Overview

The Docker page provides a unified interface for managing containers, images, networks, volumes, system and Compose across all Docker-connected nodes. Uses `Drawer Variant C` (`800px` side sheet, `portal` to `body`, `slide-in-right 0.2s`) for details — click row to open drawer, no per-row buttons (as in Nodes).

## Node Selector

Select which Docker node to manage from the dropdown at the top. Only nodes with `has_docker` appear. Synced to URL `?node=:id` and `?tab=containers|images|networks|volumes|system|compose` (shareable, `MainLayout` `64px` headers aligned, versions `Panel v·API v` in main header near `Connected` status).

## Containers

View and manage all containers on the selected node.

### Features

- **Infinite scroll** `20` (`useInfiniteDockerContainers` + `InfiniteScroll` 200px), `Search` by name/image (debounced), `Filter` by status `all/running/stopped`, `Sort` by name/image/status/created
- **No per-row buttons** — click row → `ContainerDrawer` (6 tabs). Bulk bar above table for selected: `RestartAll/StartAll/StopAll/BulkRemove/BulkExec/BulkInspect/BulkLogs/BulkStats` with `207` per-container `BulkResult`
- **No zebra** — plain `w-full` + `table-row-hover` `transition:none` instant, `hover 6%/10%`

### Container Drawer (Variant C)

6 tabs: `overview` (ID/Name/Image/Status/Ports/Created + copy), `logs` (tail/since + `ContainerLogsContent`), `stats` (CPU/Mem/Net/Block via `useDockerContainerStats` 5s poll), `exec` (`sh` default, `ExecContainerContent`), `inspect` (`ContainerInspectContent` + NetworkSettings JSON), `top` (`TopContainerContent`). Header actions: `Start/Stop/Restart/Pause/Unpause/Kill (SIGTERM)/Port/Update (memory/cpus)/Wait/Rename/Delete` (per-container, `207` aware). Close via `Esc`/`backdrop`.

## Images

View and manage Docker images.

### Features

- **Infinite** `20` + `Search` + `Sort` by repository/tag/size/created, click row → `ImageDrawer` (no per-row buttons)
- **Bulk** `Remove` (single `bulkImageRemovals {image_ids}` with `207`), `Build`/`Pull` via bulk modals

### Image Drawer

3 tabs: `overview` (ID/Repo/Tag/Size/Created), `inspect` (`ImageInspectContent` + `formatBytes`), `history` (`useImageHistory` layers). Actions: `Tag` (`repo:tag` → `POST /images/{id}/tag`), `Push` (`pushImage`/`pushImageById`), `Delete`.

## Networks

View and manage Docker networks.

### Features

- **Infinite** + `Search` + `Sort` by name/driver/scope, `Bulk Remove` (`bulkNetworkRemovals`), `Prune` (`POST /networks/prune`), click row → `NetworkDrawer`

### Network Drawer

3 tabs: `overview` (ID/Name/Driver/Scope), `inspect` (`NetworkInspectContent` + containers JSON), `containers` (Connect/Disconnect `container_id` → `POST /networks/{id}/connect/disconnect`). Delete via drawer.

## Volumes

View and manage Docker volumes.

### Features

- **Infinite** + `Search` + `Sort` by name/driver, `Bulk Remove` (`bulkVolumeRemovals`), `Prune`, click row → `VolumeDrawer`

### Volume Drawer

2 tabs: `overview` (Name/Driver), `inspect` (`VolumeInspectContent` mountpoint + labels). Delete.

## System

Read-only `SystemTab`: `GET /system/info` (server_version, os, arch, cpus, memory, storage_driver, running/stopped/images) in 3-col grid + `GET /system/df` disk usage table (type/total/active/reclaimable). **New:** `GET /system/version` badge + `Prune` buttons `system/networks/images/volumes/containers` with confirm modals.

## Compose

Manage Compose stacks per node (`useInfiniteComposeProjects` 20 + `Search` + `Bulk`).

### Compose Drawer (Variant C)

8 tabs: `overview` (compose YAML), `ps` (`GET /ps`), `logs` (`GET /logs`), `config` (`GET /config`), `images` (`GET /images`), `top` (`GET /top`), `version` (`GET /version`), `port` (`GET /port?service&port`). Header actions: `Up` (with `services` filter `comma` + `Pull`/`Build` checkboxes → `POST /ups {build,pull,services}` `BulkResult` per-service `207`), `Down` (`volumes`/`orphans` → `POST /downs {volumes,remove_orphans}`), `Restart` (`POST /restarts {services}`), `Edit` (textarea + `PATCH /{projectName}`), `Delete`. Result `BulkResult_ComposeServiceBulkResult_` shown per-service `service/status/output/error` with `succeeded/failed` counters.

## Docker Connection

To use Docker management, nodes must be configured with:

- **Connection Type:** SSH
- **Has Docker:** true
- **Docker Host:** path to Docker socket (e.g., `/var/run/docker.sock`)

See [Nodes](nodes.md) for instructions on adding Docker-connected nodes.
