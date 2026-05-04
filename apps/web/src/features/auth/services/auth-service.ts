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

export async function logout() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function registerWithPassword({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}