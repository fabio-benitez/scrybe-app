import { useEffect, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { AuthShell } from "../components/auth-shell"
import { loginSchema, type LoginFormValues } from "../schemas/login-schema"
import { loginWithPassword } from "../services/auth-service"
import { useAuth } from "../providers/auth-provider"

import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

export default function LoginPage() {
  const navigate = useNavigate()
  const { session, isLoading } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)

  
  useEffect(() => {
    if (!isLoading && session) {
      navigate("/app", { replace: true })
    }
  }, [session, isLoading, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  if (!isLoading && session) {
    return <Navigate to="/app" replace />
  }

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)

    try {
      await loginWithPassword(values)
    } catch {
      setFormError("Email o contraseña incorrectos")
    }
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="tu contraseña"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}