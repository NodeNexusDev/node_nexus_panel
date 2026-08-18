import { api } from './client'
import type { AuditLog, PaginatedResponse } from './types'

export const auditApi = {
  getAll: (params?: { page?: number; size?: number }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.size) query.set('size', String(params.size))
    const qs = query.toString()
    return api.get<PaginatedResponse<AuditLog>>(`/audit/${qs ? `?${qs}` : ''}`)
  },

  clear: () =>
    api.delete<void>('/audit/'),

  export: () =>
    api.get<string>('/audit/export'),
}
