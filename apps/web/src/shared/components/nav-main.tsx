import { NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { ComponentType } from "react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

interface NavItem {
  titleKey: string
  url: string
  icon: ComponentType<{ className?: string }>
  disabled?: boolean
  badgeKey?: string
}

interface NavMainProps {
  labelKey: string
  items: NavItem[]
}

export function NavMain({ labelKey, items }: NavMainProps) {
  const { t } = useTranslation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t(labelKey)}</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              asChild={!item.disabled}
              disabled={item.disabled}
              tooltip={t(item.titleKey)}
              className={cn(item.disabled && "opacity-50")}
            >
              {item.disabled ? (
                <>
                  <item.icon />

                  <div className="flex items-center gap-2.5">
                    <span>{t(item.titleKey)}</span>

                    {item.badgeKey && (
                      <Badge
                        variant="secondary"
                        className="pointer-events-none px-1.5 py-0 text-[10px]"
                      >
                        {t(item.badgeKey)}
                      </Badge>
                    )}
                  </div>
                </>
              ) : (
                <NavLink
                  to={item.url}
                  end={item.url === "/app"}
                  className={({ isActive }) =>
                    cn(
                      "flex w-full items-center gap-2",
                      isActive &&
                      "bg-sidebar-accent text-sidebar-accent-foreground"
                    )
                  }
                >
                  <item.icon />

                  <div className="flex w-full items-center justify-between gap-2">
                    <span>{t(item.titleKey)}</span>

                    {item.badgeKey && (
                      <Badge
                        variant="secondary"
                        className="pointer-events-none px-1.5 py-0 text-[10px]"
                      >
                        {t(item.badgeKey)}
                      </Badge>
                    )}
                  </div>
                </NavLink>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}