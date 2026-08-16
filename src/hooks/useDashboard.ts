import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard'
import type { NodeStats } from '../api/types'
import type { DashboardActivity } from '../api/dashboard'

export function useDashboardStats() {
  return useQuery<NodeStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats().then((res) => res.data),
  })
}

export function useRecentActivity(limit = 10) {
  return useQuery<DashboardActivity[]>({
    queryKey: ['dashboard', 'activity', limit],
    queryFn: () => dashboardApi.getRecentActivity(limit).then((res) => res.data),
  })
}

export function useRecentCommands(limit = 5) {
  return useQuery({
    queryKey: ['dashboard', 'commands', limit],
    queryFn: () => dashboardApi.getRecentCommands(limit),
  })
}
