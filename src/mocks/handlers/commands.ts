// @ts-nocheck
import { http, HttpResponse } from 'msw'
import { mockCommands } from '../data/commands'

const API_URL = '*'

function parseCursor(cursor: string | null): number {
  if (!cursor) return 0
  try { const d = atob(cursor); const n = Number(d); return Number.isNaN(n) ? 0 : n } catch { const n = Number(cursor); return Number.isNaN(n) ? 0 : n }
}
function encodeCursor(offset: number): string { return btoa(String(offset)) }

export const commandHandlers = [
  http.get(`${API_URL}/api/v2/commands/`, ({ request }) => {
    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const limit = Number(url.searchParams.get('limit') || url.searchParams.get('size') || '20')
    const page = Number(url.searchParams.get('page') || '1')
    const tag = url.searchParams.get('tag')
    const search = url.searchParams.get('search')
    let filtered = mockCommands
    if (tag) filtered = filtered.filter((c) => c.tags.includes(tag))
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(q) || c.command.toLowerCase().includes(q))
    }
    let offset = 0
    if (cursor) offset = parseCursor(cursor)
    else if (url.searchParams.get('page')) offset = (page - 1) * limit
    const items = filtered.slice(offset, offset + limit)
    const has_more = offset + limit < filtered.length
    const next_cursor = has_more ? encodeCursor(offset + limit) : null
    return HttpResponse.json({ items, limit, next_cursor, has_more, total: filtered.length, page, size: limit })
  }),

  http.get(`${API_URL}/api/v2/commands/tags`, () => {
    const tags = [...new Set(mockCommands.flatMap((c) => c.tags))]
    return HttpResponse.json(tags)
  }),

  http.get(`${API_URL}/api/v2/commands/history`, ({ request }) => {
    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const limit = Number(url.searchParams.get('limit') || url.searchParams.get('size') || '20')
    const offset = cursor ? parseCursor(cursor) : Number(url.searchParams.get('page') || '1') - 1 ? (Number(url.searchParams.get('page')||'1')-1)*limit : 0
    const items: unknown[] = []
    const has_more = false
    return HttpResponse.json({ items, limit, next_cursor: null, has_more, total: 0, page: Math.floor(offset/limit)+1, size: limit })
  }),

  http.get(`${API_URL}/api/v2/commands/stats`, () => {
    return HttpResponse.json({
      total: 42,
      successful: 38,
      failed: 4,
      cancelled: 0,
      success_rate: 90.48,
      avg_duration_ms: 1250,
      min_duration_ms: 200,
      max_duration_ms: 5400,
      last_executed_at: '2025-08-18T10:00:00Z',
    })
  }),

  http.get(`${API_URL}/api/v2/commands/bulk/history`, ({ request }) => {
    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const limit = Number(url.searchParams.get('limit') || url.searchParams.get('size') || '20')
    const offset = cursor ? parseCursor(cursor) : 0
    return HttpResponse.json({ items: [], limit, next_cursor: null, has_more: false, total: 0, page: Math.floor(offset/limit)+1, size: limit })
  }),

  http.get(`${API_URL}/api/v2/commands/:id`, ({ params }) => {
    const cmd = mockCommands.find((c) => c.id === params.id)
    if (!cmd) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    return HttpResponse.json(cmd)
  }),

  http.post(`${API_URL}/api/v2/commands/`, async ({ request }) => {
    const body = (await request.json()) as { items?: Array<Record<string, unknown>>; name?: string; command?: string; description?: string; parameters?: unknown; tags?: string[] }
    if (body.items && Array.isArray(body.items)) {
      const results = body.items.map((item: any) => {
        const newCmd = {
          id: String(mockCommands.length + 1 + Math.floor(Math.random() * 1000)),
          name: item.name as string,
          description: (item.description as string) || null,
          command: item.command as string,
          parameters: (item.parameters as unknown) || [],
          tags: (item.tags as string[]) || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        mockCommands.push(newCmd)
        return { id: newCmd.id, name: newCmd.name, status: 'success', error: '' }
      })
      return HttpResponse.json({ total: results.length, succeeded: results.length, failed: 0, results }, { status: 201 })
    }
    const newCmd = {
      id: String(mockCommands.length + 1),
      name: body.name as string,
      description: (body.description as string) || null,
      command: body.command as string,
      parameters: (body.parameters as unknown) || [],
      tags: (body.tags as string[]) || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockCommands.push(newCmd)
    return HttpResponse.json(newCmd, { status: 201 })
  }),

  http.patch(`${API_URL}/api/v2/commands/:id`, async ({ params, request }) => {
    const idx = mockCommands.findIndex((c) => c.id === params.id)
    if (idx === -1) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    const body = (await request.json()) as Record<string, unknown>
    Object.assign(mockCommands[idx], body, { updated_at: new Date().toISOString() })
    return HttpResponse.json(mockCommands[idx])
  }),

  http.delete(`${API_URL}/api/v2/commands/:id`, ({ params }) => {
    const idx = mockCommands.findIndex((c) => c.id === params.id)
    if (idx === -1) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    mockCommands.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API_URL}/api/v2/commands/:id/execute`, async ({ params }) => {
    const cmd = mockCommands.find((c) => c.id === params.id)
    if (!cmd) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    return HttpResponse.json({
      stdout: 'Command executed successfully',
      stderr: '',
      exit_code: 0,
    })
  }),

  http.post(`${API_URL}/api/v2/commands/:id/clone`, ({ params }) => {
    const cmd = mockCommands.find((c) => c.id === params.id)
    if (!cmd) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
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

  http.get(`${API_URL}/api/v2/commands/:id/stats`, ({ params }) => {
    const cmd = mockCommands.find((c) => c.id === params.id)
    if (!cmd) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Not found', request_id: 'mock-request-id' }, { status: 404 })
    return HttpResponse.json({
      total: 15,
      successful: 13,
      failed: 2,
      cancelled: 0,
      success_rate: 86.67,
      avg_duration_ms: 1200,
      min_duration_ms: 200,
      max_duration_ms: 4500,
      last_executed_at: '2026-01-15T10:00:00Z',
    })
  }),

  http.post(`${API_URL}/api/v2/commands/execute`, async ({ request }) => {
    const body = await request.json() as { node_id: string; command: string; timeout?: number }
    return HttpResponse.json({
      stdout: `Executed: ${body.command}`,
      stderr: '',
      exit_code: 0,
    })
  }),

  http.post(`${API_URL}/api/v2/commands/executions/:executionId/retry`, () => {
    return HttpResponse.json({
      execution_id: 'retried-123',
      status: 'pending',
      message: 'Execution retried successfully',
    })
  }),

  http.post(`${API_URL}/api/v2/commands/bulk/execute`, async ({ request }) => {
    const body = await request.json() as { command: string; node_ids?: string[]; tags?: string[] }
    return HttpResponse.json({
      command: body.command,
      results: [],
      total: 0,
      succeeded: 0,
      failed: 0,
    })
  }),

  http.post(`${API_URL}/api/v2/commands/:id/bulk-execute`, async ({ request }) => {
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

  http.post(`${API_URL}/api/v2/commands/bulk/cancel`, async ({ request }) => {
    const body = await request.json() as { execution_ids: string[] }
    return HttpResponse.json({
      results: body.execution_ids.map((id) => ({ execution_id: id, status: 'cancelled', message: 'Cancelled' })),
      total: body.execution_ids.length,
      succeeded: body.execution_ids.length,
      failed: 0,
    })
  }),

  http.post(`${API_URL}/api/v2/commands/bulk/retry`, async ({ request }) => {
    const body = await request.json() as { execution_ids: string[] }
    return HttpResponse.json({
      results: body.execution_ids.map((id) => ({ execution_id: id, status: 'pending', message: 'Retried' })),
      total: body.execution_ids.length,
      succeeded: body.execution_ids.length,
      failed: 0,
    })
  }),

  // ── v2 new endpoints ─────────────────────────────────────
  http.post(`${API_URL}/api/v2/commands/executions`, async ({ request }) => {
    const body = (await request.json()) as { command_ids: string[]; node_ids?: string[]; node_tags?: string[]; params?: Record<string, unknown> }
    const batch_id = 'batch-' + Math.random().toString(36).slice(2, 10)
    const nodeIds = body.node_ids || ['1', '2']
    const results = (body.command_ids || ['cmd1']).flatMap((cid) =>
      nodeIds.map((nid) => ({
        command: `cmd-${cid}`,
        command_id: cid,
        node_id: nid,
        node_name: `node-${nid}`,
        status: 'success' as const,
        stdout: `Executed ${cid} on ${nid}`,
        stderr: '',
        exit_code: 0,
        error: '',
      }))
    )
    return HttpResponse.json({ batch_id, total: results.length, succeeded: results.length, failed: 0, results })
  }),

  http.post(`${API_URL}/api/v2/commands/raw-executions`, async ({ request }) => {
    const body = (await request.json()) as { commands: string[]; node_ids?: string[]; node_tags?: string[] }
    const batch_id = 'batch-' + Math.random().toString(36).slice(2, 10)
    const nodeIds = body.node_ids || ['1']
    const results = (body.commands || []).flatMap((cmd) =>
      nodeIds.map((nid) => ({
        command: cmd,
        command_id: null,
        node_id: nid,
        node_name: `node-${nid}`,
        status: 'success' as const,
        stdout: `Executed ${cmd} on ${nid}`,
        stderr: '',
        exit_code: 0,
        error: '',
      }))
    )
    return HttpResponse.json({ batch_id, total: results.length, succeeded: results.length, failed: 0, results })
  }),

  http.post(`${API_URL}/api/v2/commands/executions/cancels`, async ({ request }) => {
    const body = (await request.json()) as { execution_ids: string[] }
    return HttpResponse.json({
      total: body.execution_ids.length,
      succeeded: body.execution_ids.length,
      failed: 0,
      results: body.execution_ids.map((id) => ({ execution_id: id, status: 'cancelled' as const, message: 'Cancelled' })),
    })
  }),

  http.post(`${API_URL}/api/v2/commands/executions/retries`, async ({ request }) => {
    const body = (await request.json()) as { execution_ids: string[] }
    return HttpResponse.json({
      total: body.execution_ids.length,
      succeeded: body.execution_ids.length,
      failed: 0,
      results: body.execution_ids.map((id) => ({ execution_id: id, status: 'retry_scheduled' as const, message: 'Retried' })),
    })
  }),

  http.get(`${API_URL}/api/v2/commands/executions/history`, ({ request }) => {
    const url = new URL(request.url)
    const batch_id = url.searchParams.get('batch_id') || 'mock-batch'
    const cursor = url.searchParams.get('cursor')
    const limit = Number(url.searchParams.get('limit') || '20')
    const offset = cursor ? Number(atob(cursor)) || 0 : 0
    const items = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      id: `hist-${offset + i}`,
      command_fingerprint: `fp-${offset + i}`,
      exit_code: 0,
      stdout: 'ok',
      stderr: '',
      stdout_bytes: 2,
      stderr_bytes: 0,
      truncated: false,
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }))
    const has_more = offset + limit < 20
    const next_cursor = has_more ? btoa(String(offset + limit)) : null
    return HttpResponse.json({ items, limit, next_cursor, has_more, batch_id })
  }),


]
