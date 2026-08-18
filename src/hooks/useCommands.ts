import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commandsApi } from '../api/commands'
import type { Command, CommandCreate, CommandUpdate, CommandExecuteRequest, ExecutionStatsResponse, PaginatedResponse } from '../api/types'

export function useCommands(params?: { page?: number; size?: number; tag?: string; search?: string }) {
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

export function useUpdateCommand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CommandUpdate }) => commandsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] })
    },
  })
}

export function useCloneCommand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName?: string }) => commandsApi.clone(id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] })
    },
  })
}

export function useCommandStats(id: string, params?: { date_from?: string; date_to?: string }) {
  return useQuery<ExecutionStatsResponse>({
    queryKey: ['commands', id, 'stats', params],
    queryFn: () => commandsApi.getStats(id, params),
    enabled: !!id,
  })
}

export function useCommandTags() {
  return useQuery<string[]>({
    queryKey: ['commands', 'tags'],
    queryFn: () => commandsApi.getTags(),
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
