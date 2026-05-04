import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Introduce un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export type LoginFormValues = z.infer<typeof loginSchema>