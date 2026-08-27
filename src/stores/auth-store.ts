import { create } from 'zustand'
import { authApi } from '../api/auth'
import { api } from '../api/client'
import type { UserResponse } from '../api/types'

interface AuthState {
  user: UserResponse | null
  isAuthenticated: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  setUser: (user: UserResponse | null) => void
}

// isAuthenticated is derived from token/cookie validation, not a tamperable flag
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  login: async (email: string, password: string) => {
    const tokenResponse = await authApi.login({ email, password })
    api.setToken(tokenResponse.access_token)
    const user = await authApi.me()
    set({ user, isAuthenticated: true, isInitialized: true })
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore logout errors
    }
    api.setToken(null)
    set({ user: null, isAuthenticated: false, isInitialized: true })
    try {
      localStorage.setItem('logout-event', String(Date.now()))
    } catch {
      // ignore
    }
  },

  refreshUser: async () => {
    try {
      const user = await authApi.me()
      set({ user, isAuthenticated: true, isInitialized: true })
    } catch {
      api.setToken(null)
      set({ user: null, isAuthenticated: false, isInitialized: true })
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}))
