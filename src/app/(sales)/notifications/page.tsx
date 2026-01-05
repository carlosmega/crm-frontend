'use client'

import { useState, useMemo, useCallback } from 'react'
import { NotificationFiltersBar } from '@/features/notifications/components/notification-filters-bar'
import { NotificationListView } from '@/features/notifications/components/notification-list-view'
import { NotificationBulkActionsBar } from '@/features/notifications/components/notification-bulk-actions-bar'
import { useNotifications } from '@/features/notifications/hooks/use-notifications'
import { useNotificationMutations } from '@/features/notifications/hooks/use-notification-mutations'
import { useNotificationFilters } from '@/features/notifications/hooks/use-notification-filters'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  Bell,
  Check,
  MoreVertical,
  Settings,
  Archive,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NotificationsPage() {
  // State
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'mentions'>('all')

  // Hooks
  const { notifications, loading, refetch } = useNotifications()
  const { markAsRead, markAllAsRead, deleteNotifications, archiveNotifications } =
    useNotificationMutations()
  const { filters, setFilters, clearFilters, filteredNotifications } =
    useNotificationFilters(notifications)

  // Computed values
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  )

  const unreadMentions = useMemo(
    () => notifications.filter((n) => n.type === 'mention' && !n.isRead).length,
    [notifications]
  )

  const displayedNotifications = useMemo(() => {
    let filtered = filteredNotifications

    // Apply tab filter
    if (activeTab === 'unread') {
      filtered = filtered.filter((n) => !n.isRead)
    } else if (activeTab === 'mentions') {
      filtered = filtered.filter((n) => n.type === 'mention')
    }

    return filtered
  }, [filteredNotifications, activeTab])

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== undefined && v !== null),
    [filters]
  )

  // Handlers
  const handleMarkAsRead = useCallback(
    async (id: string) => {
      await markAsRead(id)
      refetch()
    },
    [markAsRead, refetch]
  )

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead()
    refetch()
  }, [markAllAsRead, refetch])

  const handleDeleteSelected = useCallback(async () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedNotifications.length} notification(s)? This action cannot be undone.`
      )
    ) {
      await deleteNotifications(selectedNotifications)
      setSelectedNotifications([])
      refetch()
    }
  }, [selectedNotifications, deleteNotifications, refetch])

  const handleArchiveSelected = useCallback(async () => {
    await archiveNotifications(selectedNotifications)
    setSelectedNotifications([])
    refetch()
  }, [selectedNotifications, archiveNotifications, refetch])

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          {/* LEFT: Hamburger + Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <SidebarTrigger className="h-8 w-8 -ml-1" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                NOTIFICATIONS
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                All Notifications
              </h1>
            </div>
          </div>

          {/* RIGHT: Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {unreadCount > 0 && (
                <DropdownMenuItem onClick={handleMarkAllAsRead}>
                  <Check className="mr-2 h-4 w-4" />
                  Mark all as read
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Notification settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex sticky top-0 z-50 h-16 shrink-0 items-center gap-2 bg-background border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Sales</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Notifications</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* Page Header with Actions */}
        <div className="px-4 pt-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-3">
                <Bell className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
                <p className="text-muted-foreground">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                    : "You're all caught up!"}
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Mark all as read
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Notification settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Archive className="mr-2 h-4 w-4" />
                    View archived
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Tabs + Filters */}
        <div className="px-4 pb-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
              <div className="border-b px-4">
                <TabsList className="w-full grid grid-cols-3 h-auto p-0 bg-transparent">
                  <TabsTrigger
                    value="all"
                    className={cn(
                      'relative rounded-none border-0 px-4 py-3 text-sm font-medium transition-colors',
                      'data-[state=active]:bg-transparent data-[state=active]:text-purple-600',
                      'data-[state=inactive]:text-gray-500 hover:text-gray-900',
                      'data-[state=active]:after:absolute data-[state=active]:after:bottom-0',
                      'data-[state=active]:after:left-0 data-[state=active]:after:right-0',
                      'data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600'
                    )}
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className={cn(
                      'relative rounded-none border-0 px-4 py-3 text-sm font-medium transition-colors',
                      'data-[state=active]:bg-transparent data-[state=active]:text-purple-600',
                      'data-[state=inactive]:text-gray-500 hover:text-gray-900',
                      'data-[state=active]:after:absolute data-[state=active]:after:bottom-0',
                      'data-[state=active]:after:left-0 data-[state=active]:after:right-0',
                      'data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600'
                    )}
                  >
                    Unread
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 px-1 text-[10px]">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="mentions"
                    className={cn(
                      'relative rounded-none border-0 px-4 py-3 text-sm font-medium transition-colors',
                      'data-[state=active]:bg-transparent data-[state=active]:text-purple-600',
                      'data-[state=inactive]:text-gray-500 hover:text-gray-900',
                      'data-[state=active]:after:absolute data-[state=active]:after:bottom-0',
                      'data-[state=active]:after:left-0 data-[state=active]:after:right-0',
                      'data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600'
                    )}
                  >
                    Mentions
                    {unreadMentions > 0 && (
                      <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 px-1 text-[10px]">
                        {unreadMentions}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Filters Bar */}
              <NotificationFiltersBar
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />

              {/* Content */}
              <TabsContent value={activeTab} className="m-0">
                <NotificationListView
                  notifications={displayedNotifications}
                  selectedNotifications={selectedNotifications}
                  onSelectionChange={setSelectedNotifications}
                  onMarkAsRead={handleMarkAsRead}
                  loading={loading}
                  emptyStateType={activeTab}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Bulk Actions Bar (sticky at bottom when items selected) */}
        {selectedNotifications.length > 0 && (
          <NotificationBulkActionsBar
            selectedCount={selectedNotifications.length}
            onMarkAsRead={async () => {
              await Promise.all(selectedNotifications.map(markAsRead))
              setSelectedNotifications([])
              refetch()
            }}
            onArchive={handleArchiveSelected}
            onDelete={handleDeleteSelected}
            onClearSelection={() => setSelectedNotifications([])}
          />
        )}
      </div>
    </>
  )
}
