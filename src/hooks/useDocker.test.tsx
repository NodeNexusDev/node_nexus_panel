import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useDockerContainers, useDockerImages, useStartContainer } from './useDocker'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useDockerContainers', () => {
  it('fetches docker containers', async () => {
    const { result } = renderHook(() => useDockerContainers('4'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })

  it('does not fetch when nodeId is empty', () => {
    const { result } = renderHook(() => useDockerContainers(''), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useDockerImages', () => {
  it('fetches docker images', async () => {
    const { result } = renderHook(() => useDockerImages('4'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })
})

describe('useStartContainer', () => {
  it('starts a container', async () => {
    const { result } = renderHook(() => useStartContainer(), { wrapper: createWrapper() })
    result.current.mutate({ nodeId: '4', containerId: 'c1' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
