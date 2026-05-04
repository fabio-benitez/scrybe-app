import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { AuthShell } from "../components/auth-shell"
import { registerSchema, type RegisterFormValues } from "../schemas/register-schema"
import { logout, registerWithPassword } from "../services/auth-service"
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

export default function RegisterPage() {
  const { session, isLoading } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  })

  if (!isLoading && session) {
    return <Navigate to="/app" replace />
  }

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null)

    try {
      await registerWithPassword({ email: values.email, password: values.password })
      await logout()
      toast.success("Cuenta creada correctamente. Ya puedes iniciar sesión.")
      form.reset()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear la cuenta"
      setFormError(message)
    }
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>Crea tu cuenta para empezar</CardDescription>
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
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="mínimo 6 caracteres"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="repite tu contraseña"
                        autoComplete="new-password"
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
                {form.formState.isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className="text-foreground underline underline-offset-4 hover:text-primary"
                >
                  Inicia sesión
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