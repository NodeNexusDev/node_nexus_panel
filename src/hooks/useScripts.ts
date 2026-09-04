import { keepPreviousData, useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { scriptsApi } from '../api/scripts'
import type {
  ScriptResponse,
  ScriptCreate,
  ScriptUpdate,
  CursorPage_ScriptResponse_,
  CursorPage_ScriptExecutionResponse_,
  ScheduledJob,
  ScheduleRequest,
  ExecutionStatsResponse,
} from '../api/types'

export function useScripts(params?: { page?: number; size?: number; cursor?: string | null; limit?: number; tag?: string | null; search?: string | null }) {
  const apiParams: { cursor?: string | null; limit?: number; tag?: string | null; search?: string | null } = {}
  if (params?.cursor !== undefined) apiParams.cursor = params.cursor
  else if (params?.page != null) {
    const limit = params.limit ?? params.size ?? 20
    const offset = (params.page - 1) * limit
    apiParams.cursor = offset ? btoa(String(offset)) : null
    apiParams.limit = limit
  } else {
    if (params?.limit != null) apiParams.limit = params.limit
    if (params?.size != null) apiParams.limit = params.size
  }
  if (params?.tag) apiParams.tag = params.tag
  if (params?.search) apiParams.search = params.search
  return useQuery<CursorPage_ScriptResponse_>({
    queryKey: ['scripts', 'list', params],
    queryFn: () => scriptsApi.getAll(apiParams),
    placeholderData: keepPreviousData,
  })
}

export function useInfiniteScripts(params?: { limit?: number; tag?: string | null; search?: string | null }) {
  return useInfiniteQuery({
    queryKey: ['scripts', 'infinite', params],
    queryFn: ({ pageParam }) => scriptsApi.getAll({ cursor: pageParam as string | null, limit: params?.limit, tag: params?.tag, search: params?.search }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
  })
}

export function useScript(id: string) {
  return useQuery<ScriptResponse>({
    queryKey: ['scripts', 'detail', id],
    queryFn: () => scriptsApi.getById(id),
    enabled: !!id,
  })
}

export function useScriptExecutions(id: string, params?: { page?: number; size?: number; cursor?: string | null; limit?: number }) {
  return useQuery<CursorPage_ScriptExecutionResponse_>({
    queryKey: ['scripts', 'detail', id, 'executions', params],
    queryFn: () => {
      const apiParams: { cursor?: string | null; limit?: number } = {}
      if (params?.cursor !== undefined) apiParams.cursor = params.cursor
      else if (params?.page != null) { const limit = params.limit ?? params.size ?? 20; const offset = (params.page - 1) * limit; apiParams.cursor = offset ? btoa(String(offset)) : null; apiParams.limit = limit } else { if (params?.limit != null) apiParams.limit = params.limit; if (params?.size != null) apiParams.limit = params.size }
      return scriptsApi.getExecutions(id, apiParams)
    },
    enabled: !!id,
  })
}

export function useInfiniteScriptExecutions(id: string, params?: { limit?: number }) {
  return useInfiniteQuery({
    queryKey: ['scripts', 'detail', id, 'executions', 'infinite', params],
    queryFn: ({ pageParam }) => scriptsApi.getExecutions(id, { cursor: pageParam as string | null, limit: params?.limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
    enabled: !!id,
  })
}

export function useScriptScheduleHistory(id: string, params?: { page?: number; size?: number; cursor?: string | null; limit?: number }) {
  return useQuery<CursorPage_ScriptExecutionResponse_>({
    queryKey: ['scripts', 'detail', id, 'schedule-history', params],
    queryFn: () => {
      const apiParams: { cursor?: string | null; limit?: number } = {}
      if (params?.cursor !== undefined) apiParams.cursor = params.cursor
      else if (params?.page != null) { const limit = params.limit ?? params.size ?? 20; const offset = (params.page - 1) * limit; apiParams.cursor = offset ? btoa(String(offset)) : null; apiParams.limit = limit } else { if (params?.limit != null) apiParams.limit = params.limit; if (params?.size != null) apiParams.limit = params.size }
      return scriptsApi.getScheduleHistory(id, apiParams)
    },
    enabled: !!id,
  })
}

export function useInfiniteScriptScheduleHistory(id: string, params?: { limit?: number }) {
  return useInfiniteQuery({
    queryKey: ['scripts', 'detail', id, 'schedule-history', 'infinite', params],
    queryFn: ({ pageParam }) => scriptsApi.getScheduleHistory(id, { cursor: pageParam as string | null, limit: params?.limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
    enabled: !!id,
  })
}

export function useCreateScript() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ScriptCreate) => scriptsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scripts'] }),
  })
}

export function useUpdateScript() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ScriptUpdate }) => scriptsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scripts'] }),
  })
}

export function useDeleteScript() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => scriptsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scripts'] }),
  })
}

export function useRunScript() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { node_ids?: string[] | null; node_tags?: string[] | null; params?: Record<string, unknown> } }) =>
      scriptsApi.execute(id, data ?? {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scripts'] }),
  })
}

export function useCancelScriptExecution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (executionId: string) => scriptsApi.cancelExecution(executionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scripts'] }),
  })
}

export function useRetryScriptExecution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (executionId: string) => scriptsApi.retryExecution(executionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scripts'] }),
  })
}

export function useCloneScript() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName?: string }) => scriptsApi.clone(id, newName),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scripts'] }),
  })
}

export function useSetScriptSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ScheduleRequest }) => scriptsApi.setSchedule(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scripts'] }),
  })
}

export function useRemoveScriptSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => scriptsApi.removeSchedule(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scripts'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scripts'] }),
  })
}

export function useBulkRetryScriptExecutions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (executionIds: string[]) => scriptsApi.bulkRetry({ execution_ids: executionIds }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scripts'] }),
  })
}

export function useScriptStats(scriptId: string | null, params?: { date_from?: string; date_to?: string; group_by?: string }) {
  return useQuery<ExecutionStatsResponse>({
    queryKey: ['scripts', 'detail', scriptId, 'stats', params],
    queryFn: () => scriptsApi.getStats(scriptId!, params),
    enabled: !!scriptId,
  })
}
