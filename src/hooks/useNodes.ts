import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { nodesApi } from '../api/nodes'
import { commandsApi } from '../api/commands'
import type {
  Node,
  NodeCreate,
  NodeUpdate,
  NodeMetrics,
  ExecutionStatsResponse,
  NodeStatusHistoryItem,
  CommandHistoryResponse,
  PaginatedResponse,
  ConnectionType,
} from '../api/types'

export function useNodes(params?: { page?: number; size?: number; status?: string; tags?: string; search?: string }) {
  return useQuery<PaginatedResponse<Node>>({
    queryKey: ['nodes', 'list', params],
    queryFn: () => nodesApi.getAll(params),
    placeholderData: keepPreviousData,
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

export function useNodeStatusHistory(id: string, params?: { page?: number; size?: number }) {
  return useQuery<PaginatedResponse<NodeStatusHistoryItem>>({
    queryKey: ['nodes', 'detail', id, 'status-history', params],
    queryFn: () => nodesApi.getStatusHistory(id, params),
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

  return useMutation({
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

export function useNodeCommandHistory(id: string, params?: { page?: number; size?: number }) {
  return useQuery<PaginatedResponse<CommandHistoryResponse>>({
    queryKey: ['nodes', 'detail', id, 'commands-history', params],
    queryFn: () => commandsApi.getHistory({ node_id: id, ...params }),
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

  return useMutation({
    mutationFn: (nodeIds: string[]) => nodesApi.bulkDelete(nodeIds),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkMetrics() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (nodeIds: string[]) => nodesApi.bulkMetrics(nodeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkValidateCredentials() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { node_ids: string[]; tags?: string[] }) => nodesApi.bulkValidateCredentials(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkUpdateNodes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { node_ids: string[]; changes: NodeUpdate }) => nodesApi.bulkUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useValidateCredentials() {
  return useMutation({
    mutationFn: (data: { host: string; port?: number; connection_type?: ConnectionType; username?: string; password?: string; ssh_key?: string; passphrase?: string }) =>
      nodesApi.validateCredentials(data),
  })
}
