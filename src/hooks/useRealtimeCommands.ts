import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from './useWebSocket'

export function useRealtimeCommands() {
  const queryClient = useQueryClient()

  const handleCommandOutput = useCallback((payload: unknown) => {
    const data = payload as { commandId?: string }
    if (data?.commandId) {
      queryClient.invalidateQueries({ queryKey: ['commandHistory'] })
    }
  }, [queryClient])

  const handleCommandComplete = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['commandHistory'] })
  }, [queryClient])

  useWebSocket('command:output', handleCommandOutput)
  useWebSocket('command:complete', handleCommandComplete)
}
