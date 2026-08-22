import { api } from './client'
import type {
  Node,
  NodeCreate,
  NodeUpdate,
  NodeMetrics,
  ExecutionStatsResponse,
  NodeStatusHistoryItem,
  ExecutionRetryResponse,
  NodeValidateRequest,
  NodeValidateResponse,
  BulkCommandHistoryItem,
  BulkNodeOperationResult,
  BulkCommandResult,
  BulkNodeUpdateRequest,
  BulkNodeUpdateResponse,
  BulkNodeMetricsResponse,
  BulkValidateCredentialsRequest,
  BulkValidateCredentialsResponse,
  BulkCancelCommandRequest,
  BulkCancelCommandResponse,
  BulkRetryCommandRequest,
  BulkRetryCommandResponse,
  CommandHistoryResponse,
  PaginatedResponse,
} from './types'

export const nodesApi = {
  getAll: (params?: { page?: number; size?: number; status?: string; tags?: string; search?: string; cursor?: string; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.page != null) query.set('page', String(params.page))
    if (params?.size != null) query.set('size', String(params.size))
    if (params?.status) query.set('status', params.status)
    if (params?.tags) query.set('tags', params.tags)
    if (params?.search) query.set('search', params.search)
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    const qs = query.toString()
    return api.get<PaginatedResponse<Node>>(`/nodes/${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string) =>
    api.get<Node>(`/nodes/${id}`),

  create: (data: NodeCreate) =>
    api.post<Node>('/nodes/', data),

  update: (id: string, data: NodeUpdate) =>
    api.put<Node>(`/nodes/${id}`, data),

  remove: (id: string) =>
    api.delete<void>(`/nodes/${id}`),

  check: (id: string) =>
    api.post<Node>(`/nodes/${id}/check`),

  getMetrics: (id: string) =>
    api.get<NodeMetrics>(`/nodes/${id}/metrics`),

  getHistory: (id: string, params?: { page?: number; size?: number }) => {
    const query = new URLSearchParams()
    if (params?.page != null) query.set('page', String(params.page))
    if (params?.size != null) query.set('size', String(params.size))
    const qs = query.toString()
    return api.get<PaginatedResponse<CommandHistoryResponse>>(`/nodes/${id}/commands/history${qs ? `?${qs}` : ''}`)
  },

  execute: (id: string, data: { command: string; timeout?: number }) =>
    api.post<{ exit_code: number; stdout: string; stderr: string }>(`/nodes/${id}/execute`, data),

  getTags: () =>
    api.get<string[]>('/nodes/tags'),

  addTag: (id: string, tag: string) =>
    api.post<void>(`/nodes/${id}/tags`, { tag }),

  removeTag: (id: string, tag: string) =>
    api.delete<Node>(`/nodes/${id}/tags`, { body: { tag } }),

  bulkDelete: (nodeIds: string[]) =>
    api.post<BulkNodeOperationResult>('/nodes/bulk/delete', { node_ids: nodeIds }),

  bulkCheck: (nodeIds: string[]) =>
    api.post<BulkNodeOperationResult>('/nodes/bulk/check', { node_ids: nodeIds }),

  bulkExecute: (data: { command: string; node_ids?: string[]; tags?: string[] }) =>
    api.post<BulkCommandResult>('/nodes/bulk/execute', data),

  getStats: (id: string, params?: { date_from?: string; date_to?: string }) => {
    const query = new URLSearchParams()
    if (params?.date_from) query.set('date_from', params.date_from)
    if (params?.date_to) query.set('date_to', params.date_to)
    const qs = query.toString()
    return api.get<ExecutionStatsResponse>(`/nodes/${id}/stats${qs ? `?${qs}` : ''}`)
  },

  getStatusHistory: (id: string, params?: { page?: number; size?: number }) => {
    const query = new URLSearchParams()
    if (params?.page != null) query.set('page', String(params.page))
    if (params?.size != null) query.set('size', String(params.size))
    const qs = query.toString()
    return api.get<PaginatedResponse<NodeStatusHistoryItem>>(`/nodes/${id}/status-history${qs ? `?${qs}` : ''}`)
  },

  retryCommand: (id: string, executionId: string) =>
    api.post<ExecutionRetryResponse>(`/nodes/${id}/commands/${executionId}/retry`),

  validateCredentials: (data: NodeValidateRequest) =>
    api.post<NodeValidateResponse>('/nodes/validate-credentials', data),

  getBulkHistory: (batchId: string, params?: { page?: number; size?: number }) => {
    const query = new URLSearchParams({ batch_id: batchId })
    if (params?.page != null) query.set('page', String(params.page))
    if (params?.size != null) query.set('size', String(params.size))
    const qs = query.toString()
    return api.get<PaginatedResponse<BulkCommandHistoryItem>>(`/nodes/bulk/history?${qs}`)
  },

  bulkTagsAdd: (data: { node_ids: string[]; tags: string[] }) =>
    api.post<BulkNodeOperationResult>('/nodes/bulk/tags/add', data),

  bulkTagsRemove: (data: { node_ids: string[]; tags: string[] }) =>
    api.post<BulkNodeOperationResult>('/nodes/bulk/tags/remove', data),

  bulkUpdate: (data: BulkNodeUpdateRequest) =>
    api.put<BulkNodeUpdateResponse>('/nodes/bulk/update', data),

  bulkMetrics: (nodeIds: string[]) =>
    api.post<BulkNodeMetricsResponse>('/nodes/bulk/metrics', { node_ids: nodeIds }),

  bulkValidateCredentials: (data: BulkValidateCredentialsRequest) =>
    api.post<BulkValidateCredentialsResponse>('/nodes/bulk/validate-credentials', data),

  bulkCancelCommands: (data: BulkCancelCommandRequest) =>
    api.post<BulkCancelCommandResponse>('/nodes/bulk/cancel', data),

  bulkRetryCommands: (data: BulkRetryCommandRequest) =>
    api.post<BulkRetryCommandResponse>('/nodes/bulk/retry', data),
}
