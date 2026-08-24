import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commandsApi } from '../api/commands'
import type {
  Command,
  CommandCreate,
  CommandUpdate,
  CommandExecuteRequest,
  BulkCommandRequest,
  ExecutionStatsResponse,
  PaginatedResponse,
  CommandHistoryResponse,
  BulkCommandHistoryItem,
} from '../api/types'

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

export function useBulkExecuteCommand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commandId, data }: { commandId: string; data: BulkCommandRequest }) =>
      commandsApi.bulkExecute(commandId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

export function useExecuteRawCommand() {
  return useMutation({
    mutationFn: commandsApi.executeRaw,
  })
}

export function useCommandHistory(nodeId: string | null, params?: { page?: number; size?: number }) {
  return useQuery<PaginatedResponse<CommandHistoryResponse>>({
    queryKey: ['command-history', nodeId, params],
    queryFn: () => commandsApi.getHistory({ node_id: nodeId!, ...params }),
    enabled: !!nodeId,
  })
}

export function useCommandStatsByNode(nodeId: string | null, params?: { date_from?: string; date_to?: string }) {
  return useQuery<ExecutionStatsResponse>({
    queryKey: ['command-stats', nodeId, params],
    queryFn: () => commandsApi.getStatsByNode({ node_id: nodeId!, ...params }),
    enabled: !!nodeId,
  })
}

export function useRetryCommandExecution() {
  return useMutation({
    mutationFn: (executionId: string) => commandsApi.retryExecution(executionId),
  })
}

export function useBulkCommandHistory(batchId: string | null, params?: { page?: number; size?: number }) {
  return useQuery<PaginatedResponse<BulkCommandHistoryItem>>({
    queryKey: ['bulk-command-history', batchId, params],
    queryFn: () => commandsApi.getBulkHistory(batchId!, params),
    enabled: !!batchId,
  })
}

export function useBulkExecuteRawCommand() {
  return useMutation({
    mutationFn: commandsApi.bulkExecuteGlobal,
  })
}

export function useBulkCancelCommandsGlobal() {
  return useMutation({
    mutationFn: commandsApi.bulkCancel,
  })
}

export function useBulkRetryCommandsGlobal() {
  return useMutation({
    mutationFn: commandsApi.bulkRetry,
  })
}
