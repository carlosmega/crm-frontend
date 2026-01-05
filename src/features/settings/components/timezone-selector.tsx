'use client'

/**
 * Timezone Selector Component
 * Allows users to select their timezone
 */

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COMMON_TIMEZONES } from '@/core/config/settings-defaults'

interface TimezoneSelectorProps {
  value: string
  onChange: (timezone: string) => void
  label?: string
  description?: string
}

export function TimezoneSelector({
  value,
  onChange,
  label,
  description,
}: TimezoneSelectorProps) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COMMON_TIMEZONES.map((tz) => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
