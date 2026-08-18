import { api } from './client'
import type { DashboardResponse, DashboardMetricsResponse } from './types'

export const dashboardApi = {
  getStats: () =>
    api.get<DashboardResponse>('/dashboard/'),

  getMetrics: (params?: { date_from?: string; date_to?: string; group_by?: string }) => {
    const query = new URLSearchParams()
    if (params?.date_from) query.set('date_from', params.date_from)
    if (params?.date_to) query.set('date_to', params.date_to)
    if (params?.group_by) query.set('group_by', params.group_by)
    const qs = query.toString()
    return api.get<DashboardMetricsResponse>(`/dashboard/metrics${qs ? `?${qs}` : ''}`)
  },
}
