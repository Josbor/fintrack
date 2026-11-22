import { Navigate, Outlet } from 'react-router-dom'
import { FullScreenLoader } from '../components/molecules/FullScreenLoader'
import { useAuth } from './useAuth'

export function GuestRoute() {
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return <FullScreenLoader />
  }

  if (session) {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
