import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useScripts, useScript, useCreateScript, useDeleteScript } from './useScripts'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useScripts', () => {
  it('fetches paginated scripts', async () => {
    const { result } = renderHook(() => useScripts(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(3)
    expect(result.current.data?.total).toBe(3)
  })
})

describe('useScript', () => {
  it('fetches a single script by id', async () => {
    const { result } = renderHook(() => useScript('1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.name).toBe('backup-db.sh')
  })

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useScript(''), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateScript', () => {
  it('creates a script', async () => {
    const { result } = renderHook(() => useCreateScript(), { wrapper: createWrapper() })
    result.current.mutate({ name: 'new-script', steps: [] })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })
})

describe('useDeleteScript', () => {
  it('deletes a script', async () => {
    const { result } = renderHook(() => useDeleteScript(), { wrapper: createWrapper() })
    result.current.mutate('1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
