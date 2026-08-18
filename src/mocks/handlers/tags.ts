import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000'

export const tagsHandlers = [
  http.patch(`${API}/api/v1/tags/:tagName`, async ({ request }) => {
    const body = await request.json() as { new_name: string }
    return HttpResponse.json({ name: body.new_name, count: 0 })
  }),

  http.delete(`${API}/api/v1/tags/:tagName`, () => {
    return HttpResponse.json({ message: 'Tag deleted successfully' })
  }),
]
