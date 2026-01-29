"use client"

import { useMemo } from 'react'
import Link from 'next/link'
import type { Activity } from '@/core/contracts/entities'
import { ActivityStateCode, ActivityTypeCode } from '@/core/contracts/enums'
import { getActivityTypeIcon, getActivityTypeLabel } from '@/core/contracts/enums/activity-type'
import { getActivityStateLabel } from '@/core/contracts/enums/activity-state'
import {
  DataTableWithToolbar,
  DataTableColumn,
  BulkAction,
  type ActiveFilters,
} from '@/shared/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import * as Icons from 'lucide-react'
import { EmptyState } from '@/shared/components/empty-state'

interface ActivityListProps {
  activities: Activity[]
  selectedActivities?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  filters?: ActiveFilters
  onFiltersChange?: (filters: ActiveFilters) => void
  loading?: boolean
  bulkActions?: BulkAction[]
}

/**
 * Activity list table component using DataTable
 *
 * Displays activities with:
 * - Row selection for bulk actions
 * - Column sorting (type, subject, scheduled, status, priority)
 * - Column filtering (text, multiselect, daterange)
 * - Rich cell rendering with badges and links
 * - Quick action buttons
 */
export function ActivityList({
  activities,
  selectedActivities = [],
  onSelectionChange,
  filters,
  onFiltersChange,
  loading = false,
  bulkActions = []
}: ActivityListProps) {
  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // ✅ PERFORMANCE: Memoize columns to prevent recreation on every render
  const columns: DataTableColumn<Activity>[] = useMemo(() => [
    {
      id: 'type',
      header: 'Type',
      accessorFn: (activity) => activity.activitytypecode,
      sortable: true,
      filterable: true,
      filter: {
        type: 'multiselect',
        options: [
          { label: 'Email', value: ActivityTypeCode.Email, icon: Icons.Mail },
          { label: 'Phone Call', value: ActivityTypeCode.PhoneCall, icon: Icons.Phone },
          { label: 'Task', value: ActivityTypeCode.Task, icon: Icons.CheckSquare },
          { label: 'Appointment', value: ActivityTypeCode.Appointment, icon: Icons.Calendar },
          { label: 'Meeting', value: ActivityTypeCode.Meeting, icon: Icons.Users },
        ],
      },
      cell: (activity) => {
        const iconName = getActivityTypeIcon(activity.activitytypecode)
        const Icon = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>
        return (
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            <span className="text-sm">
              {getActivityTypeLabel(activity.activitytypecode)}
            </span>
          </div>
        )
      },
    },
    {
      id: 'subject',
      header: 'Subject',
      accessorFn: (activity) => activity.subject,
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        operators: ['contains', 'equals', 'startsWith', 'endsWith'],
        placeholder: 'Search subject...',
      },
      cell: (activity) => (
        <div className="flex flex-col">
          <Link
            href={`/activities/${activity.activityid}`}
            className="font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
            prefetch={true}
          >
            {activity.subject}
          </Link>
          {activity.description && (
            <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {activity.description}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'regarding',
      header: 'Regarding',
      accessorFn: (activity) => activity.regardingobjectidtype || 'None',
      sortable: true,
      filterable: true,
      filter: {
        type: 'text',
        operators: ['contains', 'equals'],
        placeholder: 'Search regarding...',
      },
      cell: (activity) => {
        if (!activity.regardingobjectid) {
          return <span className="text-sm text-muted-foreground">-</span>
        }
        return (
          <Link
            href={`/${activity.regardingobjectidtype}s/${activity.regardingobjectid}`}
            className="text-sm text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {activity.regardingobjectidtype}
          </Link>
        )
      },
    },
    {
      id: 'scheduled',
      header: 'Scheduled',
      accessorFn: (activity) => {
        const date = activity.actualstart || activity.scheduledstart || activity.createdon
        return date ? new Date(date) : null
      },
      sortable: true,
      filterable: true,
      filter: {
        type: 'daterange',
        operators: ['equals', 'before', 'after', 'between'],
      },
      cell: (activity) => {
        const isOverdue = activity.statecode === ActivityStateCode.Open &&
          activity.scheduledend &&
          new Date(activity.scheduledend) < new Date()

        return (
          <div className="flex flex-col">
            <span className="text-sm">
              {formatDate(activity.scheduledstart)}
            </span>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs mt-1">
                Overdue
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (activity) => activity.statecode,
      sortable: true,
      filterable: true,
      filter: {
        type: 'multiselect',
        options: [
          { label: 'Open', value: ActivityStateCode.Open },
          { label: 'Completed', value: ActivityStateCode.Completed },
          { label: 'Canceled', value: ActivityStateCode.Canceled },
          { label: 'Scheduled', value: ActivityStateCode.Scheduled },
        ],
      },
      cell: (activity) => (
        <Badge
          variant={
            activity.statecode === ActivityStateCode.Completed
              ? 'default'
              : activity.statecode === ActivityStateCode.Canceled
              ? 'secondary'
              : 'outline'
          }
        >
          {getActivityStateLabel(activity.statecode)}
        </Badge>
      ),
    },
    {
      id: 'priority',
      header: 'Priority',
      accessorFn: (activity) => activity.prioritycode ?? 1,
      sortable: true,
      filterable: true,
      filter: {
        type: 'multiselect',
        options: [
          { label: 'Low', value: 0, icon: Icons.ArrowDown },
          { label: 'Normal', value: 1, icon: Icons.Minus },
          { label: 'High', value: 2, icon: Icons.ArrowUp },
        ],
      },
      cell: (activity) => (
        <Badge
          variant={
            activity.prioritycode === 2
              ? 'destructive'
              : activity.prioritycode === 1
              ? 'secondary'
              : 'outline'
          }
        >
          {activity.prioritycode === 2 ? 'High' : activity.prioritycode === 1 ? 'Normal' : 'Low'}
        </Badge>
      ),
    },
    {
      id: 'createdon',
      header: 'Created',
      accessorFn: (activity) => activity.createdon ? new Date(activity.createdon) : null,
      sortable: true,
      filterable: true,
      filter: {
        type: 'daterange',
        operators: ['equals', 'before', 'after', 'between'],
      },
      cell: (activity) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(activity.createdon)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'text-right',
      headerClassName: 'text-right',
      cell: (activity) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button asChild variant="ghost" size="icon-sm" title="View details">
            <Link href={`/activities/${activity.activityid}`} prefetch={true}>
              <Icons.Eye className="size-4" />
            </Link>
          </Button>
          {(activity.statecode === ActivityStateCode.Open || activity.statecode === ActivityStateCode.Scheduled) && (
            <Button asChild variant="ghost" size="icon-sm" title="Edit activity">
              <Link href={`/activities/${activity.activityid}/edit`} prefetch={true}>
                <Icons.Edit className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      ),
    },
  ], []) // Empty deps - columns are stable

  // Empty state
  const emptyState = (
    <EmptyState
      icon={Icons.CalendarCheck}
      title="No activities found"
      description="No activities match your current filters. Try adjusting your search criteria or create a new activity to get started."
      action={{ href: '/activities/new', label: 'Create Activity' }}
    />
  )

  return (
    <DataTableWithToolbar
      data={activities}
      columns={columns}
      getRowId={(activity) => activity.activityid}
      enableRowSelection={!!onSelectionChange}
      selectedRows={selectedActivities}
      onSelectionChange={onSelectionChange}
      enableFiltering={!!onFiltersChange}
      filters={filters}
      onFiltersChange={onFiltersChange}
      loading={loading}
      loadingRows={8}
      emptyState={emptyState}
      defaultSort={{
        columnId: 'createdon',
        direction: 'desc',
      }}
      bulkActions={bulkActions}
      onRowClick={(activity) => {
        // Navigate to detail page on row click (optional)
      }}
    />
  )
}
