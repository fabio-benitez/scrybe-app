import { supabase } from "@/shared/lib/supabase"

type LoginParams = {
  email: string
  password: string
}

export async function loginWithPassword({ email, password }: LoginParams) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}