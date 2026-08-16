import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '../api/settings'
import type { NotificationSettings } from '../api/types'

export function useProfile() {
  return useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: () => settingsApi.getProfile(),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; email: string }) =>
      settingsApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      settingsApi.changePassword(data),
  })
}

export function useApiKeys() {
  return useQuery({
    queryKey: ['settings', 'api-keys'],
    queryFn: () => settingsApi.getApiKeys(),
  })
}

export function useCreateApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string }) => settingsApi.createApiKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'api-keys'] })
    },
  })
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'api-keys'] })
    },
  })
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: () => settingsApi.getNotificationSettings(),
  })
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: NotificationSettings) =>
      settingsApi.updateNotificationSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'notifications'] })
    },
  })
}

export function useResetAllData() {
  return useMutation({
    mutationFn: () => settingsApi.resetAllData(),
  })
}
