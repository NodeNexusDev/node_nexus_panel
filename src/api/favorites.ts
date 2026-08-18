import { api } from './client'
import type { Favorite, FavoriteCreate, PaginatedResponse } from './types'

export const favoritesApi = {
  getAll: (params?: { page?: number; size?: number; target_type?: string }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.size) query.set('size', String(params.size))
    if (params?.target_type) query.set('target_type', params.target_type)
    const qs = query.toString()
    return api.get<PaginatedResponse<Favorite>>(`/favorites${qs ? `?${qs}` : ''}`)
  },

  add: (data: FavoriteCreate) =>
    api.post<Favorite>('/favorites', data),

  remove: (targetType: string, targetId: string) =>
    api.delete<void>(`/favorites/${targetType}/${targetId}`),
}
