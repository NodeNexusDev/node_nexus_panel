import { api } from './client'
import type {
  ScriptResponse,
  ScriptCreate,
  ScriptUpdate,
  ScriptBulkCreateRequest,
  ScriptBulkCreateResult,
  ScriptExecutionsRequest,
  ExecutionCancelsRequest,
  ExecutionRetriesRequest,
  BulkCancelScriptResult,
  BulkRetryScriptResult,
  BulkResult,
  BulkScriptExecutionBatchResponse,
  CursorPage_ScriptResponse_,
  CursorPage_ScriptExecutionResponse_,
  ExecutionStatsResponse,
  ScheduledJob,
  ScheduleRequest,
  ScheduleResponse,
} from './types'

export const scriptsApi = {
  getAll: (params?: { cursor?: string | null; limit?: number; tag?: string | null; search?: string | null }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    if (params?.tag) query.set('tag', params.tag)
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return api.get<CursorPage_ScriptResponse_>(`/scripts/${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string) => api.get<ScriptResponse>(`/scripts/${id}`),

  bulkCreate: (data: ScriptBulkCreateRequest) =>
    api.post<BulkResult<ScriptBulkCreateResult>>('/scripts/', data),

  create: (data: ScriptCreate) =>
    api.post<BulkResult<ScriptBulkCreateResult>>('/scripts/', { items: [data] }),

  update: (id: string, data: ScriptUpdate) => api.patch<ScriptResponse>(`/scripts/${id}`, data),

  remove: (id: string) => api.delete<void>(`/scripts/${id}`),

  // M×N executions
  executions: (data: ScriptExecutionsRequest) =>
    api.post<BulkScriptExecutionBatchResponse>('/scripts/executions', data),

  // Legacy single execute -> maps to bulk, params keyed by script_id per spec
  execute: (id: string, data: { node_ids?: string[] | null; node_tags?: string[] | null; params?: Record<string, unknown> }) =>
    api.post<BulkScriptExecutionBatchResponse>('/scripts/executions', {
      script_ids: [id],
      node_ids: data.node_ids || undefined,
      node_tags: data.node_tags || undefined,
      params: data.params ? { [id]: data.params } : undefined,
    } as ScriptExecutionsRequest),

  clone: (id: string, newName?: string) => {
    const qs = newName ? `?new_name=${encodeURIComponent(newName)}` : ''
    return api.post<ScriptResponse>(`/scripts/${id}/clone${qs}`)
  },

  getStats: (id: string, params?: { date_from?: string; date_to?: string; group_by?: string }) => {
    const query = new URLSearchParams()
    if (params?.date_from) query.set('date_from', params.date_from)
    if (params?.date_to) query.set('date_to', params.date_to)
    if (params?.group_by) query.set('group_by', params.group_by)
    const qs = query.toString()
    return api.get<ExecutionStatsResponse>(`/scripts/${id}/stats${qs ? `?${qs}` : ''}`)
  },

  getStatsGlobal: (params?: { node_id?: string; date_from?: string; date_to?: string; group_by?: string }) => {
    const query = new URLSearchParams()
    if (params?.node_id) query.set('node_id', params.node_id)
    if (params?.date_from) query.set('date_from', params.date_from)
    if (params?.date_to) query.set('date_to', params.date_to)
    if (params?.group_by) query.set('group_by', params.group_by)
    const qs = query.toString()
    return api.get<ExecutionStatsResponse>(`/scripts/stats${qs ? `?${qs}` : ''}`)
  },

  getTags: async () => {
    try {
      const page = await api.get<CursorPage_ScriptResponse_>('/scripts/?limit=100')
      return [...new Set(page.items.flatMap((s) => s.tags ?? []))]
    } catch { return [] as string[] }
  },

  // Schedules (plural in v2)
  getSchedule: (id: string) => api.get<ScheduledJob | null>(`/scripts/${id}/schedules`),

  setSchedule: (id: string, data: ScheduleRequest) =>
    api.post<ScheduleResponse>(`/scripts/${id}/schedules`, data),

  removeSchedule: (id: string) => api.delete<void>(`/scripts/${id}/schedules`),

  // Legacy singular wrappers
  getScheduleLegacy: (id: string) => api.get<ScheduledJob | null>(`/scripts/${id}/schedules`),
  setScheduleLegacy: (id: string, data: ScheduleRequest) => api.post<ScheduleResponse>(`/scripts/${id}/schedules`, data),
  removeScheduleLegacy: (id: string) => api.delete<void>(`/scripts/${id}/schedules`),

  getExecutions: (id: string, params?: { cursor?: string | null; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    const qs = query.toString()
    return api.get<CursorPage_ScriptExecutionResponse_>(`/scripts/${id}/executions${qs ? `?${qs}` : ''}`)
  },

  getScheduleHistory: (id: string, params?: { cursor?: string | null; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    const qs = query.toString()
    return api.get<CursorPage_ScriptExecutionResponse_>(`/scripts/${id}/schedule/history${qs ? `?${qs}` : ''}`)
  },

  // Bulk cancels/retries (v2)
  bulkCancel: (data: ExecutionCancelsRequest) =>
    api.post<BulkResult<BulkCancelScriptResult>>('/scripts/executions/cancels', data),

  bulkRetry: (data: ExecutionRetriesRequest) =>
    api.post<BulkResult<BulkRetryScriptResult>>('/scripts/executions/retries', data),

  cancelExecution: (executionId: string) =>
    api.post<BulkResult<BulkCancelScriptResult>>('/scripts/executions/cancels', { execution_ids: [executionId] }),

  retryExecution: (executionId: string) =>
    api.post<BulkResult<BulkRetryScriptResult>>('/scripts/executions/retries', { execution_ids: [executionId] }),
}
