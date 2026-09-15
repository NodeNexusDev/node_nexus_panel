import { http, HttpResponse } from 'msw'

const API_URL = '*'

// Mirrors the real backend wire format (app/api/v2/events.py):
// the event name travels in the SSE `event:` field, the payload is a plain
// JSON object with NO `type` member. The backend currently publishes only
// `execution.cancelled`. Keep this handler in sync with the backend.
function encodeSse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export const eventsHandlers = [
  http.get(`${API_URL}/api/v2/events/stream`, () => {
    let keepaliveInterval: ReturnType<typeof setInterval> | null = null
    let eventInterval: ReturnType<typeof setInterval> | null = null

    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder()
        keepaliveInterval = setInterval(() => {
          controller.enqueue(enc.encode(': keepalive\n\n'))
        }, 15000)

        eventInterval = setInterval(() => {
          controller.enqueue(
            enc.encode(
              encodeSse('execution.cancelled', {
                execution_id: '00000000-0000-4000-8000-000000000000',
              }),
            ),
          )
        }, 30000)
      },
      cancel() {
        if (keepaliveInterval) clearInterval(keepaliveInterval)
        if (eventInterval) clearInterval(eventInterval)
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
