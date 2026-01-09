'use client'

import { useState, useMemo, useCallback } from 'react'
import { NotificationFiltersBar } from '@/features/notifications/components/notification-filters-bar'
import { NotificationListView } from '@/features/notifications/components/notification-list-view'
import { useNotifications } from '@/features/notifications/hooks/use-notifications'
import { useNotificationMutations } from '@/features/notifications/hooks/use-notification-mutations'
import { useNotificationFilters } from '@/features/notifications/hooks/use-notification-filters'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [notificationsToDelete, setNotificationsToDelete] = useState<string[]>([])

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

  const handleDeleteSelected = useCallback(() => {
    setNotificationsToDelete(selectedNotifications)
    setDeleteDialogOpen(true)
  }, [selectedNotifications])

  const confirmDelete = useCallback(async () => {
    await deleteNotifications(notificationsToDelete)
    setSelectedNotifications([])
    setDeleteDialogOpen(false)
    setNotificationsToDelete([])
    refetch()
  }, [notificationsToDelete, deleteNotifications, refetch])

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
        <div className="p-4 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="rounded-full bg-primary/10 p-2 md:p-3">
                <Bell className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">Notifications</h2>
                <p className="text-sm text-muted-foreground">
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

        {/* Tabs + Filters Card */}
        <div className="px-4 pb-4 md:px-6 md:pb-6">
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
              <div className="border-b bg-gray-50">
                <TabsList className="h-auto w-full justify-start bg-transparent p-0 rounded-none">
                  <TabsTrigger
                    value="all"
                    className="relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
                  >
                    Unread
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-2 rounded-full px-2 py-0 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="mentions"
                    className="relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary"
                  >
                    Mentions
                    {unreadMentions > 0 && (
                      <Badge variant="secondary" className="ml-2 rounded-full px-2 py-0 text-xs">
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
            </Tabs>
          </div>
        </div>

        {/* Notifications List Card */}
        <div className="px-4 pb-4 md:px-6 md:pb-6">
          <div className="bg-card rounded-lg border shadow-sm">
            <Tabs value={activeTab}>
              <TabsContent value={activeTab} className="m-0">
                <NotificationListView
                  notifications={displayedNotifications}
                  selectedNotifications={selectedNotifications}
                  onSelectionChange={setSelectedNotifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={async () => {
                    await Promise.all(selectedNotifications.map(markAsRead))
                    setSelectedNotifications([])
                    refetch()
                  }}
                  onArchive={handleArchiveSelected}
                  onDelete={handleDeleteSelected}
                  loading={loading}
                  emptyStateType={activeTab}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {notificationsToDelete.length} notification
              {notificationsToDelete.length === 1 ? '' : 's'}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
