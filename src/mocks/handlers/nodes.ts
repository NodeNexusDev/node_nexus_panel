import { http, HttpResponse } from 'msw'
import { mockNodes } from '../data/nodes'

const API_URL = 'http://localhost:8000'

export const nodeHandlers = [
  http.get(`${API_URL}/api/v1/nodes/`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const size = Number(url.searchParams.get('size') || '20')
    const start = (page - 1) * size
    const items = mockNodes.slice(start, start + size)
    return HttpResponse.json({ items, total: mockNodes.length, page, size })
  }),

  http.get(`${API_URL}/api/v1/nodes/tags`, () => {
    const tags = [...new Set(mockNodes.flatMap((n) => n.tags))]
    return HttpResponse.json(tags)
  }),

  http.get(`${API_URL}/api/v1/nodes/:id`, ({ params }) => {
    const node = mockNodes.find((n) => n.id === params.id)
    if (!node) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(node)
  }),

  http.post(`${API_URL}/api/v1/nodes/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const newNode = {
      id: String(mockNodes.length + 1),
      name: body.name as string,
      host: body.host as string,
      port: (body.port as number) || 22,
      connection_type: (body.connection_type as 'ssh') || 'ssh',
      status: 'active' as const,
      username: (body.username as string) || null,
      docker_host: (body.docker_host as string) || null,
      tags: (body.tags as string[]) || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(newNode, { status: 201 })
  }),

  http.put(`${API_URL}/api/v1/nodes/:id`, async ({ params, request }) => {
    const node = mockNodes.find((n) => n.id === params.id)
    if (!node) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json({ ...node, ...body, updated_at: new Date().toISOString() })
  }),

  http.delete(`${API_URL}/api/v1/nodes/:id`, ({ params }) => {
    const node = mockNodes.find((n) => n.id === params.id)
    if (!node) return new HttpResponse(null, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API_URL}/api/v1/nodes/:id/check`, ({ params }) => {
    const node = mockNodes.find((n) => n.id === params.id)
    if (!node) return new HttpResponse(null, { status: 404 })
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${API_URL}/api/v1/nodes/:id/metrics`, ({ params }) => {
    const node = mockNodes.find((n) => n.id === params.id)
    if (!node) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      cpu: { usage_percent: 45.2, cores: 4 },
      memory: { total_bytes: 8589934592, used_bytes: 5368709120, percent: 62.5 },
      disk: { total_bytes: 53687091200, used_bytes: 34896609280, percent: 65.0 },
      uptime_since: '2026-01-10T08:00:00Z',
    })
  }),

  http.get(`${API_URL}/api/v1/nodes/:id/commands/history`, ({ params }) => {
    const node = mockNodes.find((n) => n.id === params.id)
    if (!node) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ items: [], total: 0, page: 1, size: 20 })
  }),

  http.post(`${API_URL}/api/v1/nodes/:id/execute`, async ({ params }) => {
    const node = mockNodes.find((n) => n.id === params.id)
    if (!node) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      stdout: 'Command executed successfully',
      stderr: '',
      exit_code: 0,
    })
  }),

  http.post(`${API_URL}/api/v1/nodes/bulk/delete`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API_URL}/api/v1/nodes/bulk/check`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API_URL}/api/v1/nodes/bulk/execute`, () => {
    return HttpResponse.json({
      command: 'echo test',
      results: [],
      total: 0,
      succeeded: 0,
      failed: 0,
    })
  }),

  http.get(`${API_URL}/api/v1/nodes/:id/stats`, ({ params }) => {
    const node = mockNodes.find((n) => n.id === params.id)
    if (!node) return new HttpResponse(null, { status: 404 })
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

  http.get(`${API_URL}/api/v1/nodes/:id/status-history`, ({ params, request }) => {
    const node = mockNodes.find((n) => n.id === params.id)
    if (!node) return new HttpResponse(null, { status: 404 })
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const size = Number(url.searchParams.get('size') || '20')
    const items = [
      { id: 'sh1', node_id: node.id, old_status: null, new_status: 'active', source: 'health_check', changed_at: '2025-08-18T10:00:00Z' },
      { id: 'sh2', node_id: node.id, old_status: 'active', new_status: 'unreachable', source: 'health_check', changed_at: '2025-08-17T22:00:00Z' },
      { id: 'sh3', node_id: node.id, old_status: 'unreachable', new_status: 'active', source: 'manual', changed_at: '2025-08-17T23:30:00Z' },
    ]
    return HttpResponse.json({ items: items.slice((page - 1) * size, page * size), total: items.length, page, size })
  }),

  http.post(`${API_URL}/api/v1/nodes/:nodeId/commands/:executionId/retry`, () => {
    return HttpResponse.json({
      execution_id: 'retried-123',
      status: 'pending',
      message: 'Execution retried successfully',
    })
  }),

  http.post(`${API_URL}/api/v1/nodes/validate-credentials`, async ({ request }) => {
    const body = await request.json() as { host: string; connection_type: string }
    if (body.host === 'invalid-host') {
      return HttpResponse.json({ status: 'unreachable', message: 'Connection refused' })
    }
    return HttpResponse.json({ status: 'active', message: 'Credentials validated successfully' })
  }),

  http.get(`${API_URL}/api/v1/nodes/bulk/history`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const size = Number(url.searchParams.get('size') || '20')
    return HttpResponse.json({ items: [], total: 0, page, size })
  }),

  http.post(`${API_URL}/api/v1/nodes/bulk/tags/add`, async ({ request }) => {
    const body = await request.json() as { node_ids: string[]; tags: string[] }
    return HttpResponse.json({ affected: body.node_ids.length, node_ids: body.node_ids })
  }),

  http.post(`${API_URL}/api/v1/nodes/bulk/tags/remove`, async ({ request }) => {
    const body = await request.json() as { node_ids: string[]; tags: string[] }
    return HttpResponse.json({ affected: body.node_ids.length, node_ids: body.node_ids })
  }),
]
