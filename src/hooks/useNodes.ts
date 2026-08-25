import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

export function useNodes(params?: { page?: number; size?: number; status?: string; tags?: string; search?: string }, options?: { refetchInterval?: number }) {
  return useQuery<PaginatedResponse<Node>>({
    queryKey: ['nodes', params],
    queryFn: () => nodesApi.getAll(params),
    refetchInterval: options?.refetchInterval,
  })
}

export function useNode(id: string) {
  return useQuery<Node>({
    queryKey: ['nodes', id],
    queryFn: () => nodesApi.getById(id),
    enabled: !!id,
  })
}

export function useNodeStats(id: string, params?: { date_from?: string; date_to?: string }) {
  return useQuery<ExecutionStatsResponse>({
    queryKey: ['nodes', id, 'stats', params],
    queryFn: () => commandsApi.getStatsByNode({ node_id: id, ...params }),
    enabled: !!id,
  })
}

export function useNodeStatusHistory(id: string, params?: { page?: number; size?: number }) {
  return useQuery<PaginatedResponse<NodeStatusHistoryItem>>({
    queryKey: ['nodes', id, 'status-history', params],
    queryFn: () => nodesApi.getStatusHistory(id, params),
    enabled: !!id,
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['nodes'] })
      const previous = queryClient.getQueriesData<PaginatedResponse<Node>>({ queryKey: ['nodes'] })
      queryClient.setQueriesData<PaginatedResponse<Node>>({ queryKey: ['nodes'] }, (old) => {
        if (!old) return old
        return { ...old, items: old.items.filter((n) => n.id !== id) }
      })
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useCheckNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => nodesApi.check(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['nodes', id] })
      const previous = queryClient.getQueryData<Node>(['nodes', id])
      if (previous) {
        queryClient.setQueryData<Node>(['nodes', id], { ...previous, status: 'active' })
      }
      return { previous }
    },
    onError: (_err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['nodes', id], context.previous)
      }
    },
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
    mutationFn: ({ executionId }: { nodeId: string; executionId: string }) =>
      commandsApi.retryExecution(executionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
      queryClient.invalidateQueries({ queryKey: ['commands'] })
    },
  })
}

export function useNodeMetrics(id: string) {
  return useQuery<NodeMetrics>({
    queryKey: ['nodes', id, 'metrics'],
    queryFn: () => nodesApi.getMetrics(id),
    enabled: !!id,
  })
}

export function useNodeCommandHistory(id: string, params?: { page?: number; size?: number }) {
  return useQuery<PaginatedResponse<CommandHistoryResponse>>({
    queryKey: ['nodes', id, 'commands-history', params],
    queryFn: () => commandsApi.getHistory({ node_id: id, ...params }),
    enabled: !!id,
  })
}

export function useNodeTags() {
  return useQuery<string[]>({
    queryKey: ['nodes', 'tags'],
    queryFn: () => nodesApi.getTags(),
  })
}

export function useBulkDeleteNodes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (nodeIds: string[]) => nodesApi.bulkDelete(nodeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkExecuteNodes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { command: string; node_ids?: string[]; tags?: string[] }) => commandsApi.bulkExecuteGlobal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
      queryClient.invalidateQueries({ queryKey: ['commands'] })
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

export function useBulkCancelCommands() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (executionIds: string[]) => commandsApi.bulkCancel({ execution_ids: executionIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
      queryClient.invalidateQueries({ queryKey: ['commands'] })
    },
  })
}

export function useBulkRetryCommands() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (executionIds: string[]) => commandsApi.bulkRetry({ execution_ids: executionIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
      queryClient.invalidateQueries({ queryKey: ['commands'] })
    },
  })
}

export function useValidateCredentials() {
  return useMutation({
    mutationFn: (data: { host: string; port?: number; connection_type?: ConnectionType; username?: string; password?: string; ssh_key?: string; passphrase?: string }) =>
      nodesApi.validateCredentials(data),
  })
}
