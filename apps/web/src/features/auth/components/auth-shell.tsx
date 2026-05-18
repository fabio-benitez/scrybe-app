import { useTranslation } from "react-i18next"
import { BookOpenIcon, FolderIcon, TagsIcon } from "lucide-react"
import { LanguageSwitcher } from "@/shared/i18n/language-switcher"

type AuthShellProps = {
  children: React.ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen grid bg-black text-foreground lg:grid-cols-[1.1fr_0.9fr]">

      {/* Left - branding */}
      <div
        className="relative hidden overflow-hidden lg:flex"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.15), rgba(0,0,0,0.85)), url('/login_bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >

        <div className="relative z-10 flex w-full items-center justify-center p-14">
          <div className="flex w-full max-w-2xl flex-col gap-10 items-center text-center">
            <div className="flex flex-col items-center space-y-4">
              <img
                src="/logo.svg"
                alt="Scrybe"
                className="h-16 w-16"
              />

              <div className="space-y-3 text-center">
                <h1 className="text-6xl font-semibold tracking-tight text-white">
                  Scrybe
                </h1>

                <p className="max-w-lg text-lg leading-relaxed text-zinc-300">
                  {t("auth.shell.tagline")}
                </p>
              </div>
            </div>

            <div className="w-full max-w-xl space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-7 backdrop-blur-sm">
                <div className="relative flex items-center justify-center px-12 text-center">
                  <BookOpenIcon className="absolute left-0 size-5 text-violet-300" />

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">
                      {t("auth.shell.features.content.title")}
                    </p>

                    <p className="mt-1 text-sm text-zinc-400">
                      {t("auth.shell.features.content.description")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-7 backdrop-blur-sm">
                <div className="relative flex items-center justify-center px-12 text-center">
                  <FolderIcon className="absolute left-0 size-5 text-violet-300" />

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">
                      {t("auth.shell.features.files.title")}
                    </p>

                    <p className="mt-1 text-sm text-zinc-400">
                      {t("auth.shell.features.files.description")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-7 backdrop-blur-sm">
                <div className="relative flex items-center justify-center px-12 text-center">
                  <TagsIcon className="absolute left-0 size-5 text-violet-300" />

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">
                      {t("auth.shell.features.tags.title")}
                    </p>

                    <p className="mt-1 text-sm text-zinc-400">
                      {t("auth.shell.features.tags.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="pt-4 text-sm text-zinc-500">
              {t("auth.shell.footer")}
            </p>
          </div>
        </div>
      </div>


      {/* Right — form */}
      <div className="relative flex items-center justify-center overflow-hidden bg-zinc-950 p-6">

        <div className="absolute inset-0">
          <div className="absolute left-0 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-3xl" />
        </div>

        <div className="absolute right-6 top-6 z-10">
          <LanguageSwitcher />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}