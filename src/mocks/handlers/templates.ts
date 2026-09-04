// @ts-nocheck
import { http, HttpResponse } from 'msw'

const API_URL = '*'

let packs = [
  { id: 'pack-1', pack_id: 'nginx-starter', name: 'Nginx Starter', description: 'Simple nginx compose pack', tags: ['web', 'proxy'], version: '1.0.0', author: 'NodeNexus', readme: null, registry_id: 'reg-1', manifest_sha: null, installed_at: null, installed_version: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), assets: [] },
  { id: 'pack-2', pack_id: 'postgres-redis', name: 'Postgres + Redis', description: 'Database and cache stack', tags: ['db', 'cache'], version: '1.0.0', author: 'NodeNexus', readme: null, registry_id: 'reg-1', manifest_sha: null, installed_at: new Date().toISOString(), installed_version: '1.0.0', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), assets: [] },
]

let registries = [
  { id: 'reg-1', owner: 'NodeNexusDev', name: 'official', default_branch: 'main', last_synced_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

function parseCursor(c:string|null){ if(!c) return 0; try{ const d=atob(c); const n=Number(d); return Number.isNaN(n)?0:n }catch{ const n=Number(c); return Number.isNaN(n)?0:n } }
function encodeCursor(o:number){ return btoa(String(o)) }

export const templatesHandlers = [
  http.get(`${API_URL}/api/v2/templates/packs`, ({ request }) => {
    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const tag = url.searchParams.get('tag')
    const search = url.searchParams.get('search')
    const installedParam = url.searchParams.get('installed')
    const registryId = url.searchParams.get('registry_id')
    const limit = Number(url.searchParams.get('limit') || url.searchParams.get('size') || 50)
    let filtered = packs
    if (tag) filtered = filtered.filter((p)=> (p.tags ?? []).includes(tag))
    if (search) { const q=search.toLowerCase(); filtered = filtered.filter((p)=> p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)) }
    if (installedParam !== null) {
      const wantInstalled = installedParam === 'true'
      filtered = filtered.filter((p)=> wantInstalled ? !!p.installed_at : !p.installed_at)
    }
    if (registryId) filtered = filtered.filter((p)=> p.registry_id === registryId)
    const offset = cursor ? parseCursor(cursor) : 0
    const items = filtered.slice(offset, offset+limit)
    const has_more = offset+limit < filtered.length
    const next_cursor = has_more?encodeCursor(offset+limit):null
    return HttpResponse.json({ items, limit, next_cursor, has_more })
  }),
  http.get(`${API_URL}/api/v2/templates/packs/stats`, () => HttpResponse.json({ total: packs.length, installed: packs.filter((p) => !!p.installed_at).length, not_installed: packs.filter((p) => !p.installed_at).length, buckets: [] })),
  http.get(`${API_URL}/api/v2/templates/packs/:packId`, ({ params }) => {
    const pack = packs.find((p) => p.id === params.packId)
    if (!pack) return HttpResponse.json({ code: 'not_found', message: 'Pack not found' }, { status: 404 })
    return HttpResponse.json({ ...pack, assets: [] })
  }),
  http.post(`${API_URL}/api/v2/templates/packs`, async ({ request }) => {
    const body = await request.json() as { name: string; description?: string; tags?: string[]; pack_id?: string; version?: string; author?: string }
    const pack = { id: crypto.randomUUID(), pack_id: body.pack_id || body.name, name: body.name, description: body.description||'', tags: body.tags||[], version: body.version||'1.0.0', author: body.author||null, readme: null, registry_id: null, manifest_sha: null, installed_at: null, installed_version: null, created_at:new Date().toISOString(), updated_at:new Date().toISOString(), assets:[] }
    packs.push(pack); return HttpResponse.json(pack,{status:201})
  }),
  http.get(`${API_URL}/api/v2/templates/packs/:packId/archive`, ({ params }) => {
    const pack = packs.find((p)=> p.id===params.packId); if(!pack) return HttpResponse.json({code:'not_found',message:'Pack not found'},{status:404})
    const tar = new TextEncoder().encode('mock-tar-content')
    return new HttpResponse(tar, { headers: { 'Content-Type': 'application/x-tar', 'Content-Disposition': `attachment; filename="${pack.name}.tar"` } })
  }),
  http.get(`${API_URL}/api/v2/templates/packs/:packId/installations`, () => HttpResponse.json({ items: [], limit: 20, next_cursor: null, has_more: false })),
  http.post(`${API_URL}/api/v2/templates/packs/:packId/updates`, async ({ params, request }) => {
    const pack = packs.find((p)=> p.id===params.packId); if(!pack) return HttpResponse.json({code:'not_found',message:'Pack not found'},{status:404})
    pack.updated_at=new Date().toISOString(); return HttpResponse.json({ total:1, succeeded:1, failed:0, results:[{ entity_type:'command', name: pack.name, status:'success', entity_id: crypto.randomUUID(), error:'' }] })
  }),
  http.post(`${API_URL}/api/v2/templates/packs/:packId/installations`, ({ params, request }) => {
    const pack = packs.find((p) => p.id === params.packId)
    if (pack) { pack.installed_at = new Date().toISOString(); pack.installed_version = pack.version }
    const url = new URL(request.url); const onConflict = url.searchParams.get('on_conflict')||'fail'
    return HttpResponse.json({ total:1, succeeded:1, failed:0, results:[{ entity_type:'command', name: pack?.name ?? 'entity', status:'success', entity_id: crypto.randomUUID(), error:`on_conflict=${onConflict}` }] })
  }),
  http.post(`${API_URL}/api/v2/templates/packs/:packId/uninstallations`, ({ params }) => {
    const pack = packs.find((p) => p.id === params.packId)
    if (pack) { pack.installed_at = null; pack.installed_version = null }
    return new HttpResponse(null,{status:204})
  }),
  http.get(`${API_URL}/api/v2/templates/registries`, ({ request }) => { const url=new URL(request.url); const cursor=url.searchParams.get('cursor'); const limit=Number(url.searchParams.get('limit')||url.searchParams.get('size')||50); const offset=cursor?parseCursor(cursor):0; const items=registries.slice(offset, offset+limit); const has_more=offset+limit<registries.length; const next_cursor=has_more?encodeCursor(offset+limit):null; return HttpResponse.json({ items, limit, next_cursor, has_more }) }),
  http.post(`${API_URL}/api/v2/templates/registries`, async ({ request }) => {
    const body = await request.json() as { owner: string; name: string; default_branch?: string; github_token?: string | null }
    const reg = { id: crypto.randomUUID(), owner: body.owner, name: body.name, default_branch: body.default_branch||'main', last_synced_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
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
  http.post(`${API_URL}/api/v2/templates/registries/:registryId/syncs`, ({ params }) => HttpResponse.json({ registry_id: params.registryId, total:2, succeeded:2, failed:0, results:[{ pack_id:'pack-1', status:'success' },{ pack_id:'pack-2', status:'success' }] })),
]
