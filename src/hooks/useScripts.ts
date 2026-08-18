import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scriptsApi } from '../api/scripts'
import type { Script, ScriptCreate, ScriptUpdate, ScriptExecuteRequest, PaginatedResponse } from '../api/types'

export function useScripts(params?: { page?: number; size?: number; tag?: string }) {
  return useQuery<PaginatedResponse<Script>>({
    queryKey: ['scripts', params],
    queryFn: () => scriptsApi.getAll(params),
  })
}

export function useScript(id: string) {
  return useQuery<Script>({
    queryKey: ['scripts', id],
    queryFn: () => scriptsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateScript() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ScriptCreate) => scriptsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] })
    },
  })
}

export function useUpdateScript() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ScriptUpdate }) =>
      scriptsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] })
    },
  })
}

export function useDeleteScript() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scriptsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] })
    },
  })
}

export function useRunScript() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ScriptExecuteRequest }) =>
      scriptsApi.execute(id, data ?? {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] })
    },
  })
}
