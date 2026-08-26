import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useNodes, useNode, useCreateNode, useDeleteNode } from './useNodes'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useNodes', () => {
  it('fetches paginated nodes', async () => {
    const { result } = renderHook(() => useNodes(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(4)
    expect(result.current.data?.total).toBe(4)
  })
})

describe('useNode', () => {
  it('fetches a single node by id', async () => {
    const { result } = renderHook(() => useNode('1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.name).toBe('prod-server-01')
  })

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useNode(''), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateNode', () => {
  it('creates a node', async () => {
    const { result } = renderHook(() => useCreateNode(), { wrapper: createWrapper() })
    result.current.mutate({ name: 'new-node', host: '10.0.0.1', port: 22, connection_type: 'ssh' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })
})

describe('useDeleteNode', () => {
  it('deletes a node', async () => {
    const { result } = renderHook(() => useDeleteNode(), { wrapper: createWrapper() })
    result.current.mutate('1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
