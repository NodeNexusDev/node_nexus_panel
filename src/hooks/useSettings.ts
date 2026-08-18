import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiKeysApi } from '../api/settings'
import { configApi } from '../api/config'
import type { ApiKeyCreate, ApiKeyUpdate, ApiKeyList, ConfigExport, ConfigImport } from '../api/types'

export function useApiKeys(params?: { page?: number; size?: number }) {
  return useQuery<ApiKeyList>({
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

export function useUpdateApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApiKeyUpdate }) => apiKeysApi.update(id, data),
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

export function useConfigExport() {
  return useQuery<ConfigExport>({
    queryKey: ['config', 'export'],
    queryFn: () => configApi.export(),
    enabled: false,
  })
}

export function useConfigImport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ConfigImport) => configApi.import(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] })
    },
  })
}
