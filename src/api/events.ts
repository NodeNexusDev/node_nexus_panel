import { env } from '../lib/env'

type SseEventHandler = (event: MessageEvent) => void

const BASE_URL = env.VITE_API_URL || ''

export class EventsClient {
  private source: EventSource | null = null
  private handlers = new Map<string, Set<SseEventHandler>>()
  private _isConnected = false

  get isConnected(): boolean {
    return this._isConnected
  }

  connect() {
    if (this.source) return

    this.source = new EventSource(`${BASE_URL}/api/v1/events/stream`)

    this.source.onopen = () => {
      this._isConnected = true
    }

    this.source.onmessage = (event) => {
      this.emit('*', event)
      try {
        const data = JSON.parse(event.data)
        if (data.type) {
          this.emit(data.type, event)
        }
      } catch {
        // ignore parse errors
      }
    }

    this.source.onerror = () => {
      this._isConnected = false
      this.source?.close()
      this.source = null
      setTimeout(() => this.connect(), 3000)
    }
  }

  disconnect() {
    this.source?.close()
    this.source = null
    this._isConnected = false
  }

  on(event: string, handler: SseEventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
    return () => {
      this.handlers.get(event)?.delete(handler)
    }
  }

  private emit(event: string, data: MessageEvent) {
    this.handlers.get(event)?.forEach((h) => h(data))
    this.handlers.get('*')?.forEach((h) => h(data))
  }
}

export const eventsClient = new EventsClient()
