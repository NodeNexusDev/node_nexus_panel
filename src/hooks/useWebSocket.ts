import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { wsClient } from '../api/websocket'

export function useWebSocket(
  event: string,
  handler: (payload: unknown) => void,
) {
  const queryClient = useQueryClient()
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const unsubscribe = wsClient.on(event as Parameters<typeof wsClient.on>[0], (payload) => {
      handlerRef.current(payload)
    })
    return unsubscribe
  }, [event, queryClient])
}
