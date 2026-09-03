import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useInfinitePacks, usePackStats } from './useTemplates'
import { createElement, type ReactNode } from 'react'

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) { return createElement(QueryClientProvider, { client: qc }, children) }
}

describe('useTemplates', () => {
  it('fetches packs', async () => {
    const { result } = renderHook(() => useInfinitePacks({ limit: 20 }), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.pages[0].items).toBeDefined()
  })
  it('fetches stats', async () => {
    const { result } = renderHook(() => usePackStats(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.total).toBeDefined()
  })
})
