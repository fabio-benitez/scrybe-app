import type { TFunction } from "i18next"
import { z } from "zod"

import { emailField, passwordField } from "./fields"

export function createRegisterSchema(t: TFunction) {
  return z
    .object({
      email: emailField(t),
      password: passwordField(t),
      confirmPassword: z
        .string()
        .min(1, t("auth.validation.confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.validation.passwordsDoNotMatch"),
      path: ["confirmPassword"],
    })
}

export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>