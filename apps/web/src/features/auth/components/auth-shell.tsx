import { useTranslation } from "react-i18next"
import { BookOpenIcon, FolderIcon, TagsIcon } from "lucide-react"
import { LanguageSwitcher } from "@/shared/i18n/language-switcher"

type AuthShellProps = {
  children: React.ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen grid bg-background text-foreground lg:grid-cols-2">
      
      {/* Left - mini landing */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-slate-900 p-12 gap-12">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-white tracking-tight">Scrybe</h1>
          <p className="text-slate-400 text-lg max-w-xs">
            {t("auth.shell.tagline")}
          </p>
        </div>

        <ul className="space-y-5 w-full max-w-xs">
          <li className="flex items-start gap-3">
            <BookOpenIcon className="size-5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">
                {t("auth.shell.features.content.title")}
              </p>
              <p className="text-slate-500 text-sm">
                {t("auth.shell.features.content.description")}
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <FolderIcon className="size-5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">
                {t("auth.shell.features.files.title")}
              </p>
              <p className="text-slate-500 text-sm">
                {t("auth.shell.features.files.description")}
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <TagsIcon className="size-5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-white text-sm font-medium">
                {t("auth.shell.features.tags.title")}
              </p>
              <p className="text-slate-500 text-sm">
                {t("auth.shell.features.tags.description")}
              </p>
            </div>
          </li>
        </ul>
      </div>


      {/* Right — form */}
      <div className="relative flex items-center justify-center p-6 bg-background">
        <div className="absolute right-6 top-6">
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}