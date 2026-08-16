import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { nodesApi } from '../api/nodes'
import type { Node, PaginatedResponse } from '../api/types'

export function useNodes(page = 1, pageSize = 20) {
  return useQuery<PaginatedResponse<Node>>({
    queryKey: ['nodes', page, pageSize],
    queryFn: () => nodesApi.getAll().then((res) => res as unknown as PaginatedResponse<Node>),
  })
}

export function useNode(id: string) {
  return useQuery({
    queryKey: ['nodes', id],
    queryFn: () => nodesApi.getById(id),
    enabled: !!id,
  })
}

export function useNodeStats() {
  return useQuery({
    queryKey: ['nodes', 'stats'],
    queryFn: () => nodesApi.getStats(),
  })
}

export function useCreateNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; ip: string; port?: number }) =>
      nodesApi.create(data),
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

export function useRestartNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => nodesApi.restart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}
