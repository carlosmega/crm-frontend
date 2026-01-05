'use client'

/**
 * System Configuration Section
 * Regional formats: Date, Time, Currency, Timezone, Number format
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSettings } from '@/core/providers/settings-provider'
import { useTranslation } from '@/shared/hooks/use-translation'
import { TimezoneSelector } from './timezone-selector'
import type { Currency, DateFormatStyle, TimeFormat } from '@/core/config/settings-defaults'

export function SystemConfigSection() {
  const { settings, updateSettings } = useSettings()
  const { t } = useTranslation('settings')

  return (
    <div className="space-y-6">
      {/* Regional Formats */}
      <Card>
        <CardHeader>
          <CardTitle>{t('system.regional.title')}</CardTitle>
          <CardDescription>{t('system.regional.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Format */}
          <div className="space-y-2">
            <Label>{t('system.regional.dateFormat.label')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('system.regional.dateFormat.description')}
            </p>
            <Select
              value={settings.dateFormat}
              onValueChange={(value: DateFormatStyle) =>
                updateSettings({ dateFormat: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">
                  {t('system.regional.dateFormat.short')}
                </SelectItem>
                <SelectItem value="medium">
                  {t('system.regional.dateFormat.medium')}
                </SelectItem>
                <SelectItem value="long">
                  {t('system.regional.dateFormat.long')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Format */}
          <div className="space-y-2">
            <Label>{t('system.regional.timeFormat.label')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('system.regional.timeFormat.description')}
            </p>
            <Select
              value={settings.timeFormat}
              onValueChange={(value: TimeFormat) =>
                updateSettings({ timeFormat: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">
                  {t('system.regional.timeFormat.12h')}
                </SelectItem>
                <SelectItem value="24h">
                  {t('system.regional.timeFormat.24h')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timezone */}
          <TimezoneSelector
            value={settings.timezone}
            onChange={(timezone: string) => updateSettings({ timezone })}
            label={t('system.regional.timezone.label')}
            description={t('system.regional.timezone.description')}
          />

          {/* Currency */}
          <div className="space-y-2">
            <Label>{t('system.regional.currency.label')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('system.regional.currency.description')}
            </p>
            <Select
              value={settings.currency}
              onValueChange={(value: Currency) => updateSettings({ currency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">
                  {t('system.regional.currency.EUR')}
                </SelectItem>
                <SelectItem value="USD">
                  {t('system.regional.currency.USD')}
                </SelectItem>
                <SelectItem value="GBP">
                  {t('system.regional.currency.GBP')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number Format */}
          <div className="space-y-2">
            <Label>{t('system.regional.numberFormat.label')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('system.regional.numberFormat.description')}
            </p>
            <Select
              value={settings.numberFormat}
              onValueChange={(value: 'es-ES' | 'en-US') =>
                updateSettings({ numberFormat: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es-ES">
                  {t('system.regional.numberFormat.es-ES')}
                </SelectItem>
                <SelectItem value="en-US">
                  {t('system.regional.numberFormat.en-US')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
