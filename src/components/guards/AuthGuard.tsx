import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth-store'

export function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const token = useAuthStore((s) => s.token)

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
