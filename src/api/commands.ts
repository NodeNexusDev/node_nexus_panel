import { api } from './client'
import { chunkItems, runBulkChunks } from '../lib/chunks'
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

  bulkUpdate: (data: { updates: Array<{ id: string; changes: CommandUpdate }> }) =>
    runBulkChunks(data.updates, 20, (updates) =>
      api.patch<BulkResult<CommandBulkCreateResult>>('/commands/', { updates } as unknown as { updates: unknown })),

  bulkDelete: (data: { ids: string[] }) =>
    runBulkChunks(data.ids, 100, (ids) =>
      api.post<BulkResult<CommandBulkCreateResult>>('/commands/deletions', { ids })),

  clone: (id: string, newName?: string) => {
    const qs = newName ? `?new_name=${encodeURIComponent(newName)}` : ''
    return api.post<CommandResponse>(`/commands/${id}/clone${qs}`)
  },

  // ── Executions (M×N; command_ids auto-chunked to the server max of 20) ──
  executions: async (data: CommandExecutionsRequest): Promise<BulkExecutionBatchResponse> => {
    const ids = data.command_ids ?? []
    if (ids.length <= 20) return api.post<BulkExecutionBatchResponse>('/commands/executions', data)
    let merged: BulkExecutionBatchResponse | null = null
    // Sequential chunks: server-friendly, merged in order.
    for (const c of chunkItems(ids, 20)) {
      // oxlint-disable-next-line no-await-in-loop
      const r = await api.post<BulkExecutionBatchResponse>('/commands/executions', { ...data, command_ids: c })
      merged = merged
        ? { batch_id: merged.batch_id, total: merged.total + r.total, succeeded: merged.succeeded + r.succeeded, failed: merged.failed + r.failed, results: [...merged.results, ...r.results] }
        : r
    }
    return merged as BulkExecutionBatchResponse
  },

  rawExecutions: async (data: RawExecutionsRequest): Promise<BulkExecutionBatchResponse> => {
    const cmds = data.commands ?? []
    if (cmds.length <= 20) return api.post<BulkExecutionBatchResponse>('/commands/raw-executions', data)
    let merged: BulkExecutionBatchResponse | null = null
    // Sequential chunks: server-friendly, merged in order.
    for (const c of chunkItems(cmds, 20)) {
      // oxlint-disable-next-line no-await-in-loop
      const r = await api.post<BulkExecutionBatchResponse>('/commands/raw-executions', { ...data, commands: c })
      merged = merged
        ? { batch_id: merged.batch_id, total: merged.total + r.total, succeeded: merged.succeeded + r.succeeded, failed: merged.failed + r.failed, results: [...merged.results, ...r.results] }
        : r
    }
    return merged as BulkExecutionBatchResponse
  },

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

  // ── Cancels / Retries (execution_ids auto-chunked to the server max of 100) ──
  bulkCancel: (data: ExecutionCancelsRequest) =>
    runBulkChunks(data.execution_ids, 100, (execution_ids) =>
      api.post<BulkResult<BulkCancelCommandResult>>('/commands/executions/cancels', { ...data, execution_ids })),

  bulkRetry: (data: ExecutionRetriesRequest) =>
    runBulkChunks(data.execution_ids, 100, (execution_ids) =>
      api.post<BulkResult<BulkRetryCommandResult>>('/commands/executions/retries', { ...data, execution_ids })),

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

  getTags: async () => {
    try {
      return await api.get<string[]>('/commands/tags')
    } catch { return [] as string[] }
  },
}
