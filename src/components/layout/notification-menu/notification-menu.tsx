'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/shared/hooks/use-translation'
import type { Notification } from './types'
import { MOCK_NOTIFICATIONS } from './mock-data'
import { NotificationContent } from './notification-content'

export function NotificationMenu() {
  const { t } = useTranslation('notifications')
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'mentions'>('all')
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Computed values
  const unreadCount = useMemo(
    () => notifications.filter(n => !n.isRead).length,
    [notifications]
  )

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.isRead)
      case 'mentions':
        return notifications.filter(n => n.type === 'mention')
      default:
        return notifications
    }
  }, [notifications, activeTab])

  const unreadMentions = useMemo(
    () => notifications.filter(n => n.type === 'mention' && !n.isRead).length,
    [notifications]
  )

  // Handlers (stable references for memoized children)
  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    )
  }, [])

  const handleDismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }, [])

  // Trigger button (shared between Popover and Sheet)
  const triggerButton = (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'relative rounded-full',
        unreadCount > 0 && 'text-foreground'
      )}
      aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
    >
      <Bell className="h-5 w-5" />

      {/* Badge contador */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-background">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      {/* Pulse animation para notificaciones no leidas */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 animate-ping rounded-full bg-blue-600 opacity-75" />
      )}
    </Button>
  )

  // Mobile: Sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative rounded-full',
            unreadCount > 0 && 'text-foreground'
          )}
          onClick={() => setOpen(true)}
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />

          {/* Badge contador */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-background">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}

          {/* Pulse animation para notificaciones no leidas */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 animate-ping rounded-full bg-blue-600 opacity-75" />
          )}
        </Button>

        <SheetContent side="right" className="w-full p-0 sm:max-w-md">
          <SheetHeader className="sr-only">
            <SheetTitle>{t('title')}</SheetTitle>
          </SheetHeader>
          <NotificationContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            unreadCount={unreadCount}
            unreadMentions={unreadMentions}
            filteredNotifications={filteredNotifications}
            handleMarkAsRead={handleMarkAsRead}
            handleDismiss={handleDismiss}
            handleMarkAllAsRead={handleMarkAllAsRead}
            onClose={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: Popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {triggerButton}
      </PopoverTrigger>

      <PopoverContent
        className="w-[420px] p-0"
        align="end"
        sideOffset={8}
      >
        <NotificationContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadCount={unreadCount}
          unreadMentions={unreadMentions}
          filteredNotifications={filteredNotifications}
          handleMarkAsRead={handleMarkAsRead}
          handleDismiss={handleDismiss}
          handleMarkAllAsRead={handleMarkAllAsRead}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}
