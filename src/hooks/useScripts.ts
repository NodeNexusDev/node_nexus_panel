import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scriptsApi } from '../api/scripts'
import type {
  ScriptResponse,
  ScriptCreate,
  ScriptUpdate,
  ScriptExecuteRequest,
  ScriptExecutionResponse,
  ScheduledJob,
  PaginatedResponse,
  ScheduleRequest,
  ExecutionStatsResponse,
} from '../api/types'

export function useScripts(params?: { page?: number; size?: number; tag?: string; search?: string }) {
  return useQuery<PaginatedResponse<ScriptResponse>>({
    queryKey: ['scripts', 'list', params],
    queryFn: () => scriptsApi.getAll(params),
    placeholderData: keepPreviousData,
  })
}

export function useScript(id: string) {
  return useQuery<ScriptResponse>({
    queryKey: ['scripts', 'detail', id],
    queryFn: () => scriptsApi.getById(id),
    enabled: !!id,
  })
}

export function useScriptExecutions(id: string, params?: { page?: number; size?: number }) {
  return useQuery<PaginatedResponse<ScriptExecutionResponse>>({
    queryKey: ['scripts', 'detail', id, 'executions', params],
    queryFn: () => scriptsApi.getExecutions(id, params),
    enabled: !!id,
  })
}

export function useScriptScheduleHistory(id: string, params?: { page?: number; size?: number }) {
  return useQuery<PaginatedResponse<ScriptExecutionResponse>>({
    queryKey: ['scripts', 'detail', id, 'schedule-history', params],
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
    mutationFn: ({ id, data }: { id: string; data: ScheduleRequest }) =>
      scriptsApi.setSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] })
    },
  })
}

export function useRemoveScriptSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scriptsApi.removeSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] })
    },
  })
}

export function useScriptTags() {
  return useQuery<string[]>({
    queryKey: ['scripts', 'tags', 'list'],
    queryFn: () => scriptsApi.getTags(),
  })
}

export function useScriptSchedule(id: string) {
  return useQuery<ScheduledJob | null>({
    queryKey: ['scripts', 'detail', id, 'schedule'],
    queryFn: () => scriptsApi.getSchedule(id),
    enabled: !!id,
  })
}

export function useBulkCancelScriptExecutions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (executionIds: string[]) => scriptsApi.bulkCancel({ execution_ids: executionIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] })
    },
  })
}

export function useBulkRetryScriptExecutions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (executionIds: string[]) => scriptsApi.bulkRetry({ execution_ids: executionIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripts'] })
    },
  })
}

export function useScriptStats(scriptId: string | null, params?: { date_from?: string; date_to?: string }) {
  return useQuery<ExecutionStatsResponse>({
    queryKey: ['scripts', 'detail', scriptId, 'stats', params],
    queryFn: () => scriptsApi.getStats(scriptId!, params),
    enabled: !!scriptId,
  })
}
