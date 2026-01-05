"use client"

import * as React from "react"
import { memo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ColumnFilter,
  ActiveFilters,
  applyFilters,
} from "./data-table-filters"
import { DataTableColumnFilter, DataTableColumnHeader } from "./data-table-column-filter"

/**
 * Column definition for DataTable
 * @template TData - The type of data in each row
 */
export interface DataTableColumn<TData> {
  /** Unique identifier for the column */
  id: string
  /** Display header text */
  header: string
  /** Accessor function to get cell value from row data */
  accessorFn?: (row: TData) => any
  /** Custom cell renderer function */
  cell?: (row: TData) => React.ReactNode
  /** Whether this column is sortable */
  sortable?: boolean
  /** Custom sort function (if not provided, uses default comparison) */
  sortFn?: (a: TData, b: TData) => number
  /** Whether this column is filterable */
  filterable?: boolean
  /** Filter configuration */
  filter?: ColumnFilter
  /** Custom CSS classes for the column */
  className?: string
  /** Custom CSS classes for the header */
  headerClassName?: string
  /**
   * Whether this is a numeric column (price, quantity, percentage, etc.)
   * If true, automatically applies text-center and tabular-nums
   * @default false
   */
  numeric?: boolean
}

/**
 * Props for DataTable component
 * @template TData - The type of data in each row
 */
export interface DataTableProps<TData> {
  /** Array of data to display */
  data: TData[]
  /** Column definitions */
  columns: DataTableColumn<TData>[]
  /** Function to get unique key for each row */
  getRowId: (row: TData) => string
  /** Whether to show row selection checkboxes */
  enableRowSelection?: boolean
  /** Array of selected row IDs */
  selectedRows?: string[]
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void
  /** Whether to enable filtering */
  enableFiltering?: boolean
  /** Active filters */
  filters?: ActiveFilters
  /** Callback when filters change */
  onFiltersChange?: (filters: ActiveFilters) => void
  /** Whether data is loading */
  loading?: boolean
  /** Number of skeleton rows to show when loading */
  loadingRows?: number
  /** Custom empty state component */
  emptyState?: React.ReactNode
  /** Custom row onClick handler */
  onRowClick?: (row: TData) => void
  /** Custom row className function */
  getRowClassName?: (row: TData) => string
  /** Initial sort configuration */
  defaultSort?: {
    columnId: string
    direction: "asc" | "desc"
  }
}

type SortConfig = {
  columnId: string
  direction: "asc" | "desc"
} | null

/**
 * Get CSS classes for numeric columns
 * Applies text-center and tabular-nums for consistent numeric alignment
 */
function getNumericColumnClasses(column: DataTableColumn<any>): string {
  if (!column.numeric) return ""
  return "text-center tabular-nums"
}

/**
 * Merge column classes with numeric classes if needed
 */
function mergeColumnClasses(column: DataTableColumn<any>, customClass?: string): string {
  const numericClasses = getNumericColumnClasses(column)
  if (!customClass) return numericClasses
  // If custom class has text-alignment, use it; otherwise add numeric classes
  if (customClass.includes("text-left") || customClass.includes("text-right") || customClass.includes("text-center")) {
    return customClass
  }
  return cn(numericClasses, customClass)
}

/**
 * Memoized table row component
 * Performance: Only re-renders when row data, selection state, or handlers change
 * Prevents unnecessary re-renders of all rows when parent component updates
 */
interface DataTableRowProps<TData> {
  row: TData
  rowId: string
  isSelected: boolean
  columns: DataTableColumn<TData>[]
  enableRowSelection: boolean
  onRowClick?: (row: TData) => void
  getRowClassName?: (row: TData) => string
  onSelectRow: (rowId: string, checked: boolean) => void
}

const DataTableRowMemo = memo(function DataTableRow<TData>({
  row,
  rowId,
  isSelected,
  columns,
  enableRowSelection,
  onRowClick,
  getRowClassName,
  onSelectRow,
}: DataTableRowProps<TData>) {
  return (
    <TableRow
      key={rowId}
      data-state={isSelected ? "selected" : undefined}
      onClick={() => onRowClick?.(row)}
      className={cn(
        onRowClick && "cursor-pointer",
        getRowClassName?.(row)
      )}
    >
      {/* Selection checkbox */}
      {enableRowSelection && (
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectRow(rowId, checked as boolean)}
            aria-label={`Select row ${rowId}`}
          />
        </TableCell>
      )}
      {/* Data cells */}
      {columns.map((column) => (
        <TableCell key={column.id} className={mergeColumnClasses(column, column.className)}>
          {column.cell
            ? column.cell(row)
            : column.accessorFn
            ? String(column.accessorFn(row) ?? "-")
            : "-"}
        </TableCell>
      ))}
    </TableRow>
  )
}) as <TData>(props: DataTableRowProps<TData>) => React.JSX.Element

/**
 * Generic, reusable data table component with sorting, filtering, and selection
 *
 * Features:
 * - Row selection with checkboxes
 * - Column sorting (ascending/descending)
 * - Column filtering (text, number, date, select, multiselect)
 * - Loading states with skeleton loaders
 * - Empty state handling
 * - Hover effects and visual feedback
 * - Fully accessible with keyboard navigation
 * - Type-safe with TypeScript generics
 *
 * @example
 * ```tsx
 * <DataTable
 *   data={leads}
 *   columns={leadColumns}
 *   getRowId={(lead) => lead.leadid}
 *   enableRowSelection
 *   selectedRows={selectedIds}
 *   onSelectionChange={setSelectedIds}
 *   enableFiltering
 *   filters={filters}
 *   onFiltersChange={setFilters}
 * />
 * ```
 */
export function DataTable<TData>({
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
}: DataTableProps<TData>) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig>(defaultSort || null)

  // Memoized filtered and sorted data
  const processedData = React.useMemo(() => {
    // Step 1: Apply filters
    let result = data
    if (enableFiltering && Object.keys(filters).length > 0) {
      result = data.filter((row) => applyFilters(row, filters, columns))
    }

    // Step 2: Apply sorting
    if (!sortConfig) return result

    const column = columns.find((col) => col.id === sortConfig.columnId)
    if (!column) return result

    const sorted = [...result].sort((a, b) => {
      // Use custom sort function if provided
      if (column.sortFn) {
        return sortConfig.direction === "asc"
          ? column.sortFn(a, b)
          : column.sortFn(b, a)
      }

      // Default sorting using accessor function
      const aValue = column.accessorFn ? column.accessorFn(a) : ""
      const bValue = column.accessorFn ? column.accessorFn(b) : ""

      if (aValue === bValue) return 0
      if (aValue == null) return 1
      if (bValue == null) return -1

      // Type-aware comparison
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime()
      }

      // String comparison
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      const comparison = aStr.localeCompare(bStr)
      return sortConfig.direction === "asc" ? comparison : -comparison
    })

    return sorted
  }, [data, sortConfig, columns, enableFiltering, filters])

  // Handle sort toggle
  const handleSort = React.useCallback(
    (columnId: string) => {
      const column = columns.find((col) => col.id === columnId)
      if (!column?.sortable) return

      setSortConfig((current) => {
        // If not currently sorted by this column, sort ascending
        if (!current || current.columnId !== columnId) {
          return { columnId, direction: "asc" }
        }
        // If ascending, switch to descending
        if (current.direction === "asc") {
          return { columnId, direction: "desc" }
        }
        // If descending, remove sort
        return null
      })
    },
    [columns]
  )

  // Handle filter change
  const handleFilterChange = React.useCallback(
    (columnId: string, value: any) => {
      if (!onFiltersChange) return

      if (value === undefined) {
        // Remove filter
        const newFilters = { ...filters }
        delete newFilters[columnId]
        onFiltersChange(newFilters)
      } else {
        // Add/update filter
        onFiltersChange({
          ...filters,
          [columnId]: value,
        })
      }
    },
    [filters, onFiltersChange]
  )

  // Handle select all
  const handleSelectAll = React.useCallback(
    (checked: boolean) => {
      if (!onSelectionChange) return
      onSelectionChange(checked ? processedData.map(getRowId) : [])
    },
    [processedData, getRowId, onSelectionChange]
  )

  // Handle single row selection
  const handleSelectRow = React.useCallback(
    (rowId: string, checked: boolean) => {
      if (!onSelectionChange) return

      const newSelection = checked
        ? [...selectedRows, rowId]
        : selectedRows.filter((id) => id !== rowId)

      onSelectionChange(newSelection)
    },
    [selectedRows, onSelectionChange]
  )

  // Check if all rows are selected
  const allSelected = processedData.length > 0 && selectedRows.length === processedData.length
  const someSelected = selectedRows.length > 0 && !allSelected

  // Render sort icon
  const renderSortIcon = (columnId: string) => {
    if (sortConfig?.columnId !== columnId) {
      return <ChevronsUpDown className="ml-2 size-4 text-muted-foreground/50" />
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-2 size-4" />
    ) : (
      <ArrowDown className="ml-2 size-4" />
    )
  }

  // Loading state
  if (loading) {
    return (
      <div>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50">
              {enableRowSelection && (
                <TableHead className="w-[40px]">
                  <Skeleton className="size-4" />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column.id} className={mergeColumnClasses(column, column.headerClassName)}>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: loadingRows }).map((_, index) => (
              <TableRow key={index} className="border-b border-border/50">
                {enableRowSelection && (
                  <TableCell>
                    <Skeleton className="size-4" />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={column.id} className={column.className}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Empty state
  if (processedData.length === 0) {
    return (
      <div>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50">
              {enableRowSelection && <TableHead className="w-[40px]" />}
              {columns.map((column) => (
                <TableHead key={column.id} className={mergeColumnClasses(column, column.headerClassName)}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
        {emptyState || (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-semibold text-muted-foreground">No data found</p>
            <p className="text-sm text-muted-foreground mt-2">
              No records match your current filters
            </p>
          </div>
        )}
      </div>
    )
  }

  // Main table render
  return (
    <div className="relative">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow className="border-b border-border/50 bg-muted/30">
            {/* Select all checkbox */}
            {enableRowSelection && (
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all rows"
                  className={cn(someSelected && "data-[state=checked]:bg-primary/50")}
                />
              </TableHead>
            )}
            {/* Column headers */}
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={cn(
                  mergeColumnClasses(column, column.headerClassName),
                  column.sortable && "cursor-pointer select-none hover:bg-muted/50 transition-colors"
                )}
                onClick={() => column.sortable && handleSort(column.id)}
              >
                <div className="flex items-center">
                  <DataTableColumnHeader
                    columnHeader={column.header}
                    hasActiveFilter={enableFiltering && !!filters[column.id]}
                  >
                    {column.sortable && renderSortIcon(column.id)}
                    {enableFiltering && column.filterable && column.filter && (
                      <DataTableColumnFilter
                        columnId={column.id}
                        columnHeader={column.header}
                        filter={column.filter}
                        value={filters[column.id]}
                        onFilterChange={handleFilterChange}
                      />
                    )}
                  </DataTableColumnHeader>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {processedData.map((row) => {
            const rowId = getRowId(row)
            const isSelected = selectedRows.includes(rowId)

            return (
              <DataTableRowMemo
                key={rowId}
                row={row}
                rowId={rowId}
                isSelected={isSelected}
                columns={columns}
                enableRowSelection={enableRowSelection}
                onRowClick={onRowClick}
                getRowClassName={getRowClassName}
                onSelectRow={handleSelectRow}
              />
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
