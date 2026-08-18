import { http, HttpResponse } from 'msw'
import { mockScripts } from '../data/scripts'

const API_URL = 'http://localhost:8000'

export const scriptHandlers = [
  http.get(`${API_URL}/api/v1/scripts/`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const size = Number(url.searchParams.get('size') || '20')
    const start = (page - 1) * size
    const items = mockScripts.slice(start, start + size)
    return HttpResponse.json({ items, total: mockScripts.length, page, size })
  }),

  http.get(`${API_URL}/api/v1/scripts/tags`, () => {
    const tags = [...new Set(mockScripts.flatMap((s) => s.tags))]
    return HttpResponse.json(tags)
  }),

  http.get(`${API_URL}/api/v1/scripts/:id`, ({ params }) => {
    const script = mockScripts.find((s) => s.id === params.id)
    if (!script) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(script)
  }),

  http.post(`${API_URL}/api/v1/scripts/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const newScript = {
      id: String(mockScripts.length + 1),
      name: body.name as string,
      description: (body.description as string) || null,
      steps: (body.steps as Record<string, unknown>[]) || [],
      tags: (body.tags as string[]) || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(newScript, { status: 201 })
  }),

  http.put(`${API_URL}/api/v1/scripts/:id`, async ({ params, request }) => {
    const script = mockScripts.find((s) => s.id === params.id)
    if (!script) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ ...script, ...body, updated_at: new Date().toISOString() })
  }),

  http.delete(`${API_URL}/api/v1/scripts/:id`, ({ params }) => {
    const script = mockScripts.find((s) => s.id === params.id)
    if (!script) return new HttpResponse(null, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API_URL}/api/v1/scripts/:id/execute`, ({ params }) => {
    const script = mockScripts.find((s) => s.id === params.id)
    if (!script) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      script_id: script.id,
      results: [],
    })
  }),

  http.post(`${API_URL}/api/v1/scripts/:id/clone`, ({ params }) => {
    const script = mockScripts.find((s) => s.id === params.id)
    if (!script) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      ...script,
      id: String(mockScripts.length + 1),
      name: `${script.name} (copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }),

  http.get(`${API_URL}/api/v1/scripts/:id/stats`, ({ params }) => {
    const script = mockScripts.find((s) => s.id === params.id)
    if (!script) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ total_executions: 10, successful: 8, failed: 2 })
  }),

  http.get(`${API_URL}/api/v1/scripts/:id/schedule`, ({ params }) => {
    const script = mockScripts.find((s) => s.id === params.id)
    if (!script) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ cron: '0 2 * * *', enabled: true })
  }),

  http.post(`${API_URL}/api/v1/scripts/:id/schedule`, () => {
    return HttpResponse.json({ cron: '0 2 * * *', enabled: true })
  }),

  http.delete(`${API_URL}/api/v1/scripts/:id/schedule`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
