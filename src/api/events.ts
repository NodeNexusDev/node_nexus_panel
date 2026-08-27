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
  private connectionListeners = new Set<(connected: boolean) => void>()
  private _isConnected = false
  private _intentionalDisconnect = false
  private _retryCount = 0
  private _reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private static MAX_RETRY_DELAY = 30000
  private _lastEventId: string | null = null

  get isConnected(): boolean {
    return this._isConnected
  }

  onConnectionChange(cb: (connected: boolean) => void): () => void {
    this.connectionListeners.add(cb)
    cb(this._isConnected)
    return () => this.connectionListeners.delete(cb)
  }

  private setConnected(v: boolean) {
    if (this._isConnected === v) return
    this._isConnected = v
    this.connectionListeners.forEach((cb) => cb(v))
  }

  private scheduleReconnect() {
    if (this._intentionalDisconnect) return
    if (this._reconnectTimer) return
    const base = Math.min(3000 * 2 ** this._retryCount, EventsClient.MAX_RETRY_DELAY)
    const jitter = Math.random() * 1000
    const delay = base + jitter
    this._retryCount++
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null
      this.connect()
    }, delay)
  }

  connect() {
    if (this.controller) return
    this._intentionalDisconnect = false
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer)
      this._reconnectTimer = null
    }

    this.controller = new AbortController()

    const headers: Record<string, string> = {}
    const token = api.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    if (this._lastEventId) {
      headers['Last-Event-ID'] = this._lastEventId
    }

    fetchEventSource(`${BASE_URL}/api/v1/events/stream`, {
      headers,
      signal: this.controller.signal,
      openWhenHidden: false,
      onopen: async (res) => {
        if (res.ok) {
          this.setConnected(true)
          this._retryCount = 0
        } else if (res.status === 401) {
          // try refresh token then reconnect
          this.setConnected(false)
        }
      },
      onmessage: (event) => {
        if (event.id) this._lastEventId = event.id
        const msg = new MessageEvent(event.event || 'message', {
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
        this.setConnected(false)
        this.controller?.abort()
        this.controller = null
        this.scheduleReconnect()
      },
      onclose: () => {
        this.setConnected(false)
        this.controller = null
        this.scheduleReconnect()
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
