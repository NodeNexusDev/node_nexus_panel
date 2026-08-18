import { api } from './client'
import type { ApiKey, ApiKeyCreate, ApiKeyUpdate, ApiKeyCreated, PaginatedResponse } from './types'

export const apiKeysApi = {
  getAll: (params?: { page?: number; size?: number }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.size) query.set('size', String(params.size))
    const qs = query.toString()
    return api.get<PaginatedResponse<ApiKey>>(`/api-keys/${qs ? `?${qs}` : ''}`)
  },

  create: (data: ApiKeyCreate) =>
    api.post<ApiKeyCreated>('/api-keys/', data),

  remove: (id: string) =>
    api.delete<void>(`/api-keys/${id}`),

  update: (id: string, data: ApiKeyUpdate) =>
    api.patch<ApiKey>(`/api-keys/${id}`, data),
}
