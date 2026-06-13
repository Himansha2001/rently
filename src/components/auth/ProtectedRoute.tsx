import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAuthHydrated } from '@/hooks/useAuthHydrated'

function AuthLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center pt-24">
      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const hydrated = useAuthHydrated()
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!hydrated) {
    return <AuthLoading />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
