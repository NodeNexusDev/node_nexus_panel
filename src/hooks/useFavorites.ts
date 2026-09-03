import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { favoritesApi } from '../api/favorites'
import type { FavoriteCreate, CursorPage_FavoriteResponse_ } from '../api/types'

export function useFavorites(params?: { page?: number; size?: number; cursor?: string | null; limit?: number; target_type?: string | null }) {
  const apiParams: { cursor?: string | null; limit?: number; target_type?: string | null } = {}
  if (params?.cursor !== undefined) apiParams.cursor = params.cursor
  else if (params?.page != null) { const limit = params.limit ?? params.size ?? 20; const offset = (params.page - 1) * limit; apiParams.cursor = offset ? btoa(String(offset)) : null; apiParams.limit = limit } else { if (params?.limit != null) apiParams.limit = params.limit; if (params?.size != null) apiParams.limit = params.size }
  if (params?.target_type) apiParams.target_type = params.target_type
  return useQuery<CursorPage_FavoriteResponse_>({
    queryKey: ['favorites', params],
    queryFn: () => favoritesApi.getAll(apiParams),
  })
}

export function useInfiniteFavorites(params?: { limit?: number; target_type?: string | null }) {
  return useInfiniteQuery({
    queryKey: ['favorites', 'infinite', params],
    queryFn: ({ pageParam }) => favoritesApi.getAll({ cursor: pageParam as string | null, limit: params?.limit, target_type: params?.target_type }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
  })
}

export function useAddFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: FavoriteCreate) => favoritesApi.add(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ targetType, targetId }: { targetType: string; targetId: string }) => favoritesApi.remove(targetType, targetId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  })
}
