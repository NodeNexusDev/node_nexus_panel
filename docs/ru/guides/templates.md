---
title: Шаблоны
status: stable
translation_key: guides.templates
source_revision: 2026-08-20
---

# Шаблоны

Просмотр, установка и управление пакетами шаблонов и реестрами.

## Обзор

Страница шаблонов (`/templates`) — паки (наборы команд/скриптов) и реестры (источники GitHub).

## Паки

- **Список** курсор-пагинация (`InfiniteScroll`), фильтры `search/tag/installed/registry_id`, бейджи `total/installed/not_installed`.
- **Действия**: Install (`?on_conflict=fail|rename`), Uninstall, Update, просмотр, скачивание архива (`GET /packs/{id}/archive` `application/x-tar`).
- **Деталь**: описание, теги, версия, автор, ресурсы, установки (`GET /packs/{id}/installations`), скачивание.

### Создание пака

`POST /templates/packs` с `PackLocalCreateRequest {manifest{pack_id,name,version}, commands[], scripts[], assets[]}`.

## Реестры

- **Список** курсор-пагинация, поиск на клиенте.
- **Создание** `POST /registries` `{owner,name,default_branch,github_token?}`.
- **Синк** `POST /registries/{id}/syncs` → `RegistrySyncResult {total,succeeded,failed,results}`.
- **Удаление** `DELETE /registries/{id}`.

## API

Всё под `/api/v2/templates/*` — см. `src/api/templates.ts`.
