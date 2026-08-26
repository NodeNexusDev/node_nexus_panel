import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useDockerContainerSse } from './useDockerContainerSse'

vi.mock('./useSse', () => ({
  useSse: vi.fn(() => ({
    isConnected: true,
    lastEvent: null,
    on: vi.fn().mockReturnValue(vi.fn()),
  })),
}))

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useDockerContainerSse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without error', () => {
    const { result } = renderHook(() => useDockerContainerSse('4'), { wrapper: createWrapper() })
    expect(result.current).toBeUndefined()
  })

  it('does nothing when nodeId is empty', () => {
    const { result } = renderHook(() => useDockerContainerSse(''), { wrapper: createWrapper() })
    expect(result.current).toBeUndefined()
  })
})
