import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { templatesApi } from '../api/templates'
import type {
  PackDetailWithAssetsResponse,
  PackStatsResponse,
  CursorPage_PackResponse_,
  CursorPage_RegistryResponse_,
  CursorPage_PackInstallationResponse_,
} from '../api/types'

export function usePacks(params?: { cursor?: string | null; limit?: number; search?: string | null; tag?: string | null; installed?: boolean | null }) {
  return useQuery<CursorPage_PackResponse_>({
    queryKey: ['templates', 'packs', params],
    queryFn: () => templatesApi.listPacks(params as never),
    placeholderData: (prev) => prev,
  })
}

export function useInfinitePacks(params?: { limit?: number; search?: string | null; tag?: string | null }) {
  return useInfiniteQuery({
    queryKey: ['templates', 'packs', 'infinite', params],
    queryFn: ({ pageParam }) => templatesApi.listPacks({ cursor: pageParam as string | null, limit: params?.limit, search: params?.search, tag: params?.tag }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
  })
}

export function usePack(packId: string) {
  return useQuery<PackDetailWithAssetsResponse>({
    queryKey: ['templates', 'packs', packId],
    queryFn: () => templatesApi.getPack(packId),
    enabled: !!packId,
  })
}

export function usePackStats() {
  return useQuery<PackStatsResponse>({
    queryKey: ['templates', 'packs', 'stats'],
    queryFn: () => templatesApi.getPackStats(),
  })
}

export function useRegistries(params?: { cursor?: string | null; limit?: number }) {
  return useQuery<CursorPage_RegistryResponse_>({
    queryKey: ['templates', 'registries', params],
    queryFn: () => templatesApi.listRegistries(params),
  })
}

export function useInfiniteRegistries(params?: { limit?: number }) {
  return useInfiniteQuery({
    queryKey: ['templates', 'registries', 'infinite', params],
    queryFn: ({ pageParam }) => templatesApi.listRegistries({ cursor: pageParam as string | null, limit: params?.limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
  })
}

export function usePackInstallations(packId: string, params?: { cursor?: string | null; limit?: number }) {
  return useQuery<CursorPage_PackInstallationResponse_>({
    queryKey: ['templates', 'packs', packId, 'installations', params],
    queryFn: () => templatesApi.listInstallations(packId, params),
    enabled: !!packId,
  })
}

export function useCreateRegistry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: templatesApi.createRegistry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates', 'registries'] }),
  })
}

export function useSyncRegistry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (registryId: string) => templatesApi.syncRegistry(registryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  })
}

export function useDeleteRegistry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (registryId: string) => templatesApi.deleteRegistry(registryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates', 'registries'] }),
  })
}

export function useInstallPack() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ packId, data }: { packId: string; data?: unknown }) => templatesApi.installPack(packId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  })
}

export function useUninstallPack() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ packId, data }: { packId: string; data?: unknown }) => templatesApi.uninstallPack(packId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  })
}
