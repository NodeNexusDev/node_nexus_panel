import { api } from './client'
import type {
  User,
  AuthResponse,
  LoginRequest,
  ApiResponse,
} from './types'

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/api/auth/login', data),

  logout: () =>
    api.post<void>('/api/auth/logout'),

  me: () =>
    api.get<ApiResponse<User>>('/api/auth/me'),

  refreshToken: () =>
    api.post<ApiResponse<{ token: string }>>('/api/auth/refresh'),
}
