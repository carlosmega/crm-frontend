'use client'

import { useState, useMemo, useEffect, useCallback, memo } from 'react'
import { Bell, Check, X, User, Briefcase, FileText, CheckSquare, AtSign, AlertCircle } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { useTranslation } from '@/shared/hooks/use-translation'

// ============================================================================
// Types
// ============================================================================

export type NotificationType = 'lead' | 'opportunity' | 'quote' | 'task' | 'mention' | 'system'
export type NotificationPriority = 'low' | 'medium' | 'high'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  timestamp: Date
  isRead: boolean
  priority: NotificationPriority

  // Optional context
  relatedEntityId?: string
  relatedEntityType?: 'lead' | 'opportunity' | 'quote' | 'order'
  relatedEntityName?: string
  actionUrl?: string
  actor?: {
    name: string
    avatarUrl?: string
  }
}

// ============================================================================
// Mock Data (replace with real API call)
// ============================================================================

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'lead',
    title: 'New lead assigned',
    description: 'Acme Corp - Enterprise Software inquiry',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    isRead: false,
    priority: 'high',
    relatedEntityId: 'lead-123',
    relatedEntityType: 'lead',
    relatedEntityName: 'Acme Corp',
    actionUrl: '/leads/lead-123',
    actor: {
      name: 'John Smith',
      avatarUrl: undefined,
    },
  },
  {
    id: '2',
    type: 'opportunity',
    title: 'Opportunity stage changed',
    description: 'Enterprise Deal moved to Propose (75%)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    priority: 'medium',
    relatedEntityId: 'opp-456',
    relatedEntityType: 'opportunity',
    relatedEntityName: 'Enterprise Deal',
    actionUrl: '/opportunities/opp-456',
    actor: {
      name: 'Sarah Johnson',
    },
  },
  {
    id: '3',
    type: 'quote',
    title: 'Quote approved',
    description: 'Q-2024-001 approved by Finance Team',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    isRead: true,
    priority: 'high',
    relatedEntityId: 'quote-789',
    relatedEntityType: 'quote',
    relatedEntityName: 'Q-2024-001',
    actionUrl: '/quotes/quote-789',
  },
  {
    id: '4',
    type: 'task',
    title: 'Task due today',
    description: 'Follow up with John Doe regarding proposal',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true,
    priority: 'medium',
    actionUrl: '/activities/task-321',
  },
  {
    id: '5',
    type: 'mention',
    title: 'You were mentioned',
    description: '@you mentioned in Opportunity: Cloud Migration Project',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    isRead: true,
    priority: 'low',
    relatedEntityId: 'opp-999',
    relatedEntityType: 'opportunity',
    actionUrl: '/opportunities/opp-999',
    actor: {
      name: 'Mike Davis',
    },
  },
]

// ============================================================================
// Helper Functions
// ============================================================================

function getNotificationIcon(type: NotificationType) {
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

function getNotificationIconColor(type: NotificationType): string {
  const colorMap = {
    lead: 'text-blue-600',
    opportunity: 'text-purple-600',
    quote: 'text-green-600',
    task: 'text-orange-600',
    mention: 'text-pink-600',
    system: 'text-gray-600',
  }

  return colorMap[type] || 'text-gray-600'
}

function getNotificationBgColor(type: NotificationType): string {
  const bgMap = {
    lead: 'bg-blue-100',
    opportunity: 'bg-purple-100',
    quote: 'bg-green-100',
    task: 'bg-orange-100',
    mention: 'bg-pink-100',
    system: 'bg-gray-100',
  }

  return bgMap[type] || 'bg-gray-100'
}

// ============================================================================
// Notification Item Component
// ============================================================================

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
}

const NotificationItem = memo(function NotificationItem({ notification, onMarkAsRead, onDismiss }: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.type)
  const iconColor = getNotificationIconColor(notification.type)
  const bgColor = getNotificationBgColor(notification.type)

  const content = (
    <div
      className={cn(
        'group relative flex gap-3 pl-3 pr-2 py-3 transition-all duration-200 cursor-pointer',
        !notification.isRead
          ? 'bg-purple-50/70 hover:bg-purple-50'
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

// ============================================================================
// Empty State Component
// ============================================================================

interface EmptyStateProps {
  type: 'all' | 'unread' | 'mentions'
}

function EmptyState({ type }: EmptyStateProps) {
  const { t } = useTranslation('notifications')
  const config = {
    all: {
      icon: Bell,
      title: t('emptyState.allTitle'),
      description: t('emptyState.allDescription'),
    },
    unread: {
      icon: Check,
      title: t('emptyState.unreadTitle'),
      description: t('emptyState.unreadDescription'),
    },
    mentions: {
      icon: AtSign,
      title: t('emptyState.mentionsTitle'),
      description: t('emptyState.mentionsDescription'),
    },
  }

  const { icon: Icon, title, description } = config[type]

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

// ============================================================================
// Shared Content Component
// ============================================================================

interface NotificationContentProps {
  activeTab: 'all' | 'unread' | 'mentions'
  setActiveTab: (tab: 'all' | 'unread' | 'mentions') => void
  unreadCount: number
  unreadMentions: number
  filteredNotifications: Notification[]
  handleMarkAsRead: (id: string) => void
  handleDismiss: (id: string) => void
  handleMarkAllAsRead: () => void
  onClose: () => void
}

function NotificationContent({
  activeTab,
  setActiveTab,
  unreadCount,
  unreadMentions,
  filteredNotifications,
  handleMarkAsRead,
  handleDismiss,
  handleMarkAllAsRead,
  onClose,
}: NotificationContentProps) {
  const { t } = useTranslation('notifications')

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-base font-semibold">{t('title')}</h2>
        {unreadCount > 0 && (
          <button
            className="text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
            onClick={handleMarkAllAsRead}
          >
            {t('buttons.markAllAsRead')}
          </button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <div className="border-b px-4">
          <TabsList className="w-full grid grid-cols-3 h-auto p-0 bg-transparent">
            <TabsTrigger
              value="all"
              className="relative rounded-none border-0 px-0 py-2 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
            >
              {t('tabs.all')}
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="relative rounded-none border-0 px-0 py-2 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
            >
              {t('tabs.unread')}
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 px-1 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="mentions"
              className="relative rounded-none border-0 px-0 py-2 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
            >
              {t('tabs.mentions')}
              {unreadMentions > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 px-1 text-[10px]">
                  {unreadMentions}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <ScrollArea className="h-[400px] md:h-[500px]">
          <TabsContent value="all" className="mt-0 px-3">
            {filteredNotifications.length === 0 ? (
              <EmptyState type="all" />
            ) : (
              <div className="divide-y divide-border/40">
                {filteredNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-0 px-3">
            {filteredNotifications.length === 0 ? (
              <EmptyState type="unread" />
            ) : (
              <div className="divide-y divide-border/40">
                {filteredNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mentions" className="mt-0 px-3">
            {filteredNotifications.length === 0 ? (
              <EmptyState type="mentions" />
            ) : (
              <div className="divide-y divide-border/40">
                {filteredNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Footer */}
      <Separator />
      <div className="p-3">
        <Link
          href="/notifications"
          className="block text-center text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
          onClick={onClose}
        >
          {t('buttons.viewAll')}
        </Link>
      </div>
    </>
  )
}

// ============================================================================
// Main Notification Menu Component
// ============================================================================

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

      {/* Pulse animation para notificaciones no leídas */}
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

          {/* Pulse animation para notificaciones no leídas */}
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
