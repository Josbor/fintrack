import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { FullScreenLoader } from '../components/molecules/FullScreenLoader'
import { useAuth } from './useAuth'

export function ProtectedRoute() {
  const { session, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <FullScreenLoader />
  }

  if (!session) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
