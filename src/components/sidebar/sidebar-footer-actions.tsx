"use client"

import { Plus, HelpCircle, Settings, Layers } from "lucide-react"
import Link from "next/link"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useModule } from "@/core/providers/module-provider"

/**
 * Quick action configurations by module
 */
const MODULE_QUICK_ACTIONS = {
  sales: [
    {
      label: "Nuevo Lead",
      href: "/leads/new",
      icon: Plus,
    },
    {
      label: "Nueva Oportunidad",
      href: "/opportunities/new",
      icon: Plus,
    },
  ],
  service: [
    {
      label: "Nuevo Caso",
      href: "/cases/new",
      icon: Plus,
    },
  ],
}

export function SidebarFooterActions() {
  const { state } = useSidebar()
  const { activeModule } = useModule()
  const isCollapsed = state === "collapsed"

  // Get quick actions for current module
  const quickActions = MODULE_QUICK_ACTIONS[activeModule] || MODULE_QUICK_ACTIONS.sales

  return (
    <div className="border-t pt-2 overflow-hidden">
      <SidebarMenu>
        {/* Quick Actions - Module specific */}
        {quickActions.map((action) => (
          <SidebarMenuItem key={action.href}>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild size="sm">
                    <Link href={action.href} className="gap-2 min-w-0">
                      <action.icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && (
                        <span className="text-xs font-medium truncate">{action.label}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <p>{action.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </SidebarMenuItem>
        ))}

        {/* Settings - Always visible */}
        <SidebarMenuItem>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton asChild size="sm">
                  <Link href="/settings" className="gap-2 text-muted-foreground min-w-0">
                    <Settings className="h-4 w-4 shrink-0" />
                    {!isCollapsed && (
                      <span className="text-xs truncate">Configuración</span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  <p>Configuración</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </SidebarMenuItem>

        {/* Help - Always visible */}
        <SidebarMenuItem>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton asChild size="sm">
                  <Link href="/help" className="gap-2 text-muted-foreground min-w-0">
                    <HelpCircle className="h-4 w-4 shrink-0" />
                    {!isCollapsed && (
                      <span className="text-xs truncate">Ayuda y Soporte</span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  <p>Ayuda y Soporte</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* App Branding & Version - Bottom */}
      {!isCollapsed && (
        <div className="px-3 py-2 mt-2 border-t">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs font-medium text-muted-foreground truncate">
              CRM Dynamics
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            v1.0.0
          </p>
        </div>
      )}
    </div>
  )
}
