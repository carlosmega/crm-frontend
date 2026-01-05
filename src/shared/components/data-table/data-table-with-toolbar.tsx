"use client"

import * as React from "react"
import { DataTable, DataTableProps } from "./data-table"
import { DataTableToolbar, BulkAction } from "./data-table-toolbar"
import { cn } from "@/lib/utils"

/**
 * Props for DataTableWithToolbar component
 */
export interface DataTableWithToolbarProps<TData> extends DataTableProps<TData> {
  /** Array of bulk actions */
  bulkActions?: BulkAction[]
  /** Custom CSS class for the container */
  containerClassName?: string
}

/**
 * Data table with integrated selection toolbar
 *
 * Combines DataTable and DataTableToolbar in a single card with proper styling.
 * The toolbar appears as a purple banner at the top when rows are selected.
 *
 * @example
 * ```tsx
 * <DataTableWithToolbar
 *   data={accounts}
 *   columns={columns}
 *   getRowId={(account) => account.accountid}
 *   enableRowSelection
 *   selectedRows={selectedIds}
 *   onSelectionChange={setSelectedIds}
 *   bulkActions={[
 *     { id: 'delete', label: 'Delete', icon: Trash2, onClick: handleDelete, variant: 'destructive' }
 *   ]}
 * />
 * ```
 */
export function DataTableWithToolbar<TData>({
  data,
  columns,
  getRowId,
  enableRowSelection = false,
  selectedRows = [],
  onSelectionChange,
  enableFiltering = false,
  filters = {},
  onFiltersChange,
  loading = false,
  loadingRows = 5,
  emptyState,
  onRowClick,
  getRowClassName,
  defaultSort,
  bulkActions = [],
  containerClassName,
}: DataTableWithToolbarProps<TData>) {
  const handleClearSelection = React.useCallback(() => {
    onSelectionChange?.([])
  }, [onSelectionChange])

  return (
    <div className={cn("flex flex-col h-full rounded-lg overflow-hidden bg-card border border-border shadow-sm", containerClassName)}>
      {/* Selection Toolbar - Sticky when active */}
      {selectedRows.length > 0 && (
        <div className="shrink-0">
          <DataTableToolbar
            selectedCount={selectedRows.length}
            totalCount={data.length}
            selectedIds={selectedRows}
            onClearSelection={handleClearSelection}
            bulkActions={bulkActions}
          />
        </div>
      )}

      {/* Data Table - Scrollable content area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <DataTable
          data={data}
          columns={columns}
          getRowId={getRowId}
          enableRowSelection={enableRowSelection}
          selectedRows={selectedRows}
          onSelectionChange={onSelectionChange}
          enableFiltering={enableFiltering}
          filters={filters}
          onFiltersChange={onFiltersChange}
          loading={loading}
          loadingRows={loadingRows}
          emptyState={emptyState}
          onRowClick={onRowClick}
          getRowClassName={getRowClassName}
          defaultSort={defaultSort}
        />
      </div>

      {/* Footer with count - Always visible at bottom */}
      {!loading && data.length > 0 && (
        <div className="shrink-0 bg-muted/20 px-6 py-3 flex items-center justify-center border-t border-border/40">
          <span className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{data.length}</span>{' '}
            {data.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      )}
    </div>
  )
}
