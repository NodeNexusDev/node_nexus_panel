import { api } from './client'
import type {
  ComposeCreate,
  ComposeUpdate,
  ComposeResponse,
  ComposeConfigResponse,
  ComposePsResponse,
  ComposeImagesResponse,
  ComposeLogsResponse,
  ComposeTopResponse,
  ComposePortResponse,
  ComposeVersionResponse,
  ComposeActionResponse,
  ComposeExecRequest,
  ComposeExecResponse,
  ComposeRunRequest,
  ComposeRunResponse,
  CursorPage_ComposeResponse_,
  ComposeUpRequest,
  ComposeDownRequest,
  ComposeServicesRequest,
  ComposeKillRequest,
  BulkResult_ComposeServiceBulkResult_,
} from './types'

function composeBase(nodeId: string) {
  return `/nodes/${nodeId}/docker/compose/projects`
}

function enc(s: string) {
  return encodeURIComponent(s)
}

export const composeApi = {
  list: (nodeId: string, params?: { cursor?: string | null; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    const qs = query.toString()
    return api.get<CursorPage_ComposeResponse_>(`${composeBase(nodeId)}${qs ? `?${qs}` : ''}`)
  },

  create: (nodeId: string, data: ComposeCreate) =>
    api.post<ComposeResponse>(composeBase(nodeId), data),

  get: (nodeId: string, projectName: string) =>
    api.get<ComposeResponse>(`${composeBase(nodeId)}/${enc(projectName)}`),

  update: (nodeId: string, projectName: string, data: ComposeUpdate) =>
    api.patch<ComposeResponse>(`${composeBase(nodeId)}/${enc(projectName)}`, data),

  remove: (nodeId: string, projectName: string) => api.delete<void>(`${composeBase(nodeId)}/${enc(projectName)}`),

  // ── Actions ─────────────────────────────────────────────────
  builds: (nodeId: string, projectName: string, data: ComposeServicesRequest, params?: { no_cache?: boolean }) => {
    const qs = params?.no_cache ? '?no_cache=true' : ''
    return api.post<BulkResult_ComposeServiceBulkResult_>(`${composeBase(nodeId)}/${enc(projectName)}/builds${qs}`, data)
  },

  config: (nodeId: string, projectName: string) =>
    api.get<ComposeConfigResponse>(`${composeBase(nodeId)}/${enc(projectName)}/config`),

  creates: (nodeId: string, projectName: string, data: ComposeServicesRequest) =>
    api.post<BulkResult_ComposeServiceBulkResult_>(`${composeBase(nodeId)}/${enc(projectName)}/creates`, data),

  downs: (nodeId: string, projectName: string, data: ComposeDownRequest) =>
    api.post<ComposeActionResponse>(`${composeBase(nodeId)}/${enc(projectName)}/downs`, data),

  executions: (nodeId: string, projectName: string, data: ComposeExecRequest) =>
    api.post<ComposeExecResponse>(`${composeBase(nodeId)}/${enc(projectName)}/executions`, data),

  images: (nodeId: string, projectName: string) =>
    api.get<ComposeImagesResponse>(`${composeBase(nodeId)}/${enc(projectName)}/images`),

  kills: (nodeId: string, projectName: string, data: ComposeKillRequest) =>
    api.post<BulkResult_ComposeServiceBulkResult_>(`${composeBase(nodeId)}/${enc(projectName)}/kills`, data),

  logs: (nodeId: string, projectName: string, params?: { tail?: number; since?: string; services?: string }) => {
    const query = new URLSearchParams()
    if (params?.tail != null) query.set('tail', String(params.tail))
    if (params?.since) query.set('since', params.since)
    if (params?.services) query.set('services', params.services)
    const qs = query.toString()
    return api.get<ComposeLogsResponse>(`${composeBase(nodeId)}/${enc(projectName)}/logs${qs ? `?${qs}` : ''}`)
  },

  pauses: (nodeId: string, projectName: string, data: ComposeServicesRequest) =>
    api.post<BulkResult_ComposeServiceBulkResult_>(`${composeBase(nodeId)}/${enc(projectName)}/pauses`, data),

  port: (nodeId: string, projectName: string, params: { service: string; private_port: string }) => {
    const query = new URLSearchParams({ service: params.service, private_port: params.private_port })
    return api.get<ComposePortResponse>(`${composeBase(nodeId)}/${enc(projectName)}/port?${query}`)
  },

  ps: (nodeId: string, projectName: string, params?: { all?: boolean }) => {
    const qs = params?.all ? '?all=true' : ''
    return api.get<ComposePsResponse>(`${composeBase(nodeId)}/${enc(projectName)}/ps${qs}`)
  },

  pulls: (nodeId: string, projectName: string, data: ComposeServicesRequest) =>
    api.post<BulkResult_ComposeServiceBulkResult_>(`${composeBase(nodeId)}/${enc(projectName)}/pulls`, data),

  pushs: (nodeId: string, projectName: string, data: ComposeServicesRequest) =>
    api.post<BulkResult_ComposeServiceBulkResult_>(`${composeBase(nodeId)}/${enc(projectName)}/pushs`, data),

  restarts: (nodeId: string, projectName: string, data: ComposeServicesRequest, params?: { timeout?: number }) => {
    const qs = params?.timeout ? `?timeout=${params.timeout}` : ''
    return api.post<BulkResult_ComposeServiceBulkResult_>(`${composeBase(nodeId)}/${enc(projectName)}/restarts${qs}`, data)
  },

  rms: (nodeId: string, projectName: string, data: ComposeServicesRequest, params?: { volumes?: boolean }) => {
    const qs = params?.volumes ? '?volumes=true' : ''
    return api.post<BulkResult_ComposeServiceBulkResult_>(`${composeBase(nodeId)}/${enc(projectName)}/rms${qs}`, data)
  },

  runs: (nodeId: string, projectName: string, data: ComposeRunRequest) =>
    api.post<ComposeRunResponse>(`${composeBase(nodeId)}/${enc(projectName)}/runs`, data),

  starts: (nodeId: string, projectName: string, data: ComposeServicesRequest) =>
    api.post<BulkResult_ComposeServiceBulkResult_>(`${composeBase(nodeId)}/${enc(projectName)}/starts`, data),

  stops: (nodeId: string, projectName: string, data: ComposeServicesRequest, params?: { timeout?: number }) => {
    const qs = params?.timeout ? `?timeout=${params.timeout}` : ''
    return api.post<BulkResult_ComposeServiceBulkResult_>(`${composeBase(nodeId)}/${enc(projectName)}/stops${qs}`, data)
  },

  top: (nodeId: string, projectName: string, params?: { service?: string }) => {
    const qs = params?.service ? `?service=${params.service}` : ''
    return api.get<ComposeTopResponse>(`${composeBase(nodeId)}/${enc(projectName)}/top${qs}`)
  },

  unpauses: (nodeId: string, projectName: string, data: ComposeServicesRequest) =>
    api.post<BulkResult_ComposeServiceBulkResult_>(`${composeBase(nodeId)}/${enc(projectName)}/unpauses`, data),

  ups: (nodeId: string, projectName: string, data: ComposeUpRequest) =>
    api.post<BulkResult_ComposeServiceBulkResult_>(`${composeBase(nodeId)}/${enc(projectName)}/ups`, data),

  version: (nodeId: string, projectName: string) =>
    api.get<ComposeVersionResponse>(`${composeBase(nodeId)}/${enc(projectName)}/version`),
}
