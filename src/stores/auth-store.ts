import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../api/types'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => {
        localStorage.setItem('auth_token', token)
        set({ token, user, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('auth_token')
        set({ token: null, user: null, isAuthenticated: false })
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
