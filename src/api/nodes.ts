import { api } from './client'
import type {
  Node,
  NodeStats,
  ApiResponse,
  PaginatedResponse,
} from './types'

export const nodesApi = {
  getAll: () =>
    api.get<PaginatedResponse<Node>>('/api/nodes'),

  getById: (id: string) =>
    api.get<ApiResponse<Node>>(`/api/nodes/${id}`),

  getStats: () =>
    api.get<ApiResponse<NodeStats>>('/api/nodes/stats'),

  create: (data: { name: string; ip: string; port?: number }) =>
    api.post<ApiResponse<Node>>('/api/nodes', data),

  remove: (id: string) =>
    api.delete<void>(`/api/nodes/${id}`),

  restart: (id: string) =>
    api.post<void>(`/api/nodes/${id}/restart`),
}
