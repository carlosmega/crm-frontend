"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Props for DataTablePagination component
 */
export interface DataTablePaginationProps {
  /** Current page number (1-indexed) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Number of items per page */
  pageSize: number
  /** Total number of items */
  totalItems: number
  /** Callback when page changes */
  onPageChange: (page: number) => void
  /** Callback when page size changes */
  onPageSizeChange: (pageSize: number) => void
  /** Available page size options */
  pageSizeOptions?: number[]
  /** Whether pagination controls are disabled */
  disabled?: boolean
  /** Custom CSS class */
  className?: string
  /** Show page size selector */
  showPageSize?: boolean
  /** Show total items count */
  showTotal?: boolean
}

/**
 * Pagination component for DataTable
 *
 * Features:
 * - First/Previous/Next/Last page navigation
 * - Current page indicator with range
 * - Page size selector
 * - Total items count
 * - Keyboard navigation support
 * - Disabled state handling
 *
 * @example
 * ```tsx
 * <DataTablePagination
 *   currentPage={page}
 *   totalPages={Math.ceil(total / pageSize)}
 *   pageSize={pageSize}
 *   totalItems={total}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 * />
 * ```
 */
export function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 40, 50],
  disabled = false,
  className,
  showPageSize = true,
  showTotal = true,
}: DataTablePaginationProps) {
  // Calculate visible range
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const canGoPrevious = currentPage > 1 && !disabled
  const canGoNext = currentPage < totalPages && !disabled

  // Navigation handlers
  const goToFirstPage = () => canGoPrevious && onPageChange(1)
  const goToPreviousPage = () => canGoPrevious && onPageChange(currentPage - 1)
  const goToNextPage = () => canGoNext && onPageChange(currentPage + 1)
  const goToLastPage = () => canGoNext && onPageChange(totalPages)

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-4 px-2 py-4 sm:flex-row",
        className
      )}
    >
      {/* Left side: Page size selector and total count */}
      <div className="flex items-center gap-6 text-sm">
        {/* Page size selector */}
        {showPageSize && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground whitespace-nowrap">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                onPageSizeChange(Number(value))
                // Reset to first page when changing page size
                onPageChange(1)
              }}
              disabled={disabled}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Total items count */}
        {showTotal && totalItems > 0 && (
          <div className="text-muted-foreground whitespace-nowrap">
            Showing <span className="font-medium text-foreground">{startItem}</span> to{" "}
            <span className="font-medium text-foreground">{endItem}</span> of{" "}
            <span className="font-medium text-foreground">{totalItems}</span>{" "}
            {totalItems === 1 ? "result" : "results"}
          </div>
        )}
      </div>

      {/* Right side: Page navigation */}
      <div className="flex items-center gap-2">
        {/* Page indicator */}
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
          <span className="font-medium text-foreground">{totalPages}</span>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={goToFirstPage}
            disabled={!canGoPrevious}
            aria-label="Go to first page"
            title="First page"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={goToPreviousPage}
            disabled={!canGoPrevious}
            aria-label="Go to previous page"
            title="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={goToNextPage}
            disabled={!canGoNext}
            aria-label="Go to next page"
            title="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={goToLastPage}
            disabled={!canGoNext}
            aria-label="Go to last page"
            title="Last page"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
