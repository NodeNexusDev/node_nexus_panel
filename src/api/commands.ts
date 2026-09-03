import { api } from './client'
import type {
  CommandResponse,
  CommandCreate,
  CommandUpdate,
  CommandBulkCreateRequest,
  CommandBulkCreateResult,
  CommandExecutionsRequest,
  RawExecutionsRequest,
  ExecutionCancelsRequest,
  ExecutionRetriesRequest,
  BulkExecutionBatchResponse,
  BulkCancelCommandResult,
  BulkRetryCommandResult,
  BulkResult,
  CursorPage_CommandResponse_,
  CursorPage_CommandHistoryResponse_,
  ExecutionStatsResponse,
} from './types'

export const commandsApi = {
  // ── List & CRUD (cursor) ────────────────────────────────────
  getAll: (params?: { cursor?: string | null; limit?: number; tag?: string | null; search?: string | null }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    if (params?.tag) query.set('tag', params.tag)
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return api.get<CursorPage_CommandResponse_>(`/commands/${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string) => api.get<CommandResponse>(`/commands/${id}`),

  // Bulk create (v2)
  bulkCreate: (data: CommandBulkCreateRequest) =>
    api.post<BulkResult<CommandBulkCreateResult>>('/commands/', data),

  create: (data: CommandCreate) =>
    api.post<BulkResult<CommandBulkCreateResult>>('/commands/', { items: [data] }),

  update: (id: string, data: CommandUpdate) => api.patch<CommandResponse>(`/commands/${id}`, data),

  remove: (id: string) => api.delete<void>(`/commands/${id}`),

  clone: (id: string, newName?: string) => {
    const qs = newName ? `?new_name=${encodeURIComponent(newName)}` : ''
    return api.post<CommandResponse>(`/commands/${id}/clone${qs}`)
  },

  // ── Executions (M×N) ────────────────────────────────────────
  executions: (data: CommandExecutionsRequest) =>
    api.post<BulkExecutionBatchResponse>('/commands/executions', data),

  rawExecutions: (data: RawExecutionsRequest) =>
    api.post<BulkExecutionBatchResponse>('/commands/raw-executions', data),

  // Legacy single execute -> maps to executions with single command
  execute: (id: string, data: { node_id?: string; node_ids?: string[]; node_tags?: string[]; params?: Record<string, unknown> }) => {
    // v1: {node_id, params} ; v2: {command_ids:[id], node_ids, node_tags, params:{[id]:params}}
    const nodeIds = data.node_ids || (data.node_id ? [data.node_id] : [])
    const params = data.params ? { [id]: data.params } : undefined
    return api.post<BulkExecutionBatchResponse>('/commands/executions', {
      command_ids: [id],
      node_ids: nodeIds.length ? nodeIds : undefined,
      params,
    } as CommandExecutionsRequest)
  },

  // Legacy bulkExecute (commandId + node_ids/tags)
  bulkExecute: (commandId: string, data: { node_ids?: string[]; node_tags?: string[]; params?: Record<string, unknown> }) =>
    api.post<BulkExecutionBatchResponse>('/commands/executions', {
      command_ids: [commandId],
      node_ids: data.node_ids,
      node_tags: data.node_tags,
      params: data.params ? { [commandId]: data.params } : undefined,
    } as CommandExecutionsRequest),

  // Global bulk execute
  bulkExecuteGlobal: (data: { command: string; node_ids?: string[]; node_tags?: string[]; params?: Record<string, unknown> }) =>
    api.post<BulkExecutionBatchResponse>('/commands/raw-executions', {
      commands: [data.command],
      node_ids: data.node_ids,
      node_tags: data.node_tags,
    } as RawExecutionsRequest),

  executeRaw: (data: { node_id: string; command: string; timeout?: number | null }) =>
    api.post<BulkExecutionBatchResponse>('/commands/raw-executions', {
      commands: [data.command],
      node_ids: [data.node_id],
    } as RawExecutionsRequest),

  // ── Cancels / Retries ───────────────────────────────────────
  bulkCancel: (data: ExecutionCancelsRequest) =>
    api.post<BulkResult<BulkCancelCommandResult>>('/commands/executions/cancels', data),

  bulkRetry: (data: ExecutionRetriesRequest) =>
    api.post<BulkResult<BulkRetryCommandResult>>('/commands/executions/retries', data),

  // Legacy per-execution retry -> bulk
  retryExecution: (executionId: string) =>
    api.post<BulkResult<BulkRetryCommandResult>>('/commands/executions/retries', { execution_ids: [executionId] }),

  // ── History & Stats (cursor) ────────────────────────────────
  getHistory: (params: { node_id: string; cursor?: string | null; limit?: number }) => {
    const query = new URLSearchParams({ node_id: params.node_id })
    if (params.cursor) query.set('cursor', params.cursor)
    if (params.limit != null) query.set('limit', String(params.limit))
    const qs = query.toString()
    return api.get<CursorPage_CommandHistoryResponse_>(`/commands/history?${qs}`)
  },

  getExecutionsHistory: (params: { batch_id: string; cursor?: string | null; limit?: number }) => {
    const query = new URLSearchParams({ batch_id: params.batch_id })
    if (params.cursor) query.set('cursor', params.cursor)
    if (params.limit != null) query.set('limit', String(params.limit))
    const qs = query.toString()
    return api.get<CursorPage_CommandHistoryResponse_>(`/commands/executions/history?${qs}`)
  },

  // Legacy alias
  getBulkHistory: (batchId: string, params?: { cursor?: string | null; limit?: number }) =>
    api.get<CursorPage_CommandHistoryResponse_>(`/commands/executions/history?batch_id=${batchId}${params?.cursor ? `&cursor=${params.cursor}` : ''}${params?.limit ? `&limit=${params.limit}` : ''}`),

  getStats: (id: string, params?: { date_from?: string; date_to?: string; group_by?: string }) => {
    const query = new URLSearchParams()
    if (params?.date_from) query.set('date_from', params.date_from)
    if (params?.date_to) query.set('date_to', params.date_to)
    if (params?.group_by) query.set('group_by', params.group_by)
    const qs = query.toString()
    return api.get<ExecutionStatsResponse>(`/commands/${id}/stats${qs ? `?${qs}` : ''}`)
  },

  getStatsByNode: (params: { node_id: string; date_from?: string; date_to?: string; group_by?: string }) => {
    const query = new URLSearchParams({ node_id: params.node_id })
    if (params.date_from) query.set('date_from', params.date_from)
    if (params.date_to) query.set('date_to', params.date_to)
    if (params.group_by) query.set('group_by', params.group_by)
    const qs = query.toString()
    return api.get<ExecutionStatsResponse>(`/commands/stats?${qs}`)
  },

  getTags: () => api.get<string[]>('/commands/tags').catch(() => [] as string[]),
}
