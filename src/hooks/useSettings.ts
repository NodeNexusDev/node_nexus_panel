import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiKeysApi } from '../api/settings'
import type { ApiKey, ApiKeyCreate, PaginatedResponse } from '../api/types'

export function useApiKeys(params?: { page?: number; size?: number }) {
  return useQuery<PaginatedResponse<ApiKey>>({
    queryKey: ['api-keys', params],
    queryFn: () => apiKeysApi.getAll(params),
  })
}

export function useCreateApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ApiKeyCreate) => apiKeysApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
  })
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiKeysApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
  })
}
