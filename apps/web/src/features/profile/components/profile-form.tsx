import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { AvatarSettings } from "@/features/profile/components/avatar-settings"
import {
  useDeleteProfileAvatar,
  useProfileAvatar,
  useUpdateProfile,
  useUpdateProfileAvatar,
} from "@/features/profile/hooks/use-profile"
import type { Profile } from "@/features/profile/types/profile"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { t } = useTranslation()

  const updateProfile = useUpdateProfile()
  const updateAvatar = useUpdateProfileAvatar()
  const deleteAvatar = useDeleteProfileAvatar()

  const { data: avatar } = useProfileAvatar(profile.avatar_file_id)

  const [displayName, setDisplayName] = useState(profile.display_name)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [shouldDeleteAvatar, setShouldDeleteAvatar] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    setDisplayName(profile.display_name)
    setSelectedAvatarFile(null)
    setShouldDeleteAvatar(false)
  }, [profile.display_name, profile.avatar_file_id])

  const previewAvatarUrl = useMemo(() => {
    if (!selectedAvatarFile) return avatar?.url

    return URL.createObjectURL(selectedAvatarFile)
  }, [avatar?.url, selectedAvatarFile])

  useEffect(() => {
    if (!selectedAvatarFile || !previewAvatarUrl) return

    return () => URL.revokeObjectURL(previewAvatarUrl)
  }, [previewAvatarUrl, selectedAvatarFile])

  const isSaving =
    updateProfile.isPending ||
    updateAvatar.isPending ||
    deleteAvatar.isPending

  async function handleSubmit(
    event: SubmitEvent,
  ): Promise<void> {
    event.preventDefault()

    const trimmedDisplayName = displayName.trim()

    if (!trimmedDisplayName) {
      toast.warning(t("profileSettings.profile.validation.displayNameRequired"))
      return
    }

    try {
      await updateProfile.mutateAsync({
        display_name: trimmedDisplayName,
      })

      if (shouldDeleteAvatar && profile.avatar_file_id) {
        await deleteAvatar.mutateAsync()
      }

      if (selectedAvatarFile) {
        await updateAvatar.mutateAsync(selectedAvatarFile)
      }

      toast.success(t("profileSettings.profile.toast.updated"))
    } catch {
      toast.error(t("profileSettings.profile.toast.updateError"))
    }
  }

  function handleSelectAvatar(file: File) {
    setSelectedAvatarFile(file)
    setShouldDeleteAvatar(false)
  }

  function handleConfirmDeleteAvatar() {
    setSelectedAvatarFile(null)
    setShouldDeleteAvatar(true)
    setIsDeleteDialogOpen(false)
  }

  function handleResetAvatarChange() {
    setSelectedAvatarFile(null)
    setShouldDeleteAvatar(false)
  }

  return (
    <>
      <form
        className="max-w-3xl space-y-6"
        onSubmit={(event) => void handleSubmit(event.nativeEvent)}
      >
        <AvatarSettings
          displayName={displayName}
          avatarUrl={shouldDeleteAvatar ? undefined : previewAvatarUrl}
          hasAvatar={Boolean(profile.avatar_file_id || selectedAvatarFile)}
          selectedFileName={selectedAvatarFile?.name}
          onSelectFile={handleSelectAvatar}
          onRequestDelete={() => setIsDeleteDialogOpen(true)}
          hasPendingChange={Boolean(selectedAvatarFile || shouldDeleteAvatar)}
          onResetChange={handleResetAvatarChange}
        />

        <div className="space-y-2">
          <Label htmlFor="display_name">
            {t("profileSettings.profile.displayName")}
          </Label>

          <Input
            id="display_name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder={t("profileSettings.profile.displayNamePlaceholder")}
          />

          <p className="text-xs text-muted-foreground">
            {t("profileSettings.profile.displayNameHelp")}
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving
              ? t("profileSettings.profile.saving")
              : t("profileSettings.profile.save")}
          </Button>
        </div>
      </form>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("profileSettings.avatar.deleteDialog.title")}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {t("profileSettings.avatar.deleteDialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("profileSettings.avatar.deleteDialog.cancel")}
            </AlertDialogCancel>

            <AlertDialogAction onClick={handleConfirmDeleteAvatar}>
              {t("profileSettings.avatar.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}