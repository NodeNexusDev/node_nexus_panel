import { api } from './client'
import type {
  Script,
  ScriptCreateRequest,
  ApiResponse,
  PaginatedResponse,
} from './types'

export const scriptsApi = {
  getAll: (params?: { page?: number; pageSize?: number }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))
    const qs = query.toString()
    return api.get<PaginatedResponse<Script>>(`/api/scripts${qs ? `?${qs}` : ''}`)
  },

  getById: (id: string) =>
    api.get<ApiResponse<Script>>(`/api/scripts/${id}`),

  create: (data: ScriptCreateRequest) =>
    api.post<ApiResponse<Script>>('/api/scripts', data),

  update: (id: string, data: Partial<ScriptCreateRequest>) =>
    api.put<ApiResponse<Script>>(`/api/scripts/${id}`, data),

  remove: (id: string) =>
    api.delete<void>(`/api/scripts/${id}`),

  run: (id: string, targetNodeIds?: string[]) =>
    api.post<ApiResponse<{ runId: string }>>(`/api/scripts/${id}/run`, {
      nodeIds: targetNodeIds,
    }),
}
