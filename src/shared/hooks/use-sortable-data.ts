import { useState, useMemo, useCallback } from 'react'

export type SortDirection = 'asc' | 'desc'

export type SortConfig = {
  columnId: string
  direction: SortDirection
} | null

export interface SortableColumn<TData> {
  id: string
  accessor: (row: TData) => any
  sortFn?: (a: TData, b: TData) => number
}

/**
 * useSortableData
 *
 * Lightweight hook for client-side sorting.
 * Extracted from the DataTable sorting logic for use in sub-grid tables
 * (quote line items, order line items, invoice lines).
 *
 * Features:
 * - Tri-state toggle: asc → desc → none
 * - Type-aware comparison (number, Date, string)
 * - Custom sort functions per column
 * - Memoized sorted output
 *
 * @example
 * const columns = [
 *   { id: 'quantity', accessor: (row) => row.quantity },
 *   { id: 'price', accessor: (row) => row.priceperunit },
 * ]
 * const { sortedData, sortConfig, handleSort } = useSortableData(data, columns)
 */
export function useSortableData<TData>(
  data: TData[],
  columns: SortableColumn<TData>[],
  defaultSort?: SortConfig
) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(defaultSort || null)

  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    const column = columns.find((col) => col.id === sortConfig.columnId)
    if (!column) return data

    return [...data].sort((a, b) => {
      if (column.sortFn) {
        return sortConfig.direction === 'asc'
          ? column.sortFn(a, b)
          : column.sortFn(b, a)
      }

      const aValue = column.accessor(a)
      const bValue = column.accessor(b)

      if (aValue === bValue) return 0
      if (aValue == null) return 1
      if (bValue == null) return -1

      // Number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Date comparison
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime()
      }

      // String comparison
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      const comparison = aStr.localeCompare(bStr)
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [data, sortConfig, columns])

  const handleSort = useCallback((columnId: string) => {
    setSortConfig((current) => {
      if (!current || current.columnId !== columnId) {
        return { columnId, direction: 'asc' }
      }
      if (current.direction === 'asc') {
        return { columnId, direction: 'desc' }
      }
      return null
    })
  }, [])

  return { sortedData, sortConfig, handleSort }
}
