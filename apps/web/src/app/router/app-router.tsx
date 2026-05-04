import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import LoginPage from "@/features/auth/pages/login-page"
import RegisterPage from "@/features/auth/pages/register-page"
import DashboardPage from "@/features/profile/pages/dashboard-page"

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/app" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}