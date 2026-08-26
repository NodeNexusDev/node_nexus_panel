import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from './useSettings'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useApiKeys', () => {
  it('fetches api keys', async () => {
    const { result } = renderHook(() => useApiKeys(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(3)
    expect(result.current.data?.total).toBe(3)
  })
})

describe('useCreateApiKey', () => {
  it('creates an api key', async () => {
    const { result } = renderHook(() => useCreateApiKey(), { wrapper: createWrapper() })
    result.current.mutate({ name: 'test-key' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })
})

describe('useDeleteApiKey', () => {
  it('deletes an api key', async () => {
    const { result } = renderHook(() => useDeleteApiKey(), { wrapper: createWrapper() })
    result.current.mutate('1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
