import { api } from './client'
import type {
  Command,
  CommandExecuteRequest,
  ApiResponse,
  PaginatedResponse,
} from './types'

export const commandsApi = {
  execute: (data: CommandExecuteRequest) =>
    api.post<ApiResponse<Command>>('/api/commands/execute', data),

  getHistory: (params?: { nodeId?: string; page?: number; pageSize?: number }) => {
    const query = new URLSearchParams()
    if (params?.nodeId) query.set('nodeId', params.nodeId)
    if (params?.page) query.set('page', String(params.page))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))
    const qs = query.toString()
    return api.get<PaginatedResponse<Command>>(`/api/commands${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string) =>
    api.get<ApiResponse<Command>>(`/api/commands/${id}`),
}
