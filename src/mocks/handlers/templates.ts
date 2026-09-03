// @ts-nocheck
import { http, HttpResponse } from 'msw'

const API_URL = '*'

let packs = [
  { id: 'pack-1', name: 'Nginx Starter', description: 'Simple nginx compose pack', tags: ['web', 'proxy'], installed: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), assets: [] },
  { id: 'pack-2', name: 'Postgres + Redis', description: 'Database and cache stack', tags: ['db', 'cache'], installed: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), assets: [] },
]

let registries = [
  { id: 'reg-1', name: 'Official', url: 'https://registry.nodenexus.dev/packs.json', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

function parseCursor(c:string|null){ if(!c) return 0; try{ const d=atob(c); const n=Number(d); return Number.isNaN(n)?0:n }catch{ const n=Number(c); return Number.isNaN(n)?0:n } }
function encodeCursor(o:number){ return btoa(String(o)) }

export const templatesHandlers = [
  http.get(`${API_URL}/api/v2/templates/packs`, ({ request }) => {
    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const limit = Number(url.searchParams.get('limit') || url.searchParams.get('size') || 50)
    const offset = cursor ? parseCursor(cursor) : 0
    const items = packs.slice(offset, offset+limit)
    const has_more = offset+limit < packs.length
    const next_cursor = has_more?encodeCursor(offset+limit):null
    return HttpResponse.json({ items, limit, next_cursor, has_more })
  }),
  http.get(`${API_URL}/api/v2/templates/packs/stats`, () => HttpResponse.json({ total: packs.length, installed: packs.filter((p) => p.installed).length, not_installed: packs.filter((p) => !p.installed).length, buckets: [] })),
  http.get(`${API_URL}/api/v2/templates/packs/:packId`, ({ params }) => {
    const pack = packs.find((p) => p.id === params.packId)
    if (!pack) return HttpResponse.json({ code: 'not_found', message: 'Pack not found' }, { status: 404 })
    return HttpResponse.json({ ...pack, assets: [] })
  }),
  http.post(`${API_URL}/api/v2/templates/packs`, async ({ request }) => {
    const body = await request.json() as { name: string; description?: string; tags?: string[] }
    const pack = { id: crypto.randomUUID(), name: body.name, description: body.description||'', tags: body.tags||[], installed:false, created_at:new Date().toISOString(), updated_at:new Date().toISOString(), assets:[] }
    packs.push(pack); return HttpResponse.json(pack,{status:201})
  }),
  http.get(`${API_URL}/api/v2/templates/packs/:packId/archive`, ({ params }) => {
    const pack = packs.find((p)=> p.id===params.packId); if(!pack) return HttpResponse.json({code:'not_found',message:'Pack not found'},{status:404})
    return HttpResponse.json({ pack_id: pack.id, archive: 'mock-archive-base64' })
  }),
  http.get(`${API_URL}/api/v2/templates/packs/:packId/installations`, () => HttpResponse.json({ items: [], limit: 20, next_cursor: null, has_more: false })),
  http.post(`${API_URL}/api/v2/templates/packs/:packId/updates`, async ({ params, request }) => {
    const pack = packs.find((p)=> p.id===params.packId); if(!pack) return HttpResponse.json({code:'not_found',message:'Pack not found'},{status:404})
    const body = await request.json() as { name?: string }; if(body.name) pack.name = body.name; pack.updated_at=new Date().toISOString(); return HttpResponse.json(pack)
  }),
  http.post(`${API_URL}/api/v2/templates/packs/:packId/installations`, ({ params }) => {
    const pack = packs.find((p) => p.id === params.packId)
    if (pack) pack.installed = true
    return HttpResponse.json({ id: crypto.randomUUID(), pack_id: params.packId, status: 'installed', created_at: new Date().toISOString() })
  }),
  http.post(`${API_URL}/api/v2/templates/packs/:packId/uninstallations`, ({ params }) => {
    const pack = packs.find((p) => p.id === params.packId)
    if (pack) pack.installed = false
    return HttpResponse.json({ status: 'uninstalled' })
  }),
  http.get(`${API_URL}/api/v2/templates/registries`, ({ request }) => { const url=new URL(request.url); const cursor=url.searchParams.get('cursor'); const limit=Number(url.searchParams.get('limit')||url.searchParams.get('size')||50); const offset=cursor?parseCursor(cursor):0; const items=registries.slice(offset, offset+limit); const has_more=offset+limit<registries.length; const next_cursor=has_more?encodeCursor(offset+limit):null; return HttpResponse.json({ items, limit, next_cursor, has_more }) }),
  http.post(`${API_URL}/api/v2/templates/registries`, async ({ request }) => {
    const body = await request.json() as { name: string; url: string }
    const reg = { id: crypto.randomUUID(), name: body.name, url: body.url, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    registries.push(reg)
    return HttpResponse.json(reg, { status: 201 })
  }),
  http.get(`${API_URL}/api/v2/templates/registries/:registryId`, ({ params }) => {
    const reg = registries.find((r)=> r.id===params.registryId); if(!reg) return HttpResponse.json({code:'not_found',message:'Registry not found'},{status:404}); return HttpResponse.json(reg)
  }),
  http.delete(`${API_URL}/api/v2/templates/registries/:registryId`, ({ params }) => {
    registries = registries.filter((r) => r.id !== params.registryId)
    return new HttpResponse(null, { status: 204 })
  }),
  http.post(`${API_URL}/api/v2/templates/registries/:registryId/syncs`, () => HttpResponse.json({ status: 'synced', synced_at: new Date().toISOString() })),
]
