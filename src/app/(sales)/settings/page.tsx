/**
 * Settings Page
 * Main settings page with tabs for User Preferences and System Configuration
 */

'use client'

import { SidebarInset } from '@/components/ui/sidebar'
import { SettingsClient } from './settings-client'

export default function SettingsPage() {
  return (
    <SidebarInset className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <SettingsClient />
      </div>
    </SidebarInset>
  )
}
