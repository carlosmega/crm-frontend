/**
 * Data Table Filtering System
 *
 * Provides type definitions and utility functions for column filtering
 */

/**
 * Filter type determines the UI and logic for filtering
 */
export type FilterType = 'text' | 'select' | 'multiselect' | 'number' | 'date' | 'daterange' | 'boolean'

/**
 * Filter operators for different data types
 */
export type TextOperator = 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'notContains'
export type NumberOperator = 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'between'
export type DateOperator = 'equals' | 'before' | 'after' | 'between'
export type SelectOperator = 'equals' | 'in'
export type BooleanOperator = 'equals'

export type FilterOperator = TextOperator | NumberOperator | DateOperator | SelectOperator | BooleanOperator

/**
 * Filter option for select/multiselect filters
 */
export interface FilterOption {
  label: string
  value: any
  icon?: React.ComponentType<{ className?: string }>
}

/**
 * Column filter configuration
 */
export interface ColumnFilter {
  type: FilterType
  operators?: FilterOperator[]
  options?: FilterOption[] // For select/multiselect
  placeholder?: string
  min?: number // For number filters
  max?: number // For number filters
  defaultOperator?: FilterOperator
}

/**
 * Active filter value
 */
export interface FilterValue {
  operator: FilterOperator
  value: any
  value2?: any // For 'between' operators
}

/**
 * Active filters map (columnId → FilterValue)
 */
export type ActiveFilters = Record<string, FilterValue>

/**
 * Filter function type
 */
export type FilterFn<TData> = (row: TData, filters: ActiveFilters) => boolean

/**
 * Apply text filter
 */
export function applyTextFilter(value: any, filterValue: FilterValue): boolean {
  if (value == null) return false

  const stringValue = String(value).toLowerCase()
  const searchValue = String(filterValue.value).toLowerCase()

  switch (filterValue.operator) {
    case 'contains':
      return stringValue.includes(searchValue)
    case 'notContains':
      return !stringValue.includes(searchValue)
    case 'equals':
      return stringValue === searchValue
    case 'startsWith':
      return stringValue.startsWith(searchValue)
    case 'endsWith':
      return stringValue.endsWith(searchValue)
    default:
      return true
  }
}

/**
 * Apply number filter
 */
export function applyNumberFilter(value: any, filterValue: FilterValue): boolean {
  const numValue = typeof value === 'number' ? value : parseFloat(value)
  const filterNum = parseFloat(filterValue.value)

  if (isNaN(numValue) || isNaN(filterNum)) return false

  switch (filterValue.operator) {
    case 'equals':
      return numValue === filterNum
    case 'notEquals':
      return numValue !== filterNum
    case 'greaterThan':
      return numValue > filterNum
    case 'lessThan':
      return numValue < filterNum
    case 'between':
      const filterNum2 = parseFloat(filterValue.value2)
      if (isNaN(filterNum2)) return false
      return numValue >= filterNum && numValue <= filterNum2
    default:
      return true
  }
}

/**
 * Apply date filter
 */
export function applyDateFilter(value: any, filterValue: FilterValue): boolean {
  if (!value) return false

  const dateValue = value instanceof Date ? value : new Date(value)
  const filterDate = filterValue.value instanceof Date ? filterValue.value : new Date(filterValue.value)

  if (isNaN(dateValue.getTime()) || isNaN(filterDate.getTime())) return false

  // Reset time parts for date-only comparison
  const resetTime = (date: Date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  }

  const dateOnly = resetTime(dateValue)
  const filterDateOnly = resetTime(filterDate)

  switch (filterValue.operator) {
    case 'equals':
      return dateOnly.getTime() === filterDateOnly.getTime()
    case 'before':
      return dateOnly < filterDateOnly
    case 'after':
      return dateOnly > filterDateOnly
    case 'between':
      const filterDate2 = filterValue.value2 instanceof Date ? filterValue.value2 : new Date(filterValue.value2)
      if (isNaN(filterDate2.getTime())) return false
      const filterDateOnly2 = resetTime(filterDate2)
      return dateOnly >= filterDateOnly && dateOnly <= filterDateOnly2
    default:
      return true
  }
}

/**
 * Apply select/multiselect filter
 */
export function applySelectFilter(value: any, filterValue: FilterValue): boolean {
  if (filterValue.operator === 'in') {
    // Multi-select: use Set for O(1) lookup
    if (!Array.isArray(filterValue.value)) return false
    const fv = filterValue as any
    if (!fv._valueSet) {
      fv._valueSet = new Set(filterValue.value)
    }
    return fv._valueSet.has(value)
  }
  // Single select: direct comparison
  return value === filterValue.value
}

/**
 * Apply boolean filter
 */
export function applyBooleanFilter(value: any, filterValue: FilterValue): boolean {
  return Boolean(value) === Boolean(filterValue.value)
}

/**
 * Apply all filters to a row
 */
export function applyFilters<TData>(
  row: TData,
  filters: ActiveFilters,
  columns: Array<{
    id: string
    accessorFn?: (row: TData) => any
    filter?: ColumnFilter
  }>
): boolean {
  // If no filters, show all rows
  if (Object.keys(filters).length === 0) return true

  // Check each active filter
  for (const [columnId, filterValue] of Object.entries(filters)) {
    const column = columns.find((col) => col.id === columnId)
    if (!column || !column.filter) continue

    // Get the value from the row
    const cellValue = column.accessorFn ? column.accessorFn(row) : null

    // Apply filter based on type
    let matches = false
    switch (column.filter.type) {
      case 'text':
        matches = applyTextFilter(cellValue, filterValue)
        break
      case 'number':
        matches = applyNumberFilter(cellValue, filterValue)
        break
      case 'date':
      case 'daterange':
        matches = applyDateFilter(cellValue, filterValue)
        break
      case 'select':
      case 'multiselect':
        matches = applySelectFilter(cellValue, filterValue)
        break
      case 'boolean':
        matches = applyBooleanFilter(cellValue, filterValue)
        break
      default:
        matches = true
    }

    // If any filter doesn't match, exclude the row
    if (!matches) return false
  }

  // All filters passed
  return true
}

/**
 * Get operator label for display
 */
export function getOperatorLabel(operator: FilterOperator): string {
  const labels: Record<FilterOperator, string> = {
    contains: 'contains',
    notContains: 'does not contain',
    equals: 'equals',
    notEquals: 'not equals',
    startsWith: 'starts with',
    endsWith: 'ends with',
    greaterThan: 'greater than',
    lessThan: 'less than',
    between: 'between',
    before: 'before',
    after: 'after',
    in: 'is',
  }
  return labels[operator] || operator
}

/**
 * Get default operator for filter type
 */
export function getDefaultOperator(filterType: FilterType): FilterOperator {
  switch (filterType) {
    case 'text':
      return 'contains'
    case 'number':
      return 'equals'
    case 'date':
    case 'daterange':
      return 'equals'
    case 'select':
      return 'equals'
    case 'multiselect':
      return 'in'
    case 'boolean':
      return 'equals'
    default:
      return 'equals'
  }
}

/**
 * Format filter value for display
 */
export function formatFilterValue(
  value: any,
  filterType: FilterType,
  options?: FilterOption[]
): string {
  if (value == null) return ''

  switch (filterType) {
    case 'select':
    case 'multiselect':
      if (Array.isArray(value)) {
        // Multi-select: find labels for all values
        const labels = value
          .map((v) => options?.find((opt) => opt.value === v)?.label)
          .filter(Boolean)
        return labels.join(', ')
      }
      // Single select: find label
      return options?.find((opt) => opt.value === value)?.label || String(value)

    case 'date':
    case 'daterange':
      if (value instanceof Date) {
        return value.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      }
      return String(value)

    case 'boolean':
      return value ? 'Yes' : 'No'

    case 'number':
      return String(value)

    case 'text':
    default:
      return String(value)
  }
}
