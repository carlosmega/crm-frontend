"use client"

import { useState, useMemo, useCallback } from 'react'
import { useActivities } from '@/features/activities/hooks/use-activities'
import { ActivityList } from '@/features/activities/components'
import { CreateActivityDialog } from '@/features/activities/components/create-activity-dialog'
import {
  BulkAction,
  DataTableFilterSummary,
  type ActiveFilters,
} from '@/shared/components/data-table'
import { PageHeader } from '@/components/layout/page-header'
import { NotificationMenu } from '@/components/layout/notification-menu'
import { UserMenu } from '@/components/layout/user-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Search, Download, Loader2, WifiOff, MoreVertical } from 'lucide-react'
import { ErrorState } from '@/shared/components/error-state'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'

export default function ActivitiesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [columnFilters, setColumnFilters] = useState<ActiveFilters>({})

  const { data: activities, isLoading: loading, error } = useActivities()

  // ✅ Performance: Debounce search query
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

  // ✅ Optimized: Filter activities by search query (client-side filtering)
  const filteredActivities = useMemo(() => {
    if (!activities) return []
    if (!debouncedSearchQuery) return activities

    const lowerQuery = debouncedSearchQuery.toLowerCase()
    return activities.filter((activity) =>
      activity.subject.toLowerCase().includes(lowerQuery) ||
      activity.description?.toLowerCase().includes(lowerQuery)
    )
  }, [activities, debouncedSearchQuery])

  // ✅ Optimized: Column definitions
  const activityColumns = useMemo(() => [
    { id: 'type', header: 'Type', filter: { type: 'multiselect' as const } },
    { id: 'subject', header: 'Subject', filter: { type: 'text' as const } },
    { id: 'regarding', header: 'Regarding', filter: { type: 'text' as const } },
    { id: 'scheduled', header: 'Scheduled', filter: { type: 'daterange' as const } },
    { id: 'status', header: 'Status', filter: { type: 'multiselect' as const } },
    { id: 'priority', header: 'Priority', filter: { type: 'multiselect' as const } },
  ], [])

  // ✅ Optimized with useCallback
  const handleRemoveFilter = useCallback((columnId: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[columnId]
      return newFilters
    })
  }, [])

  // ✅ Optimized with useCallback
  const handleClearAllFilters = useCallback(() => {
    setColumnFilters({})
  }, [])

  // ✅ Optimized with useCallback
  const handleBulkExport = useCallback(
    async (selectedIds: string[]) => {
      const selectedActivitiesData = (activities || []).filter((activity) =>
        selectedIds.includes(activity.activityid)
      )

      const headers = ['Type', 'Subject', 'Regarding', 'Scheduled', 'Status', 'Priority']
      const csvContent = [
        headers.join(','),
        ...selectedActivitiesData.map((activity) =>
          [
            activity.activitytypecode,
            `"${activity.subject}"`,
            `"${activity.regardingobjectidtype || ''}"`,
            activity.scheduledstart || '',
            activity.statecode,
            activity.prioritycode ?? 1,
          ].join(',')
        ),
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `activities-export-${new Date().toISOString().split('T')[0]}.csv`
      )
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    [activities]
  )

  // ✅ Optimized: Define bulk actions
  const bulkActions = useMemo<BulkAction[]>(
    () => [
      {
        id: 'export',
        label: 'Export',
        icon: Download,
        onClick: handleBulkExport,
        variant: 'outline',
      },
    ],
    [handleBulkExport]
  )

  // ✅ Manejo de estados de carga y error
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <>
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 bg-white border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <SidebarTrigger className="h-8 w-8 -ml-1" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                  ACTIVITIES
                </p>
                <h1 className="text-sm font-semibold text-gray-900 truncate">
                  Error
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <NotificationMenu />
              <UserMenu variant="icon" />
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <PageHeader
            breadcrumbs={[
              { label: 'Sales', href: '/dashboard' },
              { label: 'Activities' }
            ]}
          />
        </div>

        {/* Error state content */}
        <div className="flex flex-1 items-center justify-center p-8">
          <ErrorState
            title="Failed to Load Activities"
            message={error instanceof Error ? error.message : 'Unable to connect to the server. Please check your network connection and try again.'}
            icon={WifiOff}
            onRetry={() => window.location.reload()}
            retryLabel="Retry"
            variant="full"
          />
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          {/* LEFT: Hamburger Menu + Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <SidebarTrigger className="h-8 w-8 -ml-1" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                ACTIVITIES
              </p>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                All Activities
              </h1>
            </div>
          </div>

          {/* RIGHT: Notifications + User + Actions Menu */}
          <div className="flex items-center gap-1 shrink-0">
            <NotificationMenu />
            <UserMenu variant="icon" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setCreateDialogOpen(true)} className="flex items-center cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                New Activity
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <PageHeader
          breadcrumbs={[
            { label: 'Sales', href: '/dashboard' },
            { label: 'Activities' }
          ]}
        />
      </div>

      {/* Content - Scroll en toda la página */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-100">
        {/* Page Header */}
        <div className="px-4 pt-4 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Activities</h2>
              <p className="text-muted-foreground">
                Manage your emails, calls, tasks, and appointments
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="hidden md:flex bg-purple-600 hover:bg-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              New Activity
            </Button>
          </div>
        </div>

        {/* Filters and Search Section */}
        <div className="px-4 pb-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search activities by subject or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filter Summary inside search card */}
            {Object.keys(columnFilters).length > 0 && (
              <DataTableFilterSummary
                filters={columnFilters}
                columns={activityColumns}
                onRemoveFilter={handleRemoveFilter}
                onClearAllFilters={handleClearAllFilters}
              />
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="px-4 pb-4">
          <ActivityList
            activities={filteredActivities}
            selectedActivities={selectedActivities}
            onSelectionChange={setSelectedActivities}
            filters={columnFilters}
            onFiltersChange={setColumnFilters}
            loading={false}
            bulkActions={bulkActions}
          />
        </div>
      </div>

      {/* Create Activity Dialog */}
      <CreateActivityDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  )
}
