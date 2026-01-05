'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
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
import type { Notification } from '../types'

interface NotificationListViewProps {
  notifications: Notification[]
  selectedNotifications: string[]
  onSelectionChange: (ids: string[]) => void
  onMarkAsRead: (id: string) => void
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
    lead: { bg: 'bg-blue-100', text: 'text-blue-600' },
    opportunity: { bg: 'bg-purple-100', text: 'text-purple-600' },
    quote: { bg: 'bg-green-100', text: 'text-green-600' },
    task: { bg: 'bg-orange-100', text: 'text-orange-600' },
    mention: { bg: 'bg-pink-100', text: 'text-pink-600' },
    system: { bg: 'bg-gray-100', text: 'text-gray-600' },
  }
  return colorMap[type] || colorMap.system
}

export function NotificationListView({
  notifications,
  selectedNotifications,
  onSelectionChange,
  onMarkAsRead,
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
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>
  }

  if (notifications.length === 0) {
    return <NotificationEmptyState type={emptyStateType} />
  }

  return (
    <div className="divide-y">
      {/* Select All Header */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
          <Checkbox
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            aria-label="Select all notifications"
          />
          <span className="text-sm text-muted-foreground">
            {selectedNotifications.length > 0
              ? `${selectedNotifications.length} selected`
              : `${notifications.length} notification${notifications.length === 1 ? '' : 's'}`}
          </span>
        </div>
      )}

      {/* Notification List */}
      <div className="divide-y max-h-[600px] overflow-y-auto">
        {notifications.map((notification) => {
          const Icon = getNotificationIcon(notification.type)
          const colors = getNotificationColors(notification.type)
          const isSelected = selectedNotifications.includes(notification.id)

          const content = (
            <div
              className={cn(
                'group flex items-start gap-3 p-4 transition-colors relative',
                notification.isRead ? 'bg-background hover:bg-accent/50' : 'bg-accent/30 hover:bg-accent/50',
                isSelected && 'bg-purple-50 hover:bg-purple-100'
              )}
            >
              {/* Checkbox */}
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleSelectOne(notification.id)}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select notification: ${notification.title}`}
                className="mt-1"
              />

              {/* Icon */}
              <div className={cn('flex-shrink-0 rounded-full p-2', colors.bg)}>
                <Icon className={cn('h-4 w-4', colors.text)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      'text-sm font-medium leading-tight',
                      !notification.isRead && 'text-foreground font-semibold'
                    )}
                  >
                    {notification.title}
                  </p>

                  {/* Priority Indicator */}
                  {notification.priority === 'high' && !notification.isRead && (
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {notification.description}
                </p>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                  </span>

                  {/* Actions (hover) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onMarkAsRead(notification.id)
                        }}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Unread Indicator (left border) */}
              {!notification.isRead && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-purple-600 rounded-r" />
              )}
            </div>
          )

          if (notification.actionUrl) {
            return (
              <Link key={notification.id} href={notification.actionUrl} className="block">
                {content}
              </Link>
            )
          }

          return <div key={notification.id}>{content}</div>
        })}
      </div>
    </div>
  )
}
