import { api } from './client'
import type {
  ScriptResponse,
  ScriptCreate,
  ScriptUpdate,
  ScriptExecuteRequest,
  ScriptExecutionResponse,
  ScriptExecutionBatchResult,
  ScriptCancelResponse,
  ScriptRetryResponse,
  ScriptBulkCancelRequest,
  ScriptBulkRetryRequest,
  ScriptBulkOperationResponse,
  ScheduledJob,
  ScheduleRequest,
  ScheduleResponse,
  ExecutionStatsResponse,
  PaginatedResponse,
} from './types'

export const scriptsApi = {
  getAll: (params?: { page?: number; size?: number; tags?: string; search?: string }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.size) query.set('size', String(params.size))
    if (params?.tags) query.set('tags', params.tags)
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return api.get<PaginatedResponse<ScriptResponse>>(`/scripts/${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string) =>
    api.get<ScriptResponse>(`/scripts/${id}`),

  create: (data: ScriptCreate) =>
    api.post<ScriptResponse>('/scripts/', data),

  update: (id: string, data: ScriptUpdate) =>
    api.patch<ScriptResponse>(`/scripts/${id}`, data),

  remove: (id: string) =>
    api.delete<void>(`/scripts/${id}`),

  execute: (id: string, data: ScriptExecuteRequest) =>
    api.post<ScriptExecutionBatchResult>(`/scripts/${id}/execute`, data),

  clone: (id: string, newName?: string) => {
    const qs = newName ? `?new_name=${encodeURIComponent(newName)}` : ''
    return api.post<ScriptResponse>(`/scripts/${id}/clone${qs}`)
  },

  getStats: (id: string, params?: { date_from?: string; date_to?: string }) => {
    const query = new URLSearchParams()
    if (params?.date_from) query.set('date_from', params.date_from)
    if (params?.date_to) query.set('date_to', params.date_to)
    const qs = query.toString()
    return api.get<ExecutionStatsResponse>(`/scripts/${id}/stats${qs ? `?${qs}` : ''}`)
  },

  getTags: () =>
    api.get<string[]>('/scripts/tags'),

  getSchedule: (id: string) =>
    api.get<ScheduledJob | null>(`/scripts/${id}/schedule`),

  setSchedule: (id: string, data: ScheduleRequest) =>
    api.post<ScheduleResponse>(`/scripts/${id}/schedule`, data),

  removeSchedule: (id: string) =>
    api.delete<void>(`/scripts/${id}/schedule`),

  getExecutions: (id: string, params?: { page?: number; size?: number }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.size) query.set('size', String(params.size))
    const qs = query.toString()
    return api.get<PaginatedResponse<ScriptExecutionResponse>>(`/scripts/${id}/executions${qs ? `?${qs}` : ''}`)
  },

  getScheduleHistory: (id: string, params?: { page?: number; size?: number }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.size) query.set('size', String(params.size))
    const qs = query.toString()
    return api.get<PaginatedResponse<ScriptExecutionResponse>>(`/scripts/${id}/schedule/history${qs ? `?${qs}` : ''}`)
  },

  cancelExecution: (executionId: string) =>
    api.post<ScriptCancelResponse>(`/scripts/executions/${executionId}/cancel`),

  retryExecution: (executionId: string) =>
    api.post<ScriptRetryResponse>(`/scripts/executions/${executionId}/retry`),

  bulkCancel: (data: ScriptBulkCancelRequest) =>
    api.post<ScriptBulkOperationResponse>('/scripts/bulk/cancel', data),

  bulkRetry: (data: ScriptBulkRetryRequest) =>
    api.post<ScriptBulkOperationResponse>('/scripts/bulk/retry', data),
}
