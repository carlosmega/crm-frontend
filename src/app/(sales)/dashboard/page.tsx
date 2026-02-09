import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardClient } from './dashboard-client'

export const metadata: Metadata = {
  title: 'Dashboard | CRM Sales',
  description: 'Sales overview with pipeline metrics, revenue forecasts and team performance',
}

export default function DashboardPage() {
  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <SidebarTrigger className="h-8 w-8 -ml-1" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                DASHBOARD
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                Sales Overview
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'Sales Dashboard', href: '/dashboard' },
          { label: 'Overview' }
        ]}
      />

      {/* Content - Gray background with consistent structure */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        <DashboardClient />
      </div>
    </>
  )
}
