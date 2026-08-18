import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commandsApi } from '../api/commands'
import type { Command, CommandCreate, CommandExecuteRequest, PaginatedResponse } from '../api/types'

export function useCommands(params?: { page?: number; size?: number; tag?: string }) {
  return useQuery<PaginatedResponse<Command>>({
    queryKey: ['commands', params],
    queryFn: () => commandsApi.getAll(params),
  })
}

export function useCommand(id: string) {
  return useQuery<Command>({
    queryKey: ['commands', id],
    queryFn: () => commandsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateCommand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CommandCreate) => commandsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] })
    },
  })
}

export function useExecuteCommand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CommandExecuteRequest }) =>
      commandsApi.execute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] })
    },
  })
}

export function useDeleteCommand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => commandsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] })
    },
  })
}
