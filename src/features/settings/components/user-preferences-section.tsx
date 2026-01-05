'use client'

/**
 * User Preferences Section
 * Theme, Language, Notifications, Display preferences
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useSettings } from '@/core/providers/settings-provider'
import { useTranslation } from '@/shared/hooks/use-translation'
import { LanguageSelector } from './language-selector'
import { ThemeSelector } from './theme-selector'
import type { Locale, Theme } from '@/core/config/settings-defaults'

export function UserPreferencesSection() {
  const { settings, updateSettings, isLoading } = useSettings()
  const { t } = useTranslation('settings')

  // Show skeleton while loading to prevent hydration mismatch
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-20 bg-muted animate-pulse rounded" />
            <div className="h-20 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-16 bg-muted animate-pulse rounded" />
            <div className="h-16 bg-muted animate-pulse rounded" />
            <div className="h-16 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Theme & Language */}
      <Card>
        <CardHeader>
          <CardTitle>{t('preferences.title')}</CardTitle>
          <CardDescription>{t('preferences.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme */}
          <ThemeSelector
            value={settings.theme}
            onChange={(theme: Theme) => updateSettings({ theme })}
            label={t('preferences.theme.label')}
            description={t('preferences.theme.description')}
          />

          {/* Language */}
          <LanguageSelector
            value={settings.locale}
            onChange={(locale: Locale) => updateSettings({ locale })}
            label={t('preferences.language.label')}
            description={t('preferences.language.description')}
          />
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>{t('preferences.notifications.title')}</CardTitle>
          <CardDescription>{t('preferences.notifications.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Desktop Notifications */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="desktop-notifications">
                {t('preferences.notifications.desktop.label')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('preferences.notifications.desktop.description')}
              </p>
            </div>
            <Switch
              id="desktop-notifications"
              checked={settings.notifications.desktop}
              onCheckedChange={(checked) =>
                updateSettings({
                  notifications: { ...settings.notifications, desktop: checked },
                })
              }
            />
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="email-notifications">
                {t('preferences.notifications.email.label')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('preferences.notifications.email.description')}
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.notifications.email}
              onCheckedChange={(checked) =>
                updateSettings({
                  notifications: { ...settings.notifications, email: checked },
                })
              }
            />
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="sound-notifications">
                {t('preferences.notifications.sound.label')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('preferences.notifications.sound.description')}
              </p>
            </div>
            <Switch
              id="sound-notifications"
              checked={settings.notifications.sound}
              onCheckedChange={(checked) =>
                updateSettings({
                  notifications: { ...settings.notifications, sound: checked },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>{t('preferences.display.title')}</CardTitle>
          <CardDescription>{t('preferences.display.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sidebar Collapsed */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="sidebar-collapsed">
                {t('preferences.display.sidebarCollapsed.label')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('preferences.display.sidebarCollapsed.description')}
              </p>
            </div>
            <Switch
              id="sidebar-collapsed"
              checked={settings.sidebarCollapsed}
              onCheckedChange={(checked) =>
                updateSettings({ sidebarCollapsed: checked })
              }
            />
          </div>

          {/* Compact Mode */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="compact-mode">
                {t('preferences.display.compactMode.label')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('preferences.display.compactMode.description')}
              </p>
            </div>
            <Switch
              id="compact-mode"
              checked={settings.compactMode}
              onCheckedChange={(checked) =>
                updateSettings({ compactMode: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
