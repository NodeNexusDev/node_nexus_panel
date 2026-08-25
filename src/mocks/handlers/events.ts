import { http, HttpResponse } from 'msw'

const API_URL = '*'

function encodeSse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export const eventsHandlers = [
  http.get(`${API_URL}/api/v1/events/stream`, () => {
    let heartbeatInterval: ReturnType<typeof setInterval> | null = null
    let realEventInterval: ReturnType<typeof setInterval> | null = null

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

        sendEvent('heartbeat', { message: 'connected' })

        heartbeatInterval = setInterval(() => {
          sendEvent('heartbeat', { message: 'keep-alive' })
        }, 15000)

        const realEvents = [
          'node:status',
          'node:metrics',
          'command:complete',
          'script:complete',
          'docker:container:started',
          'docker:container:stopped',
          'system:alert',
        ]
        realEventInterval = setInterval(() => {
          const type = realEvents[Math.floor(Math.random() * realEvents.length)]
          sendEvent(type, {})
        }, 30000)
      },
      cancel() {
        if (heartbeatInterval) clearInterval(heartbeatInterval)
        if (realEventInterval) clearInterval(realEventInterval)
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
