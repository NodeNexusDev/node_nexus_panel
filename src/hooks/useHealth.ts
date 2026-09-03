import { useQuery } from '@tanstack/react-query'
import { healthApi } from '../api/health'
import type { HealthResponse } from '../api/types'

export function useHealth() {
  return useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: () => healthApi.getHealth(),
    staleTime: Infinity,
  })
}

export function useReady() {
  return useQuery({ queryKey:['ready'], queryFn: ()=> healthApi.getReady(), staleTime: 30_000 })
}
