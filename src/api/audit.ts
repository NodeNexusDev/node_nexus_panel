import { api } from './client'
import type { AuditLog, PaginatedResponse } from './types'

export const auditApi = {
  getAll: (params?: { page?: number; size?: number; node_id?: string; action?: string; user?: string; date_from?: string; date_to?: string }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.size) query.set('size', String(params.size))
    if (params?.node_id) query.set('node_id', params.node_id)
    if (params?.action) query.set('action', params.action)
    if (params?.user) query.set('user', params.user)
    if (params?.date_from) query.set('date_from', params.date_from)
    if (params?.date_to) query.set('date_to', params.date_to)
    const qs = query.toString()
    return api.get<PaginatedResponse<AuditLog>>(`/audit/${qs ? `?${qs}` : ''}`)
  },

  clear: () =>
    api.delete<void>('/audit/?confirm=yes'),

  export: (params?: { from_date?: string; to_date?: string; action?: string; node_id?: string; fmt?: string }) => {
    const query = new URLSearchParams()
    if (params?.from_date) query.set('from_date', params.from_date)
    if (params?.to_date) query.set('to_date', params.to_date)
    if (params?.action) query.set('action', params.action)
    if (params?.node_id) query.set('node_id', params.node_id)
    if (params?.fmt) query.set('fmt', params.fmt)
    const qs = query.toString()
    return api.get<unknown>(`/audit/export${qs ? `?${qs}` : ''}`)
  },
}
