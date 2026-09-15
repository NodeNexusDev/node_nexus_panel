import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth-store'
import { Spinner } from '../ui/Spinner'

export function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const refreshUser = useAuthStore((s) => s.refreshUser)
  const location = useLocation()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    refreshUser().finally(() => setChecking(false))
  }, [refreshUser])

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'logout-event') {
        refreshUser()
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [refreshUser])

  if (checking || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <Outlet />
}
