import { useTranslation } from "react-i18next"

import { ProfileForm } from "@/features/profile/components/profile-form"
import { PreferencesSettings } from "@/features/profile/components/preferences-settings"
import { useProfile } from "@/features/profile/hooks/use-profile"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs"

export default function ProfileSettingsPage() {
  const { t } = useTranslation()
  const { data: profile, isLoading } = useProfile()

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="w-full max-w-3xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("profileSettings.title")}
          </h1>

          <p className="text-sm text-muted-foreground">
            {t("profileSettings.description")}
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              {t("profileSettings.tabs.profile")}
            </TabsTrigger>

            <TabsTrigger value="preferences">
              {t("profileSettings.tabs.preferences")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("profileSettings.profile.title")}
                </CardTitle>

                <CardDescription>
                  {t("profileSettings.profile.description")}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {isLoading || !profile ? null : (
                  <ProfileForm profile={profile} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("profileSettings.preferences.title")}
                </CardTitle>

                <CardDescription>
                  {t("profileSettings.preferences.description")}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <PreferencesSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}