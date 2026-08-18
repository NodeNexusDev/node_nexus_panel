import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { nodesApi } from '../api/nodes'
import type {
  Node,
  NodeCreate,
  ExecutionStatsResponse,
  NodeStatusHistoryItem,
  BulkCommandHistoryItem,
  PaginatedResponse,
} from '../api/types'

export function useNodes(params?: { page?: number; size?: number; status?: string; tags?: string; search?: string }) {
  return useQuery<PaginatedResponse<Node>>({
    queryKey: ['nodes', params],
    queryFn: () => nodesApi.getAll(params),
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
    queryFn: () => nodesApi.getStats(id, params),
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

export function useBulkHistory(batchId: string, params?: { page?: number; size?: number }) {
  return useQuery<PaginatedResponse<BulkCommandHistoryItem>>({
    queryKey: ['nodes', 'bulk-history', batchId, params],
    queryFn: () => nodesApi.getBulkHistory(batchId, params),
    enabled: !!batchId,
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

export function useDeleteNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => nodesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useCheckNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => nodesApi.check(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useRetryNodeCommand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, executionId }: { nodeId: string; executionId: string }) =>
      nodesApi.retryCommand(nodeId, executionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useValidateCredentials() {
  return useMutation({
    mutationFn: (data: {
      host: string
      port: number
      connection_type: string
      username?: string
      password?: string
      ssh_key?: string
    }) => nodesApi.validateCredentials(data),
  })
}

export function useBulkTagsAdd() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { node_ids: string[]; tags: string[] }) => nodesApi.bulkTagsAdd(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useBulkTagsRemove() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { node_ids: string[]; tags: string[] }) => nodesApi.bulkTagsRemove(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}
