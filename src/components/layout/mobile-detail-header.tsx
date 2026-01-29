"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserMenu } from '@/components/layout/user-menu'
import { NotificationMenu } from '@/components/layout/notification-menu'
import { ArrowLeft } from 'lucide-react'

interface MobileDetailHeaderProps {
  /** URL to navigate back to (e.g., "/leads") */
  backHref: string
  /** Entity type label (e.g., "LEADS", "CONTACTS") - displayed in uppercase */
  entityType: string
  /** Title to display (e.g., entity name) */
  title: string
  /** Optional custom actions (typically a DropdownMenu) */
  actions?: React.ReactNode
}

/**
 * MobileDetailHeader - Mobile header for detail/edit/new pages
 *
 * Includes:
 * - Back button
 * - Entity type label
 * - Title (truncated if too long)
 * - Notification menu
 * - User menu
 * - Sidebar trigger
 * - Optional custom actions (dropdown menu)
 *
 * Use this component for ALL detail, edit, and new pages on mobile
 * to ensure consistent header with user authentication info.
 */
export function MobileDetailHeader({
  backHref,
  entityType,
  title,
  actions,
}: MobileDetailHeaderProps) {
  return (
    <header className="md:hidden sticky top-0 z-50 bg-white border-b">
      <div className="flex items-center justify-between px-4 py-3">
        {/* LEFT: Back Button + Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            asChild
          >
            <Link href={backHref}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
              {entityType}
            </p>
            <h1 className="text-sm font-semibold text-gray-900 truncate">
              {title}
            </h1>
          </div>
        </div>

        {/* RIGHT: Notifications + User + Sidebar + Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <NotificationMenu />
          <UserMenu variant="icon" />
          <SidebarTrigger className="h-8 w-8" />

          {actions && (
            <>
              <div className="h-6 w-px bg-gray-300 mx-1" />
              {actions}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
