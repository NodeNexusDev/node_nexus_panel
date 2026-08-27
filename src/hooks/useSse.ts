import { useCallback, useEffect, useState } from 'react'
import { eventsClient } from '../api/events'

export type SseEvent = {
  type: string
  payload: unknown
  timestamp: string
}

export function useSse() {
  const [isConnected, setIsConnected] = useState(eventsClient.isConnected)
  const [lastEvent, setLastEvent] = useState<SseEvent | null>(null)

  useEffect(() => {
    const unsubConn = eventsClient.onConnectionChange(setIsConnected)
    const unsubscribe = eventsClient.on('*', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        setLastEvent(data)
      } catch {
        // ignore parse errors
      }
    })

    return () => {
      unsubConn()
      unsubscribe()
    }
  }, [])

  const on = useCallback((eventType: string, handler: (event: SseEvent) => void) => {
    return eventsClient.on(eventType, (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        handler(data)
      } catch {
        // ignore parse errors
      }
    })
  }, [])

  return { isConnected, lastEvent, on }
}
