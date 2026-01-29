"use client"

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
import { UserMenu } from '@/components/layout/user-menu'
import { NotificationMenu } from '@/components/layout/notification-menu'

export interface BreadcrumbItemType {
  label: string
  href?: string
}

interface DetailPageHeaderProps {
  breadcrumbs: BreadcrumbItemType[]
}

/**
 * DetailPageHeader - Desktop header for detail/edit/new pages
 *
 * Includes:
 * - Sidebar trigger
 * - Breadcrumb navigation
 * - Notification menu
 * - User menu
 *
 * Use this component for ALL detail, edit, and new pages to ensure
 * consistent header with user authentication info.
 */
export function DetailPageHeader({ breadcrumbs }: DetailPageHeaderProps) {
  return (
    <header className="hidden md:flex sticky top-0 z-50 h-16 shrink-0 items-center justify-between gap-2 bg-background border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      {/* Left side: Trigger + Breadcrumb */}
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right side: Notifications + User Menu */}
      <div className="flex items-center gap-2 px-4">
        <NotificationMenu />
        <UserMenu variant="full" />
      </div>
    </header>
  )
}
