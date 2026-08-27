import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/node'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    get store() { return store },
    set store(v: Record<string, string>) { store = v },
  }
})()

vi.stubGlobal('localStorage', localStorageMock as unknown as Storage)

const { useAuthStore } = await import('./auth-store')

describe('auth-store', () => {
  beforeEach(() => {
    localStorageMock.store = {}
    server.resetHandlers()
    useAuthStore.setState({ user: null, isAuthenticated: false, isInitialized: false })
  })

  it('has initial state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isInitialized).toBe(false)
  })

  it('login sets user and isAuthenticated', async () => {
    await useAuthStore.getState().login('admin', 'password')
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.isInitialized).toBe(true)
    expect(state.user).toBeDefined()
    expect(state.user?.email).toBe('admin@nodenexus.dev')
  })

  it('logout clears state', async () => {
    await useAuthStore.getState().login('admin', 'password')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)

    await useAuthStore.getState().logout()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().isInitialized).toBe(true)
  })

  it('refreshUser fails gracefully on 401', async () => {
    server.use(
      http.get('*/auth/me', () => HttpResponse.json(null, { status: 401 })),
    )
    await useAuthStore.getState().refreshUser()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().user).toBeNull()
  })
})
