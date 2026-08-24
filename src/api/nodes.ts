import { api } from './client'
import type {
  Node,
  NodeCreate,
  NodeUpdate,
  NodeMetrics,
  NodeStatusHistoryItem,
  NodeValidateRequest,
  NodeValidateResponse,
  BulkNodeOperationResult,
  BulkNodeUpdateRequest,
  BulkNodeUpdateResponse,
  BulkNodeMetricsResponse,
  BulkValidateCredentialsRequest,
  BulkValidateCredentialsResponse,
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
    api.patch<Node>(`/nodes/${id}`, data),

  remove: (id: string) =>
    api.delete<void>(`/nodes/${id}`),

  check: (id: string) =>
    api.post<Node>(`/nodes/${id}/check`),

  getMetrics: (id: string) =>
    api.get<NodeMetrics>(`/nodes/${id}/metrics`),

  getTags: () =>
    api.get<string[]>('/nodes/tags'),



  bulkDelete: (nodeIds: string[]) =>
    api.post<BulkNodeOperationResult>('/nodes/bulk/delete', { node_ids: nodeIds }),

  bulkCheck: (nodeIds: string[]) =>
    api.post<BulkNodeOperationResult>('/nodes/bulk/check', { node_ids: nodeIds }),

  getStatusHistory: (id: string, params?: { page?: number; size?: number }) => {
    const query = new URLSearchParams()
    if (params?.page != null) query.set('page', String(params.page))
    if (params?.size != null) query.set('size', String(params.size))
    const qs = query.toString()
    return api.get<PaginatedResponse<NodeStatusHistoryItem>>(`/nodes/${id}/status-history${qs ? `?${qs}` : ''}`)
  },

  validateCredentials: (data: NodeValidateRequest) =>
    api.post<NodeValidateResponse>('/nodes/validate-credentials', data),


  bulkUpdate: (data: BulkNodeUpdateRequest) =>
    api.patch<BulkNodeUpdateResponse>('/nodes/bulk/update', data),

  bulkMetrics: (nodeIds: string[]) =>
    api.post<BulkNodeMetricsResponse>('/nodes/bulk/metrics', { node_ids: nodeIds }),

  bulkValidateCredentials: (data: BulkValidateCredentialsRequest) =>
    api.post<BulkValidateCredentialsResponse>('/nodes/bulk/validate-credentials', data),
}
