"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Bulk action definition for toolbar
 */
export interface BulkAction {
  /** Unique identifier for the action */
  id: string
  /** Display label */
  label: string
  /** Icon component (from lucide-react) */
  icon?: React.ComponentType<{ className?: string }>
  /** Action handler - receives array of selected row IDs */
  onClick: (selectedIds: string[]) => void | Promise<void>
  /** Button variant */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost"
  /** Whether the action is destructive (shows confirmation) */
  destructive?: boolean
  /** Custom confirmation message */
  confirmMessage?: string
}

/**
 * Props for DataTableToolbar component
 */
export interface DataTableToolbarProps {
  /** Number of selected rows */
  selectedCount: number
  /** Total number of rows */
  totalCount: number
  /** Array of selected row IDs */
  selectedIds: string[]
  /** Callback to clear selection */
  onClearSelection: () => void
  /** Array of bulk actions */
  bulkActions?: BulkAction[]
  /** Additional toolbar content (e.g., filters) */
  children?: React.ReactNode
  /** Custom CSS class */
  className?: string
}

/**
 * Toolbar component for displaying selection count and bulk actions - Improved design
 *
 * Shows a prominent toolbar when rows are selected with:
 * - Selection count badge
 * - Clear selection button
 * - Bulk action buttons with improved styling
 *
 * @example
 * ```tsx
 * <DataTableToolbar
 *   selectedCount={selected.length}
 *   totalCount={data.length}
 *   selectedIds={selected}
 *   onClearSelection={() => setSelected([])}
 *   bulkActions={[
 *     {
 *       id: 'delete',
 *       label: 'Delete',
 *       icon: Trash2,
 *       onClick: handleBulkDelete,
 *       variant: 'destructive',
 *       destructive: true,
 *     }
 *   ]}
 * />
 * ```
 */
export function DataTableToolbar({
  selectedCount,
  totalCount,
  selectedIds,
  onClearSelection,
  bulkActions = [],
  children,
  className,
}: DataTableToolbarProps) {
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null)

  const handleAction = React.useCallback(
    async (action: BulkAction) => {
      // Show confirmation for destructive actions
      if (action.destructive) {
        const message =
          action.confirmMessage ||
          `Are you sure you want to ${action.label.toLowerCase()} ${selectedCount} ${
            selectedCount === 1 ? "item" : "items"
          }?`

        if (!confirm(message)) return
      }

      try {
        setLoadingAction(action.id)
        await action.onClick(selectedIds)
      } catch (error) {
        console.error(`Error executing ${action.label}:`, error)
      } finally {
        setLoadingAction(null)
      }
    },
    [selectedIds, selectedCount]
  )

  // Don't render if no rows selected
  if (selectedCount === 0) {
    return children ? <div className={cn("flex items-center gap-4", className)}>{children}</div> : null
  }

  return (
    <div
      className={cn(
        "bg-primary/5 px-4 py-3 flex items-center justify-between border-b border-border/40 animate-in fade-in-0 slide-in-from-top-1 duration-200",
        className
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
          {selectedCount} of {totalCount} row{selectedCount !== 1 ? 's' : ''} selected
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
      {bulkActions.length > 0 && (
        <div className="flex items-center gap-2">
          {bulkActions.map((action) => {
            const Icon = action.icon
            const isLoading = loadingAction === action.id

            return (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                disabled={isLoading}
                aria-label={action.destructive ? `${action.label} (destructive action)` : action.label}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all shadow-sm",
                  // Destructive actions: subtle red styling (outline with red border/text)
                  action.destructive
                    ? "bg-background border border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/60 dark:border-destructive/30 dark:hover:bg-destructive/20"
                    : "bg-background border border-border hover:bg-accent hover:text-accent-foreground",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  Icon && <Icon className="size-4" />
                )}
                {action.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Additional content */}
      {children}
    </div>
  )
}
