import { api } from './client'
import type {
  User,
  ApiKey,
  NotificationSettings,
  ApiResponse,
} from './types'

export const settingsApi = {
  getProfile: () =>
    api.get<ApiResponse<User>>('/api/settings/profile'),

  updateProfile: (data: { name: string; email: string }) =>
    api.put<ApiResponse<User>>('/api/settings/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<void>('/api/settings/password', data),

  getApiKeys: () =>
    api.get<ApiResponse<ApiKey[]>>('/api/settings/api-keys'),

  createApiKey: (data: { name: string }) =>
    api.post<ApiResponse<ApiKey>>('/api/settings/api-keys', data),

  deleteApiKey: (id: string) =>
    api.delete<void>(`/api/settings/api-keys/${id}`),

  getNotificationSettings: () =>
    api.get<ApiResponse<NotificationSettings>>('/api/settings/notifications'),

  updateNotificationSettings: (data: NotificationSettings) =>
    api.put<ApiResponse<NotificationSettings>>('/api/settings/notifications', data),

  resetAllData: () =>
    api.delete<void>('/api/settings/reset'),
}
