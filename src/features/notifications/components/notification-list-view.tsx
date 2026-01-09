'use client'

import { useMemo, memo } from 'react'
import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  User,
  Briefcase,
  FileText,
  CheckSquare,
  AtSign,
  AlertCircle,
  Check,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { NotificationEmptyState } from './notification-empty-state'
import { NotificationBulkActionsBar } from './notification-bulk-actions-bar'
import type { Notification } from '../types'

interface NotificationListViewProps {
  notifications: Notification[]
  selectedNotifications: string[]
  onSelectionChange: (ids: string[]) => void
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onArchive: () => void
  onDelete: () => void
  loading: boolean
  emptyStateType: 'all' | 'unread' | 'mentions'
}

function getNotificationIcon(type: Notification['type']) {
  const iconMap = {
    lead: User,
    opportunity: Briefcase,
    quote: FileText,
    task: CheckSquare,
    mention: AtSign,
    system: AlertCircle,
  }
  return iconMap[type] || AlertCircle
}

function getNotificationColors(type: Notification['type']) {
  const colorMap = {
    lead: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-600 dark:text-blue-400' },
    opportunity: { bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-600 dark:text-purple-400' },
    quote: { bg: 'bg-green-100 dark:bg-green-950', text: 'text-green-600 dark:text-green-400' },
    task: { bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-600 dark:text-orange-400' },
    mention: { bg: 'bg-pink-100 dark:bg-pink-950', text: 'text-pink-600 dark:text-pink-400' },
    system: { bg: 'bg-muted', text: 'text-muted-foreground' },
  }
  return colorMap[type] || colorMap.system
}

function NotificationListSkeleton() {
  return (
    <div className="divide-y">
      {/* Select all skeleton */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Notification item skeletons */}
      <div className="divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 p-4">
            <div className="flex flex-col items-center gap-2 pt-0.5">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Memoized notification item for performance
const NotificationItem = memo(({
  notification,
  isSelected,
  onSelect,
  onMarkAsRead
}: {
  notification: Notification
  isSelected: boolean
  onSelect: (id: string) => void
  onMarkAsRead: (id: string) => void
}) => {
  const Icon = getNotificationIcon(notification.type)
  const colors = getNotificationColors(notification.type)

  const content = (
    <div
      className={cn(
        'group flex gap-3 p-4 transition-colors',
        notification.isRead
          ? 'bg-background hover:bg-accent/50'
          : 'bg-primary/5 hover:bg-primary/10',
        isSelected && 'bg-primary/10 hover:bg-primary/15'
      )}
    >
      {/* Left: Checkbox + Icon */}
      <div className="flex flex-col items-center gap-2 pt-0.5">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(notification.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select notification: ${notification.title}`}
        />
        <div className={cn('flex-shrink-0 rounded-full p-2', colors.bg)}>
          <Icon className={cn('h-4 w-4', colors.text)} />
        </div>
      </div>

      {/* Center: Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h4
            className={cn(
              'text-sm font-medium leading-tight',
              !notification.isRead && 'font-semibold'
            )}
          >
            {notification.title}
          </h4>

          {/* Time + Priority always visible */}
          <div className="flex items-center gap-2 shrink-0">
            <time className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
            </time>
            {notification.priority === 'high' && !notification.isRead && (
              <div
                className="w-2 h-2 rounded-full bg-destructive"
                aria-label="High priority"
              />
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.description}
        </p>
      </div>

      {/* Right: Action button (visible on mobile, hover on desktop) */}
      {!notification.isRead && (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 h-8 px-2 md:px-3 text-xs md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onMarkAsRead(notification.id)
          }}
        >
          <Check className="h-3 w-3 md:mr-1" />
          <span className="hidden md:inline">Mark read</span>
        </Button>
      )}
    </div>
  )

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} className="block">
        {content}
      </Link>
    )
  }

  return content
})

NotificationItem.displayName = 'NotificationItem'

export function NotificationListView({
  notifications,
  selectedNotifications,
  onSelectionChange,
  onMarkAsRead,
  onMarkAllAsRead,
  onArchive,
  onDelete,
  loading,
  emptyStateType,
}: NotificationListViewProps) {
  const allSelected = useMemo(
    () => notifications.length > 0 && selectedNotifications.length === notifications.length,
    [notifications, selectedNotifications]
  )

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(notifications.map((n) => n.id))
    }
  }

  const handleSelectOne = (id: string) => {
    if (selectedNotifications.includes(id)) {
      onSelectionChange(selectedNotifications.filter((sid) => sid !== id))
    } else {
      onSelectionChange([...selectedNotifications, id])
    }
  }

  if (loading) {
    return <NotificationListSkeleton />
  }

  if (notifications.length === 0) {
    return <NotificationEmptyState type={emptyStateType} />
  }

  return (
    <div className="divide-y">
      {/* Bulk Actions Bar (when items selected) */}
      {selectedNotifications.length > 0 ? (
        <NotificationBulkActionsBar
          selectedCount={selectedNotifications.length}
          onMarkAsRead={onMarkAllAsRead}
          onArchive={onArchive}
          onDelete={onDelete}
          onClearSelection={() => onSelectionChange([])}
        />
      ) : (
        /* Select All Header (when no items selected) */
        notifications.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Select all notifications"
            />
            <span className="text-sm text-muted-foreground">
              {notifications.length} notification{notifications.length === 1 ? '' : 's'}
            </span>
          </div>
        )
      )}

      {/* Notification List */}
      <div className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            isSelected={selectedNotifications.includes(notification.id)}
            onSelect={handleSelectOne}
            onMarkAsRead={onMarkAsRead}
          />
        ))}
      </div>
    </div>
  )
}
