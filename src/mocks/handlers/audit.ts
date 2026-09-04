import { http, HttpResponse } from 'msw'
import { mockAuditLogs } from '../data/audit'

const API = '*'

export const auditHandlers = [
  http.get(`${API}/api/v2/audit/`, ({ request }) => {
    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const limit = Number(url.searchParams.get('limit') || url.searchParams.get('size') || '20')
    const page = Number(url.searchParams.get('page') || '1')
    const nodeId = url.searchParams.get('node_id')
    const action = url.searchParams.get('action')
    const user = url.searchParams.get('user')
    const dateFrom = url.searchParams.get('date_from')
    const dateTo = url.searchParams.get('date_to')
    let filtered = mockAuditLogs
    if (nodeId) filtered = filtered.filter((l) => l.node_id === nodeId)
    if (action) filtered = filtered.filter((l) => l.action.includes(action))
    if (user) filtered = filtered.filter((l) => l.user && l.user.includes(user))
    if (dateFrom) filtered = filtered.filter((l) => l.created_at >= dateFrom)
    if (dateTo) filtered = filtered.filter((l) => l.created_at <= dateTo)
    let offset = 0
    if (cursor) {
      try { offset = Number(atob(cursor)) || 0 } catch { offset = Number(cursor) || 0 }
    } else if (url.searchParams.get('page')) offset = (page - 1) * limit
    const items = filtered.slice(offset, offset + limit)
    const has_more = offset + limit < filtered.length
    const next_cursor = has_more ? btoa(String(offset + limit)) : null
    return HttpResponse.json({ items, limit, next_cursor, has_more, total: filtered.length, page, size: limit })
  }),

  http.delete(`${API}/api/v2/audit/`, () => {
    return HttpResponse.json({ deleted: mockAuditLogs.length })
  }),

  http.get(`${API}/api/v2/audit/exports`, ({ request }) => {
    const url = new URL(request.url)
    const fmt = url.searchParams.get('fmt') || 'csv'
    const nodeId = url.searchParams.get('node_id')
    const action = url.searchParams.get('action')
    const fromDate = url.searchParams.get('from_date')
    const toDate = url.searchParams.get('to_date')
    let filtered = mockAuditLogs
    if (nodeId) filtered = filtered.filter((l) => l.node_id === nodeId)
    if (action) filtered = filtered.filter((l) => l.action.includes(action))
    if (fromDate) filtered = filtered.filter((l) => l.created_at >= fromDate)
    if (toDate) filtered = filtered.filter((l) => l.created_at <= toDate)
    if (fmt === 'csv') {
      const headers = ['id', 'action', 'node_id', 'user', 'details', 'created_at']
      const rows = filtered.map((l) => headers.map((h) => `"${String((l as unknown as Record<string, unknown>)[h] ?? '').replace(/"/g, '""')}"`).join(','))
      return HttpResponse.json({ csv: [headers.join(','), ...rows].join('\n') })
    }
    return HttpResponse.json({ items: filtered, total: filtered.length })
  }),

  http.get(`${API}/api/v2/audit/stats`, () => HttpResponse.json({ total: mockAuditLogs.length, buckets: [] })),

  http.get(`${API}/api/v2/audit/:logId`, ({ params }) => {
    const log = mockAuditLogs.find((l) => l.id === params.logId)
    if (!log) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found' }, { status: 404 })
    return HttpResponse.json(log)
  }),

  http.get(`${API}/api/v2/audit/export`, ({ request }) => {
    const url = new URL(request.url)
    const fmt = url.searchParams.get('fmt') || 'csv'
    const nodeId = url.searchParams.get('node_id')
    const action = url.searchParams.get('action')
    const fromDate = url.searchParams.get('from_date')
    const toDate = url.searchParams.get('to_date')

    let filtered = mockAuditLogs
    if (nodeId) filtered = filtered.filter((l) => l.node_id === nodeId)
    if (action) filtered = filtered.filter((l) => l.action.includes(action))
    if (fromDate) filtered = filtered.filter((l) => l.created_at >= fromDate)
    if (toDate) filtered = filtered.filter((l) => l.created_at <= toDate)

    if (fmt === 'csv') {
      const headers = ['id', 'action', 'node_id', 'user', 'details', 'created_at']
      const rows = filtered.map((l) =>
        headers.map((h) => `"${String((l as unknown as Record<string, unknown>)[h] ?? '').replace(/"/g, '""')}"`).join(','),
      )
      return HttpResponse.json({ csv: [headers.join(','), ...rows].join('\n') })
    }

    return HttpResponse.json({ items: filtered, total: filtered.length })
  }),
]
