"use client"

import { PageHeader } from '@/components/layout/page-header'
import { NotificationMenu } from '@/components/layout/notification-menu'
import { UserMenu } from '@/components/layout/user-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UnlinkedEmailsList } from '@/features/activities/components'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function UnlinkedEmailsPage() {
  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <SidebarTrigger className="h-8 w-8 -ml-1" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                ACTIVITIES
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                Unlinked Emails
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <NotificationMenu />
            <UserMenu variant="icon" />
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <PageHeader
          breadcrumbs={[
            { label: 'Sales', href: '/dashboard' },
            { label: 'Activities', href: '/activities' },
            { label: 'Unlinked Emails' },
          ]}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100 dark:bg-gray-900">
        <div className="px-4 pt-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Unlinked Emails</h2>
              <p className="text-muted-foreground">
                Emails not yet associated with any CRM record
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/activities">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Activities
              </Link>
            </Button>
          </div>
        </div>

        <div className="px-4 pb-4">
          <UnlinkedEmailsList />
        </div>
      </div>
    </>
  )
}
