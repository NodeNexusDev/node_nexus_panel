import { http, HttpResponse } from 'msw'
import { mockNodes } from '../data/nodes'

const API_URL = '*'

export const nodeHandlers = [
  http.get(`${API_URL}/api/v1/nodes/`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const size = Number(url.searchParams.get('size') || '20')
    const tags = url.searchParams.get('tags')
    const search = url.searchParams.get('search')
    const status = url.searchParams.get('status')
    let filtered = mockNodes
    if (tags) {
      const tagList = tags.split(',')
      filtered = filtered.filter((n) => tagList.some((t) => n.tags.includes(t)))
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter((n) => n.name.toLowerCase().includes(q) || n.host.toLowerCase().includes(q))
    }
    if (status) {
      const statusList = status.split(',')
      filtered = filtered.filter((n) => statusList.includes(n.status))
    }
    const start = (page - 1) * size
    const items = filtered.slice(start, start + size)
    return HttpResponse.json({ items, total: filtered.length, page, size })
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
    mockNodes.push(newNode)
    return HttpResponse.json(newNode, { status: 201 })
  }),

  http.patch(`${API_URL}/api/v1/nodes/:id`, async ({ params, request }) => {
    const idx = mockNodes.findIndex((n) => n.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    Object.assign(mockNodes[idx], body, { updated_at: new Date().toISOString() })
    return HttpResponse.json(mockNodes[idx])
  }),

  http.delete(`${API_URL}/api/v1/nodes/:id`, ({ params }) => {
    const idx = mockNodes.findIndex((n) => n.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    mockNodes.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API_URL}/api/v1/nodes/:id/check`, ({ params }) => {
    const node = mockNodes.find((n) => n.id === params.id)
    if (!node) return new HttpResponse(null, { status: 404 })
    node.status = 'active'
    node.updated_at = new Date().toISOString()
    return HttpResponse.json(node)
  }),

  http.get(`${API_URL}/api/v1/nodes/:id/metrics`, ({ params }) => {
    const node = mockNodes.find((n) => n.id === params.id)
    if (!node) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      cpu: { usage_percent: 45.2, cores: 4 },
      memory: { total_bytes: 8589934592, used_bytes: 5368709120, percent: 62.5 },
      disk: { total_bytes: 53687091200, used_bytes: 34896609280, percent: 65.0 },
      load_average: { one_min: 1.23, five_min: 0.98, fifteen_min: 0.85 },
      uptime_since: '2026-01-10T08:00:00Z',
    })
  }),

  http.post(`${API_URL}/api/v1/nodes/bulk/delete`, async ({ request }) => {
    const body = await request.json() as { node_ids: string[] }
    for (const id of body.node_ids) {
      const idx = mockNodes.findIndex((n) => n.id === id)
      if (idx !== -1) mockNodes.splice(idx, 1)
    }
    return HttpResponse.json({ affected: body.node_ids.length, node_ids: body.node_ids })
  }),

  http.post(`${API_URL}/api/v1/nodes/bulk/check`, async ({ request }) => {
    const body = await request.json() as { node_ids: string[] }
    for (const id of body.node_ids) {
      const node = mockNodes.find((n) => n.id === id)
      if (node) {
        node.status = 'active'
        node.updated_at = new Date().toISOString()
      }
    }
    return HttpResponse.json({ affected: body.node_ids.length, node_ids: body.node_ids })
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

  http.post(`${API_URL}/api/v1/nodes/validate-credentials`, async ({ request }) => {
    const body = await request.json() as { host: string; connection_type: string }
    if (body.host === 'invalid-host') {
      return HttpResponse.json({ status: 'unreachable', message: 'Connection refused' })
    }
    return HttpResponse.json({ status: 'active', message: 'Credentials validated successfully' })
  }),

  http.patch(`${API_URL}/api/v1/nodes/bulk/update`, async ({ request }) => {
    const body = await request.json() as { node_ids: string[]; changes: Record<string, unknown> }
    for (const id of body.node_ids) {
      const node = mockNodes.find((n) => n.id === id)
      if (node) {
        Object.assign(node, body.changes, { updated_at: new Date().toISOString() })
      }
    }
    return HttpResponse.json({
      results: body.node_ids.map((id) => ({ node_id: id, status: 'success' })),
      total: body.node_ids.length,
      succeeded: body.node_ids.length,
      failed: 0,
    })
  }),

  http.post(`${API_URL}/api/v1/nodes/bulk/metrics`, async ({ request }) => {
    const body = await request.json() as { node_ids: string[] }
    return HttpResponse.json({
      results: body.node_ids.map((id) => ({
        node_id: id,
        node_name: `Node ${id}`,
        status: 'success',
        metrics: {
          cpu: { usage_percent: 45.2, cores: 4 },
          memory: { total_bytes: 8589934592, used_bytes: 5368709120, percent: 62.5 },
          disk: { total_bytes: 53687091200, used_bytes: 34896609280, percent: 65.0 },
          load_average: { one_min: 1.23, five_min: 0.98, fifteen_min: 0.85 },
          uptime_since: '2026-01-10T08:00:00Z',
        },
      })),
      total: body.node_ids.length,
      succeeded: body.node_ids.length,
      failed: 0,
    })
  }),

  http.post(`${API_URL}/api/v1/nodes/bulk/validate-credentials`, async ({ request }) => {
    const body = await request.json() as { node_ids: string[]; tags?: string[] }
    return HttpResponse.json({
      results: body.node_ids.map((id) => ({
        node_id: id,
        node_name: `Node ${id}`,
        status: 'active',
        message: 'Credentials validated successfully',
      })),
      total: body.node_ids.length,
      succeeded: body.node_ids.length,
      failed: 0,
    })
  }),
]
