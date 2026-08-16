import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { wsClient } from '../api/websocket'

export function useWebSocket(
  event: string,
  handler: (payload: unknown) => void,
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!wsClient.isConnected) return

    const unsubscribe = wsClient.on(event as Parameters<typeof wsClient.on>[0], handler)
    return unsubscribe
  }, [event, handler, queryClient])
}
