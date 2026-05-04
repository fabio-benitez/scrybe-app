import { z } from "zod"

import { emailField, passwordField } from "./fields"

export const registerSchema = z
  .object({
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>