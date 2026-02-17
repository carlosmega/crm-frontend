import { Metadata } from 'next'
import { QuoteAnalyticsDashboard } from '@/features/quotes/components/quote-analytics-dashboard'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { NotificationMenu } from '@/components/layout/notification-menu'
import { UserMenu } from '@/components/layout/user-menu'

export const metadata: Metadata = {
  title: 'Quote Analytics | CRM',
  description: 'Comprehensive analytics and insights for quote management',
}

/**
 * Quote Analytics Page
 *
 * Dashboard dedicado para analítica avanzada de Quotes:
 * - Métricas clave: conversion rate, avg quote value, time to close
 * - Gráficos: quotes por estado, trend mensual, top products
 * - Filtros: por período, customer, owner
 * - KPIs con comparación período anterior
 */
export default function QuoteAnalyticsPage() {
  return (
    <>
      {/* Header - Sticky */}
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 bg-background border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        {/* Left side: Trigger + Breadcrumb */}
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Sales</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/quotes">Quotes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Analytics</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right side: Notifications + User Menu */}
        <div className="flex items-center gap-2 px-4">
          <NotificationMenu />
          <UserMenu variant="full" />
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100 dark:bg-gray-900">
        <div className="px-4 pb-6 pt-6">
          <QuoteAnalyticsDashboard />
        </div>
      </div>
    </>
  )
}
