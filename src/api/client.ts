import type { ApiError } from './types'
import { env } from '../lib/env'

const API_URL = env.VITE_API_URL

class ApiClient {
  private baseUrl: string
  private accessToken: string | null = null
  private refreshPromise: Promise<string | null> | null = null

  constructor(baseUrl: string) {
    this.baseUrl = `${baseUrl}/api/v1`
  }

  setToken(token: string | null) {
    this.accessToken = token
  }

  getToken(): string | null {
    return this.accessToken
  }

  private async parseError(response: Response): Promise<ApiError> {
    try {
      const data = (await response.json()) as ApiError
      // Back-compat: map legacy details -> detail
      if (data.details && !data.detail) {
        return { ...data, detail: data.details } as ApiError
      }
      return data
    } catch {
      return {
        code: 'UNKNOWN_ERROR',
        message: response.statusText,
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }
    const isFormData = options.body instanceof FormData
    if (options.body && !isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15_000)
    const signal = options.signal ?? controller.signal

    let response: Response
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal,
        credentials: 'include',
      })
    } catch (err) {
      clearTimeout(timeoutId)
      if ((err as Error).name === 'AbortError') {
        throw new ApiRequestError(408, { code: 'TIMEOUT', message: 'Request timeout' })
      }
      throw err
    }
    clearTimeout(timeoutId)

    if (response.status === 401) {
      const newToken = await this.tryRefresh()
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`
        const retryController = new AbortController()
        const retryTimeout = setTimeout(() => retryController.abort(), 15_000)
        try {
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
            signal: options.signal ?? retryController.signal,
            credentials: 'include',
          })
          clearTimeout(retryTimeout)
          if (!retryResponse.ok) {
            const error = await this.parseError(retryResponse)
            throw new ApiRequestError(retryResponse.status, error)
          }
          if (retryResponse.status === 204) {
            return undefined as T
          }
          return retryResponse.json() as Promise<T>
        } catch (err) {
          clearTimeout(retryTimeout)
          if ((err as Error).name === 'AbortError') {
            throw new ApiRequestError(408, { code: 'TIMEOUT', message: 'Request timeout' })
          }
          throw err
        }
      }
    }

    if (!response.ok) {
      const error = await this.parseError(response)
      throw new ApiRequestError(response.status, error)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json() as Promise<T>
  }

  private async tryRefresh(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })
        if (!response.ok) return null
        const data = await response.json() as { access_token: string; token_type: string }
        this.accessToken = data.access_token
        return data.access_token
      } catch {
        return null
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: { body?: unknown }): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: options?.body ? JSON.stringify(options.body) : undefined,
    })
  }
}

export class ApiRequestError extends Error {
  status: number
  error: ApiError

  constructor(status: number, error: ApiError) {
    super(error.message)
    this.name = 'ApiRequestError'
    this.status = status
    this.error = error
  }
}

export const api = new ApiClient(API_URL)
