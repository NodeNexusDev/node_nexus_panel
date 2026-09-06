import { api } from './client'
import type {
  APIKeyResponse,
  ApiKeyCreate,
  ApiKeyUpdate,
  ApiKeyCreated,
  APIKeyListResponse,
} from './types'

export const apiKeysApi = {
  getAll: (params?: { page?: number; size?: number }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.size) query.set('size', String(params.size))
    const qs = query.toString()
    return api.get<APIKeyListResponse>(`/api-keys/${qs ? `?${qs}` : ''}`)
  },

  create: (data: ApiKeyCreate) =>
    api.post<ApiKeyCreated>('/api-keys/', data),

  remove: (id: string) =>
    api.delete<void>(`/api-keys/${id}`),

  update: (id: string, data: ApiKeyUpdate) =>
    api.patch<APIKeyResponse>(`/api-keys/${id}`, data),

  getById: (id: string) =>
    api.get<APIKeyResponse>(`/api-keys/${id}`),

  bulkDelete: (data: { key_ids: string[] }) =>
    api.post<{ total: number; succeeded: number; failed: number; results: Array<{ key_id: string; status: string; error: string }> }>('/api-keys/deletions', data),
}
