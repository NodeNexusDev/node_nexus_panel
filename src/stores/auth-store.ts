import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

function checkSession(): boolean {
  return sessionStorage.getItem('authenticated') === 'true'
}

export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: checkSession(),
  login: () => {
    sessionStorage.setItem('authenticated', 'true')
    set({ isAuthenticated: true })
  },
  logout: () => {
    sessionStorage.removeItem('authenticated')
    set({ isAuthenticated: false })
  },
}))
