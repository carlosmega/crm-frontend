"use client"

import * as React from "react"
import { memo } from "react"

import { NavMain, NavSection } from "@/components/sidebar/nav-main"
import { SidebarFooterActions } from "@/components/sidebar/sidebar-footer-actions"
import { TeamSwitcher } from "@/components/sidebar/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { USER_DATA, COMPANIES_DATA } from "./navigation-data"
import { useNavigationData } from "./navigation-data-i18n"

/**
 * AppSidebar Component
 *
 * ✅ OPTIMIZED: Uses i18n navigation data with memoization
 * - Translates navigation labels based on user locale
 * - Memoized to prevent unnecessary re-renders on navigation
 * - Stable references prevent flickering during route changes
 */
const AppSidebarComponent = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { navigationData, isLoading } = useNavigationData()

  // ✅ Keep sidebar visible during navigation to prevent flickering
  // Only show loading state on first mount
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState(false)

  React.useEffect(() => {
    if (!isLoading && !hasLoadedOnce) {
      setHasLoadedOnce(true)
    }
  }, [isLoading, hasLoadedOnce])

  // Don't render sidebar items until translations are loaded (first time only)
  if (isLoading && !hasLoadedOnce) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <TeamSwitcher companies={COMPANIES_DATA} />
        </SidebarHeader>
        <SidebarContent className="gap-0">
          <div className="px-4 py-2 text-sm text-muted-foreground">Loading...</div>
        </SidebarContent>
        <SidebarFooter>
          <SidebarFooterActions />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    )
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher companies={COMPANIES_DATA} />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* Dashboard - Sin sección */}
        <NavMain items={navigationData.dashboard} />

        {/* Sales Section */}
        <NavSection label={navigationData.labels.sales} items={navigationData.sales} />

        {/* Customers Section */}
        <NavSection label={navigationData.labels.customers} items={navigationData.customers} />

        {/* Quote-to-Cash Section */}
        <NavSection label={navigationData.labels.quoteToCash} items={navigationData.quoteToCash} />

        {/* Catalog & Activities Section */}
        <NavSection label={navigationData.labels.catalogActivities} items={navigationData.catalogActivities} />

        {/* Settings Section */}
        <NavSection label={navigationData.labels.settings} items={navigationData.settings} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterActions />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

// ✅ Memoize to prevent re-renders on every navigation
export const AppSidebar = memo(AppSidebarComponent)
