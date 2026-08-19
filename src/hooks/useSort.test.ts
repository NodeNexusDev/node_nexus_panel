import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSort } from './useSort'

describe('useSort', () => {
  it('initializes with null sort', () => {
    const { result } = renderHook(() => useSort<string>())
    expect(result.current.sort).toBeNull()
  })

  it('sets ascending sort on first toggle', () => {
    const { result } = renderHook(() => useSort<string>())
    act(() => result.current.toggle('name'))
    expect(result.current.sort).toEqual({ key: 'name', dir: 'asc' })
  })

  it('switches to descending on second toggle of same key', () => {
    const { result } = renderHook(() => useSort<string>())
    act(() => result.current.toggle('name'))
    act(() => result.current.toggle('name'))
    expect(result.current.sort).toEqual({ key: 'name', dir: 'desc' })
  })

  it('resets to null on third toggle of same key', () => {
    const { result } = renderHook(() => useSort<string>())
    act(() => result.current.toggle('name'))
    act(() => result.current.toggle('name'))
    act(() => result.current.toggle('name'))
    expect(result.current.sort).toBeNull()
  })

  it('switches to asc when toggling different key', () => {
    const { result } = renderHook(() => useSort<string>())
    act(() => result.current.toggle('name'))
    act(() => result.current.toggle('updated_at'))
    expect(result.current.sort).toEqual({ key: 'updated_at', dir: 'asc' })
  })
})
