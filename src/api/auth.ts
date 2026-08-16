import { api, ApiRequestError } from './client'
import type {
  User,
  AuthResponse,
  LoginRequest,
  ApiResponse,
} from './types'

const MOCK_EMAIL = import.meta.env.VITE_MOCK_EMAIL
const MOCK_PASSWORD = import.meta.env.VITE_MOCK_PASSWORD

function mockLogin(data: LoginRequest): ApiResponse<AuthResponse> {
  if (data.email === MOCK_EMAIL && data.password === MOCK_PASSWORD) {
    return {
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          name: 'Admin',
          email: MOCK_EMAIL,
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
      if (error instanceof ApiRequestError && error.status >= 500) {
        return mockLogin(data)
      }
      if (error instanceof TypeError) {
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
      if (error instanceof TypeError) {
        const token = localStorage.getItem('auth_token')
        if (token === 'mock-jwt-token' && MOCK_EMAIL) {
          return {
            data: {
              id: '1',
              name: 'Admin',
              email: MOCK_EMAIL,
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
