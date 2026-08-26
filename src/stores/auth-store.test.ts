import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/node'

const sessionStorageMock = (() => {
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

vi.stubGlobal('sessionStorage', sessionStorageMock)

const { useAuthStore } = await import('./auth-store')

describe('auth-store', () => {
  beforeEach(() => {
    sessionStorageMock.store = {}
    server.resetHandlers()
    useAuthStore.setState({ user: null, isAuthenticated: false })
  })

  it('has initial state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('login sets user and isAuthenticated', async () => {
    await useAuthStore.getState().login('admin@nodenexus.dev', 'password')
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toBeDefined()
    expect(state.user?.email).toBe('admin@nodenexus.dev')
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('authenticated', 'true')
  })

  it('logout clears state', async () => {
    await useAuthStore.getState().login('admin@nodenexus.dev', 'password')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)

    await useAuthStore.getState().logout()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(useAuthStore.getState().user).toBeNull()
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('authenticated')
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
