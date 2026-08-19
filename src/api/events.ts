import {
  fetchEventSource,
  type FetchEventSourceInit,
} from '@microsoft/fetch-event-source'
import { env } from '../lib/env'

type SseEventHandler = (event: MessageEvent) => void

const BASE_URL = env.VITE_API_URL || ''
const API_KEY = env.VITE_API_KEY

export class EventsClient {
  private controller: AbortController | null = null
  private handlers = new Map<string, Set<SseEventHandler>>()
  private _isConnected = false

  get isConnected(): boolean {
    return this._isConnected
  }

  connect() {
    if (this.controller) return

    this.controller = new AbortController()

    const headers: Record<string, string> = {}
    if (API_KEY) {
      headers['X-API-Key'] = API_KEY
    }

    fetchEventSource(`${BASE_URL}/api/v1/events/stream`, {
      headers,
      signal: this.controller.signal,
      openWhenHidden: true,
      onopen: async () => {
        this._isConnected = true
      },
      onmessage: (event) => {
        const msg = new MessageEvent(event.event, {
          data: event.data,
          lastEventId: event.id,
        })
        this.emit('*', msg)
        try {
          const data = JSON.parse(event.data)
          if (data.type) {
            this.emit(data.type, msg)
          }
        } catch {
          // ignore parse errors
        }
      },
      onerror: () => {
        this._isConnected = false
        this.controller?.abort()
        this.controller = null
        setTimeout(() => this.connect(), 3000)
        return undefined
      },
      onclose: () => {
        this._isConnected = false
        this.controller = null
        setTimeout(() => this.connect(), 3000)
      },
    } satisfies FetchEventSourceInit)
  }

  disconnect() {
    this.controller?.abort()
    this.controller = null
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
