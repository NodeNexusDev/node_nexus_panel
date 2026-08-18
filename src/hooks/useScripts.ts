import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scriptsApi } from '../api/scripts'
import type {
  Script,
  ScriptCreate,
  ScriptUpdate,
  ScriptExecuteRequest,
  ScriptExecutionResponse,
  PaginatedResponse,
} from '../api/types'

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

export function useScriptExecutions(id: string, params?: { page?: number; size?: number }) {
  return useQuery<PaginatedResponse<ScriptExecutionResponse>>({
    queryKey: ['scripts', id, 'executions', params],
    queryFn: () => scriptsApi.getExecutions(id, params),
    enabled: !!id,
  })
}

export function useScriptScheduleHistory(id: string, params?: { page?: number; size?: number }) {
  return useQuery<PaginatedResponse<ScriptExecutionResponse>>({
    queryKey: ['scripts', id, 'schedule-history', params],
    queryFn: () => scriptsApi.getScheduleHistory(id, params),
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

export function useCancelScriptExecution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (executionId: string) => scriptsApi.cancelExecution(executionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] })
    },
  })
}

export function useRetryScriptExecution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (executionId: string) => scriptsApi.retryExecution(executionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] })
    },
  })
}

export function useCloneScript() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName?: string }) =>
      scriptsApi.clone(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] })
    },
  })
}

export function useSetScriptSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { cron: string } }) =>
      scriptsApi.setSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] })
    },
  })
}
