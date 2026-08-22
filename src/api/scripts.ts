import { api } from './client'
import type {
  Script,
  ScriptCreate,
  ScriptUpdate,
  ScriptExecuteRequest,
  ScriptExecutionResponse,
  ScriptExecutionBatchResult,
  ScheduledJob,
  ScheduleRequest,
  ScheduleResponse,
  ExecutionStatsResponse,
  BulkScriptCancelRequest,
  BulkScriptRetryRequest,
  PaginatedResponse,
} from './types'

export const scriptsApi = {
  getAll: (params?: { page?: number; size?: number; tag?: string; search?: string }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.size) query.set('size', String(params.size))
    if (params?.tag) query.set('tag', params.tag)
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return api.get<PaginatedResponse<Script>>(`/scripts/${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string) =>
    api.get<Script>(`/scripts/${id}`),

  create: (data: ScriptCreate) =>
    api.post<Script>('/scripts/', data),

  update: (id: string, data: ScriptUpdate) =>
    api.put<Script>(`/scripts/${id}`, data),

  remove: (id: string) =>
    api.delete<void>(`/scripts/${id}`),

  execute: (id: string, data: ScriptExecuteRequest) =>
    api.post<ScriptExecutionBatchResult>(`/scripts/${id}/execute`, data),

  clone: (id: string, newName?: string) => {
    const qs = newName ? `?new_name=${encodeURIComponent(newName)}` : ''
    return api.post<Script>(`/scripts/${id}/clone${qs}`)
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
    api.post<ScriptExecutionResponse>(`/scripts/executions/${executionId}/cancel`),

  retryExecution: (executionId: string) =>
    api.post<ScriptExecutionResponse>(`/scripts/executions/${executionId}/retry`),

  bulkCancel: (data: BulkScriptCancelRequest) =>
    api.post<Record<string, unknown>>('/scripts/bulk/cancel', data),

  bulkRetry: (data: BulkScriptRetryRequest) =>
    api.post<Record<string, unknown>>('/scripts/bulk/retry', data),
}
