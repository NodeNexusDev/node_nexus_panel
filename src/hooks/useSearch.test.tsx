import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useSearch } from './useSearch'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useSearch', () => {
  it('does not search with query shorter than 2 chars', () => {
    const { result } = renderHook(() => useSearch('a'), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('enables search when query is 2+ chars', async () => {
    const { result } = renderHook(() => useSearch('ab'), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).not.toBe('idle')
  })
})
