'use client'

import { Button } from '@/components/ui/button'
import { Check, Archive, Trash2, X } from 'lucide-react'

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
    <div className="fixed bottom-0 left-0 right-0 md:left-64 z-50 border-t bg-white shadow-lg">
      <div className="container max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Selection info */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {selectedCount} notification{selectedCount === 1 ? '' : 's'} selected
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onMarkAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark as read
            </Button>
            <Button variant="outline" size="sm" onClick={onArchive}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
