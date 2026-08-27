import { QueryCache, QueryClient } from '@tanstack/react-query'
import { ApiRequestError } from '../api/client'
import { useAuthStore } from '../stores/auth-store'

function handleServerError(error: Error) {
  if (error instanceof ApiRequestError) {
    if (error.status === 401) {
      useAuthStore.getState().logout()
      queryClient.clear()
      // Use history API to avoid hard reload
      if (window.location.pathname !== '/login') {
        window.history.pushState({}, '', '/login')
        window.dispatchEvent(new PopStateEvent('popstate'))
        // Fallback hard redirect if router not listening
        setTimeout(() => {
          if (window.location.pathname !== '/login') window.location.href = '/login'
        }, 100)
      }
    }
  }
}

function retryDelay(attempt: number): number {
  const base = Math.min(1000 * 2 ** attempt, 30_000)
  const jitter = Math.random() * 1000
  return base + jitter
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => handleServerError(error as Error),
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 300_000,
      retry: (failureCount, error) => {
        if (error instanceof ApiRequestError && error.status === 404) {
          return false
        }
        if (error instanceof ApiRequestError && error.status === 401) {
          return false
        }
        return failureCount < 3
      },
      retryDelay,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => handleServerError(error),
      retry: false,
    },
  },
})
