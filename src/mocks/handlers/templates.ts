// @ts-nocheck
import { http, HttpResponse } from 'msw'

let packs = [
  { id: 'pack-1', name: 'Nginx Starter', description: 'Simple nginx compose pack', tags: ['web', 'proxy'], installed: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), assets: [] },
  { id: 'pack-2', name: 'Postgres + Redis', description: 'Database and cache stack', tags: ['db', 'cache'], installed: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), assets: [] },
]

let registries = [
  { id: 'reg-1', name: 'Official', url: 'https://registry.nodenexus.dev/packs.json', enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export const templatesHandlers = [
  http.get('/api/v2/templates/packs', ({ request }) => {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit') || 50)
    return HttpResponse.json({ items: packs.slice(0, limit), limit, next_cursor: null, has_more: false })
  }),
  http.get('/api/v2/templates/packs/stats', () => HttpResponse.json({ total: packs.length, installed: packs.filter((p) => p.installed).length, not_installed: packs.filter((p) => !p.installed).length, buckets: [] })),
  http.get('/api/v2/templates/packs/:packId', ({ params }) => {
    const pack = packs.find((p) => p.id === params.packId)
    if (!pack) return HttpResponse.json({ code: 'not_found', message: 'Pack not found' }, { status: 404 })
    return HttpResponse.json({ ...pack, assets: [] })
  }),
  http.post('/api/v2/templates/packs/:packId/installations', ({ params }) => {
    const pack = packs.find((p) => p.id === params.packId)
    if (pack) pack.installed = true
    return HttpResponse.json({ id: crypto.randomUUID(), pack_id: params.packId, status: 'installed', created_at: new Date().toISOString() })
  }),
  http.post('/api/v2/templates/packs/:packId/uninstallations', ({ params }) => {
    const pack = packs.find((p) => p.id === params.packId)
    if (pack) pack.installed = false
    return HttpResponse.json({ status: 'uninstalled' })
  }),
  http.get('/api/v2/templates/registries', () => HttpResponse.json({ items: registries, limit: 50, next_cursor: null, has_more: false })),
  http.post('/api/v2/templates/registries', async ({ request }) => {
    const body = await request.json() as { name: string; url: string }
    const reg = { id: crypto.randomUUID(), name: body.name, url: body.url, enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    registries.push(reg)
    return HttpResponse.json(reg, { status: 201 })
  }),
  http.delete('/api/v2/templates/registries/:registryId', ({ params }) => {
    registries = registries.filter((r) => r.id !== params.registryId)
    return new HttpResponse(null, { status: 204 })
  }),
  http.post('/api/v2/templates/registries/:registryId/syncs', () => HttpResponse.json({ status: 'synced', synced_at: new Date().toISOString() })),
]
