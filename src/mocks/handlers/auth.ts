import { http, HttpResponse } from 'msw'

const VALID_EMAIL = import.meta.env.VITE_PANEL_LOGIN || 'admin'
const VALID_PASSWORD = import.meta.env.VITE_PANEL_PASSWORD || 'password'

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
  http.post('*/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    if (body.email !== VALID_EMAIL || body.password !== VALID_PASSWORD) {
      return HttpResponse.json(
        { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        { status: 401 },
      )
    }
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
