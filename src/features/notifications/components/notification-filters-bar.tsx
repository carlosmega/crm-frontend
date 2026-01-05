'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
    <div className="p-4 space-y-3 border-b">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search notifications..."
          value={filters.searchQuery || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              searchQuery: e.target.value || undefined,
            })
          }
          className="pl-9"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Read Status */}
        <Select
          value={filters.isRead === undefined ? 'all' : filters.isRead ? 'read' : 'unread'}
          onValueChange={handleReadStatusChange}
        >
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-8" onClick={onClearFilters}>
            <X className="mr-1 h-3 w-3" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
