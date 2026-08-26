import { create } from 'zustand'
import { authApi } from '../api/auth'
import { api } from '../api/client'
import type { UserResponse } from '../api/types'

interface AuthState {
  user: UserResponse | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const hasAuthSession = () => sessionStorage.getItem('authenticated') === 'true'

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: hasAuthSession(),

  login: async (email: string, password: string) => {
    const tokenResponse = await authApi.login({ email, password })
    api.setToken(tokenResponse.access_token)
    const user = await authApi.me()
    sessionStorage.setItem('authenticated', 'true')
    set({ user, isAuthenticated: true })
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore logout errors
    }
    api.setToken(null)
    sessionStorage.removeItem('authenticated')
    set({ user: null, isAuthenticated: false })
  },

  refreshUser: async () => {
    try {
      const user = await authApi.me()
      set({ user, isAuthenticated: true })
    } catch {
      api.setToken(null)
      sessionStorage.removeItem('authenticated')
      set({ user: null, isAuthenticated: false })
    }
  },
}))
