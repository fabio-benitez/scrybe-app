type AuthShellProps = {
  children: React.ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Izquierda */}
      <div className="hidden lg:flex items-center justify-center bg-slate-900">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">Scrybe</h1>
          <p className="text-slate-400">
            Organiza tu contenido de forma simple y eficiente
          </p>
        </div>
      </div>

      {/* Derecha */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}