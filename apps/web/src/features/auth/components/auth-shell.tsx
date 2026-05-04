import { BookOpenIcon, FolderIcon, TagsIcon } from "lucide-react"

type AuthShellProps = {
  children: React.ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="min-h-screen grid bg-background text-foreground lg:grid-cols-2">
      {/* Left — mini landing */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-slate-900 p-12 gap-12">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-white tracking-tight">Scrybe</h1>
          <p className="text-slate-400 text-lg max-w-xs">
            Organiza tu contenido de forma simple y eficiente
          </p>
        </div>

        <ul className="space-y-5 w-full max-w-xs">
          <li className="flex items-start gap-3">
            <BookOpenIcon className="size-5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">Contenidos estructurados</p>
              <p className="text-slate-500 text-sm">Escribe y organiza tus contenidos con categorías y etiquetas.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <FolderIcon className="size-5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">Gestión de archivos</p>
              <p className="text-slate-500 text-sm">Adjunta y gestiona archivos directamente en tus contenidos.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <TagsIcon className="size-5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">Etiquetas flexibles</p>
              <p className="text-slate-500 text-sm">Clasifica con etiquetas personalizadas para encontrar todo al instante.</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}