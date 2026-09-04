// @ts-nocheck
import { http, HttpResponse } from 'msw'

const API_URL = '*'

const store = new Map<string, Array<{ id: string; project_name: string; compose: string; env: Record<string,string>|null; template_pack_id: string|null; node_id: string; created_at: string; updated_at: string }>>()

function getList(nodeId: string) {
  if (!store.has(nodeId)) store.set(nodeId, [])
  return store.get(nodeId)!
}

function parseCursor(c: string | null){ if(!c) return 0; try{ const d=atob(c); const n=Number(d); return Number.isNaN(n)?0:n }catch{ const n=Number(c); return Number.isNaN(n)?0:n } }
function encodeCursor(o:number){ return btoa(String(o)) }

export const composeHandlers = [
  http.get(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects`, ({ params, request }) => {
    const nodeId = params.nodeId as string
    const list = getList(nodeId)
    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const limit = Number(url.searchParams.get('limit') || url.searchParams.get('size') || '50')
    let offset=0; if(cursor) offset=parseCursor(cursor)
    const items=list.slice(offset, offset+limit)
    const has_more=offset+limit<list.length
    const next_cursor=has_more?encodeCursor(offset+limit):null
    return HttpResponse.json({ items, limit, next_cursor, has_more })
  }),
  http.post(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects`, async ({ params, request }) => {
    const nodeId = params.nodeId as string
    const body = await request.json() as { project_name: string; compose: string; env?: Record<string,string> }
    const item = { id: crypto.randomUUID(), project_name: body.project_name, compose: body.compose, env: body.env ?? null, template_pack_id: null, node_id: nodeId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    getList(nodeId).push(item)
    return HttpResponse.json(item, { status: 201 })
  }),
  http.get(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName`, ({ params }) => {
    const nodeId = params.nodeId as string
    const projectName = params.projectName as string
    const found = getList(nodeId).find((p) => p.project_name === projectName)
    if (!found) return HttpResponse.json({ code: 'not_found', message: 'Project not found' }, { status: 404 })
    return HttpResponse.json(found)
  }),
  http.delete(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName`, ({ params }) => {
    const nodeId = params.nodeId as string
    const projectName = params.projectName as string
    const list = getList(nodeId)
    const idx = list.findIndex((p) => p.project_name === projectName)
    if (idx !== -1) list.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
  http.patch(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName`, async ({ params, request }) => {
    const nodeId = params.nodeId as string; const projectName = params.projectName as string; const body = await request.json() as { compose?: string; env?: Record<string,string> }
    const found = getList(nodeId).find((p)=> p.project_name===projectName); if(!found) return HttpResponse.json({code:'not_found',message:'Project not found'},{status:404})
    if(body.compose) found.compose = body.compose; if(body.env) found.env = body.env; found.updated_at = new Date().toISOString()
    return HttpResponse.json(found)
  }),
  http.post(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/ups`, () => HttpResponse.json({ status: 'ok', message: 'Up started' })),
  http.post(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/downs`, () => HttpResponse.json({ status: 'ok', message: 'Down done' })),
  http.post(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/starts`, () => HttpResponse.json({ status: 'ok' })),
  http.post(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/stops`, () => HttpResponse.json({ status: 'ok' })),
  http.post(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/restarts`, () => HttpResponse.json({ status: 'ok' })),
  http.post(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/pulls`, () => HttpResponse.json({ status: 'ok' })),
  http.post(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/builds`, () => HttpResponse.json({ status: 'ok' })),
  http.post(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/creates`, () => HttpResponse.json({ status: 'ok', message: 'Create done' })),
  http.post(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/runs`, async ({ request }) => { const body = await request.json() as { service?: string }; return HttpResponse.json({ status: 'ok', service: body.service ?? 'app' }) }),
  http.post(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/executions`, async ({ request }) => { const body = await request.json() as { service?: string; command?: string }; return HttpResponse.json({ status: 'ok', output: `exec ${body.command ?? 'sh'} on ${body.service ?? 'app'}` }) }),
  http.post(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/kills`, () => HttpResponse.json({ status: 'ok' })),
  http.post(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/pauses`, () => HttpResponse.json({ status: 'ok' })),
  http.post(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/unpauses`, () => HttpResponse.json({ status: 'ok' })),
  http.post(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/pushs`, () => HttpResponse.json({ status: 'ok' })),
  http.post(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/rms`, () => HttpResponse.json({ status: 'ok' })),
  http.get(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/images`, () => HttpResponse.json({ images: [] as unknown[] })),
  http.get(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/port`, ({ request }) => { const url=new URL(request.url); const svc=url.searchParams.get('service')||'web'; const port=url.searchParams.get('port')||'80'; return HttpResponse.json({ service: svc, port, url: `0.0.0.0:${port}` }) }),
  http.get(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/top`, () => HttpResponse.json({ titles:['PID','USER','COMMAND'], processes:[['1','root','nginx']] })),
  http.get(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/version`, () => HttpResponse.json({ version: '2.24.5' })),
  http.get(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/ps`, () => HttpResponse.json({ services: [] as unknown[] })),
  http.get(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/logs`, () => HttpResponse.json({ logs: 'Compose logs mock...' })),
  http.get(`${API_URL}/api/v2/nodes/:nodeId/docker/compose/projects/:projectName/config`, () => HttpResponse.json({ config: 'version: "3"' })),
]
