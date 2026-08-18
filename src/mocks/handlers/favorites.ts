import { http, HttpResponse } from 'msw'
import { mockFavorites } from '../data/favorites'

const API = 'http://localhost:8000'

export const favoritesHandlers = [
  http.get(`${API}/api/v1/favorites`, () => {
    return HttpResponse.json(mockFavorites)
  }),

  http.post(`${API}/api/v1/favorites`, async ({ request }) => {
    const body = await request.json() as { target_type: string; target_id: string }
    const fav = {
      id: String(mockFavorites.length + 1),
      target_type: body.target_type,
      target_id: body.target_id,
      created_at: new Date().toISOString(),
    }
    return HttpResponse.json(fav, { status: 201 })
  }),

  http.delete(`${API}/api/v1/favorites/:targetType/:targetId`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
