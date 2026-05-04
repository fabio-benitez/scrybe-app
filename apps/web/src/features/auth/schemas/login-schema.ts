import type { TFunction } from "i18next"
import { z } from "zod"

import { emailField, passwordField } from "./fields"

export function createLoginSchema(t: TFunction) {
  return z.object({
    email: emailField(t),
    password: passwordField(t),
  })
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>