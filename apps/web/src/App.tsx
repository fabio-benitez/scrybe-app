import { AppRouter } from "@/app/router/app-router"
import { AuthProvider } from "@/features/auth/providers/auth-provider"
import { Toaster } from "@/shared/components/ui/sonner"
import { ThemeProvider } from "@/shared/theme/theme-provider"

function App() {
  return (
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        storageKey="scrybe.theme"
        disableTransitionOnChange
      >
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App