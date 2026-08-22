import { api } from './client'
import type {
  Command,
  CommandCreate,
  CommandUpdate,
  CommandExecuteRequest,
  CommandResult,
  BulkCommandRequest,
  BulkCommandResult,
  ExecutionStatsResponse,
  PaginatedResponse,
} from './types'

export const commandsApi = {
  getAll: (params?: { page?: number; size?: number; tag?: string; search?: string }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.size) query.set('size', String(params.size))
    if (params?.tag) query.set('tag', params.tag)
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return api.get<PaginatedResponse<Command>>(`/commands/${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string) =>
    api.get<Command>(`/commands/${id}`),

  create: (data: CommandCreate) =>
    api.post<Command>('/commands/', data),

  update: (id: string, data: CommandUpdate) =>
    api.put<Command>(`/commands/${id}`, data),

  remove: (id: string) =>
    api.delete<void>(`/commands/${id}`),

  execute: (id: string, data: CommandExecuteRequest) =>
    api.post<CommandResult>(`/commands/${id}/execute`, data),

  clone: (id: string, newName?: string) => {
    const qs = newName ? `?new_name=${encodeURIComponent(newName)}` : ''
    return api.post<Command>(`/commands/${id}/clone${qs}`)
  },

  getStats: (id: string, params?: { date_from?: string; date_to?: string }) => {
    const query = new URLSearchParams()
    if (params?.date_from) query.set('date_from', params.date_from)
    if (params?.date_to) query.set('date_to', params.date_to)
    const qs = query.toString()
    return api.get<ExecutionStatsResponse>(`/commands/${id}/stats${qs ? `?${qs}` : ''}`)
  },

  getTags: () =>
    api.get<string[]>('/commands/tags'),

  bulkExecute: (commandId: string, data: BulkCommandRequest) =>
    api.post<BulkCommandResult>(`/commands/${commandId}/bulk-execute`, data),
}
