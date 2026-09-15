import { api } from './client'
import { runBulkChunks } from '../lib/chunks'
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

  // ── Bulk operations (v2, no /bulk prefix; id-lists auto-chunked to the server max of 100) ──
  bulkUpdate: (data: NodeBulkUpdatesRequest) =>
    runBulkChunks(data.updates, 100, (updates) =>
      api.patch<BulkResult_BulkNodeUpdateResult_>('/nodes/', { ...data, updates })),

  bulkDelete: (ids: string[]) =>
    runBulkChunks(ids, 100, (c) => api.post<BulkResult_BulkNodeUpdateResult_>('/nodes/deletions', { ids: c } satisfies NodeDeletionsRequest)),

  bulkCheck: (ids: string[]) =>
    runBulkChunks(ids, 100, (c) => api.post<BulkResult_BulkNodeUpdateResult_>('/nodes/checks', { ids: c } satisfies NodeChecksRequest)),

  bulkMetrics: (ids: string[]) =>
    runBulkChunks(ids, 100, (c) => api.post<BulkResult_BulkNodeMetricsResult_>('/nodes/metrics', { ids: c } satisfies NodeMetricsRequest)),

  bulkValidateCredentials: (data: CredentialValidationsRequest) => {
    if (!data.ids || data.ids.length <= 100) return api.post<BulkResult_BulkValidateCredentialsResult_>('/nodes/credential-validations', data)
    return runBulkChunks(data.ids, 100, (c) =>
      api.post<BulkResult_BulkValidateCredentialsResult_>('/nodes/credential-validations', { ...data, ids: c }))
  },

  getStatusHistory: (id: string, params?: { cursor?: string | null; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    const qs = query.toString()
    return api.get<CursorPage_NodeStatusHistoryItem_>(`/nodes/${id}/status-history${qs ? `?${qs}` : ''}`)
  },

  // ── Single-item conveniences over the v2 bulk endpoints ─
  /** Single check via bulk */
  check: (id: string) => api.post<BulkResult_BulkNodeUpdateResult_>('/nodes/checks', { ids: [id] }),
  /** Single metrics via bulk */
  getMetrics: (id: string) =>
    api.post<BulkResult_BulkNodeMetricsResult_>('/nodes/metrics', { ids: [id] }).then((r) => {
      const first = r.results[0]
      if (!first || first.status !== 'success' || !first.metrics) throw new Error(first?.error || 'metrics failed')
      return first.metrics
    }),
  /** Tags derived from the first list page (no dedicated endpoint) */
  getTags: async () => {
    try {
      const page = await api.get<NodeCursorListResponse>('/nodes/?limit=100')
      return [...new Set(page.items.flatMap((n) => n.tags ?? []))]
    } catch { return [] as string[] }
  },
}
