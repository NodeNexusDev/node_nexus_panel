import { http, HttpResponse } from 'msw'
import { mockCommands } from '../data/commands'

const API_URL = 'http://localhost:8000'

export const commandHandlers = [
  http.get(`${API_URL}/api/v1/commands/`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const size = Number(url.searchParams.get('size') || '20')
    const tag = url.searchParams.get('tag')
    const search = url.searchParams.get('search')
    let filtered = mockCommands
    if (tag) {
      filtered = filtered.filter((c) => c.tags.includes(tag))
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(q) || c.command.toLowerCase().includes(q))
    }
    const start = (page - 1) * size
    const items = filtered.slice(start, start + size)
    return HttpResponse.json({ items, total: filtered.length, page, size })
  }),

  http.get(`${API_URL}/api/v1/commands/tags`, () => {
    const tags = [...new Set(mockCommands.flatMap((c) => c.tags))]
    return HttpResponse.json(tags)
  }),

  http.get(`${API_URL}/api/v1/commands/:id`, ({ params }) => {
    const cmd = mockCommands.find((c) => c.id === params.id)
    if (!cmd) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(cmd)
  }),

  http.post(`${API_URL}/api/v1/commands/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const newCmd = {
      id: String(mockCommands.length + 1),
      name: body.name as string,
      description: (body.description as string) || null,
      command: body.command as string,
      parameters: (body.parameters as Record<string, unknown>[]) || null,
      tags: (body.tags as string[]) || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(newCmd, { status: 201 })
  }),

  http.put(`${API_URL}/api/v1/commands/:id`, async ({ params, request }) => {
    const cmd = mockCommands.find((c) => c.id === params.id)
    if (!cmd) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ ...cmd, ...body, updated_at: new Date().toISOString() })
  }),

  http.delete(`${API_URL}/api/v1/commands/:id`, ({ params }) => {
    const cmd = mockCommands.find((c) => c.id === params.id)
    if (!cmd) return new HttpResponse(null, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API_URL}/api/v1/commands/:id/execute`, async ({ params }) => {
    const cmd = mockCommands.find((c) => c.id === params.id)
    if (!cmd) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      stdout: 'Command executed successfully',
      stderr: '',
      exit_code: 0,
    })
  }),

  http.post(`${API_URL}/api/v1/commands/:id/clone`, ({ params }) => {
    const cmd = mockCommands.find((c) => c.id === params.id)
    if (!cmd) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      ...cmd,
      id: String(mockCommands.length + 1),
      name: `${cmd.name} (copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }),

  http.get(`${API_URL}/api/v1/commands/:id/stats`, ({ params }) => {
    const cmd = mockCommands.find((c) => c.id === params.id)
    if (!cmd) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      total: 15,
      successful: 13,
      failed: 2,
      success_rate: 86.67,
      avg_duration_ms: 1200,
      min_duration_ms: 200,
      max_duration_ms: 4500,
      last_executed_at: '2026-01-15T10:00:00Z',
    })
  }),
]
