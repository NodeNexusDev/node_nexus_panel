// @ts-nocheck
import { http, HttpResponse } from 'msw'

const store = new Map<string, Array<{ id: string; project_name: string; compose: string; env: Record<string,string>|null; template_pack_id: string|null; node_id: string; created_at: string; updated_at: string }>>()

function getList(nodeId: string) {
  if (!store.has(nodeId)) store.set(nodeId, [])
  return store.get(nodeId)!
}

export const composeHandlers = [
  http.get('/api/v2/nodes/:nodeId/docker/compose/projects', ({ params }) => {
    const nodeId = params.nodeId as string
    const list = getList(nodeId)
    return HttpResponse.json({ items: list, limit: 50, next_cursor: null, has_more: false })
  }),
  http.post('/api/v2/nodes/:nodeId/docker/compose/projects', async ({ params, request }) => {
    const nodeId = params.nodeId as string
    const body = await request.json() as { project_name: string; compose: string; env?: Record<string,string> }
    const item = { id: crypto.randomUUID(), project_name: body.project_name, compose: body.compose, env: body.env ?? null, template_pack_id: null, node_id: nodeId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    getList(nodeId).push(item)
    return HttpResponse.json(item, { status: 201 })
  }),
  http.get('/api/v2/nodes/:nodeId/docker/compose/projects/:projectName', ({ params }) => {
    const nodeId = params.nodeId as string
    const projectName = params.projectName as string
    const found = getList(nodeId).find((p) => p.project_name === projectName)
    if (!found) return HttpResponse.json({ code: 'not_found', message: 'Project not found' }, { status: 404 })
    return HttpResponse.json(found)
  }),
  http.delete('/api/v2/nodes/:nodeId/docker/compose/projects/:projectName', ({ params }) => {
    const nodeId = params.nodeId as string
    const projectName = params.projectName as string
    const list = getList(nodeId)
    const idx = list.findIndex((p) => p.project_name === projectName)
    if (idx !== -1) list.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
  http.post('/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/ups', () => HttpResponse.json({ status: 'ok', message: 'Up started' })),
  http.post('/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/downs', () => HttpResponse.json({ status: 'ok', message: 'Down done' })),
  http.post('/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/starts', () => HttpResponse.json({ status: 'ok' })),
  http.post('/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/stops', () => HttpResponse.json({ status: 'ok' })),
  http.post('/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/restarts', () => HttpResponse.json({ status: 'ok' })),
  http.post('/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/pulls', () => HttpResponse.json({ status: 'ok' })),
  http.post('/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/builds', () => HttpResponse.json({ status: 'ok' })),
  http.get('/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/ps', () => HttpResponse.json({ services: [] as unknown[] })),
  http.get('/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/logs', () => HttpResponse.json({ logs: 'Compose logs mock...' })),
  http.get('/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/config', () => HttpResponse.json({ config: 'version: "3"' })),
]
