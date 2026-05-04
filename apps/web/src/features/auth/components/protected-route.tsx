import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "../providers/auth-provider"

export function ProtectedRoute() {
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}