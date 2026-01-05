"use client"

import { Plus, HelpCircle } from "lucide-react"
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

export function SidebarFooterActions() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const quickActions = [
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
  ]

  return (
    <div className="border-t pt-2">
      <SidebarMenu>
        {quickActions.map((action) => (
          <SidebarMenuItem key={action.href}>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild size="sm">
                    <Link href={action.href} className="gap-2">
                      <action.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <span className="text-xs font-medium">{action.label}</span>
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

        <SidebarMenuItem>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton asChild size="sm">
                  <Link href="/help" className="gap-2 text-muted-foreground">
                    <HelpCircle className="h-4 w-4" />
                    {!isCollapsed && (
                      <span className="text-xs">Ayuda y Soporte</span>
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

      {!isCollapsed && (
        <div className="px-3 py-2 mt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Version 1.0.0
          </p>
        </div>
      )}
    </div>
  )
}
