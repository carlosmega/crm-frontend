"use client"

import * as React from "react"
import { X, Filter as FilterIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ActiveFilters,
  FilterValue,
  ColumnFilter,
  getOperatorLabel,
  formatFilterValue,
} from "./data-table-filters"

interface DataTableFilterSummaryProps {
  filters: ActiveFilters
  columns: Array<{
    id: string
    header: string
    filter?: ColumnFilter
  }>
  onRemoveFilter: (columnId: string) => void
  onClearAllFilters: () => void
  className?: string
}

/**
 * Filter summary component - Improved design
 *
 * Displays active filters as chips with the ability to remove individual filters
 * or clear all filters at once.
 *
 * Shows: "Column: operator value" (e.g., "Category: is Preferred Customer")
 */
export function DataTableFilterSummary({
  filters,
  columns,
  onRemoveFilter,
  onClearAllFilters,
  className,
}: DataTableFilterSummaryProps) {
  const activeFiltersCount = Object.keys(filters).length

  // Don't render if no active filters
  if (activeFiltersCount === 0) return null

  // Format filter value for display
  const getFilterDisplay = (columnId: string, filterValue: FilterValue): { label: string; value: string } => {
    const column = columns.find((col) => col.id === columnId)
    if (!column) return { label: '', value: '' }

    const operatorLabel = getOperatorLabel(filterValue.operator)
    let valueDisplay = ''

    if (filterValue.operator === 'between') {
      // Special formatting for 'between' operator
      const value1 = formatFilterValue(filterValue.value, column.filter?.type || 'text', column.filter?.options)
      const value2 = formatFilterValue(filterValue.value2, column.filter?.type || 'text', column.filter?.options)
      valueDisplay = `${operatorLabel} ${value1} and ${value2}`
    } else {
      valueDisplay = `${operatorLabel} ${formatFilterValue(filterValue.value, column.filter?.type || 'text', column.filter?.options)}`
    }

    return {
      label: column.header,
      value: valueDisplay
    }
  }

  return (
    <div className={cn("mt-4 pt-4 border-t border-border/30 flex flex-wrap items-center gap-2", className)}>
      {/* Filter count */}
      <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
        <FilterIcon className="size-3.5" />
        <span>
          {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
        </span>
      </div>

      {/* Separator */}
      <span className="h-4 w-px bg-border/40 mx-0.5" />

      {/* Filter badges */}
      {Object.entries(filters).map(([columnId, filterValue]) => {
        const { label, value } = getFilterDisplay(columnId, filterValue)
        if (!label) return null

        return (
          <div
            key={columnId}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-background/80 text-sm shadow-sm"
          >
            <span className="text-xs text-muted-foreground">{label}:</span>
            <span className="font-medium text-foreground text-xs">{value}</span>
            <button
              onClick={() => onRemoveFilter(columnId)}
              className="ml-1 hover:text-destructive transition-colors flex items-center"
              aria-label={`Remove ${label} filter`}
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}

      {/* Clear all button */}
      <button
        onClick={onClearAllFilters}
        className="text-xs text-muted-foreground hover:text-primary underline decoration-dotted transition-colors ml-auto"
      >
        Clear all
      </button>
    </div>
  )
}

/**
 * Compact filter count badge (alternative to full summary)
 */
export function DataTableFilterCount({
  count,
  onClick,
}: {
  count: number
  onClick?: () => void
}) {
  if (count === 0) return null

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2 h-8"
    >
      <FilterIcon className="size-4" />
      <span className="text-xs">
        {count} {count === 1 ? 'filter' : 'filters'}
      </span>
    </Button>
  )
}
