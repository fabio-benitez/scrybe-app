import { AppRouter } from "@/app/router/app-router"
import { AuthProvider } from "@/features/auth/providers/auth-provider"

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App