---
title: Dashboard
status: stable
translation_key: guides.dashboard
source_revision: 2026-08-20
---

# Dashboard

The dashboard provides an overview of your nodes and system health.

## Features

### Stat Cards

Five stat cards with trend indicators:

| Card | Description |
|------|-------------|
| Total Nodes | Total registered nodes |
| Online | Currently active nodes |
| Offline | Unreachable nodes |
| Total Commands | Total command executions |
| Docker Containers | Running and stopped containers |

### Favorites

Quick access to favorited nodes, commands, and scripts. Toggle favorites with the star button on any entity.

### Metrics

Interactive charts for command and script execution metrics:

- **Chart types:** Bar and area charts via `MetricsChart` component
- **Date presets:** 7d, 30d, 90d, All
- **Group by:** Day, Week, Month
- **Trend indicators:** Percentage change compared to previous period

### Quick Actions

Four quick action cards:

- **Execute Command** — navigate to commands page
- **Add Node** — navigate to nodes page
- **Run Script** — navigate to scripts page
- **View Logs** — navigate to audit log

### Recent Nodes

List of recently seen nodes with status badges.

### Recent Activity

Feed of recent actions across the system (command executions, script runs, node status changes).

## Visual Effects

- Animated particle background with floating dots
- Dot grid overlay pattern
- Gradient orbs (indigo/purple) with float animation
- Glassmorphism on sidebar and header

## Layout

The dashboard is rendered inside the `MainLayout` which provides:
- **Sidebar** (left): Logo and navigation links only
- **Header** (top): Language switcher (RU/EN), theme toggle, SSE connection status, command palette trigger (Ctrl+K), user avatar with name/email, and logout button
