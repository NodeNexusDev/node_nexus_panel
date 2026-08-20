---
title: Docker
status: stable
translation_key: guides.docker
source_revision: 2026-08-20
---

# Docker

Manage Docker resources on connected nodes.

## Overview

The Docker page provides a unified interface for managing containers, images, networks, and volumes across all Docker-connected nodes.

## Node Selector

Select which Docker node to manage from the dropdown at the top of the page. Only nodes with Docker connection type appear in the list.

## Containers

View and manage all containers on the selected node.

### Features

- **Real-time updates** via SSE — container status updates automatically
- **Search** by container name or image
- **Filter** by status (running, stopped, paused)
- **Expandable rows** — click a container to see details

### Container Actions

- **Start** / **Stop** / **Restart** — lifecycle management
- **Remove** — delete container (with confirmation)
- **Inspect** — view full container configuration as JSON
- **Exec** — open an interactive terminal session inside the container

### Container Details

Expand a container row to see:

- **Inspect** — full JSON output of `docker inspect`
- **Logs** — container stdout/stderr logs
- **Exec** — interactive terminal with command history

## Images

View and manage Docker images on the selected node.

### Features

- **Pull images** — enter image name and optional timeout
- **Remove images** — delete unused images
- **Image details** — size, creation date, tags

## Networks

View and manage Docker networks.

### Features

- **List networks** — driver, scope, attached containers
- **Remove networks** — delete unused networks (with confirmation)

## Volumes

View and manage Docker volumes.

### Features

- **List volumes** — name, driver, mount point, creation time
- **Remove volumes** — delete unused volumes (with confirmation)

## Docker Connection

To use Docker management, nodes must be configured with:

- **Connection Type:** Docker
- **Docker Host:** path to Docker socket (e.g., `/var/run/docker.sock`)

See [Nodes](nodes.md) for instructions on adding Docker-connected nodes.
