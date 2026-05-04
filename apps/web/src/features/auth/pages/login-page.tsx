import { useEffect, useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { AuthShell } from "../components/auth-shell"
import { loginSchema, type LoginFormValues } from "../schemas/login-schema"
import { loginWithPassword } from "../services/auth-service"
import { useAuth } from "../providers/auth-provider"

import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form"

export default function LoginPage() {
  const navigate = useNavigate()
  const { session, isLoading } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && session) {
      navigate("/app", { replace: true })
    }
  }, [session, isLoading, navigate])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
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
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          <CardDescription>Accede a tu cuenta de Scrybe</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Contraseña</FormLabel>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
                      >
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="tu contraseña"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link
                  to="/register"
                  className="text-foreground underline underline-offset-4 hover:text-primary"
                >
                  Regístrate
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-4 px-2">
        Al continuar, aceptas los{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground">Términos de uso</a>
        {" "}y la{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground">Política de privacidad</a>
        {" "}de Scrybe.
      </p>
    </AuthShell>
  )
}