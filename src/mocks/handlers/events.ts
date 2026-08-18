import { http, HttpResponse } from 'msw'

const API_URL = '*'

function encodeSse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export const eventsHandlers = [
  http.get(`${API_URL}/api/v1/events/stream`, () => {
    const stream = new ReadableStream({
      start(controller) {
        const sendEvent = (type: string, payload: unknown) => {
          const event = {
            type,
            payload,
            timestamp: new Date().toISOString(),
          }
          controller.enqueue(new TextEncoder().encode(encodeSse(type, event)))
        }

        // Send initial heartbeat to establish connection
        sendEvent('heartbeat', { message: 'connected' })

        const _interval = setInterval(() => {
          sendEvent('heartbeat', { message: 'keep-alive' })
        }, 15000)

        // Occasionally emit real event types so dashboard refetch logic is exercised
        const realEvents = [
          'node:status',
          'node:metrics',
          'command:complete',
          'script:complete',
          'docker:container:started',
          'docker:container:stopped',
          'system:alert',
        ]
        const _realEventInterval = setInterval(() => {
          const type = realEvents[Math.floor(Math.random() * realEvents.length)]
          sendEvent(type, {})
        }, 30000)

        // Keep references alive until the stream is closed
        void _interval
        void _realEventInterval


      },
    })

    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }),
]
