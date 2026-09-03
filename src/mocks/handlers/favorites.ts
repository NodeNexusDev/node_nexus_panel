import { http, HttpResponse } from 'msw'
import { mockFavorites } from '../data/favorites'
import type { FavoriteResponse } from '../../api/types'

const API = '*'

export const favoritesHandlers = [
  http.get(`${API}/api/v2/favorites`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const size = Number(url.searchParams.get('size') || '20')
    const cursor = url.searchParams.get('cursor')
    const limit = Number(url.searchParams.get('limit') || size)
    const targetType = url.searchParams.get('target_type')
    let filtered = mockFavorites
    if (targetType) filtered = filtered.filter((f) => f.target_type === targetType)
    let offset = 0
    if (cursor) { try { offset = Number(atob(cursor)) || 0 } catch { offset = Number(cursor) || 0 } }
    else if (url.searchParams.get('page')) offset = (page - 1) * limit
    const items = filtered.slice(offset, offset + limit)
    const has_more = offset + limit < filtered.length
    const next_cursor = has_more ? btoa(String(offset + limit)) : null
    return HttpResponse.json({ items, limit, next_cursor, has_more, total: filtered.length, page, size: limit })
  }),
  http.get(`${API}/api/v2/favorites/`, ({ request }) => {
    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const limit = Number(url.searchParams.get('limit') || '20')
    const targetType = url.searchParams.get('target_type')
    let filtered = mockFavorites
    if (targetType) filtered = filtered.filter((f) => f.target_type === targetType)
    let offset = 0
    if (cursor) { try { offset = Number(atob(cursor)) || 0 } catch { offset = Number(cursor) || 0 } }
    const items = filtered.slice(offset, offset + limit)
    const has_more = offset + limit < filtered.length
    const next_cursor = has_more ? btoa(String(offset + limit)) : null
    return HttpResponse.json({ items, limit, next_cursor, has_more })
  }),

  http.post(`${API}/api/v2/favorites`, async ({ request }) => {
    const body = await request.json() as { target_type: 'node' | 'command' | 'script'; target_id: string; name?: string | null }
    const fav: FavoriteResponse = {
      id: String(mockFavorites.length + 1),
      target_type: body.target_type,
      target_id: body.target_id,
      name: body.name ?? null,
      note: null,
      created_at: new Date().toISOString(),
    }
    mockFavorites.push(fav)
    return HttpResponse.json(fav, { status: 201 })
  }),
  http.post(`${API}/api/v2/favorites/`, async ({ request }) => {
    const body = await request.json() as { target_type: 'node' | 'command' | 'script'; target_id: string; name?: string | null }
    const fav: FavoriteResponse = {
      id: String(mockFavorites.length + 1),
      target_type: body.target_type,
      target_id: body.target_id,
      name: body.name ?? null,
      note: null,
      created_at: new Date().toISOString(),
    }
    mockFavorites.push(fav)
    return HttpResponse.json(fav, { status: 201 })
  }),

  http.delete(`${API}/api/v2/favorites/:targetType/:targetId`, ({ params }) => {
    const idx = mockFavorites.findIndex((f) => f.target_type === params.targetType && f.target_id === params.targetId)
    if (idx !== -1) mockFavorites.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
