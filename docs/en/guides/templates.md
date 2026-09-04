---
title: Templates
status: stable
translation_key: guides.templates
source_revision: 2026-08-20
---

# Templates

Browse, install and manage template packs and registries.

## Overview

Templates page (`/templates`) provides packs (collections of commands/scripts) and registries (GitHub sources).

## Packs

- **List** with cursor pagination (`InfiniteScroll`), filters `search/tag/installed/registry_id`, stats badges `total/installed/not_installed`.
- **Actions**: Install (`?on_conflict=fail|rename`), Uninstall, Update, View detail, Download archive (`GET /packs/{id}/archive` as `application/x-tar`).
- **Detail modal**: description, tags, version, author, assets, installations (`GET /packs/{id}/installations`), download.

### Create Pack

`POST /templates/packs` with `PackLocalCreateRequest {manifest{pack_id,name,version}, commands[], scripts[], assets[]}`.

## Registries

- **List** cursor pagination, search client-side.
- **Create** `POST /registries` `{owner,name,default_branch,github_token?}`.
- **Sync** `POST /registries/{id}/syncs` returns `RegistrySyncResult {total,succeeded,failed,results}`.
- **Delete** `DELETE /registries/{id}`.

## API

All under `/api/v2/templates/*` — see `src/api/templates.ts`.
