import { api } from './client'
import type { FavoriteResponse, FavoriteCreate, CursorPage_FavoriteResponse_ } from './types'

export const favoritesApi = {
  getAll: (params?: { cursor?: string | null; limit?: number; target_type?: string | null }) => {
    const query = new URLSearchParams()
    if (params?.cursor) query.set('cursor', params.cursor)
    if (params?.limit != null) query.set('limit', String(params.limit))
    if (params?.target_type) query.set('target_type', params.target_type)
    const qs = query.toString()
    return api.get<CursorPage_FavoriteResponse_>(`/favorites/${qs ? `?${qs}` : ''}`)
  },

  add: (data: FavoriteCreate) => api.post<FavoriteResponse>('/favorites/', data),

  remove: (targetType: string, targetId: string) =>
    api.delete<void>(`/favorites/${targetType}/${targetId}`),
}
