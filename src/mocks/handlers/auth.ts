import { http, HttpResponse } from 'msw'

const mockUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@nodenexus.dev',
  is_active: true,
  is_superuser: true,
  created_at: new Date().toISOString(),
}

const mockToken = {
  access_token: 'mock-access-token-dev',
  token_type: 'bearer',
}

export const authHandlers = [
  http.post('*/auth/login', async () => {
    return HttpResponse.json(mockToken, {
      headers: { 'Set-Cookie': 'refresh_token=mock-refresh-token; Path=/auth; HttpOnly; SameSite=Strict' },
    })
  }),

  http.post('*/auth/logout', () => {
    return HttpResponse.json(null, {
      headers: { 'Set-Cookie': 'refresh_token=; Path=/auth; HttpOnly; Max-Age=0' },
    })
  }),

  http.get('*/auth/me', () => {
    return HttpResponse.json(mockUser)
  }),

  http.post('*/auth/refresh', () => {
    return HttpResponse.json(mockToken)
  }),
]
