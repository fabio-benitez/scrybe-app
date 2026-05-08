import { useRef } from "react"
import { useTranslation } from "react-i18next"
import { ImageIcon, Trash2Icon, UploadIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Button } from "@/shared/components/ui/button"

interface AvatarSettingsProps {
  displayName: string
  avatarUrl?: string
  hasAvatar: boolean
  selectedFileName?: string
  hasPendingChange: boolean
  onSelectFile: (file: File) => void
  onRequestDelete: () => void
  onResetChange: () => void
}

export function AvatarSettings({
  displayName,
  avatarUrl,
  hasAvatar,
  selectedFileName,
  hasPendingChange,
  onSelectFile,
  onRequestDelete,
  onResetChange,
}: AvatarSettingsProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  const fallback = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    onSelectFile(file)
    event.target.value = ""
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Avatar className="size-20 rounded-2xl">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className="rounded-2xl text-xl">
          {fallback || <ImageIcon className="size-6" />}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium">
            {t("profileSettings.avatar.title")}
          </p>
          <p className="text-sm text-muted-foreground">
            {selectedFileName
              ? selectedFileName
              : t("profileSettings.avatar.description")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
          >
            <UploadIcon className="size-4" />
            {t("profileSettings.avatar.change")}
          </Button>

          {hasAvatar ? (
            <Button
              type="button"
              variant="outline"
              onClick={onRequestDelete}
            >
              <Trash2Icon className="size-4" />
              {t("profileSettings.avatar.delete")}
            </Button>
          ) : null}

          {hasPendingChange ? (
            <Button
              type="button"
              variant="outline"
              onClick={onResetChange}
            >
              {t("profileSettings.avatar.discardChange")}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}