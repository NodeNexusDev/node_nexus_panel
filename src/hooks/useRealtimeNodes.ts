import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from './useWebSocket'

export function useRealtimeNodes() {
  const queryClient = useQueryClient()

  const handleNodeStatus = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['nodes'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }, [queryClient])

  useWebSocket('node:status', handleNodeStatus)
}
