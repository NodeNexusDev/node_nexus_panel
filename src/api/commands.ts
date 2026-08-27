import { api } from './client'
import type {
  CommandResponse,
  CommandCreate,
  CommandUpdate,
  CommandExecuteRequest,
  CommandResult,
  BulkCommandRequest,
  BulkCommandResult,
  ExecutionStatsResponse,
  PaginatedResponse,
  CommandHistoryResponse,
  ExecutionRetryResponse,
  BulkCommandHistoryItem,
  BulkCancelCommandRequest,
  BulkCancelCommandResponse,
  BulkRetryCommandRequest,
  BulkRetryCommandResponse,
} from './types'

export const commandsApi = {
  getAll: (params?: { page?: number; size?: number; tag?: string; search?: string }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.size) query.set('size', String(params.size))
    if (params?.tag) query.set('tag', params.tag)
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return api.get<PaginatedResponse<CommandResponse>>(`/commands/${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string) =>
    api.get<CommandResponse>(`/commands/${id}`),

  create: (data: CommandCreate) =>
    api.post<CommandResponse>('/commands/', data),

  update: (id: string, data: CommandUpdate) =>
    api.patch<CommandResponse>(`/commands/${id}`, data),

  remove: (id: string) =>
    api.delete<void>(`/commands/${id}`),

  execute: (id: string, data: CommandExecuteRequest) =>
    api.post<CommandResult>(`/commands/${id}/execute`, data),

  clone: (id: string, newName?: string) => {
    const qs = newName ? `?new_name=${encodeURIComponent(newName)}` : ''
    return api.post<CommandResponse>(`/commands/${id}/clone${qs}`)
  },

  getStats: (id: string, params?: { date_from?: string; date_to?: string }) => {
    const query = new URLSearchParams()
    if (params?.date_from) query.set('date_from', params.date_from)
    if (params?.date_to) query.set('date_to', params.date_to)
    const qs = query.toString()
    return api.get<ExecutionStatsResponse>(`/commands/${id}/stats${qs ? `?${qs}` : ''}`)
  },

  getTags: () =>
    api.get<string[]>('/commands/tags'),

  bulkExecute: (commandId: string, data: BulkCommandRequest) =>
    api.post<BulkCommandResult>(`/commands/${commandId}/bulk-execute`, data),

  executeRaw: (data: { node_id: string; command: string; timeout?: number | null }) =>
    api.post<{ exit_code: number; stdout: string; stderr: string }>('/commands/execute', data),

  getHistory: (params: { node_id: string; page?: number; size?: number }) => {
    const query = new URLSearchParams({ node_id: params.node_id })
    if (params?.page != null) query.set('page', String(params.page))
    if (params?.size != null) query.set('size', String(params.size))
    const qs = query.toString()
    return api.get<PaginatedResponse<CommandHistoryResponse>>(`/commands/history?${qs}`)
  },

  getStatsByNode: (params: { node_id: string; date_from?: string; date_to?: string }) => {
    const query = new URLSearchParams({ node_id: params.node_id })
    if (params?.date_from) query.set('date_from', params.date_from)
    if (params?.date_to) query.set('date_to', params.date_to)
    const qs = query.toString()
    return api.get<ExecutionStatsResponse>(`/commands/stats?${qs}`)
  },

  retryExecution: (executionId: string) =>
    api.post<ExecutionRetryResponse>(`/commands/executions/${executionId}/retry`),

  getBulkHistory: (batchId: string, params?: { page?: number; size?: number }) => {
    const query = new URLSearchParams({ batch_id: batchId })
    if (params?.page != null) query.set('page', String(params.page))
    if (params?.size != null) query.set('size', String(params.size))
    const qs = query.toString()
    return api.get<PaginatedResponse<BulkCommandHistoryItem>>(`/commands/bulk/history?${qs}`)
  },

  bulkExecuteGlobal: (data: { command: string; node_ids?: string[]; tags?: string[] }) =>
    api.post<BulkCommandResult>('/commands/bulk/execute', data),

  bulkCancel: (data: BulkCancelCommandRequest) =>
    api.post<BulkCancelCommandResponse>('/commands/bulk/cancel', data),

  bulkRetry: (data: BulkRetryCommandRequest) =>
    api.post<BulkRetryCommandResponse>('/commands/bulk/retry', data),
}
