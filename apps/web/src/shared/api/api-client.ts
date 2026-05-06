import { supabase } from "@/shared/lib/supabase"
import { ApiError } from "@/shared/api/api-error"

const BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!BASE_URL) {
  throw new Error("Missing VITE_API_BASE_URL environment variable")
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new ApiError(401, "No active session")
  }

  const isFormData = options?.body instanceof FormData

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${session.access_token}`,
      ...options?.headers,
    },
  })

  if (!res.ok) {
    throw new ApiError(res.status, `API error ${res.status}`)
  }

  const contentType = res.headers.get("content-type")
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>
  }

  return undefined as unknown as T
}