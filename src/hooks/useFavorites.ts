import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { favoritesApi } from '../api/favorites'
import type { Favorite, FavoriteCreate, PaginatedResponse } from '../api/types'

export function useFavorites(params?: { page?: number; size?: number; target_type?: string }) {
  return useQuery<PaginatedResponse<Favorite>>({
    queryKey: ['favorites', params],
    queryFn: () => favoritesApi.getAll(params),
  })
}

export function useAddFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FavoriteCreate) => favoritesApi.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ targetType, targetId }: { targetType: string; targetId: string }) =>
      favoritesApi.remove(targetType, targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}
