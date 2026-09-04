---
title: Nodes
status: stable
translation_key: guides.nodes
source_revision: 2026-08-20
---

# Nodes

Manage and monitor your connected nodes.

## Node List

View all registered nodes with their status, tags, and system info. Features:

- **Search** by name or host
- **Filter** by status (active, unreachable, offline)
- **Filter** by tags
- **Bulk operations** — select multiple nodes for bulk delete, bulk check, or bulk tag management
- **Favorites** — star nodes for quick access

## Adding Nodes

1. Click "Add Node" button
2. Fill in the form:
   - **Name** — display name
   - **Host** — IP address or hostname
   - **Port** — SSH port (default: 22)
   - **Connection Type** — SSH, Docker, or Proxmox
   - **Username** — SSH username
   - **Password** — SSH password (optional if using key)
   - **SSH Key** — private key content (optional)
   - **Passphrase** — SSH key passphrase (optional)
   - **Docker Host** — Docker socket path (for Docker connections)
   - **Tags** — comma-separated tags
3. Click "Validate" to test connectivity before saving

## Node Detail Tabs

Each node has 6 tabs:

### Overview

Basic node information: name, host, connection type, status, tags, and quick actions (edit, delete, check).

### Metrics

Real-time system metrics:

- **CPU** — usage percentage and core count
- **Memory** — total, used, and percentage
- **Disk** — total, used, and percentage
- **Uptime** — since when the node has been up

### Stats

Execution statistics with charts showing command and script execution counts over time.

### Status History

Timeline of status changes (active → unreachable → active) with timestamps and sources.

### Command History

List of commands executed on this node with:

- Command text
- Exit code
- Execution time
- Stdout/stderr output
- Retry option for failed commands

### Tags

Manage node tags individually:

- Add tags via input field
- Remove tags with one click
- Tags are used for filtering and bulk operations

## Node Actions

- **Check** — trigger a health check
- **Edit** — modify node configuration
- **Delete** — remove the node
- **Execute** — run an ad-hoc command
