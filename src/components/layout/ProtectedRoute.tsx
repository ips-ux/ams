import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui'

// DEV ONLY: bypass auth gate so the app can be previewed without Firebase credentials.
// This flag is stripped from production builds automatically by Vite.
const DEV_BYPASS_AUTH = import.meta.env.DEV

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (DEV_BYPASS_AUTH) return <Outlet />

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
