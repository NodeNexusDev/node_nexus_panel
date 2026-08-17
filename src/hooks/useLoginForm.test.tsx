import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useLoginForm } from './useLoginForm'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useLoginForm', () => {
  it('returns form methods', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper: createWrapper() })
    expect(typeof result.current.handleSubmit).toBe('function')
    expect(typeof result.current.onSubmit).toBe('function')
    expect(result.current.isLoading).toBe(false)
  })

  it('has default values', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper: createWrapper() })
    expect(result.current.getValues('email')).toBe('')
    expect(result.current.getValues('password')).toBe('')
  })
})
