"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Account } from '@/core/contracts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AccountForm, accountFormSchema, getAccountFormDefaultValues, type AccountFormValues } from './account-form'
import { useTranslation } from '@/shared/hooks/use-translation'
import { cn } from '@/lib/utils'
import { Building2, FileText, MapPin } from 'lucide-react'

export type AccountFormTabId = 'general' | 'details' | 'address'

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
 * Tabs:
 * - General: Basic information and contact details (name, email, phones, website, description)
 * - Details: Business information (industry, category, revenue, employees, relationships)
 * - Address: Physical location
 *
 * Features:
 * - Tabs navigation rendered in sticky header via portal
 * - Shared form state across all tabs (prevents data loss on tab change)
 * - Organized sections for better UX (60% reduction in fields per tab)
 * - Uses AccountForm component with section filtering
 */
export function AccountFormTabs({
  account,
  onSubmit,
  onCancel,
  isLoading
}: AccountFormTabsProps) {
  const { t } = useTranslation('accounts')
  const [activeTab, setActiveTab] = useState<AccountFormTabId>('general')
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  // ✅ Create form once at the parent level and share across all tabs
  const sharedForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: getAccountFormDefaultValues(account),
  })

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
          {t('tabs.general')}
        </TabsTrigger>

        <TabsTrigger
          value="details"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <FileText className="w-4 h-4 mr-2" />
          {t('tabs.details')}
        </TabsTrigger>

        <TabsTrigger
          value="address"
          className={cn(
            "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
            "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
            "data-[state=inactive]:text-gray-500 hover:text-gray-900",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
          )}
        >
          <MapPin className="w-4 h-4 mr-2" />
          {t('tabs.address')}
        </TabsTrigger>
      </TabsList>
    </div>
  )

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AccountFormTabId)} className="w-full">
      {/* Render tabs navigation in sticky header container via portal */}
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}

      {/* General Tab - Basic & Contact Information */}
      <TabsContent value="general" className="mt-0">
        <AccountForm
          account={account}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={isLoading}
          hideActions
          section="general"
          sharedForm={sharedForm}
        />
      </TabsContent>

      {/* Details Tab - Business Information */}
      <TabsContent value="details" className="mt-0">
        <AccountForm
          account={account}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={isLoading}
          hideActions
          section="details"
          sharedForm={sharedForm}
        />
      </TabsContent>

      {/* Address Tab - Location */}
      <TabsContent value="address" className="mt-0">
        <AccountForm
          account={account}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isLoading={isLoading}
          hideActions
          section="address"
          sharedForm={sharedForm}
        />
      </TabsContent>
    </Tabs>
  )
}
