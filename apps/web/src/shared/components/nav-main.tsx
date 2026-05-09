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
import { cn } from "@/shared/lib/utils"

interface NavItem {
  titleKey: string
  url: string
  icon: ComponentType<{ className?: string }>
  disabled?: boolean
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
                  <span>{t(item.titleKey)}</span>
                </>
              ) : (
                <NavLink
                  to={item.url}
                  end={item.url === "/app"}
                  className={({ isActive }) =>
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : ""
                  }
                >
                  <item.icon />
                  <span>{t(item.titleKey)}</span>
                </NavLink>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}