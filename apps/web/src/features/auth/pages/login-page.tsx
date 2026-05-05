import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { AuthShell } from "../components/auth-shell"
import { createLoginSchema, type LoginFormValues } from "../schemas/login-schema"
import { loginWithPassword } from "../services/auth-service"
import { useAuth } from "../hooks/use-auth"

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
  const { t, i18n } = useTranslation()

  useEffect(() => {
    if (!isLoading && session) {
      navigate("/app", { replace: true })
    }
  }, [session, isLoading, navigate])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(createLoginSchema(t)),
    defaultValues: { email: "", password: "" },
  })

  useEffect(() => {
    if (form.formState.isSubmitted) {
      form.trigger()
    }
  }, [i18n.language, form])

  if (!isLoading && session) {
    return <Navigate to="/app" replace />
  }

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)

    try {
      await loginWithPassword(values)
    } catch {
      setFormError(t("auth.login.error"))
    }
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("auth.login.title")}</CardTitle>
          <CardDescription>{t("auth.login.description")}</CardDescription>
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
                    <div className="flex items-center justify-between">
                      <FormLabel>{t("auth.fields.password")}</FormLabel>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
                      >
                        {t("auth.login.forgotPassword")}
                      </a>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("auth.placeholders.password")}
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
                {form.formState.isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {t("auth.login.noAccount")}{" "}
                <Link
                  to="/register"
                  className="text-foreground underline underline-offset-4 hover:text-primary"
                >
                  {t("auth.login.register")}
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