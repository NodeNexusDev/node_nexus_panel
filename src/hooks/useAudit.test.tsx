import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useAuditLogs, useClearAudit } from './useAudit'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useAuditLogs', () => {
  it('fetches audit logs', async () => {
    const { result } = renderHook(() => useAuditLogs(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(10)
    expect(result.current.data?.total).toBe(10)
  })
})

describe('useClearAudit', () => {
  it('clears audit logs', async () => {
    const { result } = renderHook(() => useClearAudit(), { wrapper: createWrapper() })
    result.current.mutate()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
