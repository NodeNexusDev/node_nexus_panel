import { http, HttpResponse } from 'msw'
import { mockCommands } from '../data/commands'

const API_URL = '*'

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

  http.get(`${API_URL}/api/v1/commands/history`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const size = Number(url.searchParams.get('size') || '20')
    return HttpResponse.json({ items: [], total: 0, page, size })
  }),

  http.get(`${API_URL}/api/v1/commands/stats`, () => {
    return HttpResponse.json({
      total: 42,
      successful: 38,
      failed: 4,
      success_rate: 90.48,
      avg_duration_ms: 1250,
      min_duration_ms: 200,
      max_duration_ms: 5400,
      last_executed_at: '2025-08-18T10:00:00Z',
    })
  }),

  http.get(`${API_URL}/api/v1/commands/bulk/history`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const size = Number(url.searchParams.get('size') || '20')
    return HttpResponse.json({ items: [], total: 0, page, size })
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
      parameters: (body.parameters as Array<{ name: string; type?: 'string' | 'integer' | 'boolean'; required?: boolean; default?: unknown; description?: string | null }>) || [],
      tags: (body.tags as string[]) || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockCommands.push(newCmd)
    return HttpResponse.json(newCmd, { status: 201 })
  }),

  http.patch(`${API_URL}/api/v1/commands/:id`, async ({ params, request }) => {
    const idx = mockCommands.findIndex((c) => c.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    Object.assign(mockCommands[idx], body, { updated_at: new Date().toISOString() })
    return HttpResponse.json(mockCommands[idx])
  }),

  http.delete(`${API_URL}/api/v1/commands/:id`, ({ params }) => {
    const idx = mockCommands.findIndex((c) => c.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    mockCommands.splice(idx, 1)
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
    const cloned = {
      ...cmd,
      id: String(mockCommands.length + 1),
      name: `${cmd.name} (copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockCommands.push(cloned)
    return HttpResponse.json(cloned)
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

  http.post(`${API_URL}/api/v1/commands/execute`, async ({ request }) => {
    const body = await request.json() as { node_id: string; command: string; timeout?: number }
    return HttpResponse.json({
      stdout: `Executed: ${body.command}`,
      stderr: '',
      exit_code: 0,
    })
  }),

  http.post(`${API_URL}/api/v1/commands/executions/:executionId/retry`, () => {
    return HttpResponse.json({
      execution_id: 'retried-123',
      status: 'pending',
      message: 'Execution retried successfully',
    })
  }),

  http.post(`${API_URL}/api/v1/commands/bulk/execute`, async ({ request }) => {
    const body = await request.json() as { command: string; node_ids?: string[]; tags?: string[] }
    return HttpResponse.json({
      command: body.command,
      results: [],
      total: 0,
      succeeded: 0,
      failed: 0,
    })
  }),

  http.post(`${API_URL}/api/v1/commands/:id/bulk-execute`, async ({ request }) => {
    const body = await request.json() as { command: string; node_ids?: string[]; tags?: string[] }
    const nodeIds = body.node_ids || ['1', '2']
    return HttpResponse.json({
      command: body.command,
      results: nodeIds.map((nid) => ({
        node_id: nid,
        node_name: `node-${nid}`,
        stdout: `Command executed on node-${nid}`,
        stderr: '',
        exit_code: 0,
      })),
      total: nodeIds.length,
      succeeded: nodeIds.length,
      failed: 0,
    })
  }),

  http.post(`${API_URL}/api/v1/commands/bulk/cancel`, async ({ request }) => {
    const body = await request.json() as { execution_ids: string[] }
    return HttpResponse.json({
      results: body.execution_ids.map((id) => ({ execution_id: id, status: 'cancelled', message: 'Cancelled' })),
      total: body.execution_ids.length,
      succeeded: body.execution_ids.length,
      failed: 0,
    })
  }),

  http.post(`${API_URL}/api/v1/commands/bulk/retry`, async ({ request }) => {
    const body = await request.json() as { execution_ids: string[] }
    return HttpResponse.json({
      results: body.execution_ids.map((id) => ({ execution_id: id, status: 'pending', message: 'Retried' })),
      total: body.execution_ids.length,
      succeeded: body.execution_ids.length,
      failed: 0,
    })
  }),
]
