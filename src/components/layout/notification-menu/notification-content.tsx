'use client'

import { Bell, Check, AtSign } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { useTranslation } from '@/shared/hooks/use-translation'
import type { Notification } from './types'
import { NotificationItem } from './notification-item'

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
// Notification Content Component
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

export function NotificationContent({
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
