import { http, HttpResponse } from 'msw'
import { mockUsers } from '../data/users'

const API_URL = '*'

export const userHandlers = [
  http.get(`${API_URL}/api/v1/users/`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const size = Number(url.searchParams.get('size') || '20')
    const start = (page - 1) * size
    const items = mockUsers.slice(start, start + size)
    return HttpResponse.json({ items, total: mockUsers.length })
  }),

  http.post(`${API_URL}/api/v1/users/`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string; is_superuser?: boolean }
    const newUser = {
      id: String(mockUsers.length + 1),
      email: body.email,
      is_active: true,
      is_superuser: body.is_superuser ?? false,
      created_at: new Date().toISOString(),
    }
    mockUsers.push(newUser)
    return HttpResponse.json(newUser, { status: 201 })
  }),

  http.delete(`${API_URL}/api/v1/users/:userId`, ({ params }) => {
    const idx = mockUsers.findIndex((u) => u.id === params.userId)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    mockUsers.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
