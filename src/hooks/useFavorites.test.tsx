import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useFavorites, useAddFavorite, useRemoveFavorite } from './useFavorites'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useFavorites', () => {
  it('fetches favorites', async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toBeDefined()
  })
})

describe('useAddFavorite', () => {
  it('adds a favorite', async () => {
    const { result } = renderHook(() => useAddFavorite(), { wrapper: createWrapper() })
    result.current.mutate({ target_type: 'node', target_id: '1', name: 'test' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })
})

describe('useRemoveFavorite', () => {
  it('removes a favorite', async () => {
    const { result } = renderHook(() => useRemoveFavorite(), { wrapper: createWrapper() })
    result.current.mutate({ targetType: 'node', targetId: '1' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
