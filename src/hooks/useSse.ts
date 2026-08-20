import { useCallback, useEffect, useState } from 'react'
import { eventsClient } from '../api/events'

export type SseEvent = {
  type: string
  payload: unknown
  timestamp: string
}

export function useSse() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<SseEvent | null>(null)

  useEffect(() => {
    eventsClient.connect()

    const checkConnection = setInterval(() => {
      setIsConnected(eventsClient.isConnected)
    }, 1000)

    const unsubscribe = eventsClient.on('*', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        setLastEvent(data)
      } catch {
        // ignore parse errors
      }
    })

    return () => {
      clearInterval(checkConnection)
      unsubscribe()
      eventsClient.disconnect()
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
