import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useAuthHydrated } from '@/hooks/useAuthHydrated'

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const hydrated = useAuthHydrated()
  const { user, isAuthenticated } = useAuthStore()

  if (!hydrated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center pt-24">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (!user.roles?.includes('admin')) {
    return <Navigate to="/account" replace />
  }

  return <>{children}</>
}
