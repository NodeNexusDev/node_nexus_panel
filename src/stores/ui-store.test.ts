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

const { useUiStore } = await import('./ui-store')

describe('ui-store', () => {
  beforeEach(() => {
    localStorageMock.store = {}
    useUiStore.setState({ theme: 'dark', sidebarOpen: true, activeModal: null })
    document.documentElement.className = ''
  })

  it('has initial state', () => {
    const state = useUiStore.getState()
    expect(state.theme).toBe('dark')
    expect(state.sidebarOpen).toBe(true)
    expect(state.activeModal).toBeNull()
  })

  it('setTheme updates theme and applies to document', () => {
    useUiStore.getState().setTheme('light')
    expect(useUiStore.getState().theme).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('setTheme with system resolves correctly', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: false })
    vi.stubGlobal('matchMedia', matchMedia)
    useUiStore.getState().setTheme('system')
    expect(useUiStore.getState().theme).toBe('system')
    expect(document.documentElement.classList.contains('light')).toBe(true)
    vi.unstubAllGlobals()
  })

  it('toggleSidebar toggles sidebarOpen', () => {
    expect(useUiStore.getState().sidebarOpen).toBe(true)
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().sidebarOpen).toBe(false)
    useUiStore.getState().toggleSidebar()
    expect(useUiStore.getState().sidebarOpen).toBe(true)
  })

  it('setSidebarOpen sets specific value', () => {
    useUiStore.getState().setSidebarOpen(false)
    expect(useUiStore.getState().sidebarOpen).toBe(false)
    useUiStore.getState().setSidebarOpen(true)
    expect(useUiStore.getState().sidebarOpen).toBe(true)
  })

  it('openModal and closeModal', () => {
    useUiStore.getState().openModal('test-modal')
    expect(useUiStore.getState().activeModal).toBe('test-modal')
    useUiStore.getState().closeModal()
    expect(useUiStore.getState().activeModal).toBeNull()
  })
})
