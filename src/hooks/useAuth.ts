import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { useAuthStore } from '../stores/auth-store'
import type { ApiResponse, AuthResponse } from '../api/types'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authApi.login(data),
    onSuccess: (response: ApiResponse<AuthResponse>) => {
      const { data } = response
      setAuth(data.token, data.user)
    },
  })
}

export function useCurrentUser() {
  const { isAuthenticated, token } = useAuthStore()

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    enabled: isAuthenticated && !!token,
    retry: false,
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout()
      queryClient.clear()
    },
  })
}
