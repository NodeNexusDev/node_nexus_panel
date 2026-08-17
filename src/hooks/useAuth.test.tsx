import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useLogin, useLogout } from './useAuth'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useLogin', () => {
  it('returns mutation object', () => {
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })
    expect(typeof result.current.mutate).toBe('function')
    expect(result.current.isPending).toBe(false)
  })
})

describe('useLogout', () => {
  it('returns mutation object', () => {
    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() })
    expect(typeof result.current.mutate).toBe('function')
  })
})
