import { describe, it, expect, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDocumentTitle } from './useDocumentTitle'

describe('useDocumentTitle', () => {
  afterEach(() => {
    document.title = 'NodeNexus'
  })

  it('sets document title with app name', () => {
    renderHook(() => useDocumentTitle('Dashboard'))
    expect(document.title).toBe('Dashboard | NodeNexus')
  })

  it('sets app name only when no title', () => {
    renderHook(() => useDocumentTitle())
    expect(document.title).toBe('NodeNexus')
  })

  it('restores previous title on unmount', () => {
    document.title = 'Previous Title'
    const { unmount } = renderHook(() => useDocumentTitle('New Title'))
    expect(document.title).toBe('New Title | NodeNexus')
    unmount()
    expect(document.title).toBe('Previous Title')
  })
})
