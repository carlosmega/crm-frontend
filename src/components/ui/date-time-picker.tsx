"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DateTimePickerProps {
  value?: Date | string
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showTime?: boolean
}

function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date and time",
  disabled = false,
  className,
  showTime = true,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Convert string value to Date if needed
  const dateValue = React.useMemo(() => {
    if (!value) return undefined
    if (value instanceof Date) return value
    const parsed = new Date(value)
    return isNaN(parsed.getTime()) ? undefined : parsed
  }, [value])

  const [hours, setHours] = React.useState(() => {
    if (dateValue) {
      return dateValue.getHours().toString().padStart(2, "0")
    }
    return "09"
  })

  const [minutes, setMinutes] = React.useState(() => {
    if (dateValue) {
      return dateValue.getMinutes().toString().padStart(2, "0")
    }
    return "00"
  })

  // Update time when value changes externally
  React.useEffect(() => {
    if (dateValue) {
      setHours(dateValue.getHours().toString().padStart(2, "0"))
      setMinutes(dateValue.getMinutes().toString().padStart(2, "0"))
    }
  }, [dateValue])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange?.(undefined)
      return
    }

    if (showTime) {
      selectedDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0)
    }

    onChange?.(selectedDate)
  }

  const [showHourOptions, setShowHourOptions] = React.useState(false)
  const [showMinuteOptions, setShowMinuteOptions] = React.useState(false)
  const hourInputRef = React.useRef<HTMLInputElement>(null)
  const minuteInputRef = React.useRef<HTMLInputElement>(null)

  const handleHoursChange = (newHours: string) => {
    // Only allow valid hour input (0-23)
    const cleaned = newHours.replace(/\D/g, "").slice(0, 2)
    const num = parseInt(cleaned)
    if (cleaned === "" || (num >= 0 && num <= 23)) {
      setHours(cleaned)
    }
  }

  const handleHoursBlur = () => {
    // Format on blur
    const num = parseInt(hours) || 0
    const formatted = Math.min(23, Math.max(0, num)).toString().padStart(2, "0")
    setHours(formatted)
    setShowHourOptions(false)

    if (dateValue) {
      const newDate = new Date(dateValue)
      newDate.setHours(parseInt(formatted), parseInt(minutes) || 0, 0, 0)
      onChange?.(newDate)
    }
  }

  const handleMinutesChange = (newMinutes: string) => {
    // Only allow valid minute input (0-59)
    const cleaned = newMinutes.replace(/\D/g, "").slice(0, 2)
    const num = parseInt(cleaned)
    if (cleaned === "" || (num >= 0 && num <= 59)) {
      setMinutes(cleaned)
    }
  }

  const handleMinutesBlur = () => {
    // Format on blur
    const num = parseInt(minutes) || 0
    const formatted = Math.min(59, Math.max(0, num)).toString().padStart(2, "0")
    setMinutes(formatted)
    setShowMinuteOptions(false)

    if (dateValue) {
      const newDate = new Date(dateValue)
      newDate.setHours(parseInt(hours) || 0, parseInt(formatted), 0, 0)
      onChange?.(newDate)
    }
  }

  const selectHour = (hour: string) => {
    setHours(hour)
    setShowHourOptions(false)

    if (dateValue) {
      const newDate = new Date(dateValue)
      newDate.setHours(parseInt(hour), parseInt(minutes) || 0, 0, 0)
      onChange?.(newDate)
    }
  }

  const selectMinute = (minute: string) => {
    setMinutes(minute)
    setShowMinuteOptions(false)

    if (dateValue) {
      const newDate = new Date(dateValue)
      newDate.setHours(parseInt(hours) || 0, parseInt(minute), 0, 0)
      onChange?.(newDate)
    }
  }

  // Generate hour options (00-23)
  const hourOptions = React.useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
  }, [])

  // Generate minute options (00-55 in 5-min intervals)
  const minuteOptions = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"))
  }, [])

  const formatDisplay = () => {
    if (!dateValue) return null
    if (showTime) {
      return format(dateValue, "PPP 'a las' HH:mm", { locale: es })
    }
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
        {showTime && (
          <div className="border-t p-3">
            <Label className="text-xs text-muted-foreground mb-2 block">
              Time
            </Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />

              {/* Hours input with dropdown */}
              <div className="relative">
                <Input
                  ref={hourInputRef}
                  type="text"
                  inputMode="numeric"
                  value={hours}
                  onChange={(e) => handleHoursChange(e.target.value)}
                  onFocus={() => setShowHourOptions(true)}
                  onBlur={handleHoursBlur}
                  placeholder="HH"
                  className="w-[60px] text-center"
                  maxLength={2}
                />
                {showHourOptions && (
                  <div className="absolute top-full left-0 mt-1 z-50 w-[60px] rounded-md border bg-popover shadow-md">
                    <ScrollArea className="h-[200px]">
                      <div className="p-1">
                        {hourOptions.map((hour) => (
                          <button
                            key={hour}
                            type="button"
                            className={cn(
                              "w-full px-2 py-1.5 text-sm text-center rounded-sm hover:bg-accent hover:text-accent-foreground",
                              hours === hour && "bg-accent text-accent-foreground"
                            )}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              selectHour(hour)
                            }}
                          >
                            {hour}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              <span className="text-muted-foreground font-medium">:</span>

              {/* Minutes input with dropdown */}
              <div className="relative">
                <Input
                  ref={minuteInputRef}
                  type="text"
                  inputMode="numeric"
                  value={minutes}
                  onChange={(e) => handleMinutesChange(e.target.value)}
                  onFocus={() => setShowMinuteOptions(true)}
                  onBlur={handleMinutesBlur}
                  placeholder="MM"
                  className="w-[60px] text-center"
                  maxLength={2}
                />
                {showMinuteOptions && (
                  <div className="absolute top-full left-0 mt-1 z-50 w-[60px] rounded-md border bg-popover shadow-md">
                    <ScrollArea className="h-[200px]">
                      <div className="p-1">
                        {minuteOptions.map((minute) => (
                          <button
                            key={minute}
                            type="button"
                            className={cn(
                              "w-full px-2 py-1.5 text-sm text-center rounded-sm hover:bg-accent hover:text-accent-foreground",
                              minutes === minute && "bg-accent text-accent-foreground"
                            )}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              selectMinute(minute)
                            }}
                          >
                            {minute}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export { DateTimePicker }
export type { DateTimePickerProps }
