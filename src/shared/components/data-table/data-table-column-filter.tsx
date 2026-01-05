"use client"

import * as React from "react"
import { Filter, X, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  ColumnFilter,
  FilterValue,
  FilterOperator,
  getDefaultOperator,
  getOperatorLabel,
  TextOperator,
  NumberOperator,
  DateOperator,
} from "./data-table-filters"

interface DataTableColumnFilterProps {
  columnId: string
  columnHeader: string
  filter: ColumnFilter
  value: FilterValue | undefined
  onFilterChange: (columnId: string, value: FilterValue | undefined) => void
}

/**
 * Column filter popover component
 *
 * Provides filtering UI for a specific column based on its filter type.
 * Supports text, number, date, select, multiselect, and boolean filters.
 */
export function DataTableColumnFilter({
  columnId,
  columnHeader,
  filter,
  value,
  onFilterChange,
}: DataTableColumnFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [operator, setOperator] = React.useState<FilterOperator>(
    value?.operator || filter.defaultOperator || getDefaultOperator(filter.type)
  )
  const [filterValue, setFilterValue] = React.useState<any>(value?.value ?? '')
  const [filterValue2, setFilterValue2] = React.useState<any>(value?.value2 ?? '')

  // Sync with external value changes
  React.useEffect(() => {
    if (value) {
      setOperator(value.operator)
      setFilterValue(value.value ?? '')
      setFilterValue2(value.value2 ?? '')
    } else {
      // Reset when filter is cleared externally
      setOperator(filter.defaultOperator || getDefaultOperator(filter.type))
      setFilterValue('')
      setFilterValue2('')
    }
  }, [value, filter])

  // Apply filter
  const handleApply = () => {
    // Validate filter value
    if (
      filterValue === '' ||
      filterValue === null ||
      filterValue === undefined ||
      (Array.isArray(filterValue) && filterValue.length === 0)
    ) {
      onFilterChange(columnId, undefined)
      setIsOpen(false)
      return
    }

    // For 'between' operators, ensure both values are provided
    if (operator === 'between' && (filterValue2 === '' || filterValue2 === null)) {
      return
    }

    onFilterChange(columnId, {
      operator,
      value: filterValue,
      value2: operator === 'between' ? filterValue2 : undefined,
    })
    setIsOpen(false)
  }

  // Clear filter
  const handleClear = () => {
    setOperator(filter.defaultOperator || getDefaultOperator(filter.type))
    setFilterValue('')
    setFilterValue2('')
    onFilterChange(columnId, undefined)
    setIsOpen(false)
  }

  // Get available operators for this filter type
  const getOperators = (): FilterOperator[] => {
    if (filter.operators) return filter.operators

    // Default operators by type
    switch (filter.type) {
      case 'text':
        return ['contains', 'equals', 'startsWith', 'endsWith', 'notContains']
      case 'number':
        return ['equals', 'notEquals', 'greaterThan', 'lessThan', 'between']
      case 'date':
      case 'daterange':
        return ['equals', 'before', 'after', 'between']
      case 'select':
        return ['equals']
      case 'multiselect':
        return ['in']
      case 'boolean':
        return ['equals']
      default:
        return ['equals']
    }
  }

  const operators = getOperators()

  // Render filter input based on type
  const renderFilterInput = () => {
    switch (filter.type) {
      case 'text':
        return (
          <Input
            placeholder={filter.placeholder || 'Enter value...'}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApply()
              }
            }}
            autoFocus
          />
        )

      case 'number':
        return (
          <div className="space-y-2">
            <Input
              type="number"
              placeholder={filter.placeholder || 'Enter value...'}
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && operator !== 'between') {
                  handleApply()
                }
              }}
              min={filter.min}
              max={filter.max}
              autoFocus
            />
            {operator === 'between' && (
              <>
                <span className="text-xs text-muted-foreground">and</span>
                <Input
                  type="number"
                  placeholder="Enter second value..."
                  value={filterValue2}
                  onChange={(e) => setFilterValue2(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleApply()
                    }
                  }}
                  min={filter.min}
                  max={filter.max}
                />
              </>
            )}
          </div>
        )

      case 'date':
      case 'daterange':
        return (
          <div className="space-y-2">
            <Calendar
              mode="single"
              selected={filterValue ? new Date(filterValue) : undefined}
              onSelect={(date) => setFilterValue(date)}
              initialFocus
            />
            {operator === 'between' && (
              <>
                <Separator />
                <Label className="text-xs text-muted-foreground">To date</Label>
                <Calendar
                  mode="single"
                  selected={filterValue2 ? new Date(filterValue2) : undefined}
                  onSelect={(date) => setFilterValue2(date)}
                />
              </>
            )}
          </div>
        )

      case 'select':
        return (
          <Select value={String(filterValue)} onValueChange={setFilterValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select value..." />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  <div className="flex items-center gap-2">
                    {option.icon && <option.icon className="size-4" />}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiselect':
        const selectedValues = Array.isArray(filterValue) ? filterValue : []
        return (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {filter.options?.map((option) => {
              const isSelected = selectedValues.includes(option.value)
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${columnId}-${option.value}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilterValue([...selectedValues, option.value])
                      } else {
                        setFilterValue(selectedValues.filter((v: any) => v !== option.value))
                      }
                    }}
                  />
                  <Label
                    htmlFor={`${columnId}-${option.value}`}
                    className="text-sm font-normal cursor-pointer flex items-center gap-2"
                  >
                    {option.icon && <option.icon className="size-4" />}
                    {option.label}
                  </Label>
                </div>
              )
            })}
          </div>
        )

      case 'boolean':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${columnId}-yes`}
                checked={filterValue === true}
                onCheckedChange={(checked) => setFilterValue(checked ? true : undefined)}
              />
              <Label htmlFor={`${columnId}-yes`} className="text-sm font-normal cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${columnId}-no`}
                checked={filterValue === false}
                onCheckedChange={(checked) => setFilterValue(checked ? false : undefined)}
              />
              <Label htmlFor={`${columnId}-no`} className="text-sm font-normal cursor-pointer">
                No
              </Label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "ml-2 size-4 p-0 opacity-50 hover:opacity-100",
            value && "opacity-100 text-primary"
          )}
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(true)
          }}
        >
          <Filter className="size-3.5" />
          <span className="sr-only">Filter {columnHeader}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Filter {columnHeader}</h4>
            <p className="text-xs text-muted-foreground">
              Set conditions to filter this column
            </p>
          </div>

          <Separator />

          {/* Operator selector (if multiple operators available) */}
          {operators.length > 1 && (
            <div className="space-y-2">
              <Label className="text-xs">Condition</Label>
              <Select value={operator} onValueChange={(v) => setOperator(v as FilterOperator)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((op) => (
                    <SelectItem key={op} value={op}>
                      {getOperatorLabel(op)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filter input */}
          <div className="space-y-2">
            <Label className="text-xs">Value</Label>
            {renderFilterInput()}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleApply} className="flex-1">
              <Check className="mr-2 size-3.5" />
              Apply
            </Button>
            <Button size="sm" variant="outline" onClick={handleClear}>
              <X className="mr-2 size-3.5" />
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Column header with filter indicator
 */
export function DataTableColumnHeader({
  columnHeader,
  hasActiveFilter,
  children,
}: {
  columnHeader: string
  hasActiveFilter: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center">
      <span>{columnHeader}</span>
      {hasActiveFilter && (
        <Badge variant="default" className="ml-2 size-1.5 rounded-full p-0" />
      )}
      {children}
    </div>
  )
}
