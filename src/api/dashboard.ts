import { api } from './client'
import type {
  NodeStats,
  Command,
  ApiResponse,
} from './types'

export interface DashboardActivity {
  id: string
  type: 'command' | 'node_offline' | 'node_online' | 'script_run'
  message: string
  timestamp: string
  metadata?: Record<string, string>
}

export const dashboardApi = {
  getStats: () =>
    api.get<ApiResponse<NodeStats>>('/api/dashboard/stats'),

  getRecentActivity: (limit?: number) => {
    const qs = limit ? `?limit=${limit}` : ''
    return api.get<ApiResponse<DashboardActivity[]>>(`/api/dashboard/activity${qs}`)
  },

  getRecentCommands: (limit?: number) => {
    const qs = limit ? `?limit=${limit}` : ''
    return api.get<ApiResponse<Command[]>>(`/api/dashboard/commands${qs}`)
  },
}
