import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard'
import type { DashboardResponse, DashboardMetricsResponse } from '../api/types'

export function useDashboard() {
  return useQuery<DashboardResponse>({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats(),
  })
}

export function useDashboardMetrics(params?: { date_from?: string; date_to?: string; group_by?: string }) {
  return useQuery<DashboardMetricsResponse>({
    queryKey: ['dashboard', 'metrics', params],
    queryFn: () => dashboardApi.getMetrics(params),
  })
}
