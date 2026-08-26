import { api } from './client'
import type { UserCreate, UserResponse, UserListResponse } from './types'

export const usersApi = {
  getAll: (params?: { page?: number; size?: number }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.size) query.set('size', String(params.size))
    const qs = query.toString()
    return api.get<UserListResponse>(`/users/${qs ? `?${qs}` : ''}`)
  },

  create: (data: UserCreate) =>
    api.post<UserResponse>('/users/', data),

  remove: (userId: string) =>
    api.delete<void>(`/users/${userId}`),
}
