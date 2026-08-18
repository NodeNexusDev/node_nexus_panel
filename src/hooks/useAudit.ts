import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { auditApi } from '../api/audit'
import type { AuditLog, PaginatedResponse } from '../api/types'

export function useAuditLogs(params?: { page?: number; size?: number; node_id?: string; action?: string; user?: string; date_from?: string; date_to?: string }) {
  return useQuery<PaginatedResponse<AuditLog>>({
    queryKey: ['audit', params],
    queryFn: () => auditApi.getAll(params),
  })
}

export function useClearAudit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => auditApi.clear(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit'] })
    },
  })
}

export function useExportAudit() {
  return useMutation({
    mutationFn: () => auditApi.export(),
  })
}
