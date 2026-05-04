import type { TFunction } from "i18next"
import { z } from "zod"

export function emailField(t: TFunction) {
  return z.email(t("auth.validation.email"))
}

export function passwordField(t: TFunction) {
  return z.string().min(6, t("auth.validation.passwordMin"))
}