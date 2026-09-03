import { api } from './client'
import type { LoginRequest, TokenResponse, UserResponse } from './types'

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<TokenResponse>('/auth/login', data),

  logout: () =>
    api.post<void>('/auth/logout'),

  me: () =>
    api.get<UserResponse>('/auth/me'),

  refresh: () =>
    api.post<TokenResponse>('/auth/refresh'),
}
