'use client'

import { Button } from '@/components/ui/button'
import { Trash2, Percent, X } from 'lucide-react'

interface BulkActionsToolbarProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkDelete: () => void
  onBulkDiscount: () => void
}

/**
 * Bulk Actions Toolbar
 *
 * Aparece cuando hay Quote Lines seleccionadas
 * Permite acciones en batch: Delete, Apply Discount
 */
export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkDiscount,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="sticky top-0 z-10 border-b bg-muted/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDiscount}
              className="gap-2"
            >
              <Percent className="h-4 w-4" />
              Apply Discount
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDelete}
              className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Clear Selection
        </Button>
      </div>
    </div>
  )
}
