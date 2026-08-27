import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSse } from './useSse'

vi.mock('../api/events', () => ({
  eventsClient: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    get isConnected() { return false },
    on: vi.fn().mockReturnValue(vi.fn()),
    onConnectionChange: vi.fn((cb: (v: boolean) => void) => {
      cb(false)
      return vi.fn()
    }),
  },
}))

describe('useSse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with disconnected state', () => {
    const { result } = renderHook(() => useSse())
    expect(result.current.isConnected).toBe(false)
    expect(result.current.lastEvent).toBeNull()
  })

  it('returns on function', () => {
    const { result } = renderHook(() => useSse())
    expect(typeof result.current.on).toBe('function')
  })
})
