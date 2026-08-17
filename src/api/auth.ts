import { api, ApiRequestError } from './client'
import type {
  User,
  AuthResponse,
  LoginRequest,
  ApiResponse,
} from './types'

function mockLogin(data: LoginRequest): ApiResponse<AuthResponse> {
  const email = import.meta.env.VITE_MOCK_EMAIL
  const password = import.meta.env.VITE_MOCK_PASSWORD
  if (data.email === email && data.password === password) {
    return {
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          name: 'Admin',
          email,
          role: 'admin',
        },
      },
    }
  }
  throw new ApiRequestError(401, { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' })
}

export const authApi = {
  login: async (data: LoginRequest) => {
    try {
      return await api.post<ApiResponse<AuthResponse>>('/api/auth/login', data)
    } catch (error) {
      if (import.meta.env.DEV && (error instanceof ApiRequestError && error.status >= 500 || error instanceof TypeError)) {
        return mockLogin(data)
      }
      throw error
    }
  },

  logout: () =>
    api.post<void>('/api/auth/logout'),

  me: async () => {
    try {
      return await api.get<ApiResponse<User>>('/api/auth/me')
    } catch (error) {
      if (import.meta.env.DEV && error instanceof TypeError) {
        const token = localStorage.getItem('auth_token')
        if (token === 'mock-jwt-token' && import.meta.env.VITE_MOCK_EMAIL) {
          return {
            data: {
              id: '1',
              name: 'Admin',
              email: import.meta.env.VITE_MOCK_EMAIL,
              role: 'admin',
            },
          }
        }
      }
      throw error
    }
  },

  refreshToken: () =>
    api.post<ApiResponse<{ token: string }>>('/api/auth/refresh'),
}
