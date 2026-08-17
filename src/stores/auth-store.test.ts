import { describe, it, expect, beforeEach, vi } from 'vitest'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    store,
  }
})()

vi.stubGlobal('localStorage', localStorageMock)

const { useAuthStore } = await import('./auth-store')

describe('auth-store', () => {
  beforeEach(() => {
    localStorageMock.store = {}
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false })
  })

  it('has initial state', () => {
    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('setAuth sets token, user and isAuthenticated', () => {
    const user = { id: '1', email: 'test@test.com', name: 'Test', role: 'admin' as const }
    useAuthStore.getState().setAuth('token-123', user)
    const state = useAuthStore.getState()
    expect(state.token).toBe('token-123')
    expect(state.user).toEqual(user)
    expect(state.isAuthenticated).toBe(true)
  })

  it('setUser updates user only', () => {
    const user = { id: '1', email: 'test@test.com', name: 'Test', role: 'admin' as const }
    useAuthStore.getState().setUser(user)
    expect(useAuthStore.getState().user).toEqual(user)
  })

  it('logout clears state and localStorage', () => {
    const user = { id: '1', email: 'test@test.com', name: 'Test', role: 'admin' as const }
    useAuthStore.getState().setAuth('token-123', user)
    useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})
