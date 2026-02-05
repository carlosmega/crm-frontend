'use client'

import type { SortConfig } from '@/shared/hooks/use-sortable-data'
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SortableColumnHeaderProps {
  columnId: string
  label: string
  sortConfig: SortConfig
  onSort: (columnId: string) => void
  className?: string
}

/**
 * SortableColumnHeader
 *
 * Lightweight sortable header for sub-grid tables.
 * Visually consistent with the DataTable sort headers.
 *
 * Shows:
 * - ChevronsUpDown (unsorted)
 * - ArrowUp (ascending)
 * - ArrowDown (descending)
 */
export function SortableColumnHeader({
  columnId,
  label,
  sortConfig,
  onSort,
  className,
}: SortableColumnHeaderProps) {
  const isActive = sortConfig?.columnId === columnId

  return (
    <button
      type="button"
      onClick={() => onSort(columnId)}
      className={cn(
        'inline-flex items-center gap-1 hover:text-foreground transition-colors -ml-2 px-2 py-1 rounded-md hover:bg-muted/50',
        isActive ? 'text-foreground' : 'text-muted-foreground',
        className
      )}
    >
      {label}
      {isActive && sortConfig.direction === 'asc' ? (
        <ArrowUp className="size-3.5" />
      ) : isActive && sortConfig.direction === 'desc' ? (
        <ArrowDown className="size-3.5" />
      ) : (
        <ChevronsUpDown className="size-3.5 text-muted-foreground/50" />
      )}
    </button>
  )
}
