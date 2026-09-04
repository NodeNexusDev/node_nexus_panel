import { keepPreviousData, useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { auditApi } from '../api/audit'
import type { CursorPage_AuditLogResponse_ } from '../api/types'

export function useAuditLogs(params?: { page?: number; size?: number; cursor?: string | null; limit?: number; node_id?: string | null; action?: string | null; user?: string | null; date_from?: string | null; date_to?: string | null }) {
  const apiParams: { cursor?: string | null; limit?: number; node_id?: string | null; action?: string | null; user?: string | null; date_from?: string | null; date_to?: string | null } = {}
  if (params?.cursor !== undefined) apiParams.cursor = params.cursor
  else if (params?.page != null) { const limit = params.limit ?? params.size ?? 20; const offset = (params.page - 1) * limit; apiParams.cursor = offset ? btoa(String(offset)) : null; apiParams.limit = limit } else { if (params?.limit != null) apiParams.limit = params.limit; if (params?.size != null) apiParams.limit = params.size }
  if (params?.node_id) apiParams.node_id = params.node_id
  if (params?.action) apiParams.action = params.action
  if (params?.user) apiParams.user = params.user
  if (params?.date_from) apiParams.date_from = params.date_from
  if (params?.date_to) apiParams.date_to = params.date_to
  return useQuery<CursorPage_AuditLogResponse_>({
    queryKey: ['audit', params],
    queryFn: () => auditApi.getAll(apiParams),
    placeholderData: keepPreviousData,
  })
}

export function useInfiniteAuditLogs(params?: { limit?: number; node_id?: string | null; action?: string | null; user?: string | null; date_from?: string | null; date_to?: string | null }) {
  return useInfiniteQuery({
    queryKey: ['audit', 'infinite', params],
    queryFn: ({ pageParam }) => auditApi.getAll({ cursor: pageParam as string | null, limit: params?.limit, node_id: params?.node_id, action: params?.action, user: params?.user, date_from: params?.date_from, date_to: params?.date_to }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
  })
}

export function useClearAudit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => auditApi.clear(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['audit'] }),
  })
}

export function useExportAudit() {
  return useMutation({
    mutationFn: (params?: { from_date?: string; to_date?: string; action?: string; node_id?: string; fmt?: string }) => auditApi.export(params),
  })
}

export function useAuditLog(id: string) {
  return useQuery({ queryKey:['audit','detail',id], queryFn: ()=> auditApi.getById(id), enabled: !!id })
}

export function useAuditStats(params?: { group_by?: string | null }) {
  return useQuery({ queryKey:['audit','stats',params], queryFn: ()=> auditApi.getStats(params as never) })
}
