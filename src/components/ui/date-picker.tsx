"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date | string
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Convert string value to Date if needed
  const dateValue = React.useMemo(() => {
    if (!value) return undefined
    if (value instanceof Date) return value
    const parsed = new Date(value)
    return isNaN(parsed.getTime()) ? undefined : parsed
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onChange?.(selectedDate)
    if (selectedDate) {
      setIsOpen(false)
    }
  }

  const formatDisplay = () => {
    if (!dateValue) return null
    return format(dateValue, "PPP", { locale: es })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !dateValue && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplay() || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
export type { DatePickerProps }
