"use client"

import { memo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

/**
 * NavMain Component
 * ✅ OPTIMIZED: Memoized to prevent re-renders when items don't change
 * - Only re-renders when pathname or items change
 * - Stable references prevent unnecessary updates
 * - Supports optional badge count for notifications
 */
export const NavMain = memo(function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    badge?: number
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="px-2 pt-2 pb-0">
      <SidebarMenu>
        {items.map((item) => {
          // Check if current path matches this item
          const isActive = pathname === item.url || pathname.startsWith(item.url + '/')

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.badge !== undefined && (
                    <Badge
                      variant="secondary"
                      className="ml-auto rounded-full px-2 py-0 text-xs"
                      aria-label={`${item.badge} unread`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
})

/**
 * NavSection Component
 * ✅ OPTIMIZED: Memoized to prevent re-renders when label/items don't change
 * - Only re-renders when pathname, label, or items change
 * - Stable references prevent unnecessary updates
 * - Supports optional badge count for notifications
 */
export const NavSection = memo(function NavSection({
  label,
  items,
}: {
  label: string
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    badge?: number
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="px-2 pt-2 pb-0">
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Check if current path matches this item
          const isActive = pathname === item.url || pathname.startsWith(item.url + '/')

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.badge !== undefined && (
                    <Badge
                      variant="secondary"
                      className="ml-auto rounded-full px-2 py-0 text-xs"
                      aria-label={`${item.badge} unread`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
})
