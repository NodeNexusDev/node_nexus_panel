import { describe, expect, it } from 'vitest'
import { MIN_BACKEND_MAJOR, MIN_BACKEND_MINOR, isBackendSupported } from './compat'

describe('isBackendSupported', () => {
  it('accepts same major with equal or newer minor', () => {
    expect(isBackendSupported('2.5.3')).toBe(true)
    expect(isBackendSupported('2.9.0')).toBe(true)
    expect(isBackendSupported('v2.5.0')).toBe(true)
  })

  it('rejects older minor, other majors and garbage', () => {
    expect(isBackendSupported('2.4.9')).toBe(false)
    expect(isBackendSupported('3.0.0')).toBe(false)
    expect(isBackendSupported('1.9.9')).toBe(false)
    expect(isBackendSupported('unknown')).toBe(false)
    expect(isBackendSupported('')).toBe(false)
  })

  it('tracks the documented floor', () => {
    expect(MIN_BACKEND_MAJOR).toBe(2)
    expect(MIN_BACKEND_MINOR).toBe(5)
  })
})
