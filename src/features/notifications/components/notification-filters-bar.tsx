'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import type { NotificationFilters } from '../types'

interface NotificationFiltersBarProps {
  filters: NotificationFilters
  onFiltersChange: (filters: NotificationFilters) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export function NotificationFiltersBar({
  filters,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters,
}: NotificationFiltersBarProps) {
  const handleReadStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      isRead: value === 'all' ? undefined : value === 'read',
    })
  }

  return (
    <div className="p-4 space-y-3 border-b bg-muted/30">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search notifications..."
          value={filters.searchQuery || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              searchQuery: e.target.value || undefined,
            })
          }
          className="pl-9 h-9"
          aria-label="Search notifications"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Read Status */}
        <Select
          value={filters.isRead === undefined ? 'all' : filters.isRead ? 'read' : 'unread'}
          onValueChange={handleReadStatusChange}
        >
          <SelectTrigger className="w-[130px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="unread">Unread only</SelectItem>
            <SelectItem value="read">Read only</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={onClearFilters}
          >
            <X className="mr-1.5 h-3 w-3" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
