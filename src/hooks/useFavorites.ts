import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { favoritesApi } from '../api/favorites'
import type { Favorite, FavoriteCreate } from '../api/types'

export function useFavorites() {
  return useQuery<Favorite[]>({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.getAll(),
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
