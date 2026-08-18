import { http, HttpResponse } from 'msw'
import { mockAuditLogs } from '../data/audit'

const API = 'http://localhost:8000'

export const auditHandlers = [
  http.get(`${API}/api/v1/audit/`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const size = Number(url.searchParams.get('size') || '20')
    const start = (page - 1) * size
    const items = mockAuditLogs.slice(start, start + size)
    return HttpResponse.json({ items, total: mockAuditLogs.length, page, size })
  }),

  http.delete(`${API}/api/v1/audit/`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${API}/api/v1/audit/export`, () => {
    return HttpResponse.json({ message: 'Export generated', format: 'json' })
  }),
]
