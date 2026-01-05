'use client'

/**
 * Settings Client Component
 * Tabbed interface for user preferences and system configuration
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserPreferencesSection } from '@/features/settings/components/user-preferences-section'
import { SystemConfigSection } from '@/features/settings/components/system-config-section'
import { SecuritySettingsSection } from '@/features/settings/components/security-settings-section'
import { useTranslation } from '@/shared/hooks/use-translation'
import { Settings, Shield } from 'lucide-react'
import { useIsAdmin } from '@/shared/hooks/use-permissions'

export function SettingsClient() {
  const { t } = useTranslation('settings')
  const isAdmin = useIsAdmin()

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        </div>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList>
          <TabsTrigger value="preferences">
            {t('tabs.preferences')}
          </TabsTrigger>
          <TabsTrigger value="system">
            {t('tabs.system')}
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="security">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          <UserPreferencesSection />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SystemConfigSection />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="security" className="space-y-6">
            <SecuritySettingsSection />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
