"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Account } from '@/core/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AccountForm } from './account-form'
import { cn } from '@/lib/utils'
import { Building2 } from 'lucide-react'

export type AccountFormTabId = 'general'

interface AccountFormTabsProps {
  account?: Account
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

/**
 * AccountFormTabs
 *
 * Tabbed form view for creating and editing accounts.
 *
 * Features:
 * - Only General tab (no Related tabs for forms)
 * - Tabs navigation rendered in sticky header via portal
 * - Uses AccountForm component
 */
export function AccountFormTabs({
  account,
  onSubmit,
  onCancel,
  isLoading
}: AccountFormTabsProps) {
  const [activeTab, setActiveTab] = useState<AccountFormTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  // Find the tabs container in sticky header on mount
  useEffect(() => {
    const container = document.getElementById('account-tabs-nav-container')
    setTabsContainer(container)
  }, [])

  // Tabs navigation component
  const tabsNavigation = (
    <div className="overflow-x-auto">
      <TabsList className="h-auto p-0 bg-transparent border-0 gap-0 justify-start rounded-none inline-flex w-full md:w-auto min-w-max">
        <TabsTrigger
          value="general"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <Building2 className="w-4 h-4 mr-2" />
          General
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AccountFormTabId)} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* Tab Contents */}
      <TabsContent value="general" className="mt-0">
        <AccountForm
          account={account}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={isLoading}
          hideActions
        />
      </TabsContent>
    </Tabs>
  )
}
