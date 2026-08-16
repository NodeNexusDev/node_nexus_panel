---
title: Local Setup
status: stable
translation_key: development.local_setup
source_revision: 2026-08-16
---

# Local Setup

## Prerequisites

- Node.js 22+
- npm 10+

## Setup

```bash
git clone https://github.com/NodeNexusDev/node_nexus_panel.git
cd node_nexus_panel
npm install
```

## Development Server

```bash
npm run dev
```

Opens at `http://localhost:5173`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Typecheck + build |
| `npm run lint` | Run oxlint |
| `npm run preview` | Preview build |
