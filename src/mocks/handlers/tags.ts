import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000'

const mockTags = [
  { name: 'system', count: 5 },
  { name: 'monitoring', count: 3 },
  { name: 'docker', count: 4 },
  { name: 'services', count: 2 },
  { name: 'production', count: 3 },
]

export const tagsHandlers = [
  http.get(`${API}/api/v1/tags`, () => {
    return HttpResponse.json(mockTags)
  }),

  http.patch(`${API}/api/v1/tags/:tagName`, async ({ request }) => {
    const body = await request.json() as { new_name: string }
    return HttpResponse.json({ name: body.new_name, count: 0 })
  }),

  http.delete(`${API}/api/v1/tags/:tagName`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
