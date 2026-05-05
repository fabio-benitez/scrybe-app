import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"

import { logout } from "@/features/auth/services/auth-service"
import { ApiError } from "@/shared/api/api-error"
import { Button } from "@/shared/components/ui/button"
import { getProfile, getProfileAvatarUrl } from "@/features/profile/services/profile-service"

function getErrorMessage(error: unknown, t: (key: string) => string) {
  if (error instanceof ApiError) {
    if (error.status === 401) return t("errors.unauthorized")
    if (error.status === 403) return t("errors.forbidden")
    if (error.status >= 500) return t("errors.serverError")
  }

  return t("errors.unknown")
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  })

  const avatarQuery = useQuery({
    queryKey: ["profile-avatar", profileQuery.data?.avatar_file_id],
    queryFn: () => getProfileAvatarUrl(profileQuery.data!.avatar_file_id!),
    enabled: Boolean(profileQuery.data?.avatar_file_id),
  })

  async function handleLogout() {
    setIsLoggingOut(true)
    setLogoutError(null)

    try {
      await logout()
    } catch {
      setLogoutError(t("errors.unknown"))
      setIsLoggingOut(false)
    }
  }

  const error = profileQuery.error

  return (
    <div className="p-6 space-y-4">
      <p>Dashboard</p>

      {profileQuery.isLoading && (
        <p className="text-sm text-muted-foreground">Cargando perfil...</p>
      )}

      {profileQuery.data && (
        <div className="space-y-1">
          {avatarQuery.data?.url && (
            <img
              src={avatarQuery.data.url}
              alt={profileQuery.data.display_name}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}

          <p className="font-medium">{profileQuery.data.display_name}</p>
          <p className="text-sm text-muted-foreground">
            {profileQuery.data.email}
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">
          {getErrorMessage(error, t)}
        </p>
      )}

      {logoutError && (
        <p className="text-sm text-destructive">{logoutError}</p>
      )}

      <Button onClick={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
      </Button>
    </div>
  )
}