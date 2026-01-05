'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Filter, X, Calendar as CalendarIcon } from 'lucide-react'
import { ActivityTypeCode, getActivityTypeLabel } from '@/core/contracts/enums'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export interface ActivityFilters {
  activityType?: ActivityTypeCode
  dateFrom?: Date
  dateTo?: Date
  owner?: string
}

interface ActivityFiltersBarProps {
  filters: ActivityFilters
  onFiltersChange: (filters: ActivityFilters) => void
  onClearFilters: () => void
}

/**
 * Activity Filters Bar Component
 *
 * Barra de filtros avanzados para activities:
 * - Por tipo de actividad (Email, Phone Call, Task, Meeting, Note)
 * - Por rango de fechas (from - to)
 * - Por owner (assignee)
 * - Clear all filters button
 */
export function ActivityFiltersBar({
  filters,
  onFiltersChange,
  onClearFilters,
}: ActivityFiltersBarProps) {
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters =
    filters.activityType !== undefined ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined ||
    filters.owner !== undefined

  const activeFiltersCount = [
    filters.activityType,
    filters.dateFrom,
    filters.dateTo,
    filters.owner,
  ].filter((f) => f !== undefined).length

  const handleTypeChange = (value: string) => {
    if (value === 'all') {
      const { activityType, ...rest } = filters
      onFiltersChange(rest)
    } else {
      onFiltersChange({ ...filters, activityType: parseInt(value) as ActivityTypeCode })
    }
  }

  const handleDateFromChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, dateFrom: date })
  }

  const handleDateToChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, dateTo: date })
  }

  const handleOwnerChange = (value: string) => {
    if (value === 'all') {
      const { owner, ...rest } = filters
      onFiltersChange(rest)
    } else {
      onFiltersChange({ ...filters, owner: value })
    }
  }

  return (
    <div className="space-y-3">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Activity Type Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Activity Type</Label>
              <Select
                value={filters.activityType?.toString() || 'all'}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={ActivityTypeCode.Email.toString()}>
                    📧 {getActivityTypeLabel(ActivityTypeCode.Email)}
                  </SelectItem>
                  <SelectItem value={ActivityTypeCode.PhoneCall.toString()}>
                    📞 {getActivityTypeLabel(ActivityTypeCode.PhoneCall)}
                  </SelectItem>
                  <SelectItem value={ActivityTypeCode.Task.toString()}>
                    ☑️ {getActivityTypeLabel(ActivityTypeCode.Task)}
                  </SelectItem>
                  <SelectItem value={ActivityTypeCode.Appointment.toString()}>
                    📅 {getActivityTypeLabel(ActivityTypeCode.Appointment)}
                  </SelectItem>
                  <SelectItem value={ActivityTypeCode.Note.toString()}>
                    💬 {getActivityTypeLabel(ActivityTypeCode.Note)}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !filters.dateFrom && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, 'PP') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={handleDateFromChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !filters.dateTo && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, 'PP') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={handleDateToChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Owner Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Owner</Label>
              <Select
                value={filters.owner || 'all'}
                onValueChange={handleOwnerChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All owners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  <SelectItem value="user-1">John Doe (Me)</SelectItem>
                  <SelectItem value="user-2">Jane Smith</SelectItem>
                  <SelectItem value="user-3">Bob Johnson</SelectItem>
                  <SelectItem value="user-4">Alice Williams</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {filters.activityType !== undefined && (
                <Badge variant="secondary" className="gap-1">
                  Type: {getActivityTypeLabel(filters.activityType)}
                  <button
                    onClick={() => {
                      const { activityType, ...rest } = filters
                      onFiltersChange(rest)
                    }}
                    className="ml-1 hover:bg-secondary-foreground/10 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.dateFrom && (
                <Badge variant="secondary" className="gap-1">
                  From: {format(filters.dateFrom, 'PP')}
                  <button
                    onClick={() => {
                      const { dateFrom, ...rest } = filters
                      onFiltersChange(rest)
                    }}
                    className="ml-1 hover:bg-secondary-foreground/10 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.dateTo && (
                <Badge variant="secondary" className="gap-1">
                  To: {format(filters.dateTo, 'PP')}
                  <button
                    onClick={() => {
                      const { dateTo, ...rest } = filters
                      onFiltersChange(rest)
                    }}
                    className="ml-1 hover:bg-secondary-foreground/10 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.owner && (
                <Badge variant="secondary" className="gap-1">
                  Owner: {filters.owner === 'user-1' ? 'Me' : filters.owner}
                  <button
                    onClick={() => {
                      const { owner, ...rest } = filters
                      onFiltersChange(rest)
                    }}
                    className="ml-1 hover:bg-secondary-foreground/10 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
