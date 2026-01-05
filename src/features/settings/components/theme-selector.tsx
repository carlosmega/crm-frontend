'use client'

/**
 * Theme Selector Component
 * Allows users to switch between light/dark/system theme
 */

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Monitor, Moon, Sun } from 'lucide-react'
import type { Theme } from '@/core/config/settings-defaults'

interface ThemeSelectorProps {
  value: Theme
  onChange: (theme: Theme) => void
  label?: string
  description?: string
}

const THEME_OPTIONS: Array<{
  value: Theme
  label: string
  icon: React.ReactNode
}> = [
  {
    value: 'light',
    label: 'Light',
    icon: <Sun className="h-4 w-4" />,
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: <Moon className="h-4 w-4" />,
  },
  {
    value: 'system',
    label: 'System',
    icon: <Monitor className="h-4 w-4" />,
  },
]

export function ThemeSelector({
  value,
  onChange,
  label,
  description,
}: ThemeSelectorProps) {
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
          {THEME_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex items-center gap-2">
                {option.icon}
                <span>{option.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
