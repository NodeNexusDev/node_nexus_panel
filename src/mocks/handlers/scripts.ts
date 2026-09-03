// @ts-nocheck
import { http, HttpResponse } from 'msw'
import { mockScripts } from '../data/scripts'

const API_URL = '*'

export const scriptHandlers = [
  http.get(`${API_URL}/api/v2/scripts/`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const size = Number(url.searchParams.get('size') || '20')
    const tag = url.searchParams.get('tag')
    const search = url.searchParams.get('search')
    let filtered = mockScripts
    if (tag) {
      filtered = filtered.filter((s) => s.tags.includes(tag))
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q)))
    }
    const start = (page - 1) * size
    const items = filtered.slice(start, start + size)
    return HttpResponse.json({ items, total: filtered.length, page, size })
  }),

  http.get(`${API_URL}/api/v2/scripts/tags`, () => {
    const tags = [...new Set(mockScripts.flatMap((s) => s.tags))]
    return HttpResponse.json(tags)
  }),

  http.get(`${API_URL}/api/v2/scripts/:id`, ({ params }) => {
    const script = mockScripts.find((s) => s.id === params.id)
    if (!script) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    return HttpResponse.json(script)
  }),

  http.post(`${API_URL}/api/v2/scripts/`, async ({ request }) => {
    const body = (await request.json()) as { items?: Array<Record<string, unknown>>; name?: string; description?: string; steps?: unknown; tags?: string[] }
    if (body.items) {
      const results = body.items.map((item: any) => {
        const newScript = {
          id: String(mockScripts.length + 1 + Math.floor(Math.random() * 1000)),
          name: item.name as string,
          description: (item.description as string) || null,
          steps: item.steps || [],
          tags: item.tags || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        mockScripts.push(newScript)
        return { id: newScript.id, name: newScript.name, status: 'success', error: '' }
      })
      return HttpResponse.json({ total: results.length, succeeded: results.length, failed: 0, results }, { status: 201 })
    }
    const newScript = {
      id: String(mockScripts.length + 1),
      name: body.name as string,
      description: (body.description as string) || null,
      steps: (body.steps as any) || [],
      tags: (body.tags as string[]) || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockScripts.push(newScript)
    return HttpResponse.json(newScript, { status: 201 })
  }),

  http.patch(`${API_URL}/api/v2/scripts/:id`, async ({ params, request }) => {
    const idx = mockScripts.findIndex((s) => s.id === params.id)
    if (idx === -1) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    Object.assign(mockScripts[idx], body, { updated_at: new Date().toISOString() })
    return HttpResponse.json(mockScripts[idx])
  }),

  http.delete(`${API_URL}/api/v2/scripts/:id`, ({ params }) => {
    const idx = mockScripts.findIndex((s) => s.id === params.id)
    if (idx === -1) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    mockScripts.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API_URL}/api/v2/scripts/:id/execute`, ({ params }) => {
    const script = mockScripts.find((s) => s.id === params.id)
    if (!script) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    return HttpResponse.json({
      script_id: script.id,
      results: [],
    })
  }),

  http.post(`${API_URL}/api/v2/scripts/:id/clone`, ({ params }) => {
    const script = mockScripts.find((s) => s.id === params.id)
    if (!script) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    const cloned = {
      ...script,
      id: String(mockScripts.length + 1),
      name: `${script.name} (copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockScripts.push(cloned)
    return HttpResponse.json(cloned)
  }),

  http.get(`${API_URL}/api/v2/scripts/:id/stats`, ({ params }) => {
    const script = mockScripts.find((s) => s.id === params.id)
    if (!script) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    return HttpResponse.json({
      total: 10,
      successful: 8,
      failed: 2,
      cancelled: 0,
      success_rate: 80.0,
      avg_duration_ms: 1250,
      min_duration_ms: 200,
      max_duration_ms: 5400,
      last_executed_at: '2026-01-15T10:00:00Z',
    })
  }),

  http.get(`${API_URL}/api/v2/scripts/:id/schedule`, ({ params }) => {
    const script = mockScripts.find((s) => s.id === params.id)
    if (!script) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    return HttpResponse.json({
      id: 'sched-1',
      script_id: script.id,
      cron: '0 2 * * *',
      timezone: 'UTC',
      enabled: true,
      misfire_grace_seconds: 60,
      operational_state: 'active',
      next_run_at: '2026-01-16T02:00:00Z',
      last_run_at: '2026-01-15T02:00:00Z',
      last_success_at: '2026-01-15T02:00:00Z',
      last_failure_at: null,
      last_error_type: null,
      node_ids: ['1', '2'],
      params: {},
    })
  }),

  http.post(`${API_URL}/api/v2/scripts/:id/schedule`, async ({ params, request }) => {
    const script = mockScripts.find((s) => s.id === params.id)
    if (!script) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    const body = await request.json() as { cron: string; node_ids: string[]; timezone?: string }
    return HttpResponse.json({
      script_id: script.id,
      cron: body.cron,
      message: 'Script scheduled successfully',
      timezone: body.timezone || 'UTC',
    })
  }),

  http.delete(`${API_URL}/api/v2/scripts/:id/schedule`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${API_URL}/api/v2/scripts/:id/executions`, ({ params, request }) => {
    const script = mockScripts.find((s) => s.id === params.id)
    if (!script) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const size = Number(url.searchParams.get('size') || '20')
    const items = [
      { id: 'e1', script_id: script.id, node_id: '1', params: null, status: 'completed', steps: [{ label: 'Step 1', status: 'completed' }], started_at: '2025-08-18T08:00:00Z', finished_at: '2025-08-18T08:01:30Z' },
      { id: 'e2', script_id: script.id, node_id: '2', params: null, status: 'failed', steps: [{ label: 'Step 1', status: 'failed' }], started_at: '2025-08-17T14:00:00Z', finished_at: '2025-08-17T14:00:45Z' },
      { id: 'e3', script_id: script.id, node_id: '1', params: null, status: 'running', steps: [{ label: 'Step 1', status: 'completed' }], started_at: '2025-08-18T10:00:00Z', finished_at: null },
    ]
    return HttpResponse.json({ items: items.slice((page - 1) * size, page * size), total: items.length, page, size })
  }),

  http.get(`${API_URL}/api/v2/scripts/:id/schedule/history`, ({ params, request }) => {
    const script = mockScripts.find((s) => s.id === params.id)
    if (!script) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const size = Number(url.searchParams.get('size') || '20')
    return HttpResponse.json({ items: [], total: 0, page, size })
  }),

  http.post(`${API_URL}/api/v2/scripts/executions/:executionId/cancel`, ({ params }) => {
    return HttpResponse.json({
      id: params.executionId as string,
      script_id: '1',
      node_id: '1',
      params: null,
      status: 'cancelled',
      steps: [],
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    })
  }),

  http.post(`${API_URL}/api/v2/scripts/executions/:executionId/retry`, ({ params }) => {
    return HttpResponse.json({
      id: params.executionId as string,
      script_id: '1',
      node_id: '1',
      params: null,
      status: 'pending',
      steps: [],
      started_at: new Date().toISOString(),
      finished_at: null,
    })
  }),

  http.post(`${API_URL}/api/v2/scripts/bulk/cancel`, async ({ request }) => {
    const body = await request.json() as { execution_ids: string[] }
    return HttpResponse.json({
      results: body.execution_ids.map((id) => ({ execution_id: id, status: 'cancelled', message: 'Cancelled' })),
      total: body.execution_ids.length,
      succeeded: body.execution_ids.length,
      failed: 0,
    })
  }),

  http.post(`${API_URL}/api/v2/scripts/bulk/retry`, async ({ request }) => {
    const body = await request.json() as { execution_ids: string[] }
    return HttpResponse.json({
      results: body.execution_ids.map((id) => ({ execution_id: id, status: 'pending', message: 'Retried' })),
      total: body.execution_ids.length,
      succeeded: body.execution_ids.length,
      failed: 0,
    })
  }),

  http.post(`${API_URL}/api/v2/scripts/executions`, async ({ request }) => {
    const body = (await request.json()) as { script_ids: string[]; node_ids?: string[]; node_tags?: string[] }
    const batch_id = 'batch-' + Math.random().toString(36).slice(2, 10)
    const nodeIds = body.node_ids || ['1', '2']
    const results = (body.script_ids || []).flatMap((sid) =>
      nodeIds.map((nid) => ({
        script_id: sid,
        node_id: nid,
        node_name: `node-${nid}`,
        execution_id: `exec-${Math.random().toString(36).slice(2, 6)}`,
        status: 'success' as const,
        steps: [{ label: 'Step 1', command_fingerprint: 'fp', stdout: 'ok', stderr: '', stdout_bytes: 2, stderr_bytes: 0, exit_code: 0, truncated: false, step_index: 0 }],
        error: '',
      }))
    )
    return HttpResponse.json({ batch_id, total: results.length, succeeded: results.length, failed: 0, results })
  }),

  http.post(`${API_URL}/api/v2/scripts/executions/cancels`, async ({ request }) => {
    const body = (await request.json()) as { execution_ids: string[] }
    return HttpResponse.json({
      total: body.execution_ids.length,
      succeeded: body.execution_ids.length,
      failed: 0,
      results: body.execution_ids.map((id) => ({ execution_id: id, status: 'cancelled' as const, message: 'Cancelled' })),
    })
  }),

  http.post(`${API_URL}/api/v2/scripts/executions/retries`, async ({ request }) => {
    const body = (await request.json()) as { execution_ids: string[] }
    return HttpResponse.json({
      total: body.execution_ids.length,
      succeeded: body.execution_ids.length,
      failed: 0,
      results: body.execution_ids.map((id) => ({ execution_id: id, status: 'retry_scheduled' as const, message: 'Retried' })),
    })
  }),

  http.get(`${API_URL}/api/v2/scripts/:id/schedules`, ({ params }) => {
    const script = mockScripts.find((s) => s.id === params.id)
    if (!script) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found' }, { status: 404 })
    return HttpResponse.json({
      id: 'sched-1',
      script_id: script.id,
      cron: '0 2 * * *',
      timezone: 'UTC',
      enabled: true,
      misfire_grace_seconds: 60,
      operational_state: 'active',
      next_run_at: '2026-01-16T02:00:00Z',
      last_run_at: '2026-01-15T02:00:00Z',
      last_success_at: '2026-01-15T02:00:00Z',
      last_failure_at: null,
      last_error_type: null,
      node_ids: ['1', '2'],
      params: {},
    })
  }),

  http.post(`${API_URL}/api/v2/scripts/:id/schedules`, async ({ params, request }) => {
    const script = mockScripts.find((s) => s.id === params.id)
    if (!script) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found' }, { status: 404 })
    const body = (await request.json()) as { cron: string; node_ids: string[]; timezone?: string }
    return HttpResponse.json({ script_id: script.id, cron: body.cron, message: 'Scheduled', timezone: body.timezone || 'UTC' })
  }),

  http.delete(`${API_URL}/api/v2/scripts/:id/schedules`, () => new HttpResponse(null, { status: 204 })),
]
