type WebSocketEventType =
  | 'node:status'
  | 'command:output'
  | 'command:complete'
  | 'system:alert'
  | 'script:complete'

interface WebSocketEvent {
  type: WebSocketEventType
  payload: unknown
}

type EventHandler = (payload: unknown) => void

import { env } from '../lib/env'

const WS_URL = env.VITE_WS_URL

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000]
const HEARTBEAT_INTERVAL = 30000

export class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private handlers = new Map<WebSocketEventType, Set<EventHandler>>()
  private reconnectAttempt = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private _isConnected = false
  private _token: string | undefined

  constructor(url: string = WS_URL) {
    this.url = url
  }

  get isConnected(): boolean {
    return this._isConnected
  }

  connect(token?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return

    if (token) this._token = token
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      this._isConnected = true
      this.reconnectAttempt = 0
      this.startHeartbeat()
      if (this._token) {
        this.ws?.send(JSON.stringify({ type: 'auth', token: this._token }))
      }
      this.emit('system:alert', { message: 'Connected' })
    }

    this.ws.onmessage = (event) => {
      try {
        const data: WebSocketEvent = JSON.parse(event.data)
        this.emit(data.type, data.payload)
      } catch {
        // ignore malformed messages
      }
    }

    this.ws.onclose = () => {
      this._isConnected = false
      this.stopHeartbeat()
      this.scheduleReconnect()
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  disconnect() {
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectAttempt = RECONNECT_DELAYS.length
    this.ws?.close()
    this.ws = null
    this._isConnected = false
  }

  on(event: WebSocketEventType, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)

    return () => {
      this.handlers.get(event)?.delete(handler)
    }
  }

  private emit(event: WebSocketEventType, payload: unknown) {
    this.handlers.get(event)?.forEach((handler) => handler(payload))
  }

  private scheduleReconnect() {
    if (this.reconnectAttempt >= RECONNECT_DELAYS.length) return

    const delay = RECONNECT_DELAYS[this.reconnectAttempt]
    this.reconnectAttempt++

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, HEARTBEAT_INTERVAL)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }
}

export const wsClient = new WebSocketClient()
