// @ts-nocheck
import { http, HttpResponse } from 'msw'
import { mockNodes } from '../data/nodes'

const API_URL = '*'

function parseCursor(cursor: string | null): number {
  if (!cursor) return 0
  try {
    const decoded = atob(cursor)
    const n = Number(decoded)
    return Number.isNaN(n) ? 0 : n
  } catch {
    const n = Number(cursor)
    return Number.isNaN(n) ? 0 : n
  }
}
function encodeCursor(offset: number): string {
  return btoa(String(offset))
}

export const nodeHandlers = [
  // ── List (v2 cursor) with legacy page/size fallback ─────────
  http.get(`${API_URL}/api/v2/nodes/`, ({ request }) => {
    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const limit = Number(url.searchParams.get('limit') || url.searchParams.get('size') || '20')
    const page = Number(url.searchParams.get('page') || '1')
    const tag = url.searchParams.get('tag') || url.searchParams.get('tags')?.split(',')[0]
    const search = url.searchParams.get('search')
    let filtered = mockNodes
    if (tag) {
      filtered = filtered.filter((n) => n.tags.includes(tag))
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter((n) => n.name.toLowerCase().includes(q) || n.host.toLowerCase().includes(q))
    }
    // cursor takes precedence over page
    let offset = 0
    if (cursor) offset = parseCursor(cursor)
    else if (url.searchParams.get('page')) offset = (page - 1) * limit
    const items = filtered.slice(offset, offset + limit)
    const nextOffset = offset + limit
    const has_more = nextOffset < filtered.length
    const next_cursor = has_more ? encodeCursor(nextOffset) : null
    // Return cursor shape, but also include page/size/total for legacy compat
    return HttpResponse.json({
      items,
      limit,
      next_cursor,
      has_more,
      // legacy
      total: filtered.length,
      page,
      size: limit,
    })
  }),

  http.get(`${API_URL}/api/v2/nodes/:id`, ({ params }) => {
    const node = mockNodes.find((n) => n.id === params.id)
    if (!node) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    return HttpResponse.json(node)
  }),

  // Bulk create (v2) - POST /nodes/ with {items:[NodeCreate]}
  http.post(`${API_URL}/api/v2/nodes/`, async ({ request }) => {
    const body = (await request.json()) as { items?: Array<Record<string, unknown>>; name?: string; host?: string }
    // Support both bulk {items:[...]} and legacy single {name,host,...}
    const items = body.items || (body.name ? [body] : [])
    const results = items.map((item: any) => {
      const newNode = {
        id: String(mockNodes.length + 1 + Math.floor(Math.random() * 1000)),
        name: item.name as string,
        host: item.host as string,
        port: (item.port as number) || 22,
        connection_type: (item.connection_type as 'ssh') || 'ssh',
        status: 'active' as const,
        username: (item.username as string) || null,
        docker_host: (item.docker_host as string) || null,
        has_docker: (item.has_docker as boolean) ?? false,
        tags: (item.tags as string[]) || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: (item.description as string) || null,
      }
      mockNodes.push(newNode)
      return { node_id: newNode.id, status: 'success', error: '' }
    })
    // Also handle legacy single create that expects Node returned directly
    // If request was legacy single (no items), return Node
    if (!body.items && body.name) {
      const last = mockNodes[mockNodes.length - 1]
      return HttpResponse.json(last, { status: 201 })
    }
    return HttpResponse.json({ total: results.length, succeeded: results.length, failed: 0, results }, { status: 201 })
  }),

  http.patch(`${API_URL}/api/v2/nodes/:id`, async ({ params, request }) => {
    const idx = mockNodes.findIndex((n) => n.id === params.id)
    if (idx === -1) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    Object.assign(mockNodes[idx], body, { updated_at: new Date().toISOString() })
    return HttpResponse.json(mockNodes[idx])
  }),

  http.delete(`${API_URL}/api/v2/nodes/:id`, ({ params }) => {
    const idx = mockNodes.findIndex((n) => n.id === params.id)
    if (idx === -1) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    mockNodes.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // Legacy single check - map to bulk
  http.post(`${API_URL}/api/v2/nodes/:id/check`, ({ params }) => {
    const node = mockNodes.find((n) => n.id === params.id)
    if (!node) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    node.status = 'active'
    node.updated_at = new Date().toISOString()
    return HttpResponse.json(node)
  }),

  http.post(`${API_URL}/api/v2/nodes/:id/refresh-host-key`, ({ params }) => {
    const node = mockNodes.find((n) => n.id === params.id)
    if (!node) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    node.updated_at = new Date().toISOString()
    return HttpResponse.json(node)
  }),

  http.get(`${API_URL}/api/v2/nodes/:id/metrics`, ({ params }) => {
    const node = mockNodes.find((n) => n.id === params.id)
    if (!node) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    return HttpResponse.json({
      cpu: { usage_percent: 45.2, cores: 4 },
      memory: { total_bytes: 8589934592, used_bytes: 5368709120, percent: 62.5 },
      disk: { total_bytes: 53687091200, used_bytes: 34896609280, percent: 65.0 },
      load_average: { one_min: 1.23, five_min: 0.98, fifteen_min: 0.85 },
      uptime_since: '2026-01-10T08:00:00Z',
    })
  }),

  // ── Bulk v2 ─────────────────────────────────────────────────
  http.post(`${API_URL}/api/v2/nodes/deletions`, async ({ request }) => {
    const body = (await request.json()) as { ids?: string[]; node_ids?: string[] }
    const ids = body.ids || body.node_ids || []
    for (const id of ids) {
      const idx = mockNodes.findIndex((n) => n.id === id)
      if (idx !== -1) mockNodes.splice(idx, 1)
    }
    return HttpResponse.json({
      total: ids.length,
      succeeded: ids.length,
      failed: 0,
      results: ids.map((id) => ({ node_id: id, status: 'success', error: '' })),
    })
  }),

  // Legacy bulk/delete
  http.post(`${API_URL}/api/v2/nodes/bulk/delete`, async ({ request }) => {
    const body = (await request.json()) as { node_ids: string[] }
    for (const id of body.node_ids) {
      const idx = mockNodes.findIndex((n) => n.id === id)
      if (idx !== -1) mockNodes.splice(idx, 1)
    }
    return HttpResponse.json({ affected: body.node_ids.length, node_ids: body.node_ids })
  }),

  http.post(`${API_URL}/api/v2/nodes/checks`, async ({ request }) => {
    const body = (await request.json()) as { ids?: string[]; node_ids?: string[] }
    const ids = body.ids || body.node_ids || []
    for (const id of ids) {
      const node = mockNodes.find((n) => n.id === id)
      if (node) {
        node.status = 'active'
        node.updated_at = new Date().toISOString()
      }
    }
    return HttpResponse.json({
      total: ids.length,
      succeeded: ids.length,
      failed: 0,
      results: ids.map((id) => ({ node_id: id, status: 'success', error: '' })),
    })
  }),

  http.post(`${API_URL}/api/v2/nodes/bulk/check`, async ({ request }) => {
    const body = (await request.json()) as { node_ids: string[] }
    for (const id of body.node_ids) {
      const node = mockNodes.find((n) => n.id === id)
      if (node) {
        node.status = 'active'
        node.updated_at = new Date().toISOString()
      }
    }
    return HttpResponse.json({ affected: body.node_ids.length, node_ids: body.node_ids })
  }),

  http.get(`${API_URL}/api/v2/nodes/:id/status-history`, ({ params, request }) => {
    const node = mockNodes.find((n) => n.id === params.id)
    if (!node) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const limit = Number(url.searchParams.get('limit') || url.searchParams.get('size') || '20')
    const page = Number(url.searchParams.get('page') || '1')
    let offset = 0
    if (cursor) offset = parseCursor(cursor)
    else if (url.searchParams.get('page')) offset = (page - 1) * limit
    const all = [
      { id: 'sh1', node_id: node.id, old_status: null, new_status: 'active', source: 'health_check', changed_at: '2025-08-18T10:00:00Z' },
      { id: 'sh2', node_id: node.id, old_status: 'active', new_status: 'unreachable', source: 'health_check', changed_at: '2025-08-17T22:00:00Z' },
      { id: 'sh3', node_id: node.id, old_status: 'unreachable', new_status: 'active', source: 'manual', changed_at: '2025-08-17T23:30:00Z' },
    ]
    const items = all.slice(offset, offset + limit)
    const has_more = offset + limit < all.length
    const next_cursor = has_more ? encodeCursor(offset + limit) : null
    return HttpResponse.json({
      items,
      limit,
      next_cursor,
      has_more,
      total: all.length,
      page,
      size: limit,
    })
  }),

  http.post(`${API_URL}/api/v2/nodes/validate-credentials`, async ({ request }) => {
    const body = (await request.json()) as { host: string; connection_type: string }
    if (body.host === 'invalid-host') {
      return HttpResponse.json({ status: 'unreachable', message: 'Connection refused' })
    }
    return HttpResponse.json({ status: 'active', message: 'Credentials validated successfully' })
  }),

  // PATCH /nodes/ bulk update (v2)
  http.patch(`${API_URL}/api/v2/nodes/`, async ({ request }) => {
    const body = (await request.json()) as { updates?: Array<{ id: string; changes: Record<string, unknown> }>; node_ids?: string[]; changes?: Record<string, unknown> }
    let updates: Array<{ id: string; changes: Record<string, unknown> }> = []
    if (body.updates) updates = body.updates
    else if (body.node_ids && body.changes) updates = body.node_ids.map((id) => ({ id, changes: body.changes! }))
    for (const u of updates) {
      const node = mockNodes.find((n) => n.id === u.id)
      if (node) Object.assign(node, u.changes, { updated_at: new Date().toISOString() })
    }
    return HttpResponse.json({
      total: updates.length,
      succeeded: updates.length,
      failed: 0,
      results: updates.map((u) => ({ node_id: u.id, status: 'success', error: '' })),
    })
  }),

  http.patch(`${API_URL}/api/v2/nodes/bulk/update`, async ({ request }) => {
    const body = (await request.json()) as { node_ids: string[]; changes: Record<string, unknown> }
    for (const id of body.node_ids) {
      const node = mockNodes.find((n) => n.id === id)
      if (node) Object.assign(node, body.changes, { updated_at: new Date().toISOString() })
    }
    return HttpResponse.json({
      results: body.node_ids.map((id) => ({ node_id: id, status: 'success' })),
      total: body.node_ids.length,
      succeeded: body.node_ids.length,
      failed: 0,
    })
  }),

  http.post(`${API_URL}/api/v2/nodes/metrics`, async ({ request }) => {
    const body = (await request.json()) as { ids?: string[]; node_ids?: string[] }
    const ids = body.ids || body.node_ids || []
    return HttpResponse.json({
      total: ids.length,
      succeeded: ids.length,
      failed: 0,
      results: ids.map((id) => ({
        node_id: id,
        node_name: `Node ${id}`,
        status: 'success',
        error: '',
        metrics: {
          cpu: { usage_percent: 45.2, cores: 4 },
          memory: { total_bytes: 8589934592, used_bytes: 5368709120, percent: 62.5 },
          disk: { total_bytes: 53687091200, used_bytes: 34896609280, percent: 65.0 },
          load_average: { one_min: 1.23, five_min: 0.98, fifteen_min: 0.85 },
          uptime_since: '2026-01-10T08:00:00Z',
        },
      })),
    })
  }),

  http.post(`${API_URL}/api/v2/nodes/bulk/metrics`, async ({ request }) => {
    const body = (await request.json()) as { node_ids: string[] }
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

  http.post(`${API_URL}/api/v2/nodes/credential-validations`, async ({ request }) => {
    const body = (await request.json()) as { ids?: string[]; node_ids?: string[]; tags?: string[] }
    const ids = body.ids || body.node_ids || ['1', '2']
    return HttpResponse.json({
      total: ids.length,
      succeeded: ids.length,
      failed: 0,
      results: ids.map((id) => ({
        node_id: id,
        node_name: `Node ${id}`,
        status: 'success',
        message: 'Credentials validated successfully',
        error: '',
      })),
    })
  }),

  http.post(`${API_URL}/api/v2/nodes/bulk/validate-credentials`, async ({ request }) => {
    const body = (await request.json()) as { node_ids: string[]; tags?: string[] }
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

  // Tags (removed in v2, keep for legacy)
  http.get(`${API_URL}/api/v2/nodes/tags`, () => {
    const tags = [...new Set(mockNodes.flatMap((n) => n.tags))]
    return HttpResponse.json(tags)
  }),
]
