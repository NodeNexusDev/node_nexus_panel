import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commandsApi } from '../api/commands'
import type { Command, PaginatedResponse } from '../api/types'

export function useCommandHistory(params?: { nodeId?: string; page?: number; pageSize?: number }) {
  return useQuery<PaginatedResponse<Command>>({
    queryKey: ['commands', 'history', params],
    queryFn: () => commandsApi.getHistory(params) as Promise<PaginatedResponse<Command>>,
  })
}

export function useCommand(id: string) {
  return useQuery({
    queryKey: ['commands', id],
    queryFn: () => commandsApi.getById(id),
    enabled: !!id,
  })
}

export function useExecuteCommand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { command: string; nodeId: string }) =>
      commandsApi.execute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] })
    },
  })
}
