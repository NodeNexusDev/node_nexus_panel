import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useHotkey } from './useHotkey'

describe('useHotkey', () => {
  it('fires callback on keydown', () => {
    const callback = vi.fn()
    renderHook(() => useHotkey('k', callback))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }))
    expect(callback).toHaveBeenCalled()
  })

  it('does not fire when modifier required but not pressed', () => {
    const callback = vi.fn()
    renderHook(() => useHotkey('k', callback, { ctrl: true }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }))
    expect(callback).not.toHaveBeenCalled()
  })

  it('fires when required modifier is pressed', () => {
    const callback = vi.fn()
    renderHook(() => useHotkey('k', callback, { ctrl: true }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
    expect(callback).toHaveBeenCalled()
  })

  it('respects case insensitivity', () => {
    const callback = vi.fn()
    renderHook(() => useHotkey('K', callback))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }))
    expect(callback).toHaveBeenCalled()
  })
})
