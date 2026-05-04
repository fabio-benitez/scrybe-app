// Shared validation rules for auth fields.
// Update here to apply changes across all auth schemas.
import { z } from "zod"

export const emailField = z.email("Introduce un email válido")
export const passwordField = z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
