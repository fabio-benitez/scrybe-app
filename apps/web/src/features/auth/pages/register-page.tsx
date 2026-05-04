import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, Navigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { AuthShell } from "../components/auth-shell"
import { createRegisterSchema, type RegisterFormValues } from "../schemas/register-schema"
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
  const { t, i18n } = useTranslation()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(createRegisterSchema(t)),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  })

  useEffect(() => {
    if (form.formState.isSubmitted) {
      form.trigger()
    }
  }, [i18n.language, form])

  if (!isLoading && session) {
    return <Navigate to="/app" replace />
  }

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null)

    try {
      await registerWithPassword({ email: values.email, password: values.password })
      await logout()
      toast.success(t("auth.register.success"))
      form.reset()
    } catch (err) {
      const message = err instanceof Error ? err.message : t("auth.register.error")
      setFormError(message)
    }
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("auth.register.title")}</CardTitle>
          <CardDescription>{t("auth.register.description")}</CardDescription>
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
                    <FormLabel>{t("auth.fields.email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("auth.placeholders.email")}
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
                    <FormLabel>{t("auth.fields.password")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("auth.placeholders.password")}
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
                    <FormLabel>{t("auth.fields.confirmPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("auth.placeholders.confirmPassword")}
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
                {form.formState.isSubmitting ? t("auth.register.submitting") : t("auth.register.submit")}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {t("auth.register.hasAccount")}{" "}
                <Link
                  to="/login"
                  className="text-foreground underline underline-offset-4 hover:text-primary"
                >
                  {t("auth.register.login")}
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-4 px-2">
        {t("auth.legal.prefix")}{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground">
          {t("auth.legal.terms")}
        </a>{" "}
        {t("auth.legal.middle")}{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground">
          {t("auth.legal.privacy")}
        </a>{" "}
        {t("auth.legal.suffix")}
      </p>
    </AuthShell>
  )
}