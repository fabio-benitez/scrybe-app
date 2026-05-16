import * as React from "react"

import { NavMain } from "@/shared/components/nav-main"
import { NavUser } from "@/shared/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"
import { PinnedIcon } from "@/shared/components/pinned-icon"

import {
  FolderIcon,
  HomeIcon,
  PaperclipIcon,
  SettingsIcon,
  TagsIcon,
  Trash2Icon,
} from "lucide-react"

import { useTranslation } from "react-i18next"

const navMain = [
  {
    titleKey: "app.navigation.home",
    url: "/app",
    icon: HomeIcon,
  },
  {
    titleKey: "app.navigation.notes",
    url: "/app/notes",
    icon: FolderIcon,
  },
  {
    titleKey: "app.navigation.favorites",
    url: "/app/favorites",
    icon: PinnedIcon,
  },
  {
    titleKey: "app.navigation.files",
    url: "/app/files",
    icon: PaperclipIcon,
    disabled: true,
    badgeKey: "app.navigation.comingSoon",
  },
  {
    titleKey: "app.navigation.trash",
    url: "/app/trash",
    icon: Trash2Icon,
  },
]

const navOrganization = [
  {
    titleKey: "app.navigation.categories",
    url: "/app/categories",
    icon: FolderIcon,
  },
  {
    titleKey: "app.navigation.tags",
    url: "/app/tags",
    icon: TagsIcon,
    disabled: true,
    badgeKey: "app.navigation.comingSoon",
  },
]

const navSettings = [
  {
    titleKey: "app.navigation.settings",
    url: "/app/settings",
    icon: SettingsIcon,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/app" className="flex items-center gap-1">
                <img
                  src="/logo.svg"
                  alt={t("app.brand.name")}
                  className="size-7"
                />
                <span className="text-base font-semibold">
                  {t("app.brand.name")}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain labelKey="app.navigation.main" items={navMain} />
        <NavMain labelKey="app.navigation.organization" items={navOrganization} />
        <NavMain labelKey="app.navigation.settings" items={navSettings} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}