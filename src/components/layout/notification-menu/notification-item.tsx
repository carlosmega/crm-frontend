'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import type { Notification } from './types'
import { getNotificationIcon, getNotificationIconColor, getNotificationBgColor } from './notification-helpers'

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
}

export const NotificationItem = memo(function NotificationItem({ notification, onMarkAsRead, onDismiss }: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.type)
  const iconColor = getNotificationIconColor(notification.type)
  const bgColor = getNotificationBgColor(notification.type)

  const content = (
    <div
      className={cn(
        'group relative flex gap-3 pl-3 pr-2 py-3 transition-all duration-200 cursor-pointer',
        !notification.isRead
          ? 'bg-purple-50/70 dark:bg-purple-950/30 hover:bg-purple-50 dark:hover:bg-purple-950/50'
          : 'hover:bg-accent/20'
      )}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 rounded-full p-2', bgColor)}>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <p className={cn(
            'text-sm leading-tight',
            !notification.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
          )}>
            {notification.title}
          </p>

          <span className={cn(
            'text-xs whitespace-nowrap flex-shrink-0 mt-0.5',
            !notification.isRead ? 'text-purple-600 font-medium' : 'text-muted-foreground/70'
          )}>
            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
          </span>
        </div>

        <p className={cn(
          'text-sm line-clamp-1 leading-tight',
          !notification.isRead ? 'text-foreground/70' : 'text-muted-foreground/80'
        )}>
          {notification.description}
        </p>
      </div>
    </div>
  )

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} className="block" onClick={() => onMarkAsRead(notification.id)}>
        {content}
      </Link>
    )
  }

  return content
})
