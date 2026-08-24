import { http, HttpResponse } from 'msw'
import { mockApiKeys } from '../data/api-keys'

const API_URL = '*'

export const apiKeyHandlers = [
  http.get(`${API_URL}/api/v1/api-keys/`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const size = Number(url.searchParams.get('size') || '20')
    const start = (page - 1) * size
    const items = mockApiKeys.slice(start, start + size)
    return HttpResponse.json({ items, total: mockApiKeys.length, page, size })
  }),

  http.post(`${API_URL}/api/v1/api-keys/`, async ({ request }) => {
    const body = (await request.json()) as { name: string; scope?: string }
    const newKey = {
      id: String(mockApiKeys.length + 1),
      name: body.name,
      key_prefix: 'sk-ne',
      is_active: true,
      scope: (body.scope || 'read-write') as 'read-only' | 'read-write',
      created_at: new Date().toISOString(),
      last_used_at: null,
      expires_at: null,
    }
    mockApiKeys.push(newKey)
    return HttpResponse.json(newKey, { status: 201 })
  }),

  http.delete(`${API_URL}/api/v1/api-keys/:id`, ({ params }) => {
    const idx = mockApiKeys.findIndex((k) => k.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    mockApiKeys.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.patch(`${API_URL}/api/v1/api-keys/:id`, async ({ params, request }) => {
    const idx = mockApiKeys.findIndex((k) => k.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    Object.assign(mockApiKeys[idx], body)
    return HttpResponse.json(mockApiKeys[idx])
  }),
]
