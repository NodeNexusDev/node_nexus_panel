import { api } from './client'
import type {
  Command,
  CommandCreate,
  CommandUpdate,
  CommandExecuteRequest,
  CommandResult,
  PaginatedResponse,
} from './types'

export const commandsApi = {
  getAll: (params?: { page?: number; size?: number; tag?: string }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.size) query.set('size', String(params.size))
    if (params?.tag) query.set('tag', params.tag)
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

  clone: (id: string) =>
    api.post<Command>(`/commands/${id}/clone`),

  getStats: (id: string) =>
    api.get<unknown>(`/commands/${id}/stats`),

  getTags: () =>
    api.get<string[]>('/commands/tags'),
}
