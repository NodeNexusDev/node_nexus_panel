import { api } from './client'
import type { AuditLogResponse, CursorPage_AuditLogResponse_ } from './types'

export const auditApi = {
  getAll: (params?: {
    cursor?: string | null
    limit?: number
    node_id?: string | null
    action?: string | null
    user?: string | null
    date_from?: string | null
    date_to?: string | null
  }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    if (params?.node_id) query.set('node_id', params.node_id)
    if (params?.action) query.set('action', params.action)
    if (params?.user) query.set('user', params.user)
    if (params?.date_from) query.set('date_from', params.date_from)
    if (params?.date_to) query.set('date_to', params.date_to)
    const qs = query.toString()
    return api.get<CursorPage_AuditLogResponse_>(`/audit/${qs ? `?${qs}` : ''}`)
  },

  getById: (logId: string) => api.get<AuditLogResponse>(`/audit/${logId}`),

  clear: () => api.delete<void>('/audit/?confirm=yes'),

  export: (params?: { from_date?: string; to_date?: string; action?: string; node_id?: string; fmt?: string; cursor?: string | null; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.from_date) query.set('from_date', params.from_date)
    if (params?.to_date) query.set('to_date', params.to_date)
    if (params?.action) query.set('action', params.action)
    if (params?.node_id) query.set('node_id', params.node_id)
    if (params?.fmt) query.set('fmt', params.fmt)
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    const qs = query.toString()
    return api.get<unknown>(`/audit/exports${qs ? `?${qs}` : ''}`)
  },

  getStats: (params?: { date_from?: string | null; date_to?: string | null; group_by?: string | null }) => {
    const query = new URLSearchParams()
    if (params?.date_from) query.set('date_from', params.date_from)
    if (params?.date_to) query.set('date_to', params.date_to)
    if (params?.group_by) query.set('group_by', params.group_by)
    const qs = query.toString()
    return api.get<unknown>(`/audit/stats${qs ? `?${qs}` : ''}`)
  },
}
