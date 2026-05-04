
import { useState } from "react"

import { logout } from "@/features/auth/services/auth-service"
import { Button } from "@/shared/components/ui/button"

export default function DashboardPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogout() {
    setIsLoggingOut(true)
    setError(null)

    try {
      await logout()
    } catch {
      setError("Error al cerrar sesión. Inténtalo de nuevo.")
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <p>Dashboard</p>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
      </Button>
    </div>
  )
}