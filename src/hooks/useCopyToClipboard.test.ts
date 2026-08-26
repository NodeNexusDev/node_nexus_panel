import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCopyToClipboard } from './useCopyToClipboard'

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('copies text and sets copied to true', async () => {
    const { result } = renderHook(() => useCopyToClipboard())
    await act(async () => {
      await result.current.copy('hello')
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello')
    expect(result.current.copied).toBe(true)
  })

  it('resets copied after duration', async () => {
    const { result } = renderHook(() => useCopyToClipboard({ successDuration: 1000 }))
    await act(async () => {
      await result.current.copy('test')
    })
    expect(result.current.copied).toBe(true)

    act(() => vi.advanceTimersByTime(1001))
    expect(result.current.copied).toBe(false)
  })

  it('calls onCopied callback', async () => {
    const onCopied = vi.fn()
    const { result } = renderHook(() => useCopyToClipboard({ onCopied }))
    await act(async () => {
      await result.current.copy('test')
    })
    expect(onCopied).toHaveBeenCalled()
  })
})
