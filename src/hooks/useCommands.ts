import { keepPreviousData, useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { commandsApi } from '../api/commands'
import type {
  CommandResponse,
  CommandCreate,
  CommandUpdate,
  CursorPage_CommandResponse_,
  ExecutionStatsResponse,
} from '../api/types'

export function useCommands(params?: { page?: number; size?: number; cursor?: string | null; limit?: number; tag?: string | null; search?: string | null }) {
  // Translate legacy page/size to cursor/limit
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
  return useQuery<CursorPage_CommandResponse_>({
    queryKey: ['commands', 'list', params],
    queryFn: () => commandsApi.getAll(apiParams),
    placeholderData: keepPreviousData,
  })
}

export function useInfiniteCommands(params?: { limit?: number; tag?: string | null; search?: string | null }) {
  return useInfiniteQuery({
    queryKey: ['commands', 'infinite', params],
    queryFn: ({ pageParam }) => commandsApi.getAll({ cursor: pageParam as string | null, limit: params?.limit, tag: params?.tag, search: params?.search }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
  })
}

export function useCommand(id: string) {
  return useQuery<CommandResponse>({
    queryKey: ['commands', 'detail', id],
    queryFn: () => commandsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateCommand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CommandCreate) => commandsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commands'] }),
  })
}

export function useUpdateCommand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CommandUpdate }) => commandsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commands'] }),
  })
}

export function useCloneCommand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName?: string }) => commandsApi.clone(id, newName),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commands'] }),
  })
}

export function useCommandStats(id: string, params?: { date_from?: string; date_to?: string; group_by?: string }) {
  return useQuery<ExecutionStatsResponse>({
    queryKey: ['commands', 'detail', id, 'stats', params],
    queryFn: () => commandsApi.getStats(id, params),
    enabled: !!id,
  })
}

export function useCommandTags() {
  return useQuery<string[]>({
    queryKey: ['commands', 'tags', 'list'],
    queryFn: () => commandsApi.getTags(),
  })
}

export function useExecuteCommand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, node_id, node_ids, node_tags, params, data }: { id: string; node_id?: string; node_ids?: string[]; node_tags?: string[]; params?: Record<string, unknown>; data?: { node_id?: string; node_ids?: string[]; node_tags?: string[]; params?: Record<string, unknown> } }) => {
      const payload = data ?? ({ node_id, node_ids, node_tags, params } as { node_id?: string; node_ids?: string[]; node_tags?: string[]; params?: Record<string, unknown> })
      return commandsApi.execute(id, payload as never)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commands'] }),
  })
}

export function useDeleteCommand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => commandsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commands'] }),
  })
}

export function useBulkExecuteCommand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ commandId, data }: { commandId: string; data: { node_ids?: string[]; node_tags?: string[]; params?: Record<string, unknown> } }) =>
      commandsApi.bulkExecute(commandId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useExecuteRawCommand() {
  return useMutation({ mutationFn: commandsApi.executeRaw })
}

export function useBulkExecuteRawCommand() {
  return useMutation({ mutationFn: commandsApi.bulkExecuteGlobal })
}

export function useBulkCancelCommands() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (ids: string[]) => commandsApi.bulkCancel({ execution_ids: ids } as never), onSuccess: ()=> qc.invalidateQueries({queryKey:['commands']}) })
}

export function useBulkRetryCommands() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (ids: string[]) => commandsApi.bulkRetry({ execution_ids: ids } as never), onSuccess: ()=> qc.invalidateQueries({queryKey:['commands']}) })
}

export function useCommandExecutionsHistory(batchId: string, params?: { cursor?: string | null; limit?: number }) {
  return useQuery({ queryKey:['commands','executions','history', batchId, params], queryFn: ()=> (commandsApi as unknown as { getExecutionsHistory: (a:string,b:unknown)=>Promise<unknown> }).getExecutionsHistory(batchId, params as never), enabled: !!batchId })
}

export function useCommandHistory(params?: { node_id?: string; cursor?: string | null; limit?: number }) {
  return useQuery({ queryKey:['commands','history', params], queryFn: ()=> commandsApi.getHistory(params as never) })
}
