import type { ApiError } from './types'
import { env } from '../lib/env'

const API_URL = env.VITE_API_URL

class ApiClient {
  private baseUrl: string
  private accessToken: string | null = null
  private refreshPromise: Promise<string | null> | null = null
  /** Default abort timeout for requests; heavy bulk ops override per call. */
  static readonly DEFAULT_TIMEOUT_MS = 15_000

  constructor(baseUrl: string) {
    this.baseUrl = `${baseUrl}/api/v2`
  }

  setToken(token: string | null) {
    this.accessToken = token
  }

  getToken(): string | null {
    return this.accessToken
  }

  private async parseError(response: Response): Promise<ApiError> {
    try {
      const data = (await response.json()) as unknown as ApiError & ProblemBody
      return toApiError(response.status, data)
    } catch {
      return {
        code: 'UNKNOWN_ERROR',
        message: response.statusText,
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { timeoutMs?: number; acceptBulk422?: boolean } = {},
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
    const timeoutMs = options.timeoutMs ?? ApiClient.DEFAULT_TIMEOUT_MS
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
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
        const retryTimeout = setTimeout(() => retryController.abort(), timeoutMs)
        try {
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
            signal: options.signal ?? retryController.signal,
            credentials: 'include',
          })
          clearTimeout(retryTimeout)
          if (retryResponse.status === 204) {
            return undefined as T
          }
          if (retryResponse.ok || retryResponse.status === 207) {
            return retryResponse.json() as Promise<T>
          }
          const error = await this.parseError(retryResponse)
          throw new ApiRequestError(retryResponse.status, error)
        } catch (err) {
          clearTimeout(retryTimeout)
          if ((err as Error).name === 'AbortError') {
            throw new ApiRequestError(408, { code: 'TIMEOUT', message: 'Request timeout' })
          }
          throw err
        }
      }
    }

    // Bulk endpoints may return 207 Multi-Status on partial success (200-207 are success)
    if (response.status === 204) {
      return undefined as T
    }
    if (response.ok || response.status === 207) {
      return response.json() as Promise<T>
    }
    // All-failed bulk installs share the BulkResult shape on 422 — return it
    // instead of throwing when the caller opted in.
    if (response.status === 422 && options.acceptBulk422) {
      try {
        const data: unknown = await response.json()
        if (isBulkResult(data)) return data as T
      } catch {
        // fall through to error handling
      }
    }

    const error = await this.parseError(response)
    throw new ApiRequestError(response.status, error)
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

  async get<T>(endpoint: string, options?: RequestInit & { timeoutMs?: number }): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options })
  }

  async getBlob(endpoint: string): Promise<Blob> {
    const headers: Record<string, string> = {}
    if (this.accessToken) headers['Authorization'] = `Bearer ${this.accessToken}`
    const response = await fetch(`${this.baseUrl}${endpoint}`, { method: 'GET', headers, credentials: 'include' })
    if (response.ok || response.status === 207) {
      return response.blob()
    }
    const error = await this.parseError(response)
    throw new ApiRequestError(response.status, error)
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit & { timeoutMs?: number; acceptBulk422?: boolean }): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
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

export interface ProblemBody {
  type?: unknown; title?: unknown; status?: unknown; detail?: unknown;
  code?: unknown; message?: unknown; request_id?: unknown;
  instance?: unknown; errors?: unknown;
}

export function problemSlugToCode(typeUri: string): string {
  const slug = typeUri.split('/').pop() ?? 'unknown-error';
  return slug.toUpperCase().replace(/-/g, '_');
}

export function toApiError(_status: number, data: ApiError & ProblemBody): ApiError {
  const type = typeof data.type === 'string' && data.type ? data.type : 'unknown-error'
  const title = typeof data.title === 'string' && data.title ? data.title : 'Request failed'
  return {
    code: typeof data.code === 'string' && data.code ? data.code : problemSlugToCode(type),
    message: typeof data.message === 'string' && data.message ? data.message : title,
    detail: (data.detail ?? null) as unknown,
    request_id: (typeof data.request_id === 'string' ? data.request_id : null),
    details: toFieldDetails(data.errors),
  } as ApiError;
}

/** Map FastAPI validation `errors: [{loc, msg}]` to per-field messages. */
function toFieldDetails(errors: unknown): Record<string, string[]> | undefined {
  if (!Array.isArray(errors)) return undefined
  const out: Record<string, string[]> = {}
  for (const item of errors) {
    if (typeof item !== 'object' || item === null) continue
    const loc = (item as { loc?: unknown }).loc
    const msg = (item as { msg?: unknown }).msg
    if (typeof msg !== 'string') continue
    const key = Array.isArray(loc)
      ? loc.map(String).filter((p) => p !== 'body').join('.') || 'general'
      : 'general'
    ;(out[key] ??= []).push(msg)
  }
  return Object.keys(out).length > 0 ? out : undefined
}

/** BulkResult shape guard (200/207 success + 422 all-failed share it). */
function isBulkResult(data: unknown): data is { total: number; results: unknown[] } {
  if (typeof data !== 'object' || data === null) return false
  const rec = data as Record<string, unknown>
  return typeof rec.total === 'number' && Array.isArray(rec.results)
}
