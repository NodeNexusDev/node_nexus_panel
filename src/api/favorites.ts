import { api } from './client'
import type { Favorite, FavoriteCreate } from './types'

export const favoritesApi = {
  getAll: () =>
    api.get<Favorite[]>('/favorites'),

  add: (data: FavoriteCreate) =>
    api.post<Favorite>('/favorites', data),

  remove: (targetType: string, targetId: string) =>
    api.delete<void>(`/favorites/${targetType}/${targetId}`),
}
