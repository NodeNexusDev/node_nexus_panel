import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useNotes, useCreateNote, useDeleteNote } from './useNotes'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useNotes', () => {
  it('fetches notes for a target', async () => {
    const { result } = renderHook(() => useNotes('node', '1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })

  it('does not fetch when target is empty', () => {
    const { result } = renderHook(() => useNotes('', ''), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateNote', () => {
  it('creates a note', async () => {
    const { result } = renderHook(() => useCreateNote(), { wrapper: createWrapper() })
    result.current.mutate({ targetType: 'node', targetId: '1', data: { content: 'test note' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })
})

describe('useDeleteNote', () => {
  it('deletes a note', async () => {
    const { result } = renderHook(() => useDeleteNote(), { wrapper: createWrapper() })
    result.current.mutate('note-1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
