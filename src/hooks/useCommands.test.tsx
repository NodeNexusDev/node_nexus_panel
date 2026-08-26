import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useCommands, useCommand, useCreateCommand, useDeleteCommand } from './useCommands'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useCommands', () => {
  it('fetches paginated commands', async () => {
    const { result } = renderHook(() => useCommands(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(4)
    expect(result.current.data?.total).toBe(4)
  })
})

describe('useCommand', () => {
  it('fetches a single command by id', async () => {
    const { result } = renderHook(() => useCommand('1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.name).toBe('Check Disk Space')
  })

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useCommand(''), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateCommand', () => {
  it('creates a command', async () => {
    const { result } = renderHook(() => useCreateCommand(), { wrapper: createWrapper() })
    result.current.mutate({ name: 'new-cmd', command: 'echo hello' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })
})

describe('useDeleteCommand', () => {
  it('deletes a command', async () => {
    const { result } = renderHook(() => useDeleteCommand(), { wrapper: createWrapper() })
    result.current.mutate('1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
