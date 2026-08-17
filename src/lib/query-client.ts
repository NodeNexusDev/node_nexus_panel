import { QueryClient } from '@tanstack/react-query'
import { ApiRequestError } from '../api/client'
import { useAuthStore } from '../stores/auth-store'

function handleServerError(error: Error) {
  if (error instanceof ApiRequestError) {
    if (error.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (error instanceof ApiRequestError && error.status === 404) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => handleServerError(error),
    },
  },
})
