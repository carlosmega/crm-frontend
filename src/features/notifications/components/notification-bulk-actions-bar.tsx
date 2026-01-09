'use client'

import { Check, Archive, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationBulkActionsBarProps {
  selectedCount: number
  onMarkAsRead: () => void
  onArchive: () => void
  onDelete: () => void
  onClearSelection: () => void
}

export function NotificationBulkActionsBar({
  selectedCount,
  onMarkAsRead,
  onArchive,
  onDelete,
  onClearSelection,
}: NotificationBulkActionsBarProps) {
  return (
    <div
      className={cn(
        "bg-primary/5 px-4 py-3 flex items-center justify-between border-b border-border/40 animate-in fade-in-0 slide-in-from-top-1 duration-200"
      )}
    >
      {/* Selection info */}
      <div className="flex items-center gap-3">
        {/* Count badge */}
        <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
          {selectedCount}
        </div>

        {/* Selection text */}
        <span className="text-sm font-medium text-foreground">
          {selectedCount} notification{selectedCount !== 1 ? 's' : ''} selected
        </span>

        {/* Separator */}
        <span className="h-4 w-px bg-purple-200 dark:bg-purple-800 mx-1" />

        {/* Clear selection button */}
        <button
          onClick={onClearSelection}
          className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          Clear selection
        </button>
      </div>

      {/* Bulk actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMarkAsRead}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm",
            "bg-background border border-border hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Check className="size-4" />
          <span className="hidden sm:inline">Mark as read</span>
        </button>
        <button
          onClick={onArchive}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm",
            "bg-background border border-border hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Archive className="size-4" />
          <span className="hidden sm:inline">Archive</span>
        </button>
        <button
          onClick={onDelete}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm",
            "bg-background border border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/60 dark:border-destructive/30 dark:hover:bg-destructive/20"
          )}
        >
          <Trash2 className="size-4" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    </div>
  )
}
