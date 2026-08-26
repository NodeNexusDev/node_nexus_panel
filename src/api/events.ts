import {
  fetchEventSource,
  type FetchEventSourceInit,
} from '@microsoft/fetch-event-source'
import { env } from '../lib/env'
import { api } from './client'

type SseEventHandler = (event: MessageEvent) => void

const BASE_URL = env.VITE_API_URL || ''

export class EventsClient {
  private controller: AbortController | null = null
  private handlers = new Map<string, Set<SseEventHandler>>()
  private _isConnected = false
  private _intentionalDisconnect = false
  private _retryCount = 0
  private static MAX_RETRY_DELAY = 30000

  get isConnected(): boolean {
    return this._isConnected
  }

  connect() {
    if (this.controller) return
    this._intentionalDisconnect = false

    this.controller = new AbortController()

    const headers: Record<string, string> = {}
    const token = api.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    fetchEventSource(`${BASE_URL}/api/v1/events/stream`, {
      headers,
      signal: this.controller.signal,
      openWhenHidden: true,
      onopen: async () => {
        this._isConnected = true
        this._retryCount = 0
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
        if (!this._intentionalDisconnect) {
          const delay = Math.min(3000 * 2 ** this._retryCount, EventsClient.MAX_RETRY_DELAY)
          this._retryCount++
          setTimeout(() => this.connect(), delay)
        }
      },
      onclose: () => {
        this._isConnected = false
        this.controller = null
        if (!this._intentionalDisconnect) {
          const delay = Math.min(3000 * 2 ** this._retryCount, EventsClient.MAX_RETRY_DELAY)
          this._retryCount++
          setTimeout(() => this.connect(), delay)
        }
      },
    } satisfies FetchEventSourceInit)
  }

  disconnect() {
    this._intentionalDisconnect = true
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
