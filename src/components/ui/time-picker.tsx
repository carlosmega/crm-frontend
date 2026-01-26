"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

function TimePicker({
  value = "09:00",
  onChange,
  placeholder = "Select time",
  disabled = false,
  className,
}: TimePickerProps) {
  const [hours, setHours] = React.useState(() => {
    if (value) {
      const [h] = value.split(":")
      return h || "09"
    }
    return "09"
  })

  const [minutes, setMinutes] = React.useState(() => {
    if (value) {
      const [, m] = value.split(":")
      return m || "00"
    }
    return "00"
  })

  const [showHourOptions, setShowHourOptions] = React.useState(false)
  const [showMinuteOptions, setShowMinuteOptions] = React.useState(false)

  // Update internal state when value changes externally
  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(":")
      if (h) setHours(h.padStart(2, "0"))
      if (m) setMinutes(m.padStart(2, "0"))
    }
  }, [value])

  const updateValue = (newHours: string, newMinutes: string) => {
    const formattedHours = newHours.padStart(2, "0")
    const formattedMinutes = newMinutes.padStart(2, "0")
    onChange?.(`${formattedHours}:${formattedMinutes}`)
  }

  const handleHoursChange = (newHours: string) => {
    const cleaned = newHours.replace(/\D/g, "").slice(0, 2)
    const num = parseInt(cleaned)
    if (cleaned === "" || (num >= 0 && num <= 23)) {
      setHours(cleaned)
    }
  }

  const handleHoursBlur = () => {
    const num = parseInt(hours) || 0
    const formatted = Math.min(23, Math.max(0, num)).toString().padStart(2, "0")
    setHours(formatted)
    setShowHourOptions(false)
    updateValue(formatted, minutes)
  }

  const handleMinutesChange = (newMinutes: string) => {
    const cleaned = newMinutes.replace(/\D/g, "").slice(0, 2)
    const num = parseInt(cleaned)
    if (cleaned === "" || (num >= 0 && num <= 59)) {
      setMinutes(cleaned)
    }
  }

  const handleMinutesBlur = () => {
    const num = parseInt(minutes) || 0
    const formatted = Math.min(59, Math.max(0, num)).toString().padStart(2, "0")
    setMinutes(formatted)
    setShowMinuteOptions(false)
    updateValue(hours, formatted)
  }

  const selectHour = (hour: string) => {
    setHours(hour)
    setShowHourOptions(false)
    updateValue(hour, minutes)
  }

  const selectMinute = (minute: string) => {
    setMinutes(minute)
    setShowMinuteOptions(false)
    updateValue(hours, minute)
  }

  // Generate hour options (00-23)
  const hourOptions = React.useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
  }, [])

  // Generate minute options (00-55 in 5-min intervals)
  const minuteOptions = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"))
  }, [])

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />

      {/* Hours input with dropdown */}
      <div className="relative">
        <Input
          type="text"
          inputMode="numeric"
          value={hours}
          onChange={(e) => handleHoursChange(e.target.value)}
          onFocus={() => setShowHourOptions(true)}
          onBlur={handleHoursBlur}
          placeholder="HH"
          className="w-[60px] text-center"
          maxLength={2}
          disabled={disabled}
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
          type="text"
          inputMode="numeric"
          value={minutes}
          onChange={(e) => handleMinutesChange(e.target.value)}
          onFocus={() => setShowMinuteOptions(true)}
          onBlur={handleMinutesBlur}
          placeholder="MM"
          className="w-[60px] text-center"
          maxLength={2}
          disabled={disabled}
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
  )
}

export { TimePicker }
export type { TimePickerProps }
