import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import Spinner from '../common/Spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, token } = useAuthStore()

  // Check if we have a token in localStorage (for page refresh)
  const hasToken = localStorage.getItem('auth_token')

  if (hasToken && !isAuthenticated) {
    // Token exists but not loaded yet - show loading
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated && !hasToken) {
    // No authentication - redirect to login
    return <Navigate to="/auth/login" replace />
  }

  return <>{children}</>
}

