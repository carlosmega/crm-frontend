"use client"

import * as React from "react"
import { memo } from "react"

import { NavMain, NavSection } from "@/components/sidebar/nav-main"
import { SidebarFooterActions } from "@/components/sidebar/sidebar-footer-actions"
import { ModuleSwitcher } from "@/components/sidebar/module-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useNavigationData } from "./navigation-data-i18n"

/**
 * AppSidebar Component
 *
 * Optimized sidebar with module-aware navigation:
 * - ModuleSwitcher at top to switch between Sales/Service
 * - Shared sections (Dashboard, Notifications, Customers) always visible
 * - Module-specific sections filtered based on active module
 * - Memoized to prevent unnecessary re-renders
 */
const AppSidebarComponent = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { navigationData, isLoading, activeModule } = useNavigationData()

  // Keep sidebar visible during navigation to prevent flickering
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
          {/* Module Switcher with integrated branding */}
          <ModuleSwitcher />
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
        {/* Module Switcher with integrated app branding (CRM Dynamics) */}
        <ModuleSwitcher />
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {/* ===== SHARED SECTIONS (Always visible) ===== */}

        {/* Dashboard - No section label */}
        <NavMain items={navigationData.dashboard} />

        {/* Notifications - Standalone (high priority) */}
        <NavMain items={navigationData.notifications} />

        {/* ===== MODULE-SPECIFIC SECTIONS ===== */}

        {activeModule === 'sales' && (
          <>
            {/* Sales Pipeline Section */}
            <NavSection label={navigationData.labels.sales} items={navigationData.sales} />

            {/* Customers Section (shared but contextual to Sales) */}
            <NavSection label={navigationData.labels.customers} items={navigationData.customers} />

            {/* Quote-to-Cash Section */}
            <NavSection label={navigationData.labels.quoteToCash} items={navigationData.quoteToCash} />

            {/* Catalog & Activities Section */}
            <NavSection label={navigationData.labels.catalogActivities} items={navigationData.catalogActivities} />
          </>
        )}

        {activeModule === 'service' && (
          <>
            {/* Support Section */}
            <NavSection label={navigationData.labels.support} items={navigationData.support} />

            {/* Customers Section (shared but contextual to Service) */}
            <NavSection label={navigationData.labels.customers} items={navigationData.customers} />
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarFooterActions />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

// Memoize to prevent re-renders on every navigation
export const AppSidebar = memo(AppSidebarComponent)
