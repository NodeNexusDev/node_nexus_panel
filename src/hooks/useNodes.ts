import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { nodesApi } from '../api/nodes'
import type { Node, NodeCreate, PaginatedResponse } from '../api/types'

export function useNodes(params?: { page?: number; size?: number; status?: string; tag?: string }) {
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
