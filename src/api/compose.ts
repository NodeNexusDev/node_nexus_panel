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
} from './types'

function composeBase(nodeId: string) {
  return `/nodes/${nodeId}/docker/compose/projects`
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
    api.get<ComposeResponse>(`${composeBase(nodeId)}/${projectName}`),

  update: (nodeId: string, projectName: string, data: ComposeUpdate) =>
    api.patch<ComposeResponse>(`${composeBase(nodeId)}/${projectName}`, data),

  remove: (nodeId: string, projectName: string) => api.delete<void>(`${composeBase(nodeId)}/${projectName}`),

  // ── Actions ─────────────────────────────────────────────────
  builds: (nodeId: string, projectName: string, params?: { no_cache?: boolean }) => {
    const qs = params?.no_cache ? '?no_cache=true' : ''
    return api.post<ComposeActionResponse>(`${composeBase(nodeId)}/${projectName}/builds${qs}`)
  },

  config: (nodeId: string, projectName: string) =>
    api.get<ComposeConfigResponse>(`${composeBase(nodeId)}/${projectName}/config`),

  creates: (nodeId: string, projectName: string) =>
    api.post<ComposeActionResponse>(`${composeBase(nodeId)}/${projectName}/creates`),

  downs: (nodeId: string, projectName: string) =>
    api.post<ComposeActionResponse>(`${composeBase(nodeId)}/${projectName}/downs`),

  executions: (nodeId: string, projectName: string, data: ComposeExecRequest) =>
    api.post<ComposeExecResponse>(`${composeBase(nodeId)}/${projectName}/executions`, data),

  images: (nodeId: string, projectName: string) =>
    api.get<ComposeImagesResponse>(`${composeBase(nodeId)}/${projectName}/images`),

  kills: (nodeId: string, projectName: string) =>
    api.post<ComposeActionResponse>(`${composeBase(nodeId)}/${projectName}/kills`),

  logs: (nodeId: string, projectName: string, params?: { tail?: number; since?: string; services?: string }) => {
    const query = new URLSearchParams()
    if (params?.tail != null) query.set('tail', String(params.tail))
    if (params?.since) query.set('since', params.since)
    if (params?.services) query.set('services', params.services)
    const qs = query.toString()
    return api.get<ComposeLogsResponse>(`${composeBase(nodeId)}/${projectName}/logs${qs ? `?${qs}` : ''}`)
  },

  pauses: (nodeId: string, projectName: string) =>
    api.post<ComposeActionResponse>(`${composeBase(nodeId)}/${projectName}/pauses`),

  port: (nodeId: string, projectName: string, params: { service: string; private_port: string }) => {
    const query = new URLSearchParams({ service: params.service, private_port: params.private_port })
    return api.get<ComposePortResponse>(`${composeBase(nodeId)}/${projectName}/port?${query}`)
  },

  ps: (nodeId: string, projectName: string, params?: { all?: boolean }) => {
    const qs = params?.all ? '?all=true' : ''
    return api.get<ComposePsResponse>(`${composeBase(nodeId)}/${projectName}/ps${qs}`)
  },

  pulls: (nodeId: string, projectName: string) =>
    api.post<ComposeActionResponse>(`${composeBase(nodeId)}/${projectName}/pulls`),

  pushs: (nodeId: string, projectName: string) =>
    api.post<ComposeActionResponse>(`${composeBase(nodeId)}/${projectName}/pushs`),

  restarts: (nodeId: string, projectName: string, params?: { timeout?: number }) => {
    const qs = params?.timeout ? `?timeout=${params.timeout}` : ''
    return api.post<ComposeActionResponse>(`${composeBase(nodeId)}/${projectName}/restarts${qs}`)
  },

  rms: (nodeId: string, projectName: string, params?: { volumes?: boolean }) => {
    const qs = params?.volumes ? '?volumes=true' : ''
    return api.post<ComposeActionResponse>(`${composeBase(nodeId)}/${projectName}/rms${qs}`)
  },

  runs: (nodeId: string, projectName: string, data: ComposeRunRequest) =>
    api.post<ComposeRunResponse>(`${composeBase(nodeId)}/${projectName}/runs`, data),

  starts: (nodeId: string, projectName: string) =>
    api.post<ComposeActionResponse>(`${composeBase(nodeId)}/${projectName}/starts`),

  stops: (nodeId: string, projectName: string, params?: { timeout?: number }) => {
    const qs = params?.timeout ? `?timeout=${params.timeout}` : ''
    return api.post<ComposeActionResponse>(`${composeBase(nodeId)}/${projectName}/stops${qs}`)
  },

  top: (nodeId: string, projectName: string, params?: { service?: string }) => {
    const qs = params?.service ? `?service=${params.service}` : ''
    return api.get<ComposeTopResponse>(`${composeBase(nodeId)}/${projectName}/top${qs}`)
  },

  unpauses: (nodeId: string, projectName: string) =>
    api.post<ComposeActionResponse>(`${composeBase(nodeId)}/${projectName}/unpauses`),

  ups: (nodeId: string, projectName: string) =>
    api.post<ComposeActionResponse>(`${composeBase(nodeId)}/${projectName}/ups`),

  version: (nodeId: string, projectName: string) =>
    api.get<ComposeVersionResponse>(`${composeBase(nodeId)}/${projectName}/version`),
}
