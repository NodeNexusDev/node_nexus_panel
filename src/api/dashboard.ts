import { api } from './client'
import type { DashboardResponse, DashboardMetricsResponse } from './types'

export const dashboardApi = {
  getStats: () =>
    api.get<DashboardResponse>('/dashboard/'),

  getMetrics: () =>
    api.get<DashboardMetricsResponse>('/dashboard/metrics'),
}
