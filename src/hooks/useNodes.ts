import { keepPreviousData, useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { nodesApi } from '../api/nodes'
import { commandsApi } from '../api/commands'
import type {
  Node,
  NodeCreate,
  NodeUpdate,
  NodeMetrics,
  ExecutionStatsResponse,
  NodeListResponse,
  CursorPage_NodeStatusHistoryItem_,
  CursorPage_CommandHistoryResponse_,
  BulkResult_BulkNodeUpdateResult_,
  BulkResult_BulkNodeMetricsResult_,
  BulkResult_BulkValidateCredentialsResult_,
  CredentialValidationsRequest,
  NodeBulkUpdatesRequest,
} from '../api/types'

export function useNodes(params?: { page?: number; size?: number; cursor?: string | null; limit?: number; tag?: string | null; search?: string | null }) {
  const apiParams: { cursor?: string | null; limit?: number; tag?: string | null; search?: string | null } = {}
  if (params?.cursor !== undefined) apiParams.cursor = params.cursor
  else if (params?.page != null) { const limit = params.limit ?? params.size ?? 20; const offset = (params.page - 1) * limit; apiParams.cursor = offset ? btoa(String(offset)) : null; apiParams.limit = limit } else { if (params?.limit != null) apiParams.limit = params.limit; if (params?.size != null) apiParams.limit = params.size }
  if (params?.tag) apiParams.tag = params.tag
  if (params?.search) apiParams.search = params.search
  return useQuery<NodeListResponse>({
    queryKey: ['nodes', 'list', params],
    queryFn: () => nodesApi.getAll(apiParams),
    placeholderData: keepPreviousData,
  })
}

export function useInfiniteNodes(params?: { limit?: number; tag?: string | null; search?: string | null }) {
  return useInfiniteQuery({
    queryKey: ['nodes', 'infinite', params],
    queryFn: ({ pageParam }) => nodesApi.getAll({ cursor: pageParam as string | null, limit: params?.limit, tag: params?.tag, search: params?.search }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage as unknown as { has_more: boolean; next_cursor: string | null }).has_more ? (lastPage as unknown as { next_cursor: string | null }).next_cursor : undefined,
  })
}

export function useInfiniteNodeStatusHistory(id: string, params?: { limit?: number }) {
  return useInfiniteQuery({
    queryKey: ['nodes', 'detail', id, 'status-history', 'infinite', params],
    queryFn: ({ pageParam }) => nodesApi.getStatusHistory(id, { cursor: pageParam as string | null, limit: params?.limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
    enabled: !!id,
  })
}

export function useInfiniteNodeCommandHistory(id: string, params?: { limit?: number }) {
  return useInfiniteQuery({
    queryKey: ['nodes', 'detail', id, 'commands-history', 'infinite', params],
    queryFn: ({ pageParam }) => commandsApi.getHistory({ node_id: id, cursor: pageParam as string | null, limit: params?.limit }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
    enabled: !!id,
  })
}

export function useNode(id: string) {
  return useQuery<Node>({
    queryKey: ['nodes', 'detail', id],
    queryFn: () => nodesApi.getById(id),
    enabled: !!id,
  })
}

export function useNodeStats(id: string, params?: { date_from?: string; date_to?: string }) {
  return useQuery<ExecutionStatsResponse>({
    queryKey: ['nodes', 'detail', id, 'stats', params],
    queryFn: () => commandsApi.getStatsByNode({ node_id: id, ...params }),
    enabled: !!id,
    placeholderData: keepPreviousData,
  })
}

export function useNodeStatusHistory(id: string, params?: { page?: number; size?: number; cursor?: string | null; limit?: number }) {
  return useQuery<CursorPage_NodeStatusHistoryItem_>({
    queryKey: ['nodes', 'detail', id, 'status-history', params],
    queryFn: () => {
      const apiParams: { cursor?: string | null; limit?: number } = {}
      if (params?.cursor !== undefined) apiParams.cursor = params.cursor
      else if (params?.page != null) { const limit = params.limit ?? params.size ?? 20; const offset = (params.page - 1) * limit; apiParams.cursor = offset ? btoa(String(offset)) : null; apiParams.limit = limit } else { if (params?.limit != null) apiParams.limit = params.limit; if (params?.size != null) apiParams.limit = params.size }
      return nodesApi.getStatusHistory(id, apiParams)
    },
    enabled: !!id,
    placeholderData: keepPreviousData,
  })
}

export function useCreateNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: NodeCreate) => nodesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useUpdateNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NodeUpdate }) => nodesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useExecuteNode() {
  return useMutation({
    mutationFn: ({ id, command, timeout }: { id: string; command: string; timeout?: number }) =>
      commandsApi.executeRaw({ node_id: id, command, timeout }),
  })
}

export function useDeleteNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => nodesApi.remove(id),
    onSettled: (_data, _err, id) => {
      queryClient.removeQueries({ queryKey: ['nodes', id] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useCheckNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => nodesApi.check(id),
    onSettled: (_data, _err, id) => {
      queryClient.invalidateQueries({ queryKey: ['nodes', id] })
    },
  })
}

export function useBulkCheck() {
  const queryClient = useQueryClient()

  return useMutation<BulkResult_BulkNodeUpdateResult_, Error, string[]>({
    mutationFn: (nodeIds: string[]) => nodesApi.bulkCheck(nodeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useRetryNodeCommand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ executionId }: { nodeId?: string; executionId: string }) =>
      commandsApi.retryExecution(executionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
      queryClient.invalidateQueries({ queryKey: ['commands'] })
    },
  })
}

export function useNodeMetrics(id: string) {
  return useQuery<NodeMetrics>({
    queryKey: ['nodes', 'detail', id, 'metrics'],
    queryFn: () => nodesApi.getMetrics(id),
    enabled: !!id,
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  })
}

export function useNodeCommandHistory(id: string, params?: { page?: number; size?: number; cursor?: string | null; limit?: number }) {
  return useQuery<CursorPage_CommandHistoryResponse_>({
    queryKey: ['nodes', 'detail', id, 'commands-history', params],
    queryFn: () => {
      const apiParams: { cursor?: string | null; limit?: number } = {}
      if (params?.cursor !== undefined) apiParams.cursor = params.cursor
      else if (params?.page != null) { const limit = params.limit ?? params.size ?? 20; const offset = (params.page - 1) * limit; apiParams.cursor = offset ? btoa(String(offset)) : null; apiParams.limit = limit } else { if (params?.limit != null) apiParams.limit = params.limit; if (params?.size != null) apiParams.limit = params.size }
      return commandsApi.getHistory({ node_id: id, ...apiParams })
    },
    enabled: !!id,
    placeholderData: keepPreviousData,
  })
}

export function useNodeTags() {
  return useQuery<string[]>({
    queryKey: ['nodes', 'tags', 'list'],
    queryFn: () => nodesApi.getTags(),
  })
}

export function useBulkDeleteNodes() {
  const queryClient = useQueryClient()

  return useMutation<BulkResult_BulkNodeUpdateResult_, Error, string[]>({
    mutationFn: (nodeIds: string[]) => nodesApi.bulkDelete(nodeIds),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkMetrics() {
  const queryClient = useQueryClient()

  return useMutation<BulkResult_BulkNodeMetricsResult_, Error, string[]>({
    mutationFn: (nodeIds: string[]) => nodesApi.bulkMetrics(nodeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkValidateCredentials() {
  const queryClient = useQueryClient()

  return useMutation<BulkResult_BulkValidateCredentialsResult_, Error, CredentialValidationsRequest>({
    mutationFn: (data: CredentialValidationsRequest) => nodesApi.bulkValidateCredentials(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkUpdateNodes() {
  const queryClient = useQueryClient()

  return useMutation<BulkResult_BulkNodeUpdateResult_, Error, NodeBulkUpdatesRequest>({
    mutationFn: (data: NodeBulkUpdatesRequest) => nodesApi.bulkUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

// Legacy wrapper for old call shape {node_ids, changes}
export function useBulkUpdateNodesLegacy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { node_ids: string[]; changes: NodeUpdate }) => nodesApi.bulkUpdateLegacy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}


