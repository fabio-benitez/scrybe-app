import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import { useAuth } from "@/features/auth/hooks/use-auth"
import { ProtectedRoute } from "@/features/auth/components/protected-route"
import LoginPage from "@/features/auth/pages/login-page"
import RegisterPage from "@/features/auth/pages/register-page"
import DashboardPage from "@/features/profile/pages/dashboard-page"

function RootRedirect() {
  const { session, isLoading } = useAuth()

  if (isLoading) return null

  return <Navigate to={session ? "/app" : "/login"} replace />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}