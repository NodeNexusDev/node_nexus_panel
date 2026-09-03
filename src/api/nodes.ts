import { api } from './client'
import type {
  Node,
  NodeCreate,
  NodeUpdate,
  NodeCursorListResponse,
  NodeBulkCreateRequest,
  NodeBulkUpdatesRequest,
  NodeDeletionsRequest,
  NodeChecksRequest,
  NodeMetricsRequest,
  CredentialValidationsRequest,
  BulkResult_NodeBulkCreateResult_,
  BulkResult_BulkNodeUpdateResult_,
  BulkResult_BulkNodeMetricsResult_,
  BulkResult_BulkValidateCredentialsResult_,
  CursorPage_NodeStatusHistoryItem_,
} from './types'

export const nodesApi = {
  // ── List (cursor) ─────────────────────────────────────────────
  getAll: (params?: { cursor?: string | null; limit?: number; tag?: string | null; search?: string | null }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    if (params?.tag) query.set('tag', params.tag)
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return api.get<NodeCursorListResponse>(`/nodes/${qs ? `?${qs}` : ''}`)
  },

  // Legacy compat: keep page/size/tags support via translation (deprecated)
  getAllLegacy: (params?: { page?: number; size?: number; tags?: string; search?: string; cursor?: string; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    else if (params?.size != null) query.set('limit', String(params.size))
    if (params?.tags) query.set('tag', params.tags.split(',')[0])
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return api.get<NodeCursorListResponse>(`/nodes/${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string) => api.get<Node>(`/nodes/${id}`),

  // ── Bulk create (v2) ──────────────────────────────────────────
  bulkCreate: (data: NodeBulkCreateRequest) =>
    api.post<BulkResult_NodeBulkCreateResult_>('/nodes/', data),

  // Single create via bulk (convenience, returns BulkResult for spec compliance)
  create: (data: NodeCreate) =>
    api.post<BulkResult_NodeBulkCreateResult_>('/nodes/', { items: [data] }),

  // Helper that creates and fetches the Node (for UI backward compat)
  createAndFetch: async (data: NodeCreate): Promise<Node> => {
    const res = await api.post<BulkResult_NodeBulkCreateResult_>('/nodes/', { items: [data] })
    const first = res.results[0]
    if (!first || first.status !== 'success' || !first.node_id) {
      throw new Error(first?.error || 'Failed to create node')
    }
    return api.get<Node>(`/nodes/${first.node_id}`)
  },

  update: (id: string, data: NodeUpdate) => api.patch<Node>(`/nodes/${id}`, data),

  remove: (id: string) => api.delete<void>(`/nodes/${id}`),

  // ── Bulk operations (v2, no /bulk prefix) ─────────────────────
  bulkUpdate: (data: NodeBulkUpdatesRequest) =>
    api.patch<BulkResult_BulkNodeUpdateResult_>('/nodes/', data),

  // Legacy wrapper: {node_ids, changes} -> {updates:[{id, changes}]}
  bulkUpdateLegacy: (data: { node_ids: string[]; changes: NodeUpdate }) =>
    api.patch<BulkResult_BulkNodeUpdateResult_>('/nodes/', {
      updates: data.node_ids.map((id) => ({ id, changes: data.changes })),
    }),

  bulkDelete: (ids: string[]) =>
    api.post<BulkResult_BulkNodeUpdateResult_>('/nodes/deletions', { ids } satisfies NodeDeletionsRequest),

  bulkCheck: (ids: string[]) =>
    api.post<BulkResult_BulkNodeUpdateResult_>('/nodes/checks', { ids } satisfies NodeChecksRequest),

  bulkMetrics: (ids: string[]) =>
    api.post<BulkResult_BulkNodeMetricsResult_>('/nodes/metrics', { ids } satisfies NodeMetricsRequest),

  bulkValidateCredentials: (data: CredentialValidationsRequest) =>
    api.post<BulkResult_BulkValidateCredentialsResult_>('/nodes/credential-validations', data),

  getStatusHistory: (id: string, params?: { cursor?: string | null; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    const qs = query.toString()
    return api.get<CursorPage_NodeStatusHistoryItem_>(`/nodes/${id}/status-history${qs ? `?${qs}` : ''}`)
  },

  // Legacy page/size wrapper
  getStatusHistoryLegacy: (id: string, params?: { page?: number; size?: number }) => {
    const query = new URLSearchParams()
    if (params?.page != null) query.set('cursor', String(params.page))
    if (params?.size != null) query.set('limit', String(params.size))
    const qs = query.toString()
    return api.get<CursorPage_NodeStatusHistoryItem_>(`/nodes/${id}/status-history${qs ? `?${qs}` : ''}`)
  },

  // ── Deprecated / removed in v2 (kept for type compat, will 404) ─
  /** @deprecated removed in v2, use bulkCheck */
  check: (id: string) => api.post<BulkResult_BulkNodeUpdateResult_>('/nodes/checks', { ids: [id] }),
  /** @deprecated removed in v2 */
  refreshHostKey: (_id: string) => Promise.reject(new Error('refreshHostKey removed in API v2')),
  /** @deprecated removed in v2, use bulkMetrics */
  getMetrics: (id: string) =>
    api.post<BulkResult_BulkNodeMetricsResult_>('/nodes/metrics', { ids: [id] }).then((r) => {
      const first = r.results[0]
      if (!first || first.status !== 'success' || !first.metrics) throw new Error(first?.error || 'metrics failed')
      return first.metrics
    }),
  /** @deprecated removed in v2, tags derived from list */
  getTags: () => api.get<string[]>('/nodes/tags').catch(() => [] as string[]),
  /** @deprecated removed in v2, use credential-validations with ids */
  validateCredentials: (_data: unknown) => Promise.reject(new Error('validateCredentials removed in API v2')),
}
