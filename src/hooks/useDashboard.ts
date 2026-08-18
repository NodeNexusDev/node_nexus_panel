import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard'
import type { DashboardResponse, DashboardMetricsResponse } from '../api/types'

export function useDashboard() {
  return useQuery<DashboardResponse>({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats(),
  })
}

export function useDashboardMetrics() {
  return useQuery<DashboardMetricsResponse>({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => dashboardApi.getMetrics(),
  })
}
