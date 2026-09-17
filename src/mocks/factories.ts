import type {
  BulkResult_ComposeServiceBulkResult_,
  BulkResult_ContainerBulkResult_,
  BulkResult_PackInstallResult_,
  CommandResponse,
  ComposeServiceBulkResult,
  ContainerBulkResult,
  CursorPage_CommandResponse_,
  CursorPage_ContainerBulkResult_,
  NodeResponse,
  PackInstallResult,
  PackResponse,
  RegistryResponse,
  ScriptResponse,
} from '../api/types'

let seq = 0
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`

export function bulkResult<T extends { status: string }>(
  items: Array<Partial<T> & { status: 'success' | 'error' }>,
): { total: number; succeeded: number; failed: number; results: T[] } {
  const results = items as T[]
  const succeeded = results.filter((r) => r.status === 'success').length
  return { total: results.length, succeeded, failed: results.length - succeeded, results }
}

export function installResults(
  names: string[],
  status: 'success' | 'error' = 'success',
): BulkResult_PackInstallResult_ {
  return bulkResult<PackInstallResult>(
    names.map((name) => ({ entity_type: 'command', entity_id: uid('ent'), name, status })),
  )
}

export function containerBulkResults(
  ids: string[],
  status: 'success' | 'error' = 'success',
): BulkResult_ContainerBulkResult_ {
  return bulkResult<ContainerBulkResult>(
    ids.map((container_id) => ({ container_id, status })),
  )
}

export function composeBulkResults(
  services: string[],
  status: 'success' | 'error' = 'success',
): BulkResult_ComposeServiceBulkResult_ {
  return bulkResult<ComposeServiceBulkResult>(
    services.map((service) => ({ service, status })),
  )
}

export function commandResponse(overrides: Partial<CommandResponse> = {}): CommandResponse {
  return {
    id: uid('cmd'),
    name: 'mock-command',
    description: null,
    command: 'echo hi',
    parameters: [],
    tags: [],
    timeout: 60,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function commandPage(
  items: CommandResponse[],
): CursorPage_CommandResponse_ {
  return { items, limit: 20, next_cursor: null, has_more: false }
}

export function nodeResponse(overrides: Partial<NodeResponse> = {}): NodeResponse {
  return {
    id: uid('node'),
    name: 'mock-node',
    host: '192.0.2.10',
    port: 22,
    connection_type: 'ssh',
    status: 'active',
    username: 'ops',
    docker_host: null,
    has_docker: false,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function scriptResponse(overrides: Partial<ScriptResponse> = {}): ScriptResponse {
  return {
    id: uid('scr'),
    name: 'mock-script',
    description: null,
    steps: [],
    tags: [],
    timeout: 60,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function packResponse(overrides: Partial<PackResponse> = {}): PackResponse {
  return {
    id: uid('pack'),
    registry_id: null,
    pack_id: 'mock-pack',
    name: 'Mock Pack',
    description: null,
    version: '1.0.0',
    author: null,
    tags: [],
    manifest_sha: null,
    readme: null,
    installed_version: null,
    installed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function registryResponse(
  overrides: Partial<RegistryResponse> = {},
): RegistryResponse {
  return {
    id: uid('reg'),
    owner: 'mock-org',
    name: 'mock-repo',
    default_branch: 'main',
    last_synced_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function problemJson(code: string, message: string, status = 422) {
  const slug = code
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
  return {
    type: `https://nodenexusdev.github.io/node_nexus_api/en/errors/${slug}`,
    title: `HTTP ${status}`,
    status,
    detail: message,
    code,
    message,
    request_id: uid('req'),
  }
}

export function containerBulkPage(
  items: ContainerBulkResult[],
): CursorPage_ContainerBulkResult_ {
  return { items, limit: 20, next_cursor: null, has_more: false }
}
