'use client'

/**
 * Language Selector Component
 * Allows users to switch between supported locales
 */

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SUPPORTED_LOCALES, getLocaleDisplayName, getLocaleFlag } from '@/core/config/i18n-config'
import type { Locale } from '@/core/config/settings-defaults'

interface LanguageSelectorProps {
  value: Locale
  onChange: (locale: Locale) => void
  label?: string
  description?: string
}

export function LanguageSelector({
  value,
  onChange,
  label,
  description,
}: LanguageSelectorProps) {
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
          {SUPPORTED_LOCALES.map((locale) => (
            <SelectItem key={locale} value={locale}>
              <span className="flex items-center gap-2">
                <span>{getLocaleFlag(locale)}</span>
                <span>{getLocaleDisplayName(locale)}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
