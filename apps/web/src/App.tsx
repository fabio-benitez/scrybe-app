import { AppRouter } from "@/app/router/app-router"
import { AuthProvider } from "@/features/auth/providers/auth-provider"
import { Toaster } from "@/shared/components/ui/sonner"

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster />
    </AuthProvider>
  )
}

export default App