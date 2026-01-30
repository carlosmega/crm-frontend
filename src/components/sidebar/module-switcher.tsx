"use client"

import * as React from "react"
import { ChevronsUpDown, Check } from "lucide-react"
import { useModule } from "@/core/providers/module-provider"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

/**
 * ModuleSwitcher Component
 *
 * Allows users to switch between CRM modules (Sales, Service, etc.)
 * Includes integrated application branding at the top.
 *
 * Each module provides a distinct set of features while sharing
 * common entities like Accounts and Contacts.
 */
export function ModuleSwitcher() {
  const { isMobile } = useSidebar()
  const { activeModule, setActiveModule, modules, getModule } = useModule()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentModule = getModule(activeModule)

  if (!currentModule) {
    return null
  }

  // Prevent hydration mismatch by not rendering dropdown until mounted
  if (!mounted) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <currentModule.icon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden min-w-0">
              <span className="truncate font-semibold">{currentModule.name}</span>
              <span className="truncate text-xs text-muted-foreground">{currentModule.description}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 shrink-0 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {/* Module Switcher Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
              aria-label={`Módulo actual: ${currentModule.name}. Click para cambiar de módulo.`}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                <currentModule.icon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden min-w-0">
                <span className="truncate font-semibold">{currentModule.name}</span>
                <span className="truncate text-xs text-muted-foreground">{currentModule.description}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Módulos CRM
            </DropdownMenuLabel>
            {modules.map((module) => (
              <DropdownMenuItem
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <module.icon className="size-3.5 shrink-0" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-medium">{module.name}</span>
                  <span className="text-xs text-muted-foreground">{module.description}</span>
                </div>
                {activeModule === module.id && (
                  <Check className="size-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
